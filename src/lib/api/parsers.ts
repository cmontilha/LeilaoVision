import { calculateFinancialAnalysis } from "@/lib/financial/calculations";
import {
  AUCTION_TYPE,
  BID_STATUS,
  CONTACT_TYPE,
  DOCUMENT_TYPE,
  POST_AUCTION_STATUS,
  PROPERTY_STATUS,
  TASK_PRIORITY,
  TASK_STATUS,
} from "@/types";

import {
  ensureBoolean,
  ensureEnum,
  ensureIsoDate,
  ensureNumber,
  ensureOptionalEnum,
  ensureOptionalIsoDate,
  ensureOptionalNumber,
  ensureOptionalString,
  ensureOptionalUrl,
  ensureOptionalUuid,
  ensureRequiredString,
  ValidationError,
} from "./validation";

function hasKey(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

function ensureOptionalEmail(value: unknown, field: string): string | null {
  const normalized = ensureOptionalString(value, field, 255);
  if (!normalized) {
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new ValidationError(`Campo ${field} deve ser e-mail válido.`);
  }

  return normalized;
}

export function parsePropertyCreate(payload: Record<string, unknown>) {
  return {
    auction_id: ensureOptionalUuid(payload.auction_id, "auction_id"),
    address: ensureRequiredString(payload.address, "address"),
    city: ensureRequiredString(payload.city, "city"),
    state: ensureRequiredString(payload.state, "state", 2).toUpperCase(),
    property_type: ensureRequiredString(payload.property_type, "property_type"),
    source_url: ensureOptionalUrl(payload.source_url, "source_url"),
    size_sqm: ensureOptionalNumber(payload.size_sqm, "size_sqm"),
    occupied: hasKey(payload, "occupied") ? ensureBoolean(payload.occupied, "occupied") : false,
    market_value: ensureOptionalNumber(payload.market_value, "market_value"),
    min_bid: ensureOptionalNumber(payload.min_bid, "min_bid"),
    renovation_cost: ensureOptionalNumber(payload.renovation_cost, "renovation_cost"),
    status: hasKey(payload, "status")
      ? ensureEnum(payload.status, PROPERTY_STATUS, "status")
      : "analyzing",
    watchlist: hasKey(payload, "watchlist") ? ensureBoolean(payload.watchlist, "watchlist") : false,
  };
}

export function parsePropertyUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "auction_id")) next.auction_id = ensureOptionalUuid(payload.auction_id, "auction_id");
  if (hasKey(payload, "address")) next.address = ensureRequiredString(payload.address, "address");
  if (hasKey(payload, "city")) next.city = ensureRequiredString(payload.city, "city");
  if (hasKey(payload, "state")) next.state = ensureRequiredString(payload.state, "state", 2).toUpperCase();
  if (hasKey(payload, "property_type"))
    next.property_type = ensureRequiredString(payload.property_type, "property_type");
  if (hasKey(payload, "source_url")) next.source_url = ensureOptionalUrl(payload.source_url, "source_url");
  if (hasKey(payload, "size_sqm")) next.size_sqm = ensureOptionalNumber(payload.size_sqm, "size_sqm");
  if (hasKey(payload, "occupied")) next.occupied = ensureBoolean(payload.occupied, "occupied");
  if (hasKey(payload, "market_value"))
    next.market_value = ensureOptionalNumber(payload.market_value, "market_value");
  if (hasKey(payload, "min_bid")) next.min_bid = ensureOptionalNumber(payload.min_bid, "min_bid");
  if (hasKey(payload, "renovation_cost"))
    next.renovation_cost = ensureOptionalNumber(payload.renovation_cost, "renovation_cost");
  if (hasKey(payload, "status")) next.status = ensureEnum(payload.status, PROPERTY_STATUS, "status");
  if (hasKey(payload, "watchlist")) next.watchlist = ensureBoolean(payload.watchlist, "watchlist");

  return next;
}

export function parseAuctionCreate(payload: Record<string, unknown>) {
  return {
    auctioneer: ensureRequiredString(payload.auctioneer, "auctioneer"),
    platform: ensureOptionalString(payload.platform, "platform"),
    auction_type: ensureEnum(payload.auction_type, AUCTION_TYPE, "auction_type"),
    first_auction_at: ensureIsoDate(payload.first_auction_at, "first_auction_at"),
    second_auction_at: ensureOptionalIsoDate(payload.second_auction_at, "second_auction_at"),
    commission_percent: ensureNumber(payload.commission_percent, "commission_percent"),
    payment_terms: ensureOptionalString(payload.payment_terms, "payment_terms", 2000),
    notice_url: ensureOptionalUrl(payload.notice_url, "notice_url"),
  };
}

