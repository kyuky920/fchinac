import { notFound } from "next/navigation";
import { canManageUsers,getCurrentUser } from "@/lib/auth";
export default async function BoardAdminLayout({children}:{children:React.ReactNode}){if(!canManageUsers(await getCurrentUser()))notFound();return children}
