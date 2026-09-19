import "server-only";
import type { RowDataPacket } from "mysql2";
import { db, withTransaction } from "@/lib/db";
import { writeAdminAudit } from "@/lib/admin-audit";
import { createHash } from "node:crypto";
import { mkdir,unlink,writeFile } from "node:fs/promises";
import { basename,extname,resolve,sep } from "node:path";
import { createPublicId } from "@/lib/ids";
import { env } from "@/lib/env";

interface PostRow extends RowDataPacket {
  public_id:string; board_key:string; board_name:string; title:string; author:string|null;
  status:"draft"|"published"|"hidden"|"deleted"; visibility:"public"|"member"|"private";
  is_pinned:number; attachment_count:number; updated_at:Date;
}
interface PostDetailRow extends PostRow { body:string; body_format:"html"|"markdown"|"plain"; locale_code:string }
interface AttachmentRow extends RowDataPacket { public_id:string; original_filename:string; size_bytes:number; download_count:number }

export interface AdminPostSummary { publicId:string; boardKey:string; boardName:string; title:string; author:string|null; status:PostRow["status"]; visibility:PostRow["visibility"]; isPinned:boolean; attachmentCount:number; updatedAt:Date }
export interface AdminAttachment { publicId:string; filename:string; sizeBytes:number; downloadCount:number }
export interface AdminPostDetail extends AdminPostSummary { body:string; bodyFormat:PostDetailRow["body_format"]; localeCode:string; attachments:AdminAttachment[] }

export async function listAdminPosts(input:{locale:string;query?:string;boardKey?:string;page?:number}) {
  const page=Math.max(1,Number(input.page)||1), pageSize=20, offset=(page-1)*pageSize;
  const where=["p.status<>'deleted'"]; const args:unknown[]=[];
  if(input.query){where.push("(pt.title LIKE ? OR ko.title LIKE ? OR u.username LIKE ?)");const q=`%${input.query}%`;args.push(q,q,q)}
  if(input.boardKey){where.push("b.board_key=?");args.push(input.boardKey)}
  const [countRows]=await db.query<(RowDataPacket&{count:number})[]>(`SELECT COUNT(DISTINCT p.id) count FROM posts p JOIN boards b ON b.id=p.board_id LEFT JOIN users u ON u.id=p.author_user_id LEFT JOIN post_translations pt ON pt.post_id=p.id AND pt.locale_code=? LEFT JOIN post_translations ko ON ko.post_id=p.id AND ko.locale_code='ko' WHERE ${where.join(" AND ")}`,[input.locale,...args]);
  const [rows]=await db.query<PostRow[]>(`SELECT p.public_id,b.board_key,COALESCE(bt.name,b.board_key) board_name,COALESCE(pt.title,ko.title,'제목 없음') title,COALESCE(u.display_name,p.guest_name) author,p.status,p.visibility,p.is_pinned,COUNT(a.id) attachment_count,p.updated_at FROM posts p JOIN boards b ON b.id=p.board_id LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=? LEFT JOIN users u ON u.id=p.author_user_id LEFT JOIN post_translations pt ON pt.post_id=p.id AND pt.locale_code=? LEFT JOIN post_translations ko ON ko.post_id=p.id AND ko.locale_code='ko' LEFT JOIN attachments a ON a.post_id=p.id WHERE ${where.join(" AND ")} GROUP BY p.id,bt.name,pt.title,ko.title,u.display_name ORDER BY p.is_pinned DESC,p.updated_at DESC LIMIT ? OFFSET ?`,[input.locale,input.locale,...args,pageSize,offset]);
  return {posts:rows.map(toSummary),total:Number(countRows[0]?.count??0),page,pageSize};
}

function toSummary(row:PostRow):AdminPostSummary{return {publicId:row.public_id,boardKey:row.board_key,boardName:row.board_name,title:row.title,author:row.author,status:row.status,visibility:row.visibility,isPinned:Boolean(row.is_pinned),attachmentCount:Number(row.attachment_count),updatedAt:row.updated_at}}

export async function getAdminPost(publicId:string,locale:string):Promise<AdminPostDetail|null>{
  const [rows]=await db.query<PostDetailRow[]>(`SELECT p.public_id,b.board_key,COALESCE(bt.name,b.board_key) board_name,COALESCE(pt.title,ko.title,'제목 없음') title,COALESCE(pt.body,ko.body,'') body,COALESCE(pt.body_format,ko.body_format,'plain') body_format,COALESCE(pt.locale_code,ko.locale_code,?) locale_code,COALESCE(u.display_name,p.guest_name) author,p.status,p.visibility,p.is_pinned,0 attachment_count,p.updated_at FROM posts p JOIN boards b ON b.id=p.board_id LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=? LEFT JOIN users u ON u.id=p.author_user_id LEFT JOIN post_translations pt ON pt.post_id=p.id AND pt.locale_code=? LEFT JOIN post_translations ko ON ko.post_id=p.id AND ko.locale_code='ko' WHERE p.public_id=? AND p.status<>'deleted' LIMIT 1`,[locale,locale,locale,publicId]);
  const row=rows[0];if(!row)return null;
  const [files]=await db.query<AttachmentRow[]>("SELECT public_id,original_filename,size_bytes,download_count FROM attachments WHERE post_id=(SELECT id FROM posts WHERE public_id=?) ORDER BY sort_order,id",[publicId]);
  return {...toSummary(row),body:row.body,bodyFormat:row.body_format,localeCode:row.locale_code,attachments:files.map(f=>({publicId:f.public_id,filename:f.original_filename,sizeBytes:Number(f.size_bytes),downloadCount:Number(f.download_count)}))};
}