export function parseAuctionUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "auctioneer"))
    next.auctioneer = ensureRequiredString(payload.auctioneer, "auctioneer");
  if (hasKey(payload, "platform")) next.platform = ensureOptionalString(payload.platform, "platform");
  if (hasKey(payload, "auction_type"))
    next.auction_type = ensureEnum(payload.auction_type, AUCTION_TYPE, "auction_type");
  if (hasKey(payload, "first_auction_at"))
    next.first_auction_at = ensureIsoDate(payload.first_auction_at, "first_auction_at");
  if (hasKey(payload, "second_auction_at"))
    next.second_auction_at = ensureOptionalIsoDate(payload.second_auction_at, "second_auction_at");
  if (hasKey(payload, "commission_percent"))
    next.commission_percent = ensureNumber(payload.commission_percent, "commission_percent");
  if (hasKey(payload, "payment_terms"))
    next.payment_terms = ensureOptionalString(payload.payment_terms, "payment_terms", 2000);
  if (hasKey(payload, "notice_url"))
    next.notice_url = ensureOptionalUrl(payload.notice_url, "notice_url");

  return next;
}

export function parseAnalysisCreate(payload: Record<string, unknown>) {
  const marketValue = ensureNumber(payload.market_value, "market_value");
  const maxBid = ensureNumber(payload.max_bid, "max_bid");
  const estimatedSaleValue = ensureNumber(payload.estimated_sale_value, "estimated_sale_value");
  const renovationCost = ensureNumber(payload.renovation_cost, "renovation_cost");
  const legalCost = ensureNumber(payload.legal_cost, "legal_cost");
  const itbiCost = ensureNumber(payload.itbi_cost, "itbi_cost");
  const registrationCost = ensureNumber(payload.registration_cost, "registration_cost");
  const evictionCost = ensureNumber(payload.eviction_cost, "eviction_cost");

  const calc = calculateFinancialAnalysis({
    marketValue,
    maxBid,
    estimatedSaleValue,
    renovationCost,
    legalCost,
    itbiCost,
    registrationCost,
    evictionCost,
  });

  return {
    property_id: ensureOptionalUuid(payload.property_id, "property_id"),
    market_value: marketValue,
    max_bid: maxBid,
    estimated_sale_value: estimatedSaleValue,
    renovation_cost: renovationCost,
    legal_cost: legalCost,
    itbi_cost: itbiCost,
    registration_cost: registrationCost,
    eviction_cost: evictionCost,
    estimated_profit: calc.estimatedProfit,
    roi_percent: calc.roiPercent,
    safety_margin: calc.safetyMargin,
    break_even_value: calc.breakEvenValue,
  };
}

export function parseAnalysisUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "property_id"))
    next.property_id = ensureOptionalUuid(payload.property_id, "property_id");
  if (hasKey(payload, "market_value"))
    next.market_value = ensureNumber(payload.market_value, "market_value");
  if (hasKey(payload, "max_bid")) next.max_bid = ensureNumber(payload.max_bid, "max_bid");
  if (hasKey(payload, "estimated_sale_value"))
    next.estimated_sale_value = ensureNumber(payload.estimated_sale_value, "estimated_sale_value");
  if (hasKey(payload, "renovation_cost"))
    next.renovation_cost = ensureNumber(payload.renovation_cost, "renovation_cost");
  if (hasKey(payload, "legal_cost")) next.legal_cost = ensureNumber(payload.legal_cost, "legal_cost");
  if (hasKey(payload, "itbi_cost")) next.itbi_cost = ensureNumber(payload.itbi_cost, "itbi_cost");
  if (hasKey(payload, "registration_cost"))
    next.registration_cost = ensureNumber(payload.registration_cost, "registration_cost");
  if (hasKey(payload, "eviction_cost"))
    next.eviction_cost = ensureNumber(payload.eviction_cost, "eviction_cost");

  if (
    hasKey(next, "market_value") &&
    hasKey(next, "max_bid") &&
    hasKey(next, "estimated_sale_value") &&
    hasKey(next, "renovation_cost") &&
    hasKey(next, "legal_cost") &&
    hasKey(next, "itbi_cost") &&
    hasKey(next, "registration_cost") &&
    hasKey(next, "eviction_cost")
  ) {
    const calc = calculateFinancialAnalysis({
      marketValue: next.market_value as number,
      maxBid: next.max_bid as number,
      estimatedSaleValue: next.estimated_sale_value as number,
      renovationCost: next.renovation_cost as number,
      legalCost: next.legal_cost as number,
      itbiCost: next.itbi_cost as number,
      registrationCost: next.registration_cost as number,
      evictionCost: next.eviction_cost as number,
    });

    next.estimated_profit = calc.estimatedProfit;
    next.roi_percent = calc.roiPercent;
    next.safety_margin = calc.safetyMargin;
    next.break_even_value = calc.breakEvenValue;
  }

  return next;
}

