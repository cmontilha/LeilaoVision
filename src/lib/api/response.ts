import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status = 400, details?: string) {
  const includeDetails = process.env.NODE_ENV !== "production" && Boolean(details);

  return NextResponse.json(
    {
      error: message,
      ...(includeDetails ? { details } : {}),
    },
    { status },
  );
}
