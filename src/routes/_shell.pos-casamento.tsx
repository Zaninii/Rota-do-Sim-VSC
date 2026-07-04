import { createFileRoute, Link } from "@tanstack/react-router";
import { useData, useTotals } from "@/data/store";
import { brl } from "@/lib/format";
import { Trail } from "@/components/trail";
import { Sparkles, ArrowLeft, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/pos-casamento")({
  head: () => ({ meta: [{ title: "Depois do sim — Rota do Sim" }] }),
  component: PosCasamento,
});

function PosCasamento() {
  const { wedding, categories, guests } = useData();
  const totals = useTotals();
  const confirmed = guests.filter((g) => g.status === "confirmado").length;
  const diff = wedding.totalBudget != null ? wedding.totalBudget - totals.paid : null;

  return (
    <div className="space-y-8">
      <Link to="/mais" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-graphite">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="rounded-3xl border border-border bg-gradient-to-b from-sand/70 to-background p-8 md:p-12">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="h-5 w-5" />
          <p className="text-xs font-medium uppercase tracking-widest">a jornada até o sim</p>
        </div>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-graphite md:text-5xl">
          {wedding.couple}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Do primeiro sinal ao último brinde, veja como foi a caminhada financeira de vocês.
        </p>

        <div className="mt-10">
          {wedding.totalBudget != null ? (
            <Trail value={totals.paid} max={wedding.totalBudget} milestones={12} tone="primary" />
          ) : (
            <p className="text-sm text-muted-foreground">
              Vocês não definiram um orçamento total, então não dá pra traçar a trilha completa aqui.
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Orçamento planejado"
            value={wedding.totalBudget != null ? brl(wedding.totalBudget) : "não definido"}
          />
          <StatCard label="Gasto real" value={brl(totals.paid)} accent="olive" />
          {diff != null ? (
            <StatCard
              label={diff >= 0 ? "Economia" : "Além do previsto"}
              value={brl(Math.abs(diff))}
              accent={diff >= 0 ? "olive" : "primary"}
            />
          ) : (
            <StatCard label="Economia" value="—" />
          )}
        </div>

        <div className="mt-10">
          <p className="mb-4 text-sm font-medium text-graphite">Por categoria</p>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {categories.map((c) => {
              const spent = totals.spentByCategory[c.id] || 0;
              return (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-sm text-graphite">{c.name}</span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-serif text-base text-graphite">{brl(spent)}</p>
                    <p className="text-xs text-muted-foreground">planejado {brl(c.planned)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-10 text-center font-serif text-lg italic text-graphite">
          "{confirmed} pessoas queridas celebraram com vocês."
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="gap-1"><Share2 className="h-4 w-4" /> Compartilhar</Button>
        <Button className="gap-1"><Download className="h-4 w-4" /> Salvar como imagem</Button>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "olive" | "primary" }) {
  const color = accent === "olive" ? "text-olive" : accent === "primary" ? "text-primary" : "text-graphite";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-serif text-2xl ${color}`}>{value}</p>
    </div>
  );
}
