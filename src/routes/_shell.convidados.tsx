import { createFileRoute, Link } from "@tanstack/react-router";
import { useData } from "@/data/store";
import type { GuestStatus } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_shell/convidados")({
  head: () => ({ meta: [{ title: "Convidados — Rota do Sim" }] }),
  component: Convidados,
});

const statusMeta: Record<GuestStatus, { label: string; color: string }> = {
  convidado: { label: "convidado", color: "bg-muted text-muted-foreground" },
  confirmado: { label: "confirmado", color: "bg-olive/15 text-olive" },
  nao_vai: { label: "não vai", color: "bg-destructive/10 text-destructive" },
};

function Convidados() {
  const { guests, wedding, addGuest, updateGuest, removeGuest } = useData();
  const [filter, setFilter] = useState<"todos" | GuestStatus>("todos");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    confirmado: guests.filter((g) => g.status === "confirmado").length,
    convidado: guests.filter((g) => g.status === "convidado").length,
    nao_vai: guests.filter((g) => g.status === "nao_vai").length,
    total: guests.length,
  }), [guests]);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = guests.filter((g) => {
      if (filter !== "todos" && g.status !== filter) return false;
      if (q && !g.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const map: Record<string, typeof guests> = {};
    for (const g of filtered) (map[g.group] = map[g.group] || []).push(g);
    return map;
  }, [guests, filter, search]);

  const limit = wedding.estimatedGuests;
  const overLimit = limit != null && counts.confirmado > limit;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-graphite md:text-4xl">Convidados</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quem vai celebrar com vocês.</p>
        </div>
        <Button
          className="gap-1"
          onClick={() => {
            const name = window.prompt("Nome do convidado?");
            if (!name) return;
            const group = window.prompt("Grupo (família da noiva, amigos, trabalho…)?", "Amigos") || "Outros";
            addGuest({ name, group, status: "convidado" });
          }}
        ><Plus className="h-4 w-4" /> Adicionar</Button>
      </div>

      {/* Counter card */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <p className="text-sm">
            {limit != null
              ? `${counts.confirmado} confirmados de ${limit} previstos no orçamento`
              : `${counts.confirmado} confirmados · quantidade prevista ainda não definida`}
          </p>
        </div>
        {limit != null ? (
          <>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${overLimit ? "bg-destructive" : "bg-olive"}`}
                style={{ width: `${Math.min(100, (counts.confirmado / Math.max(1, limit)) * 100)}%` }}
              />
            </div>
            {overLimit && (
              <p className="mt-2 text-xs text-destructive">
                Vocês passaram do previsto — vale simular o impacto no buffet.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            <Link to="/mais" className="text-primary underline-offset-4 hover:underline">
              Defina uma estimativa de convidados
            </Link>{" "}
            para acompanhar o progresso aqui.
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {(["todos", "confirmado", "convidado", "nao_vai"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === k ? "bg-graphite text-background" : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {k === "todos" ? `Todos (${counts.total})` :
             k === "confirmado" ? `Confirmados (${counts.confirmado})` :
             k === "convidado" ? `Convidados (${counts.convidado})` :
             `Não vão (${counts.nao_vai})`}
          </button>
        ))}
        <Input
          placeholder="Buscar por nome..."
          className="ml-auto max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-sand/40 p-10 text-center text-sm text-muted-foreground">
          Nenhum convidado por aqui ainda. Comece adicionando os primeiros nomes.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, list]) => (
            <section key={group}>
              <h2 className="mb-2 text-sm font-medium text-muted-foreground">{group} · {list.length}</h2>
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {list.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                    <p className="flex-1 truncate text-sm text-graphite">{g.name}</p>
                    <select
                      value={g.status}
                      onChange={(e) => updateGuest(g.id, { status: e.target.value as GuestStatus })}
                      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-medium ${statusMeta[g.status].color}`}
                    >
                      <option value="convidado">convidado</option>
                      <option value="confirmado">confirmado</option>
                      <option value="nao_vai">não vai</option>
                    </select>
                    <button
                      onClick={() => removeGuest(g.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
