import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function toCurrency(value: number | null | undefined): string {
  const normalized = typeof value === "number" ? value : 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(normalized);
}

export function toPercent(value: number | null | undefined): string {
  const normalized = typeof value === "number" ? value : 0;

  return `${normalized.toFixed(2)}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: undefined,
  }).format(date);
}

export function emptyToNull<T>(value: T): T | null {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}

export function toNullableNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
