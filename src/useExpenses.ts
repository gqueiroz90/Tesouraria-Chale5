import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import type { Expense } from "./types";
import { db } from "./firebase";

type ExpenseInput = Omit<Expense, "id"> & { id?: string };

function requireDb() {
  if (!db) throw new Error("Firebase não está configurado.");
  return db;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let firestore;
    try {
      firestore = requireDb();
    } catch {
      setError("Firebase não está configurado.");
      setLoading(false);
      return;
    }

    return onSnapshot(
      collection(firestore, "expenses"),
      (snapshot) => {
        setExpenses(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }) as Expense)
            .sort((a, b) => b.date.localeCompare(a.date))
        );
        setLoading(false);
        setError("");
      },
      () => {
        setError("Não foi possível ler os lançamentos. Verifique as regras do Firestore.");
        setLoading(false);
      }
    );
  }, []);

  const save = async (expense: ExpenseInput) => {
    const firestore = requireDb();
    const { id, ...data } = expense;
    if (id) {
      await updateDoc(doc(firestore, "expenses", id), data);
      setExpenses((current) =>
        current
          .map((item) => (item.id === id ? { ...item, ...data } : item))
          .sort((a, b) => b.date.localeCompare(a.date))
      );
    } else {
      const created = await addDoc(collection(firestore, "expenses"), data);
      setExpenses((current) => {
        const savedExpense = { id: created.id, ...data };
        return [
          ...current.filter((item) => item.id !== created.id),
          savedExpense,
        ].sort((a, b) => b.date.localeCompare(a.date));
      });
    }
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(requireDb(), "expenses", id));
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  };

  return { expenses, loading, error, save, remove };
}
