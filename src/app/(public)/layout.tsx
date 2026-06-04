import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/layout/PublicNav";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role;
  const dashboardHref =
    role === "admin" ? "/admin/dashboard" : "/assistent/dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      <PublicNav isLoggedIn={!!user} dashboardHref={dashboardHref} />
      <div className="flex flex-col flex-1">
        <main className="flex-1 pt-14 lg:pt-0">{children}</main>
        <footer className="bg-background border-t border-border px-6 py-6">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-text-muted">
            <span>© {new Date().getFullYear()} Apotheekhulp</span>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:info@apotheekhulp.be"
                className="hover:text-primary transition-colors"
              >
                info@apotheekhulp.be
              </a>
              <a
                href="tel:+32472579116"
                className="hover:text-primary transition-colors"
              >
                +32 472 57 91 16
              </a>
              <a
                href="tel:+32494996182"
                className="hover:text-primary transition-colors"
              >
                +32 494 99 61 82
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
