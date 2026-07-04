import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/data/store";
import { Heart, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rota do Sim — orçamento de casamento sem sufoco" },
      { name: "description", content: "O app que ajuda casais a planejar, acompanhar e controlar todos os gastos do casamento em um só lugar." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { onboarded, update } = useData();
  const [mode, setMode] = useState<"login" | "signup">("signup");

  function handleContinue() {
    if (onboarded) navigate({ to: "/painel" });
    else navigate({ to: "/onboarding" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <Logo />
      </header>

      <main className="mx-auto grid max-w-6xl gap-16 px-6 py-8 md:grid-cols-2 md:py-16">
        {/* Left — pitch */}
        <section className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-medium text-sand-foreground">
            <Sparkles className="h-3.5 w-3.5" /> planejamento sem sufoco
          </span>
          <h1 className="mt-5 font-serif text-4xl leading-[1.1] text-graphite md:text-5xl">
            Cada parcela paga é <span className="text-primary">um passo</span> a mais no caminho até o seu sim.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            Junte tudo em um só lugar: fornecedores, parcelas, convidados, orçamento. Você vê o quadro inteiro sem planilhas nem susto no cartão.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-graphite">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-olive">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              Uma trilha visual mostrando o quanto você já andou
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-olive">
                <Heart className="h-3.5 w-3.5" />
              </span>
              Compare cotações lado a lado antes de fechar
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-olive">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              Simule "e se convidarmos 20 a menos?" em segundos
            </li>
          </ul>
        </section>

        {/* Right — auth card */}
        <section className="flex items-center">
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${mode === "signup" ? "bg-background text-graphite shadow-sm" : "text-muted-foreground"}`}
              >
                Criar conta
              </button>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${mode === "login" ? "bg-background text-graphite shadow-sm" : "text-muted-foreground"}`}
              >
                Entrar
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); update({ onboarded: mode === "login" ? true : false }); handleContinue(); }}
              className="mt-6 space-y-4"
            >
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Seu nome</Label>
                  <Input id="name" placeholder="Marina" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@exemplo.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" size="lg">
                {mode === "signup" ? "Começar planejamento" : "Entrar"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={handleContinue}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-graphite transition hover:bg-secondary"
            >
              <GoogleIcon /> Continuar com Google
            </button>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Ao continuar, você concorda com nossos termos. Sem letras miúdas assustadoras.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        Feito para quem quer chegar ao altar com tranquilidade — e sem sufoco no boleto.
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
