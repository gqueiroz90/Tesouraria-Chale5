import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import type { Booking, CashDeposit, CashExpense } from "./types";
import { db } from "./firebase";

export interface CollectionApi<T> {
  items: T[];
  loading: boolean;
  error: string;
  save: (item: Omit<T, "id"> & { id?: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function requireDb() {
  if (!db) throw new Error("Firebase não está configurado.");
  return db;
}

function useCollection<T extends { id: string }>(
  name: string,
  readError: string
): CollectionApi<T> {
  const [items, setItems] = useState<T[]>([]);
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
      collection(firestore, name),
      (snapshot) => {
        setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T));
        setLoading(false);
        setError("");
      },
      () => {
        setError(readError);
        setLoading(false);
      }
    );
  }, [name, readError]);

  const save = async (item: Omit<T, "id"> & { id?: string }) => {
    const firestore = requireDb();
    const { id, ...data } = item;
    if (id) {
      await updateDoc(doc(firestore, name, id), data);
      setItems((current) =>
        current.map((existing) =>
          existing.id === id ? ({ ...existing, ...data } as T) : existing
        )
      );
    } else {
      const created = await addDoc(collection(firestore, name), data);
      setItems((current) => [
        ...current.filter((existing) => existing.id !== created.id),
        { id: created.id, ...data } as T,
      ]);
    }
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(requireDb(), name, id));
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return { items, loading, error, save, remove };
}

export const useBookings = () =>
  useCollection<Booking>(
    "reservas",
    "Não foi possível ler as reservas. Verifique as regras do Firestore."
  );

export const useCashExpenses = () =>
  useCollection<CashExpense>(
    "gastosCaixa",
    "Não foi possível ler os gastos do caixa. Verifique as regras do Firestore."
  );

export const useCashDeposits = () =>
  useCollection<CashDeposit>(
    "aportes",
    "Não foi possível ler os aportes do caixa. Verifique as regras do Firestore."
  );
