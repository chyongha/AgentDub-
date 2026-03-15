import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NewProjectView } from "@/components/NewProjectView";

export const metadata = { title: "New Project — AgentDub" };

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return <NewProjectView />;
}
