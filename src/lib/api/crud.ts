import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { buildRateLimitKey, consumeRateLimit, isSameOriginRequest } from "@/lib/api/security";

import { fail, ok } from "./response";
import { ValidationError, ensureObject, ensureUuid } from "./validation";

type PayloadParser = (payload: Record<string, unknown>) => Record<string, unknown>;

interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
}

interface QueryLike extends PromiseLike<QueryResult> {
  eq: (column: string, value: unknown) => QueryLike;
  ilike: (column: string, pattern: string) => QueryLike;
  order: (column: string, options: { ascending: boolean }) => QueryLike;
  range: (from: number, to: number) => QueryLike;
}

interface SingleMutationResult {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
}

interface InsertBuilder {
  select: (columns: string) => {
    single: () => Promise<SingleMutationResult>;
  };
}

interface UpdateBuilder {
  eq: (column: string, value: unknown) => UpdateBuilder;
  select: (columns: string) => {
    single: () => Promise<SingleMutationResult>;
  };
}

interface DeleteResult {
  error: { message: string } | null;
}

interface DeleteBuilder extends PromiseLike<DeleteResult> {
  eq: (column: string, value: unknown) => DeleteBuilder;
}

interface DynamicTableClient {
  select: (columns: string) => QueryLike;
  insert: (values: Record<string, unknown>) => InsertBuilder;
  update: (values: Record<string, unknown>) => UpdateBuilder;
  delete: () => DeleteBuilder;
}

interface CrudRouteOptions {
  table: string;
  orderBy?: string;
  parseCreate: PayloadParser;
  parseUpdate: PayloadParser;
  applyListFilters?: (query: QueryLike, request: NextRequest) => QueryLike;
  validateWrite?: (params: {
    payload: Record<string, unknown>;
    userId: string;
    supabase: unknown;
    request: NextRequest;
    mode: "create" | "update";
    id?: string;
  }) => Promise<string | null> | string | null;
  rateLimits?: Partial<
    Record<
      "GET" | "POST" | "PATCH" | "DELETE",
      {
        limit: number;
        windowMs: number;
      }
    >
  >;
}

