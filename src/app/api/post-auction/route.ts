import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { parsePostAuctionCreate, parsePostAuctionUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "post_auction",
  parseCreate: parsePostAuctionCreate,
  parseUpdate: parsePostAuctionUpdate,
  applyListFilters(query, request: NextRequest) {
    const status = request.nextUrl.searchParams.get("status");

    if (status) {
      return query.eq("status", status);
    }

    return query;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
