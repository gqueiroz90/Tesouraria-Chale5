export const PEOPLE = 5;

export type Category = "aluguel" | "agua" | "luz" | "outros";

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  aluguel: { label: "Aluguel", color: "shell" },
  agua: { label: "Água", color: "ocean" },
  luz: { label: "Luz", color: "sun" },
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
