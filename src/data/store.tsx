import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type VendorStatus = "orcamento" | "negociando" | "fechado" | "pago";
export type InstallmentStatus = "pago" | "pendente" | "atrasado";
export type GuestStatus = "convidado" | "confirmado" | "nao_vai";
export type CollaboratorRole = "visualizador" | "editor";

export interface Installment {
  id: string;
  vendorId: string;
  label: string;
  amount: number;
  dueDate: string; // ISO yyyy-mm-dd
  status: InstallmentStatus;
}

export interface Vendor {
  id: string;
  name: string;
  categoryId: string;
  totalAmount: number;
  status: VendorStatus;
  paymentMethod: string;
  notes?: string;
  attachments?: { id: string; name: string }[];
}

export interface VendorQuote {
  id: string;
  categoryId: string;
  vendorName: string;
  amount: number;
  paymentMethod: string;
  deliveryTerm: string;
  notes?: string;
  archived?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  planned: number;
  perGuest?: boolean; // varies with guest count (e.g. buffet)
}

export interface Guest {
  id: string;
  name: string;
  group: string;
  status: GuestStatus;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole;
}

export interface Wedding {
  couple: string;
  date: string | null; // ISO; null = casal ainda não decidiu a data
  estimatedGuests: number | null; // null = casal ainda não sabe estimar
  totalBudget: number | null; // null = casal ainda não definiu um teto
}

interface State {
  wedding: Wedding;
  categories: Category[];
  vendors: Vendor[];
  installments: Installment[];
  quotes: VendorQuote[];
  guests: Guest[];
  collaborators: Collaborator[];
  onboarded: boolean;
}

const today = new Date();
const future = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const initialState: State = {
  onboarded: false,
  wedding: {
    couple: "Marina & Rafael",
    date: future(180),
    estimatedGuests: 120,
    totalBudget: 90000,
  },
  categories: [
    { id: "c-buffet", name: "Buffet", emoji: "🍽️", planned: 32000, perGuest: true },
    { id: "c-decor", name: "Decoração", emoji: "🌿", planned: 12000 },
    { id: "c-foto", name: "Fotografia", emoji: "📷", planned: 8500 },
    { id: "c-traje", name: "Vestido e traje", emoji: "👗", planned: 9000 },
    { id: "c-musica", name: "Música", emoji: "🎶", planned: 6500 },
    { id: "c-convites", name: "Convites", emoji: "✉️", planned: 2500 },
    { id: "c-lua", name: "Lua de mel", emoji: "🌙", planned: 15000 },
    { id: "c-outros", name: "Outros", emoji: "✨", planned: 4500 },
  ],
  vendors: [
    {
      id: "v-1", name: "Buffet Oliveira", categoryId: "c-buffet", totalAmount: 30000,
      status: "fechado", paymentMethod: "6x no boleto",
      notes: "Confirmado cardápio degustação para 24/03.",
    },
    {
      id: "v-2", name: "Estúdio Luz Natural", categoryId: "c-foto", totalAmount: 7800,
      status: "fechado", paymentMethod: "3x cartão",
    },
    {
      id: "v-3", name: "Ateliê Flor de Sal", categoryId: "c-decor", totalAmount: 11200,
      status: "negociando", paymentMethod: "à combinar",
    },
    {
      id: "v-4", name: "DJ Nômade", categoryId: "c-musica", totalAmount: 5200,
      status: "pago", paymentMethod: "PIX à vista",
    },
  ],
  installments: [
    { id: "i-1", vendorId: "v-1", label: "Sinal", amount: 6000, dueDate: future(-30), status: "pago" },
    { id: "i-2", vendorId: "v-1", label: "Parcela 2/6", amount: 4800, dueDate: future(3), status: "pendente" },
    { id: "i-3", vendorId: "v-1", label: "Parcela 3/6", amount: 4800, dueDate: future(34), status: "pendente" },
    { id: "i-4", vendorId: "v-2", label: "Sinal", amount: 2600, dueDate: future(-14), status: "pago" },
    { id: "i-5", vendorId: "v-2", label: "Parcela final", amount: 5200, dueDate: future(6), status: "pendente" },
    { id: "i-6", vendorId: "v-4", label: "Pagamento único", amount: 5200, dueDate: future(-2), status: "pago" },
  ],
  quotes: [
    { id: "q-1", categoryId: "c-foto", vendorName: "Estúdio Luz Natural", amount: 7800, paymentMethod: "3x cartão", deliveryTerm: "60 dias", notes: "Álbum incluso" },
    { id: "q-2", categoryId: "c-foto", vendorName: "Foto & Film Co.", amount: 9200, paymentMethod: "à vista", deliveryTerm: "45 dias", notes: "Vídeo curto extra" },
    { id: "q-3", categoryId: "c-foto", vendorName: "Ana Retratos", amount: 6500, paymentMethod: "2x cartão", deliveryTerm: "90 dias", notes: "Sem álbum físico" },
  ],
  guests: [
    ...Array.from({ length: 28 }).map((_, i) => ({ id: `g-nb-${i}`, name: `Convidado noiva ${i + 1}`, group: "Família da noiva", status: (i < 22 ? "confirmado" : "convidado") as GuestStatus })),
    ...Array.from({ length: 26 }).map((_, i) => ({ id: `g-nv-${i}`, name: `Convidado noivo ${i + 1}`, group: "Família do noivo", status: (i < 20 ? "confirmado" : i < 24 ? "convidado" : "nao_vai") as GuestStatus })),
    ...Array.from({ length: 40 }).map((_, i) => ({ id: `g-am-${i}`, name: `Amigo ${i + 1}`, group: "Amigos", status: (i < 30 ? "confirmado" : "convidado") as GuestStatus })),
    ...Array.from({ length: 18 }).map((_, i) => ({ id: `g-tr-${i}`, name: `Colega ${i + 1}`, group: "Trabalho", status: (i < 8 ? "confirmado" : "convidado") as GuestStatus })),
  ],
  collaborators: [
    { id: "col-1", name: "Sônia (mãe da noiva)", email: "sonia@email.com", role: "visualizador" },
    { id: "col-2", name: "Pedro (irmão)", email: "pedro@email.com", role: "editor" },
  ],
};

