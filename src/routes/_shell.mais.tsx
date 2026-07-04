import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useData } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Settings, PartyPopper, Sparkles, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CollaboratorRole } from "@/data/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/mais")({
  head: () => ({ meta: [{ title: "Mais — Rota do Sim" }] }),
  component: Mais,
});

function Mais() {
  const { collaborators, addCollaborator, removeCollaborator, wedding, setWedding, reset } = useData();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("visualizador");

  function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    addCollaborator({ name, email, role });
    setName(""); setEmail("");
    toast.success(`Convite enviado para ${email}.`);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-graphite md:text-4xl">Mais</h1>
        <p className="mt-1 text-sm text-muted-foreground">Colaboradores, configurações e o momento pós-casamento.</p>
      </div>

      {/* Colaboradores */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl text-graphite">Colaboradores</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Convide os pais ou padrinhos para acompanhar (ou ajudar a editar) o planejamento.
        </p>

        <form onSubmit={invite} className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_auto_auto]">
          <div>
            <Label htmlFor="c-name" className="text-xs">Nome</Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sônia" />
          </div>
          <div>
            <Label htmlFor="c-email" className="text-xs">E-mail</Label>
            <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sonia@email.com" />
          </div>
          <div>
            <Label htmlFor="c-role" className="text-xs">Permissão</Label>
            <select
              id="c-role"
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
              className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="visualizador">Visualizador</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit">Convidar</Button>
          </div>
        </form>

        {collaborators.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {collaborators.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-graphite">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  c.role === "editor" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {c.role === "editor" ? "editor" : "só visualiza"}
                </span>
                <button
                  onClick={() => { removeCollaborator(c.id); toast.success("Acesso revogado."); }}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  revogar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Configurações do casamento */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl text-graphite">Configurações do casamento</h2>
        </div>
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Nome do casal</Label>
            <Input value={wedding.couple} onChange={(e) => setWedding({ couple: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Data</Label>
            <Input
              type="date" value={wedding.date ?? ""}
              onChange={(e) => setWedding({ date: e.target.value || null })}
            />
          </div>
          <div>
            <Label className="text-xs">Convidados estimados</Label>
            <Input
              type="number" value={wedding.estimatedGuests ?? ""} placeholder="Ainda não definido"
              onChange={(e) => setWedding({ estimatedGuests: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Orçamento total</Label>
            <Input
              type="number" value={wedding.totalBudget ?? ""} placeholder="Ainda não definido"
              onChange={(e) => setWedding({ totalBudget: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </div>
      </section>

      {/* Modo pós-casamento */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <PartyPopper className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl text-graphite">Depois do casamento</h2>
        </div>
        <Link
          to="/pos-casamento"
          className="flex items-center justify-between rounded-2xl border border-border bg-sand/50 p-5 transition hover:border-primary/40"
        >
          <div>
            <p className="text-sm font-medium text-graphite">Ver a jornada financeira</p>
            <p className="mt-1 text-xs text-muted-foreground">Um resumo bonito, pronto pra guardar de lembrança.</p>
          </div>
          <Sparkles className="h-5 w-5 text-gold" />
        </Link>
      </section>

      {/* Session */}
      <section className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button
          variant="ghost"
          className="gap-1 text-muted-foreground"
          onClick={() => { reset(); toast.success("Dados restaurados."); }}
        >
          <Trash2 className="h-4 w-4" /> Restaurar dados de exemplo
        </Button>
        <Button variant="ghost" className="gap-1 text-muted-foreground" onClick={() => nav({ to: "/" })}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </section>
    </div>
  );
}
