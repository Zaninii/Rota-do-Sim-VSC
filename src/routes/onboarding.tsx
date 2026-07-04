import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/data/store";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Bem-vindos — Rota do Sim" }] }),
  component: Onboarding,
});

function Onboarding() {
  const nav = useNavigate();
  const { wedding, setWedding, update } = useData();
  const [step, setStep] = useState(0);
  const [couple, setCouple] = useState(wedding.couple);
  const [date, setDate] = useState(wedding.date);
  const [guests, setGuests] = useState(wedding.estimatedGuests);
  const [budget, setBudget] = useState(wedding.totalBudget);

  const steps = ["O casal", "A data", "Os convidados", "O orçamento"];

  function advance() {
    if (step < 3) setStep(step + 1);
    else {
      update({ onboarded: true });
      nav({ to: "/painel" });
    }
  }

  function next() {
    if (step === 0) setWedding({ couple });
    if (step === 1) setWedding({ date });
    if (step === 2) setWedding({ estimatedGuests: guests });
    if (step === 3) setWedding({ totalBudget: budget });
    advance();
  }

  function skipDate() {
    setDate(null);
    setWedding({ date: null });
    advance();
  }

  function skipGuests() {
    setGuests(null);
    setWedding({ estimatedGuests: null });
    advance();
  }

  function skipBudget() {
    setBudget(null);
    setWedding({ totalBudget: null });
    advance();
  }

  function skip() {
    update({ onboarded: true });
    nav({ to: "/painel" });
  }

  return (
    <div className="min-h-screen bg-sand/40">
      <header className="mx-auto max-w-2xl px-6 py-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-16">
        {/* Trail-style step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
          <p className="text-sm font-medium text-primary">Passo {step + 1} de {steps.length}</p>
          <h1 className="mt-2 font-serif text-3xl text-graphite">{titleFor(step)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitleFor(step)}</p>

          <div className="mt-8">
            {step === 0 && (
              <div className="space-y-2">
                <Label htmlFor="couple">Nome do casal</Label>
                <Input
                  id="couple" value={couple} onChange={(e) => setCouple(e.target.value)}
                  placeholder="Marina & Rafael"
                />
              </div>
            )}
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="date">Data do casamento</Label>
                <Input
                  id="date" type="date" value={date ?? ""}
                  onChange={(e) => setDate(e.target.value || null)}
                />
                <button
                  onClick={skipDate}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Ainda não tenho a data
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="guests">Quantos convidados vocês esperam?</Label>
                <Input
                  id="guests" type="number" min={0} value={guests ?? ""}
                  onChange={(e) => setGuests(e.target.value === "" ? null : Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Sem estresse — dá para ajustar depois. Serve pra estimar o buffet.
                </p>
                <button
                  onClick={skipGuests}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Não sei a quantidade de convidados
                </button>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento total estimado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <Input
                    id="budget" type="number" min={0} step={500} value={budget ?? ""}
                    onChange={(e) => setBudget(e.target.value === "" ? null : Number(e.target.value))}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {budget != null
                    ? `${brl(budget)} é a linha de referência — a gente ajuda você a ficar por dentro dela.`
                    : "Sem problemas — você define isso quando quiser, mais pra frente."}
                </p>
                <button
                  onClick={skipBudget}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Ainda não tenho um valor máximo
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            ) : (
              <button onClick={skip} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Pular por enquanto
              </button>
            )}
            <Button onClick={next} size="lg" className="gap-1">
              {step === 3 ? "Ir para o painel" : "Continuar"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function titleFor(s: number) {
  return [
    "Como se chama esse casal?",
    "Quando é o grande dia?",
    "Uma ideia de quantos convidados?",
    "E qual é o orçamento total?",
  ][s];
}
function subtitleFor(s: number) {
  return [
    "Vamos deixar tudo com a cara de vocês desde o começo.",
    "Serve pra saber quanto tempo temos até a comemoração.",
    "É só um chute inicial. Você refina os grupos depois.",
    "Sem julgamento — pode ser o número que fizer sentido pra vocês agora.",
  ][s];
}