const STORAGE_KEY = "rota-do-sim-state-v1";

interface Ctx extends State {
  update: (patch: Partial<State>) => void;
  setWedding: (w: Partial<Wedding>) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  addVendor: (v: Omit<Vendor, "id">) => Vendor;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  removeVendor: (id: string) => void;
  addInstallment: (i: Omit<Installment, "id">) => void;
  updateInstallment: (id: string, patch: Partial<Installment>) => void;
  addQuote: (q: Omit<VendorQuote, "id">) => void;
  chooseQuote: (quoteId: string) => void;
  archiveQuote: (quoteId: string) => void;
  addGuest: (g: Omit<Guest, "id">) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  addCollaborator: (c: Omit<Collaborator, "id">) => void;
  removeCollaborator: (id: string) => void;
  reset: () => void;
}

const DataContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as State;
    } catch {
      /* noop */
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<Ctx>(() => ({
    ...state,
    update: (patch) => setState((s) => ({ ...s, ...patch })),
    setWedding: (w) => setState((s) => ({ ...s, wedding: { ...s.wedding, ...w } })),
    addCategory: (c) => setState((s) => ({ ...s, categories: [...s.categories, { ...c, id: uid() }] })),
    updateCategory: (id, patch) => setState((s) => ({
      ...s, categories: s.categories.map((c) => c.id === id ? { ...c, ...patch } : c),
    })),
    removeCategory: (id) => setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) })),
    addVendor: (v) => {
      const vendor = { ...v, id: uid() };
      setState((s) => ({ ...s, vendors: [...s.vendors, vendor] }));
      return vendor;
    },
    updateVendor: (id, patch) => setState((s) => ({
      ...s, vendors: s.vendors.map((v) => v.id === id ? { ...v, ...patch } : v),
    })),
    removeVendor: (id) => setState((s) => ({
      ...s,
      vendors: s.vendors.filter((v) => v.id !== id),
      installments: s.installments.filter((i) => i.vendorId !== id),
    })),
    addInstallment: (i) => setState((s) => ({ ...s, installments: [...s.installments, { ...i, id: uid() }] })),
    updateInstallment: (id, patch) => setState((s) => ({
      ...s, installments: s.installments.map((i) => i.id === id ? { ...i, ...patch } : i),
    })),
    addQuote: (q) => setState((s) => ({ ...s, quotes: [...s.quotes, { ...q, id: uid() }] })),
    chooseQuote: (quoteId) => setState((s) => {
      const q = s.quotes.find((qq) => qq.id === quoteId);
      if (!q) return s;
      const vendor: Vendor = {
        id: uid(),
        name: q.vendorName,
        categoryId: q.categoryId,
        totalAmount: q.amount,
        status: "fechado",
        paymentMethod: q.paymentMethod,
        notes: q.notes,
      };
      return {
        ...s,
        vendors: [...s.vendors, vendor],
        quotes: s.quotes.map((qq) => qq.categoryId === q.categoryId ? { ...qq, archived: true } : qq),
      };
    }),
    archiveQuote: (quoteId) => setState((s) => ({
      ...s, quotes: s.quotes.map((q) => q.id === quoteId ? { ...q, archived: true } : q),
    })),
    addGuest: (g) => setState((s) => ({ ...s, guests: [...s.guests, { ...g, id: uid() }] })),
    updateGuest: (id, patch) => setState((s) => ({
      ...s, guests: s.guests.map((g) => g.id === id ? { ...g, ...patch } : g),
    })),
    removeGuest: (id) => setState((s) => ({ ...s, guests: s.guests.filter((g) => g.id !== id) })),
    addCollaborator: (c) => setState((s) => ({ ...s, collaborators: [...s.collaborators, { ...c, id: uid() }] })),
    removeCollaborator: (id) => setState((s) => ({
      ...s, collaborators: s.collaborators.filter((c) => c.id !== id),
    })),
    reset: () => setState(initialState),
  }), [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// Derived helpers
export function useTotals() {
  const { vendors, installments, wedding } = useData();
  const commitedByCategory: Record<string, number> = {};
  const spentByCategory: Record<string, number> = {};
  for (const v of vendors) {
    commitedByCategory[v.categoryId] = (commitedByCategory[v.categoryId] || 0) + v.totalAmount;
  }
  for (const i of installments) {
    if (i.status === "pago") {
      const v = vendors.find((vv) => vv.id === i.vendorId);
      if (v) spentByCategory[v.categoryId] = (spentByCategory[v.categoryId] || 0) + i.amount;
    }
  }
  const committed = Object.values(commitedByCategory).reduce((a, b) => a + b, 0);
  const paid = Object.values(spentByCategory).reduce((a, b) => a + b, 0);
  const remaining = wedding.totalBudget == null ? null : wedding.totalBudget - committed;
  const owed = committed - paid;
  return { commitedByCategory, spentByCategory, committed, paid, remaining, owed };
}
