import { createFileRoute, Link } from "@tanstack/react-router";
import { useData } from "@/data/store";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, HandshakeIcon } from "lucide-react";
import type { VendorStatus } from "@/data/store";
import { QuoteComparator } from "@/components/quote-comparator";

export const Route = createFileRoute("/_shell/fornecedores/")({
  head: () => ({ meta: [{ title: "Fornecedores — Rota do Sim" }] }),
  component: Fornecedores,
});

const statusLabel: Record<VendorStatus, string> = {
  orcamento: "orçamento pedido",
  negociando: "negociando",
  fechado: "fechado",
  pago: "pago",
};

const statusColor: Record<VendorStatus, string> = {
  orcamento: "bg-muted text-muted-foreground",
  negociando: "bg-gold/20 text-gold-foreground",
  fechado: "bg-primary/15 text-primary",
  pago: "bg-olive/15 text-olive",
};

function Fornecedores() {
  const { categories, vendors, quotes } = useData();

  const byCategory = categories.map((c) => ({
    category: c,
    vendors: vendors.filter((v) => v.categoryId === c.id),
    activeQuotes: quotes.filter((q) => q.categoryId === c.id && !q.archived),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-graphite md:text-4xl">Fornecedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quem já está no barco, o que ainda está sendo negociado.
          </p>
        </div>
        <Button className="gap-1"><Plus className="h-4 w-4" /> Novo fornecedor</Button>
      </div>

      {vendors.length === 0 && quotes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {byCategory.map(({ category, vendors: cVendors, activeQuotes }) => {
            if (cVendors.length === 0 && activeQuotes.length === 0) return null;
            return (
              <section key={category.id}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  <h2 className="font-serif text-lg text-graphite">{category.name}</h2>
                </div>

                {activeQuotes.length >= 2 && cVendors.length === 0 && (
                  <QuoteComparator categoryId={category.id} quotes={activeQuotes} />
                )}

                <div className="grid gap-2">
                  {cVendors.map((v) => (
                    <Link
                      key={v.id}
                      to="/fornecedores/$id"
                      params={{ id: v.id }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-graphite">{v.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {brl(v.totalAmount)} · {v.paymentMethod}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColor[v.status]}`}>
                          {statusLabel[v.status]}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}

                  {activeQuotes.length === 1 && cVendors.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
                      Uma cotação de {activeQuotes[0].vendorName} salva. Adicione outras pra comparar antes de fechar.
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-sand/40 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background text-primary">
        <HandshakeIcon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-xl text-graphite">Comece adicionando seu primeiro fornecedor</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Buffet, foto, decoração — o que já estiver no radar. Você pode salvar como cotação e comparar depois.
      </p>
      <Button className="mt-5 gap-1"><Plus className="h-4 w-4" /> Adicionar fornecedor</Button>
    </div>
  );
}
