import "server-only";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function writeAdminAudit(actorUserId: number, entityType: string, entityKey: string, action: string, details?: Record<string, unknown>) {
  await db.execute(
    "INSERT INTO admin_audit_logs (actor_user_id,entity_type,entity_key,action,details) VALUES (?,?,?,?,?)",
    [actorUserId, entityType, entityKey, action, details ? JSON.stringify(details) : null],
  );
}

interface AuditRow extends RowDataPacket { id:number;actor_name:string|null;entity_type:string;entity_key:string;action:string;details:string|Record<string,unknown>|null;created_at:Date }
export async function listAdminAudit(page=1){const current=Math.max(1,Number(page)||1),pageSize=50,offset=(current-1)*pageSize;const [[count],[rows]]=await Promise.all([db.query<(RowDataPacket&{count:number})[]>("SELECT COUNT(*) count FROM admin_audit_logs"),db.query<AuditRow[]>("SELECT a.id,u.display_name actor_name,a.entity_type,a.entity_key,a.action,a.details,a.created_at FROM admin_audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id ORDER BY a.created_at DESC,a.id DESC LIMIT ? OFFSET ?",[pageSize,offset])]);return{items:rows.map(r=>({id:r.id,actor:r.actor_name??"시스템",entityType:r.entity_type,entityKey:r.entity_key,action:r.action,details:typeof r.details==="string"?r.details:JSON.stringify(r.details??{}),createdAt:r.created_at})),total:Number(count[0]?.count??0),page:current,pageSize}}
