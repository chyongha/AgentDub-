export const metadata = { title: "Docs — AgentDub" };

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-5xl mb-2" style={{ color: "var(--color-text)" }}>
          DOCS
        </h1>
        <p className="text-sm" style={{ color: "var(--color-ash)" }}>
          API reference and integration guides.
        </p>
        <div
          className="mt-10 rounded-xl flex items-center justify-center py-24"
          style={{ border: "1px dashed rgba(200,241,53,0.15)", background: "rgba(17,17,24,0.4)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-ash)" }}>
            Documentation coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