export function parseBidCreate(payload: Record<string, unknown>) {
  return {
    property_id: ensureOptionalUuid(payload.property_id, "property_id"),
    auction_id: ensureOptionalUuid(payload.auction_id, "auction_id"),
    max_bid: ensureNumber(payload.max_bid, "max_bid"),
    placed_bid: ensureOptionalNumber(payload.placed_bid, "placed_bid"),
    status: hasKey(payload, "status") ? ensureEnum(payload.status, BID_STATUS, "status") : "planned",
  };
}

export function parseBidUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "property_id"))
    next.property_id = ensureOptionalUuid(payload.property_id, "property_id");
  if (hasKey(payload, "auction_id"))
    next.auction_id = ensureOptionalUuid(payload.auction_id, "auction_id");
  if (hasKey(payload, "max_bid")) next.max_bid = ensureNumber(payload.max_bid, "max_bid");
  if (hasKey(payload, "placed_bid"))
    next.placed_bid = ensureOptionalNumber(payload.placed_bid, "placed_bid");
  if (hasKey(payload, "status")) next.status = ensureEnum(payload.status, BID_STATUS, "status");

  return next;
}

export function parseDocumentCreate(payload: Record<string, unknown>) {
  return {
    property_id: ensureOptionalUuid(payload.property_id, "property_id"),
    type: ensureEnum(payload.type, DOCUMENT_TYPE, "type"),
    file_name: ensureRequiredString(payload.file_name, "file_name"),
    storage_path: ensureRequiredString(payload.storage_path, "storage_path", 600),
    file_url: ensureOptionalUrl(payload.file_url, "file_url"),
  };
}

export function parseDocumentUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "property_id"))
    next.property_id = ensureOptionalUuid(payload.property_id, "property_id");
  if (hasKey(payload, "type")) next.type = ensureEnum(payload.type, DOCUMENT_TYPE, "type");
  if (hasKey(payload, "file_name"))
    next.file_name = ensureRequiredString(payload.file_name, "file_name");
  if (hasKey(payload, "storage_path"))
    next.storage_path = ensureRequiredString(payload.storage_path, "storage_path", 600);
  if (hasKey(payload, "file_url")) next.file_url = ensureOptionalUrl(payload.file_url, "file_url");

  return next;
}

export function parseTaskCreate(payload: Record<string, unknown>) {
  return {
    property_id: ensureOptionalUuid(payload.property_id, "property_id"),
    name: ensureRequiredString(payload.name, "name"),
    due_date: ensureIsoDate(payload.due_date, "due_date"),
    priority: ensureEnum(payload.priority, TASK_PRIORITY, "priority"),
    status: hasKey(payload, "status")
      ? ensureEnum(payload.status, TASK_STATUS, "status")
      : "pending",
  };
}

export function parseTaskUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "property_id"))
    next.property_id = ensureOptionalUuid(payload.property_id, "property_id");
  if (hasKey(payload, "name")) next.name = ensureRequiredString(payload.name, "name");
  if (hasKey(payload, "due_date")) next.due_date = ensureIsoDate(payload.due_date, "due_date");
  if (hasKey(payload, "priority"))
    next.priority = ensureEnum(payload.priority, TASK_PRIORITY, "priority");
  if (hasKey(payload, "status")) next.status = ensureEnum(payload.status, TASK_STATUS, "status");

  return next;
}

export function parseContactCreate(payload: Record<string, unknown>) {
  return {
    type: ensureEnum(payload.type, CONTACT_TYPE, "type"),
    name: ensureRequiredString(payload.name, "name"),
    role: ensureOptionalString(payload.role, "role"),
    company: ensureOptionalString(payload.company, "company"),
    email: ensureOptionalEmail(payload.email, "email"),
    phone: ensureOptionalString(payload.phone, "phone"),
    notes: ensureOptionalString(payload.notes, "notes", 2000),
  };
}

