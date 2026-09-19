import { notFound } from "next/navigation";
import { canManageUsers,getCurrentUser } from "@/lib/auth";
export default async function PostAdminLayout({children}:{children:React.ReactNode}){if(!canManageUsers(await getCurrentUser()))notFound();return children}
