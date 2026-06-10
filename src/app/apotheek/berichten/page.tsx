import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function BerichtenApotheekPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = await createClient();

  const { data: messages } = await adminClient
    .from("messages")
    .select("id, title, body, show_as_popup, created_at")
    .order("created_at", { ascending: false });

  const allMessages = messages ?? [];

  // Determine which messages are unread before marking them all read
  let unreadIds = new Set<string>();
  if (user && allMessages.length > 0) {
    const { data: reads } = await supabase
      .from("message_reads")
      .select("message_id");
    const readIds = new Set((reads ?? []).map((r) => r.message_id));
    unreadIds = new Set(allMessages.filter((m) => !readIds.has(m.id)).map((m) => m.id));

    // Mark all as read
    if (unreadIds.size > 0) {
      await supabase.from("message_reads").upsert(
        Array.from(unreadIds).map((id) => ({ user_id: user.id, message_id: id })),
        { onConflict: "user_id,message_id", ignoreDuplicates: true },
      );
    }
  }

  const popups = allMessages.filter((m) => m.show_as_popup);
  const rest = allMessages.filter((m) => !m.show_as_popup);
  const allSorted = [...popups, ...rest];

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <p className="text-xs text-text-muted mb-1">Informatie</p>
        <h1 className="text-2xl font-bold text-text">Berichten</h1>
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
                {unreadIds.has(msg.id) && <Badge variant="info">Nieuw</Badge>}
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