export function createCrudHandlers({
  table,
  orderBy = "created_at",
  parseCreate,
  parseUpdate,
  applyListFilters,
  validateWrite,
  rateLimits,
}: CrudRouteOptions) {
  function resolveRateLimit(method: "GET" | "POST" | "PATCH" | "DELETE") {
    if (method === "GET") {
      return {
        limit: rateLimits?.GET?.limit ?? 180,
        windowMs: rateLimits?.GET?.windowMs ?? 60_000,
      };
    }

    if (method === "PATCH") {
      return {
        limit: rateLimits?.PATCH?.limit ?? 90,
        windowMs: rateLimits?.PATCH?.windowMs ?? 60_000,
      };
    }

    if (method === "DELETE") {
      return {
        limit: rateLimits?.DELETE?.limit ?? 45,
        windowMs: rateLimits?.DELETE?.windowMs ?? 60_000,
      };
    }

    return {
      limit: rateLimits?.POST?.limit ?? 60,
      windowMs: rateLimits?.POST?.windowMs ?? 60_000,
    };
  }

  function enforceRateLimit(request: NextRequest, userId: string, method: "GET" | "POST" | "PATCH" | "DELETE") {
    const methodLimit = resolveRateLimit(method);
    const key = buildRateLimitKey(request, `crud:${table}:${method}`, userId);
    return consumeRateLimit(key, methodLimit.limit, methodLimit.windowMs);
  }

  async function GET(request: NextRequest) {
    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const rate = enforceRateLimit(request, auth.user.id, "GET");
    if (!rate.allowed) {
      return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
    }

    const rawLimit = request.nextUrl.searchParams.get("limit");
    let limit = 200;
    if (rawLimit !== null) {
      const parsedLimit = Number(rawLimit);
      if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 200) {
        return fail("Parâmetro limit inválido. Use um valor entre 1 e 200.", 422);
      }
      limit = parsedLimit;
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      let query = tableClient.select("*").eq("user_id", auth.user.id);

      if (applyListFilters) {
        query = applyListFilters(query, request);
      }

      const { data, error } = await query.order(orderBy, { ascending: false }).range(0, limit - 1);

      if (error) {
        return fail("Erro ao buscar registros.", 500, error.message);
      }

      return ok(data ?? []);
    } catch (error) {
      return fail("Erro ao processar requisição.", 500, String(error));
    }
  }

  async function POST(request: NextRequest) {
    if (!isSameOriginRequest(request)) {
      return fail("Origem da requisição não permitida.", 403);
    }

    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const rate = enforceRateLimit(request, auth.user.id, "POST");
    if (!rate.allowed) {
      return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      const body = ensureObject(await request.json());
      const parsed = parseCreate(body);
      const payload = {
        ...parsed,
        user_id: auth.user.id,
      };

      if (validateWrite) {
        const validationError = await validateWrite({
          payload,
          userId: auth.user.id,
          supabase: auth.supabase,
          request,
          mode: "create",
        });

        if (validationError) {
          return fail(validationError, 422);
        }
      }

      const { data, error } = await tableClient.insert(payload).select("*").single();

      if (error) {
        return fail("Erro ao criar registro.", 400, error.message);
      }

      return ok(data, 201);
    } catch (error) {
      if (error instanceof ValidationError) {
        return fail(error.message, 422);
      }

      return fail("Erro ao processar requisição.", 500, String(error));
    }
  }

  async function PATCH(request: NextRequest) {
    if (!isSameOriginRequest(request)) {
      return fail("Origem da requisição não permitida.", 403);
    }

    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const rawId = request.nextUrl.searchParams.get("id");
    if (!rawId) {
      return fail("Parâmetro id é obrigatório.", 422);
    }

    const rate = enforceRateLimit(request, auth.user.id, "PATCH");
    if (!rate.allowed) {
      return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
    }

    let id: string;
    try {
      id = ensureUuid(rawId, "id");
    } catch (error) {
      if (error instanceof ValidationError) {
        return fail(error.message, 422);
      }
      return fail("Parâmetro id inválido.", 422);
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      const body = ensureObject(await request.json());
      const parsed = parseUpdate(body);

      if (Object.keys(parsed).length === 0) {
        return fail("Nenhum campo válido para atualização.", 422);
      }

      if (validateWrite) {
        const validationError = await validateWrite({
          payload: parsed,
          userId: auth.user.id,
          supabase: auth.supabase,
          request,
          mode: "update",
          id,
        });

        if (validationError) {
          return fail(validationError, 422);
        }
      }

      const { data, error } = await tableClient
        .update(parsed)
        .eq("id", id)
        .eq("user_id", auth.user.id)
        .select("*")
        .single();

      if (error) {
        return fail("Erro ao atualizar registro.", 400, error.message);
      }

      return ok(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        return fail(error.message, 422);
      }

      return fail("Erro ao processar requisição.", 500, String(error));
    }
  }

  async function DELETE(request: NextRequest) {
    if (!isSameOriginRequest(request)) {
      return fail("Origem da requisição não permitida.", 403);
    }

    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const rawId = request.nextUrl.searchParams.get("id");
    if (!rawId) {
      return fail("Parâmetro id é obrigatório.", 422);
    }

    const rate = enforceRateLimit(request, auth.user.id, "DELETE");
    if (!rate.allowed) {
      return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
    }

    let id: string;
    try {
      id = ensureUuid(rawId, "id");
    } catch (error) {
      if (error instanceof ValidationError) {
        return fail(error.message, 422);
      }
      return fail("Parâmetro id inválido.", 422);
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      const { error } = await tableClient.delete().eq("id", id).eq("user_id", auth.user.id);

      if (error) {
        return fail("Erro ao remover registro.", 400, error.message);
      }

      return ok({ deleted: true });
    } catch (error) {
      return fail("Erro ao processar requisição.", 500, String(error));
    }
  }

  return {
    GET,
    POST,
    PATCH,
    DELETE,
  };
}
