import { createFileRoute } from "@tanstack/react-router";
import { useData, useTotals } from "@/data/store";
import { brl } from "@/lib/format";
import { Trail } from "@/components/trail";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/_shell/simular")({
  head: () => ({ meta: [{ title: "Simular — Rota do Sim" }] }),
  component: Simular,
});

// Ponto de partida do slider quando o casal ainda não definiu um orçamento total.
const DEFAULT_BUDGET_ESTIMATE = 50000;

function Simular() {
  const { wedding, categories, guests, setWedding, updateCategory } = useData();
  const totals = useTotals();
  const confirmed = guests.filter((g) => g.status === "confirmado").length;

  const [simGuests, setSimGuests] = useState(confirmed);
  const [budgetOverride, setBudgetOverride] = useState<number>(wedding.totalBudget ?? DEFAULT_BUDGET_ESTIMATE);
  const [cutCategory, setCutCategory] = useState<string | null>(null);
  const [catOverrides, setCatOverrides] = useState<Record<string, number>>({});

  const simulated = useMemo(() => {
    // Adjusted planned per category
    let newCommitted = 0;
    const perCat: Record<string, number> = {};
    for (const c of categories) {
      if (cutCategory === c.id) { perCat[c.id] = 0; continue; }
      const base = catOverrides[c.id] ?? (totals.commitedByCategory[c.id] || c.planned);
      // Scale per-guest categories with simGuests
      const scaled = c.perGuest && confirmed > 0
        ? base * (simGuests / confirmed)
        : base;
      perCat[c.id] = scaled;
      newCommitted += scaled;
    }
    return {
      committed: newCommitted,
      perCat,
      remaining: budgetOverride - newCommitted,
      perGuest: simGuests > 0 ? newCommitted / simGuests : 0,
    };
  }, [categories, catOverrides, cutCategory, budgetOverride, simGuests, confirmed, totals]);

  const diff = simulated.committed - totals.committed;

  function reset() {
    setSimGuests(confirmed);
    setBudgetOverride(wedding.totalBudget ?? DEFAULT_BUDGET_ESTIMATE);
    setCutCategory(null);
    setCatOverrides({});
  }

  function apply() {
    setWedding({ totalBudget: budgetOverride, estimatedGuests: simGuests });
    for (const c of categories) {
      const val = simulated.perCat[c.id];
      if (cutCategory === c.id) updateCategory(c.id, { planned: 0 });
      else if (catOverrides[c.id] !== undefined) updateCategory(c.id, { planned: val });
    }
    toast.success("Cenário aplicado ao seu planejamento.");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-medium text-sand-foreground">
          <Lightbulb className="h-3.5 w-3.5" /> nada é salvo até você confirmar
        </p>
        <h1 className="mt-3 font-serif text-3xl text-graphite md:text-4xl">E se… vocês testassem?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mexa nos controles abaixo. Você vê o impacto em tempo real, sem alterar o planejamento real.
        </p>
      </div>

      {/* Comparação lado a lado */}
      <section className="grid gap-4 md:grid-cols-2">
        <ScenarioCard
          title="Cenário atual"
          tone="muted"
          budget={wedding.totalBudget}
          committed={totals.committed}
          guests={confirmed}
          perGuest={confirmed > 0 ? totals.committed / confirmed : 0}
        />
        <ScenarioCard
          title="Cenário simulado"
          tone="primary"
          budget={budgetOverride}
          committed={simulated.committed}
          guests={simGuests}
          perGuest={simulated.perGuest}
          diff={diff}
        />
      </section>

      {/* Controles */}
      <section className="space-y-6 rounded-2xl border border-border bg-card p-6">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-medium text-graphite">Número de convidados</p>
            <p className="font-serif text-lg text-primary">{simGuests}</p>
          </div>
          <Slider
            value={[simGuests]}
            min={0}
            max={300}
            step={5}
            onValueChange={(v) => setSimGuests(v[0])}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Categorias por convidado (como buffet) reagem automaticamente.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-medium text-graphite">Orçamento total</p>
            <p className="font-serif text-lg text-primary">{brl(budgetOverride)}</p>
          </div>
          <Slider
            value={[budgetOverride]}
            min={10000}
            max={300000}
            step={1000}
            onValueChange={(v) => setBudgetOverride(v[0])}
          />
          {wedding.totalBudget == null && (
            <p className="mt-1 text-xs text-muted-foreground">
              Vocês ainda não definiram um orçamento — este é só um ponto de partida para simular.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-graphite">Cortar uma categoria inteira</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCutCategory(cutCategory === c.id ? null : c.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  cutCategory === c.id
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
          {cutCategory && (
            <p className="mt-2 text-xs text-olive">
              Ao cortar essa categoria, você libera {brl(totals.commitedByCategory[cutCategory] || categories.find((c) => c.id === cutCategory)?.planned || 0)}.
            </p>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="ghost" onClick={reset} className="gap-1">
          <RotateCcw className="h-4 w-4" /> Descartar
        </Button>
        <Button onClick={apply} size="lg">Aplicar esse cenário</Button>
      </div>
    </div>
  );
}

function ScenarioCard({
  title, tone, budget, committed, guests, perGuest, diff,
}: {
  title: string;
  tone: "primary" | "muted";
  budget: number | null;
  committed: number;
  guests: number;
  perGuest: number;
  diff?: number;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${tone === "primary" ? "border-primary/30 bg-sand/50" : "border-border bg-card"}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${tone === "primary" ? "text-primary" : "text-muted-foreground"}`}>{title}</p>
      <p className="mt-2 font-serif text-2xl text-graphite">{brl(committed)}</p>
      <p className="text-xs text-muted-foreground">
        {budget != null ? `de ${brl(budget)} planejados` : "orçamento ainda não definido"}
      </p>
      <div className="mt-4">
        {budget != null ? (
          <Trail value={committed} max={budget} milestones={8} tone={tone === "primary" ? "primary" : "olive"} />
        ) : (
          <div className="h-8" />
        )}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Convidados</dt>
          <dd className="font-serif text-lg text-graphite">{guests}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Por convidado</dt>
          <dd className="font-serif text-lg text-graphite">{brl(perGuest)}</dd>
        </div>
      </dl>
      {diff !== undefined && diff !== 0 && (
        <p className={`mt-4 text-xs font-medium ${diff > 0 ? "text-destructive" : "text-olive"}`}>
          {diff > 0 ? `+${brl(diff)} a mais que hoje` : `${brl(diff)} — ${brl(-diff)} liberados`}
        </p>
      )}
    </div>
  );
}
