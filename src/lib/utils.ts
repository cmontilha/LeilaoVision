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

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T00:00:00(?:\.000)?Z$)/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
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
