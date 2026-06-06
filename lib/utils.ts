// lib/utils.ts
// Shared utility functions used across the app.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  if (amount >= 100000) {
    return `INR ${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `INR ${(amount / 1000).toFixed(0)}K`;
  }
  return `INR ${amount}`;
}

export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPackage(amount: number): string {
  if (amount >= 10000000) {
    return `INR ${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `INR ${(amount / 100000).toFixed(1)}L`;
  }
  return `INR ${(amount / 1000).toFixed(0)}K`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}

export function apiError(
  message: string,
  status: number,
  details?: unknown
): Response {
  return Response.json(
    {
      ok: false,
      error: message,
      details,
      meta: { status },
    },
    { status }
  );
}

export function apiSuccess<TData>(
  data: TData,
  meta?: Record<string, unknown>,
  init?: ResponseInit
): Response {
  return Response.json(
    {
      ok: true,
      data,
      meta: meta ?? {},
    },
    init
  );
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: TArgs) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
