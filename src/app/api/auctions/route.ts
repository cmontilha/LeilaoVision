import { createCrudHandlers } from "@/lib/api/crud";
import { parseAuctionCreate, parseAuctionUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "auctions",
  parseCreate: parseAuctionCreate,
  parseUpdate: parseAuctionUpdate,
  orderBy: "first_auction_at",
});

export const { GET, POST, PATCH, DELETE } = handlers;
