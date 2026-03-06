import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api/auth";

import { fail, ok } from "./response";
import { ValidationError, ensureObject } from "./validation";

type PayloadParser = (payload: Record<string, unknown>) => Record<string, unknown>;

interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
}

interface QueryLike extends PromiseLike<QueryResult> {
  eq: (column: string, value: unknown) => QueryLike;
  ilike: (column: string, pattern: string) => QueryLike;
  order: (column: string, options: { ascending: boolean }) => QueryLike;
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
}

export function createCrudHandlers({
  table,
  orderBy = "created_at",
  parseCreate,
  parseUpdate,
  applyListFilters,
}: CrudRouteOptions) {
  async function GET(request: NextRequest) {
    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      let query = tableClient.select("*").eq("user_id", auth.user.id);

      if (applyListFilters) {
        query = applyListFilters(query, request);
      }

      const { data, error } = await query.order(orderBy, { ascending: false });

      if (error) {
        return fail("Erro ao buscar registros.", 500, error.message);
      }

      return ok(data ?? []);
    } catch (error) {
      return fail("Erro ao processar requisição.", 500, String(error));
    }
  }

  async function POST(request: NextRequest) {
    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      const body = ensureObject(await request.json());
      const parsed = parseCreate(body);
      const payload = {
        ...parsed,
        user_id: auth.user.id,
      };

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
    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return fail("Parâmetro id é obrigatório.", 422);
    }

    try {
      const tableClient = auth.supabase.from(table) as unknown as DynamicTableClient;
      const body = ensureObject(await request.json());
      const parsed = parseUpdate(body);

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
    const auth = await requireApiUser();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return fail("Parâmetro id é obrigatório.", 422);
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
