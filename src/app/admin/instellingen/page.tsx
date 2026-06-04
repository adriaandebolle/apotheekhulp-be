import { getPlatformConfig } from "@/lib/actions/platform-config";
import { InstellingenForm } from "./InstellingenForm";

export default async function InstellingenPage() {
  const config = await getPlatformConfig();
  return (
    <div className="p-8 max-w-4xl">
      <p className="text-xs text-text-muted mb-1">Beheer</p>
      <h1 className="text-2xl font-bold text-text mb-2">
        Platforminstellingen
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Standaardwaarden die in het hele platform worden gebruikt.
      </p>
      <InstellingenForm config={config} />
    </div>
  );
}
