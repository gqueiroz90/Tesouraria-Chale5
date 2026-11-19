export const PEOPLE = 5;

export type Category = "aluguel" | "agua" | "luz" | "caixa" | "outros";

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  aluguel: { label: "Aluguel", color: "shell" },
  agua: { label: "Água", color: "ocean" },
  luz: { label: "Luz", color: "sun" },
  caixa: { label: "Caixa", color: "cyanSea" },
  outros: { label: "Outros", color: "lagoon" },
};

export interface Expense {
  id: string;
  description: string;
  category: Category;
  amount: number;
  date: string; // YYYY-MM-DD
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const monthOf = (date: string) => date.slice(0, 7);

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatDate = (date: string) => date.split("-").reverse().join("/");

// Caixa do Chalé: receitas de locações e gastos do fundo, separados do rateio.
export type BookingKind = "locacao" | "uso";

export const BOOKING_KINDS: Record<BookingKind, string> = {
  locacao: "Locação",
  uso: "Uso dos amigos",
};

export interface Booking {
  id: string;
  kind: BookingKind;
  name: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD (dia da saída; a noite dessa data fica livre)
  amount: number; // 0 para uso dos amigos
  note: string;
}

export type CashCategory = "manutencao" | "melhorias" | "reposicao" | "outros";

export const CASH_CATEGORIES: Record<CashCategory, { label: string; color: string }> = {
  manutencao: { label: "Manutenção", color: "shell" },
  melhorias: { label: "Melhorias", color: "ocean" },
  reposicao: { label: "Reposição de itens", color: "sun" },
  outros: { label: "Outros", color: "lagoon" },
};

export interface CashExpense {
  id: string;
  description: string;
  category: CashCategory;
  amount: number;
  date: string;
}

const DAY_MS = 86_400_000;
const toMs = (date: string) => Date.parse(`${date}T00:00:00Z`);

export const addDays = (date: string, n: number) =>
  new Date(toMs(date) + n * DAY_MS).toISOString().slice(0, 10);

export const nightsBetween = (from: string, to: string) =>
  Math.round((toMs(to) - toMs(from)) / DAY_MS);

export const bookingsOverlap = (a: Booking, b: Pick<Booking, "checkIn" | "checkOut">) =>
  a.checkIn < b.checkOut && b.checkIn < a.checkOut;

export const rentals = (bookings: Booking[]) => bookings.filter((b) => b.kind === "locacao");

export interface CashDeposit {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface CashEntry {
  id: string;
  recordId: string;
  type: "Aporte" | "Locação";
  description: string;
  amount: number;
  date: string;
}

export interface CashInflow {
  id: string;
  date: string;
  amount: number;
  source: "locacao" | "aporte" | "lancamento";
}

// Entradas do caixa: locações (na data da entrada), aportes diretos e
// lançamentos da categoria "Caixa" feitos na aba Lançamentos.
export const cashInflows = (
  bookings: Booking[],
  deposits: CashDeposit[],
  expenses: Expense[]
): CashInflow[] => [
  ...rentals(bookings).map((b) => ({ id: b.id, date: b.checkIn, amount: b.amount, source: "locacao" as const })),
  ...deposits.map((d) => ({ id: d.id, date: d.date, amount: d.amount, source: "aporte" as const })),
  ...expenses
    .filter((e) => e.category === "caixa")
    .map((e) => ({ id: e.id, date: e.date, amount: e.amount, source: "lancamento" as const })),
];

export const cashBalance = (inflows: CashInflow[], spending: CashExpense[]) =>
  inflows.reduce((a, i) => a + i.amount, 0) - spending.reduce((a, e) => a + e.amount, 0);
