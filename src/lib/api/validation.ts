export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function normalizeEmptyToNull<T>(value: T): T {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return (trimmed === "" ? null : trimmed) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeEmptyToNull(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
      key,
      normalizeEmptyToNull(entryValue),
    ]);

    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function ensureObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("Payload inválido.");
  }

  return normalizeEmptyToNull(input as Record<string, unknown>);
}

export function ensureRequiredString(
  value: unknown,
  field: string,
  maxLength = 255,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`Campo obrigatório: ${field}`);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ValidationError(`Campo ${field} excede ${maxLength} caracteres.`);
  }

  return normalized;
}

export function ensureOptionalString(
  value: unknown,
  field: string,
  maxLength = 2000,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`Campo ${field} deve ser texto.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`Campo ${field} excede ${maxLength} caracteres.`);
  }

  return normalized;
}

export function ensureBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new ValidationError(`Campo ${field} deve ser boolean.`);
  }

  return value;
}

export function ensureOptionalBoolean(value: unknown, field: string): boolean | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "boolean") {
    throw new ValidationError(`Campo ${field} deve ser boolean.`);
  }

  return value;
}

export function ensureNumber(value: unknown, field: string): number {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    throw new ValidationError(`Campo ${field} deve ser número.`);
  }

  return numeric;
}

export function ensureOptionalNumber(value: unknown, field: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return ensureNumber(value, field);
}

export function ensureUuid(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Campo ${field} deve ser UUID.`);
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    throw new ValidationError(`Campo ${field} deve ser UUID válido.`);
  }

  return value;
}

export function ensureOptionalUuid(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return ensureUuid(value, field);
}

export function ensureIsoDate(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Campo ${field} deve ser data ISO.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`Campo ${field} deve ser data ISO válida.`);
  }

  return date.toISOString();
}

export function ensureOptionalIsoDate(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return ensureIsoDate(value, field);
}

export function ensureUrl(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Campo ${field} deve ser URL.`);
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new ValidationError(`Campo ${field} deve ser URL http/https.`);
    }

    return url.toString();
  } catch {
    throw new ValidationError(`Campo ${field} deve ser URL válida.`);
  }
}

export function ensureOptionalUrl(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return ensureUrl(value, field);
}

export function ensureEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    throw new ValidationError(`Campo ${field} inválido.`);
  }

  return value as T;
}

export function ensureOptionalEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  field: string,
): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  return ensureEnum(value, values, field);
}
