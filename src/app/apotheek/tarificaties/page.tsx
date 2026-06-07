import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function TarificatiesPage() {
  const supabase = createAdminClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("id, title, body, show_as_popup, created_at")
    .order("created_at", { ascending: false });

  const popups = (messages ?? []).filter((m) => m.show_as_popup);
  const rest = (messages ?? []).filter((m) => !m.show_as_popup);
  const allSorted = [...popups, ...rest];

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <p className="text-xs text-text-muted mb-1">Informatie</p>
        <h1 className="text-2xl font-bold text-text">Tarificaties</h1>
        <p className="text-sm text-text-muted mt-1">
          Berichten van Apotheekhulp over tarieven en andere aankondigingen.
        </p>
      </div>

      {allSorted.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          Er zijn nog geen berichten.
        </div>
      ) : (
        <div className="space-y-4">
          {allSorted.map((msg) => (
            <div
              key={msg.id}
              className={`bg-surface border rounded-xl p-5 ${
                msg.show_as_popup
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-semibold text-text">{msg.title}</h2>
                {msg.show_as_popup && <Badge variant="info">Nieuw</Badge>}
              </div>
              <p className="text-xs text-text-muted mb-3">
                {formatDate(msg.created_at)}
              </p>
              <div
                className="rich-text text-text"
                dangerouslySetInnerHTML={{ __html: msg.body }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
