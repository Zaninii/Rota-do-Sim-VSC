import type { VendorQuote } from "@/data/store";
import { useData } from "@/data/store";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  quotes: VendorQuote[];
}

export function QuoteComparator({ quotes }: Props) {
  const { chooseQuote, archiveQuote } = useData();

  const cheapest = quotes.reduce((min, q) => q.amount < min.amount ? q : min, quotes[0]);

  return (
    <div className="mb-3 rounded-2xl border border-border bg-sand/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-graphite">Comparando {quotes.length} cotações</p>
        <p className="text-xs text-muted-foreground">Menor valor destacado</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((q) => {
          const isCheapest = q.id === cheapest.id;
          return (
            <div
              key={q.id}
              className={`rounded-xl border bg-card p-4 ${
                isCheapest ? "border-primary/50 ring-2 ring-primary/10" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-graphite">{q.vendorName}</p>
                {isCheapest && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    menor
                  </span>
                )}
              </div>
              <p className="mt-2 font-serif text-2xl text-graphite">{brl(q.amount)}</p>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-2"><dt>Pagamento</dt><dd className="text-graphite">{q.paymentMethod}</dd></div>
                <div className="flex justify-between gap-2"><dt>Prazo</dt><dd className="text-graphite">{q.deliveryTerm}</dd></div>
              </dl>
              {q.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{q.notes}"</p>}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => {
                    chooseQuote(q.id);
                    toast.success(`${q.vendorName} escolhido — as outras foram arquivadas.`);
                  }}
                >
                  <Check className="h-3.5 w-3.5" /> Escolher
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { archiveQuote(q.id); toast.success("Cotação arquivada."); }}
                >
                  Arquivar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
