import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useData } from "@/data/store";
import { brl, fmtDate, daysUntil } from "@/lib/format";
import { ArrowLeft, FileText, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InstallmentStatus } from "@/data/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/fornecedores/$id")({
  head: () => ({ meta: [{ title: "Fornecedor — Rota do Sim" }] }),
  component: VendorDetail,
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <p className="font-serif text-2xl text-graphite">Fornecedor não encontrado</p>
      <Link to="/fornecedores" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">
        Voltar para fornecedores
      </Link>
    </div>
  ),
});

function VendorDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { vendors, categories, installments, updateInstallment, removeVendor } = useData();
  const vendor = vendors.find((v) => v.id === id);
  if (!vendor) throw notFound();

  const category = categories.find((c) => c.id === vendor.categoryId);
  const vInstallments = installments
    .filter((i) => i.vendorId === vendor.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const paid = vInstallments.filter((i) => i.status === "pago").reduce((s, i) => s + i.amount, 0);
  const remaining = vendor.totalAmount - paid;

  const statusPill = (s: InstallmentStatus) => {
    const styles = {
      pago: "bg-olive/15 text-olive",
      pendente: "bg-muted text-muted-foreground",
      atrasado: "bg-destructive/15 text-destructive",
    }[s];
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles}`}>{s}</span>;
  };

  return (
    <div className="space-y-8">
      <Link to="/fornecedores" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-graphite">
        <ArrowLeft className="h-4 w-4" /> Fornecedores
      </Link>

      <header>
        <p className="text-xs font-medium text-primary">{category?.emoji} {category?.name}</p>
        <h1 className="mt-1 font-serif text-3xl text-graphite md:text-4xl">{vendor.name}</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Valor total</p>
          <p className="mt-1 font-serif text-xl text-graphite">{brl(vendor.totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pago</p>
          <p className="mt-1 font-serif text-xl text-olive">{brl(paid)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Falta</p>
          <p className="mt-1 font-serif text-xl text-graphite">{brl(remaining)}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg text-graphite">Forma de pagamento</h2>
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-graphite">{vendor.paymentMethod}</p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-graphite">Parcelas</h2>
          <p className="text-xs text-muted-foreground">{vInstallments.length} parcela{vInstallments.length === 1 ? "" : "s"}</p>
        </div>
        {vInstallments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Nenhuma parcela cadastrada por enquanto.
          </p>
        ) : (
          <ol className="space-y-2">
            {vInstallments.map((i) => {
              const days = daysUntil(i.dueDate);
              return (
                <li key={i.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    i.status === "pago" ? "bg-olive" : i.status === "atrasado" ? "bg-destructive" : "bg-border"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-graphite">{i.label}</p>
                      {statusPill(i.status)}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fmtDate(i.dueDate)}
                      {i.status !== "pago" && (
                        <> · {days < 0 ? `atrasada há ${-days} dias` : days === 0 ? "vence hoje" : `faltam ${days} dias`}</>
                      )}
                    </p>
                  </div>
                  <p className="font-serif text-base text-graphite">{brl(i.amount)}</p>
                  {i.status !== "pago" && (
                    <Button size="sm" variant="ghost" onClick={() => { updateInstallment(i.id, { status: "pago" }); toast.success("Parcela marcada como paga."); }}>
                      Marcar paga
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg text-graphite">Anexos</h2>
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
          <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Guarde contratos e orçamentos em PDF ou foto.
          </p>
          <Button variant="outline" size="sm" className="mt-3 gap-1"><Paperclip className="h-3.5 w-3.5" /> Adicionar arquivo</Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg text-graphite">Observações</h2>
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-graphite whitespace-pre-line">
          {vendor.notes || <span className="text-muted-foreground italic">Nada anotado aqui ainda.</span>}
        </p>
      </section>

      <section className="border-t border-border pt-6">
        <Button
          variant="ghost"
          className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            removeVendor(vendor.id);
            toast.success("Fornecedor removido.");
            nav({ to: "/fornecedores" });
          }}
        >
          <Trash2 className="h-4 w-4" /> Remover fornecedor
        </Button>
      </section>
    </div>
  );
}
