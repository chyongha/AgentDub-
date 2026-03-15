import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Projects — AgentDub" };

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-5xl mb-2" style={{ color: "var(--color-text)" }}>
          PROJECTS
        </h1>
        <p className="text-sm" style={{ color: "var(--color-ash)" }}>
          All your dubbing projects in one place.
        </p>
        <div
          className="mt-10 rounded-xl flex items-center justify-center py-24 text-center"
          style={{ border: "1px dashed rgba(200,241,53,0.15)", background: "rgba(17,17,24,0.4)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-ash)" }}>
            Project listing coming in the next iteration.
          </p>
        </div>
      </div>
    </div>
  );
}
