import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { validateOwnedReferences } from "@/lib/api/ownership";
import { parseBidCreate, parseBidUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "bids",
  parseCreate: parseBidCreate,
  parseUpdate: parseBidUpdate,
  validateWrite: async ({ payload, userId, supabase }) =>
    validateOwnedReferences({
      payload,
      userId,
      supabase: supabase as Parameters<typeof validateOwnedReferences>[0]["supabase"],
      rules: [
        { field: "property_id", table: "properties" },
        { field: "auction_id", table: "auctions" },
      ],
    }),
  applyListFilters(query, request: NextRequest) {
    const status = request.nextUrl.searchParams.get("status");
    const propertyId = request.nextUrl.searchParams.get("property_id");

    let nextQuery = query;

    if (status) {
      nextQuery = nextQuery.eq("status", status);
    }

    if (propertyId) {
      nextQuery = nextQuery.eq("property_id", propertyId);
    }

    return nextQuery;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
