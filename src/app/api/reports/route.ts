import { createCrudHandlers } from "@/lib/api/crud";
import { parseReportCreate, parseReportUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "reports",
  parseCreate: parseReportCreate,
  parseUpdate: parseReportUpdate,
});

export const { GET, POST, PATCH, DELETE } = handlers;