export async function updateAdminPost(input:{actorId:number;publicId:string;locale:string;boardKey:string;title:string;body:string;bodyFormat:string;status:string;visibility:string;isPinned:boolean}){
  await withTransaction(async c=>{
    const [posts]=await c.query<(RowDataPacket&{id:number})[]>("SELECT id FROM posts WHERE public_id=? AND status<>'deleted' FOR UPDATE",[input.publicId]);const post=posts[0];if(!post)throw new Error("게시물을 찾을 수 없습니다.");
    const [boards]=await c.query<(RowDataPacket&{id:number})[]>("SELECT id FROM boards WHERE board_key=?",[input.boardKey]);if(!boards[0])throw new Error("게시판을 찾을 수 없습니다.");
    await c.execute("UPDATE posts SET board_id=?,status=?,visibility=?,is_pinned=?,published_at=IF(?='published',COALESCE(published_at,UTC_TIMESTAMP(3)),published_at) WHERE id=?",[boards[0].id,input.status,input.visibility,input.isPinned,input.status,post.id]);
    await c.execute("INSERT INTO post_translations (post_id,locale_code,title,body,body_format,translation_status) VALUES (?,?,?,?,?,'original') ON DUPLICATE KEY UPDATE title=VALUES(title),body=VALUES(body),body_format=VALUES(body_format),updated_at=UTC_TIMESTAMP(3)",[post.id,input.locale,input.title,input.body,input.bodyFormat]);
  });
  await writeAdminAudit(input.actorId,"post",input.publicId,"updated",{locale:input.locale,status:input.status});
}

export async function deleteAdminPost(actorId:number,publicId:string){await db.execute("UPDATE posts SET status='deleted',deleted_at=UTC_TIMESTAMP(3) WHERE public_id=?",[publicId]);await writeAdminAudit(actorId,"post",publicId,"deleted")}
export async function deleteAdminAttachment(actorId:number,publicId:string){const [rows]=await db.query<(RowDataPacket&{storage_provider:string;storage_key:string})[]>("SELECT storage_provider,storage_key FROM attachments WHERE public_id=?",[publicId]);await db.execute("DELETE FROM attachments WHERE public_id=?",[publicId]);const file=rows[0];if(file?.storage_provider==="local"){const root=resolve(env.UPLOAD_ROOT),path=resolve(root,file.storage_key);if(path.startsWith(`${root}${sep}`))await unlink(path).catch(()=>undefined)}await writeAdminAudit(actorId,"attachment",publicId,"deleted")}

const allowedExtensions=new Set(["pdf","hwp","hwpx","doc","docx","xls","xlsx","ppt","pptx","txt","zip","jpg","jpeg","png","gif","webp"]);
export async function uploadAdminAttachment(input:{actorId:number;postPublicId:string;file:File}){const filename=basename(input.file.name).slice(0,500),extension=extname(filename).slice(1).toLowerCase();if(!filename||!extension||!allowedExtensions.has(extension))throw new Error("허용되지 않는 파일 형식입니다.");const [posts]=await db.query<(RowDataPacket&{id:number;max_attachments:number;max_attachment_bytes:number;file_count:number})[]>(`SELECT p.id,b.max_attachments,b.max_attachment_bytes,COUNT(a.id) file_count FROM posts p JOIN boards b ON b.id=p.board_id LEFT JOIN attachments a ON a.post_id=p.id WHERE p.public_id=? AND p.status<>'deleted' GROUP BY p.id`,[input.postPublicId]);const post=posts[0];if(!post)throw new Error("게시물을 찾을 수 없습니다.");if(Number(post.file_count)>=Number(post.max_attachments))throw new Error("게시판의 최대 첨부파일 수를 초과했습니다.");if(input.file.size<=0||input.file.size>Math.min(Number(post.max_attachment_bytes),20*1024*1024))throw new Error("파일 크기 제한을 초과했습니다.");const data=Buffer.from(await input.file.arrayBuffer()),publicId=createPublicId(),storageKey=`admin/${input.postPublicId}/${publicId}.${extension}`,root=resolve(env.UPLOAD_ROOT),path=resolve(root,storageKey);if(!path.startsWith(`${root}${sep}`))throw new Error("잘못된 저장 경로입니다.");await mkdir(resolve(path,".."),{recursive:true});await writeFile(path,data,{flag:"wx"});try{await db.execute("INSERT INTO attachments (public_id,post_id,uploaded_by,storage_provider,storage_key,original_filename,extension,mime_type,size_bytes,checksum_sha256,sort_order) VALUES (?,?,?,'local',?,?,?,?,?,?,?)",[publicId,post.id,input.actorId,storageKey,filename,extension,input.file.type||"application/octet-stream",data.byteLength,createHash("sha256").update(data).digest("hex"),Number(post.file_count)])}catch(e){await unlink(path).catch(()=>undefined);throw e}await writeAdminAudit(input.actorId,"attachment",publicId,"uploaded",{post:input.postPublicId,filename})}

export async function listBoardChoices(locale:string){const [rows]=await db.query<(RowDataPacket&{board_key:string;name:string})[]>("SELECT b.board_key,COALESCE(bt.name,ko.name,b.board_key) name FROM boards b LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=? LEFT JOIN board_translations ko ON ko.board_id=b.id AND ko.locale_code='ko' ORDER BY b.sort_order,b.id",[locale]);return rows.map(r=>({key:r.board_key,name:r.name}))}
