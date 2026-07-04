import { createFileRoute, Link } from "@tanstack/react-router";
import { useData, useTotals } from "@/data/store";
import { brl, brlShort, fmtDateShort, daysUntil } from "@/lib/format";
import { Trail, MiniTrail } from "@/components/trail";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import type { Installment } from "@/data/store";

export const Route = createFileRoute("/_shell/painel")({
  head: () => ({ meta: [{ title: "Painel — Rota do Sim" }] }),
  component: Painel,
});

function Painel() {
  const { wedding, categories, vendors, installments } = useData();
  const totals = useTotals();
  const [view, setView] = useState<"categoria" | "convidado">("categoria");

  const confirmedGuests = useData().guests.filter((g) => g.status === "confirmado").length;

  const upcoming = installments
    .filter((i) => i.status !== "pago")
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Bem-vindos</p>
          <h1 className="font-serif text-3xl text-graphite md:text-4xl">{wedding.couple}</h1>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          <button
            onClick={() => setView("categoria")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${view === "categoria" ? "bg-background text-graphite shadow-sm" : "text-muted-foreground"}`}
          >
            Por categoria
          </button>
          <button
            onClick={() => setView("convidado")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${view === "convidado" ? "bg-background text-graphite shadow-sm" : "text-muted-foreground"}`}
          >
            Por convidado
          </button>
        </div>
      </div>

      {/* Big trail: budget vs committed */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Sua trilha até o sim</p>
            <p className="mt-1 font-serif text-2xl text-graphite">
              {brl(totals.committed)}{" "}
              <span className="text-muted-foreground">
                {wedding.totalBudget != null ? `de ${brl(wedding.totalBudget)} comprometidos` : "comprometidos até agora"}
              </span>
            </p>
          </div>
          {wedding.totalBudget != null ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Restam para contratar</p>
              <p className="font-serif text-xl text-olive">{brl(Math.max(0, totals.remaining ?? 0))}</p>
            </div>
          ) : (
            <Link
              to="/mais"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Definir orçamento total
            </Link>
          )}
        </div>
        {wedding.totalBudget != null ? (
          <div className="mt-6">
            <Trail value={totals.committed} max={wedding.totalBudget} milestones={10} />
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-sand/60 px-3 py-2 text-sm text-sand-foreground">
            Defina um orçamento total para acompanhar sua trilha até o grande dia.
          </p>
        )}
        {totals.remaining != null && totals.remaining < 0 && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Você passou do orçamento planejado em {brl(-totals.remaining)}. Vamos ver o que ajustar?
          </p>
        )}
      </section>

      {/* Two cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pago até agora</p>
          <p className="mt-1 font-serif text-3xl text-olive">{brl(totals.paid)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Você já andou {Math.round((totals.paid / Math.max(1, totals.committed)) * 100)}% do contratado.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Falta pagar</p>
          <p className="mt-1 font-serif text-3xl text-graphite">{brl(totals.owed)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Em {installments.filter((i) => i.status !== "pago").length} parcelas
            {wedding.date ? ` até ${fmtDateShort(wedding.date)}` : ""}.
          </p>
        </div>
      </section>

      {/* Upcoming installments alert */}
      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-gold/40 bg-sand/60 p-5">
          <div className="mb-3 flex items-center gap-2 text-graphite">
            <AlertCircle className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Próximas parcelas</p>
          </div>
          <ul className="space-y-2.5">
            {upcoming.map((i) => <UpcomingRow key={i.id} inst={i} />)}
          </ul>
        </section>
      )}

      {/* Categories */}
      {view === "categoria" ? (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-graphite">Categorias</h2>
            <Button variant="ghost" size="sm" className="gap-1"><Plus className="h-4 w-4" /> Nova despesa</Button>
          </div>
          <div className="grid gap-3">
            {categories.map((c) => {
              const committed = totals.commitedByCategory[c.id] || 0;
              const paid = totals.spentByCategory[c.id] || 0;
              return (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-graphite">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {brlShort(committed)} de {brlShort(c.planned)} planejados
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-olive">{brlShort(paid)} pagos</p>
                    </div>
                  </div>
                  <MiniTrail value={committed} max={c.planned} tone={committed > c.planned ? "over" : "primary"} />
                  {committed > c.planned && (
                    <p className="mt-2 text-xs text-destructive">
                      Essa categoria passou do planejado em {brl(committed - c.planned)} — vamos ver o que ajustar?
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <PorConvidadoView confirmed={confirmedGuests} />
      )}
    </div>
  );
}

function UpcomingRow({ inst }: { inst: Installment }) {
  const { vendors } = useData();
  const vendor = vendors.find((v) => v.id === inst.vendorId);
  const days = daysUntil(inst.dueDate);
  const dueText =
    days < 0 ? `atrasada há ${-days} dia${-days === 1 ? "" : "s"}` :
    days === 0 ? "vence hoje" :
    days === 1 ? "vence amanhã" :
    `vence em ${days} dias`;
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-background/70 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-graphite">{vendor?.name ?? "—"} · {inst.label}</p>
        <p className="text-xs text-muted-foreground">{dueText} · {fmtDateShort(inst.dueDate)}</p>
      </div>
      <p className="font-serif text-base text-graphite">{brl(inst.amount)}</p>
    </li>
  );
}

function PorConvidadoView({ confirmed }: { confirmed: number }) {
  const { categories } = useData();
  const totals = useTotals();
  const perGuest = confirmed > 0 ? totals.committed / confirmed : 0;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <p className="text-sm">{confirmed} convidados confirmados</p>
        </div>
        <p className="mt-3 font-serif text-3xl text-graphite">
          {brl(perGuest)} <span className="text-base text-muted-foreground font-sans">por pessoa</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Considera tudo já comprometido em contratos. Quer testar cenários diferentes?{" "}
          <Link to="/simular" className="text-primary underline-offset-4 hover:underline">Abrir o simulador</Link>.
        </p>
      </div>

      <div className="grid gap-3">
        {categories.map((c) => {
          const cost = totals.commitedByCategory[c.id] || 0;
          const per = confirmed > 0 ? cost / confirmed : 0;
          return (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-graphite">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.perGuest ? "varia por convidado" : "custo fixo"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif text-lg text-graphite">{brl(per)}</p>
                <p className="text-xs text-muted-foreground">por pessoa</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
