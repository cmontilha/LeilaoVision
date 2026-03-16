import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { validateOwnedReferences } from "@/lib/api/ownership";
import { parsePostAuctionCreate, parsePostAuctionUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "post_auction",
  parseCreate: parsePostAuctionCreate,
  parseUpdate: parsePostAuctionUpdate,
  validateWrite: async ({ payload, userId, supabase }) =>
    validateOwnedReferences({
      payload,
      userId,
      supabase: supabase as Parameters<typeof validateOwnedReferences>[0]["supabase"],
      rules: [
        { field: "property_id", table: "properties" },
        { field: "bid_id", table: "bids" },
      ],
    }),
  applyListFilters(query, request: NextRequest) {
    const status = request.nextUrl.searchParams.get("status");

    if (status) {
      return query.eq("status", status);
    }

    return query;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
