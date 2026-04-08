import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import UserDashboard from "@/components/user-dashboard";
import AuthSessionProvider from "@/components/AuthSessionProvider";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/api/auth/signin?callbackUrl=/dashboard/user");
  }
  return (
    <AuthSessionProvider>
      <UserDashboard />
    </AuthSessionProvider>
  );
}