export function parseContactUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "type")) next.type = ensureEnum(payload.type, CONTACT_TYPE, "type");
  if (hasKey(payload, "name")) next.name = ensureRequiredString(payload.name, "name");
  if (hasKey(payload, "role")) next.role = ensureOptionalString(payload.role, "role");
  if (hasKey(payload, "company")) next.company = ensureOptionalString(payload.company, "company");
  if (hasKey(payload, "email")) next.email = ensureOptionalEmail(payload.email, "email");
  if (hasKey(payload, "phone")) next.phone = ensureOptionalString(payload.phone, "phone");
  if (hasKey(payload, "notes")) next.notes = ensureOptionalString(payload.notes, "notes", 2000);

  return next;
}

export function parseReportCreate(payload: Record<string, unknown>) {
  return {
    name: ensureRequiredString(payload.name, "name"),
    period_start: ensureOptionalIsoDate(payload.period_start, "period_start"),
    period_end: ensureOptionalIsoDate(payload.period_end, "period_end"),
    avg_roi: ensureOptionalNumber(payload.avg_roi, "avg_roi"),
    success_rate: ensureOptionalNumber(payload.success_rate, "success_rate"),
    invested_capital: ensureOptionalNumber(payload.invested_capital, "invested_capital"),
    discarded_properties: ensureOptionalNumber(payload.discarded_properties, "discarded_properties"),
  };
}

export function parseReportUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "name")) next.name = ensureRequiredString(payload.name, "name");
  if (hasKey(payload, "period_start"))
    next.period_start = ensureOptionalIsoDate(payload.period_start, "period_start");
  if (hasKey(payload, "period_end"))
    next.period_end = ensureOptionalIsoDate(payload.period_end, "period_end");
  if (hasKey(payload, "avg_roi")) next.avg_roi = ensureOptionalNumber(payload.avg_roi, "avg_roi");
  if (hasKey(payload, "success_rate"))
    next.success_rate = ensureOptionalNumber(payload.success_rate, "success_rate");
  if (hasKey(payload, "invested_capital"))
    next.invested_capital = ensureOptionalNumber(payload.invested_capital, "invested_capital");
  if (hasKey(payload, "discarded_properties"))
    next.discarded_properties = ensureOptionalNumber(
      payload.discarded_properties,
      "discarded_properties",
    );

  return next;
}

export function parsePostAuctionCreate(payload: Record<string, unknown>) {
  return {
    property_id: ensureOptionalUuid(payload.property_id, "property_id"),
    bid_id: ensureOptionalUuid(payload.bid_id, "bid_id"),
    status: hasKey(payload, "status")
      ? ensureEnum(payload.status, POST_AUCTION_STATUS, "status")
      : "pagamento_pendente",
    payment_amount: ensureOptionalNumber(payload.payment_amount, "payment_amount"),
    auctioneer_commission: ensureOptionalNumber(
      payload.auctioneer_commission,
      "auctioneer_commission",
    ),
    registry_status: ensureOptionalString(payload.registry_status, "registry_status"),
    eviction_status: ensureOptionalString(payload.eviction_status, "eviction_status"),
    renovation_notes: ensureOptionalString(payload.renovation_notes, "renovation_notes", 2000),
    resale_value: ensureOptionalNumber(payload.resale_value, "resale_value"),
  };
}

export function parsePostAuctionUpdate(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  if (hasKey(payload, "property_id"))
    next.property_id = ensureOptionalUuid(payload.property_id, "property_id");
  if (hasKey(payload, "bid_id")) next.bid_id = ensureOptionalUuid(payload.bid_id, "bid_id");
  if (hasKey(payload, "status"))
    next.status = ensureOptionalEnum(payload.status, POST_AUCTION_STATUS, "status");
  if (hasKey(payload, "payment_amount"))
    next.payment_amount = ensureOptionalNumber(payload.payment_amount, "payment_amount");
  if (hasKey(payload, "auctioneer_commission"))
    next.auctioneer_commission = ensureOptionalNumber(
      payload.auctioneer_commission,
      "auctioneer_commission",
    );
  if (hasKey(payload, "registry_status"))
    next.registry_status = ensureOptionalString(payload.registry_status, "registry_status");
  if (hasKey(payload, "eviction_status"))
    next.eviction_status = ensureOptionalString(payload.eviction_status, "eviction_status");
  if (hasKey(payload, "renovation_notes"))
    next.renovation_notes = ensureOptionalString(payload.renovation_notes, "renovation_notes", 2000);
  if (hasKey(payload, "resale_value"))
    next.resale_value = ensureOptionalNumber(payload.resale_value, "resale_value");

  return next;
}
