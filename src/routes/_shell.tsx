import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard, Users, HandshakeIcon, Lightbulb, MoreHorizontal,
} from "lucide-react";
import { useData } from "@/data/store";
import { daysUntil } from "@/lib/format";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

const items = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/fornecedores", label: "Fornecedores", icon: HandshakeIcon },
  { to: "/convidados", label: "Convidados", icon: Users },
  { to: "/simular", label: "Simular", icon: Lightbulb },
  { to: "/mais", label: "Mais", icon: MoreHorizontal },
] as const;

function ShellLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { wedding } = useData();
  const days = wedding.date ? daysUntil(wedding.date) : null;

  const isActive = (to: string) =>
    to === "/painel" ? path === to : path.startsWith(to);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card md:flex">
        <div className="px-6 py-6">
          <Logo />
        </div>
        <nav className="flex-1 px-3">
          {items.map((it) => {
            const active = isActive(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-secondary text-graphite" : "text-muted-foreground hover:bg-muted hover:text-graphite"
                }`}
              >
                <it.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="mx-3 mb-4 rounded-lg bg-sand/60 px-4 py-3">
          <p className="text-xs font-medium text-sand-foreground">{wedding.couple}</p>
          <p className="mt-0.5 font-serif text-lg text-graphite">
            {days === null ? "Data a definir" : days > 0 ? `Faltam ${days} dias` : days === 0 ? "É hoje!" : "Depois do sim"}
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Logo size={22} />
        <div className="text-right">
          <p className="text-[11px] font-medium text-muted-foreground">{wedding.couple}</p>
          <p className="text-xs font-medium text-primary">
            {days === null ? "data a definir" : days > 0 ? `${days} dias` : days === 0 ? "hoje!" : "pós-casamento"}
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="md:pl-60">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card md:hidden">
        {items.map((it) => {
          const active = isActive(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
