import { addDays, formatMonthLabel, isFutureDate, isPastDate } from "@/lib/date";
import { requireApiUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import type { Auction, Bid, DashboardData, DashboardPoint, Property, PropertyAnalysis, Task } from "@/types";

function groupByMonth<T extends { created_at: string }>(rows: T[], valueResolver: (row: T) => number) {
  const grouped = new Map<string, number>();

  rows.forEach((row) => {
    const label = formatMonthLabel(new Date(row.created_at));
    grouped.set(label, (grouped.get(label) ?? 0) + valueResolver(row));
  });

  return [...grouped.entries()].map(([label, value]) => ({ label, value }));
}

function buildSuccessSeries(bids: Bid[]): DashboardPoint[] {
  const grouped = new Map<string, { won: number; total: number }>();

  bids.forEach((bid) => {
    const label = formatMonthLabel(new Date(bid.created_at));
    const current = grouped.get(label) ?? { won: 0, total: 0 };
    current.total += 1;
    if (bid.status === "won") {
      current.won += 1;
    }
    grouped.set(label, current);
  });

  return [...grouped.entries()].map(([label, value]) => ({
    label,
    value: value.total > 0 ? (value.won / value.total) * 100 : 0,
  }));
}

function sortByDateAscending<T>(rows: T[], getter: (row: T) => string) {
  return [...rows].sort((a, b) => new Date(getter(a)).getTime() - new Date(getter(b)).getTime());
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const [
      propertiesResult,
      auctionsResult,
      bidsResult,
      analysisResult,
      tasksResult,
    ] = await Promise.all([
      auth.supabase.from("properties").select("*"),
      auth.supabase.from("auctions").select("*"),
      auth.supabase.from("bids").select("*"),
      auth.supabase.from("analysis").select("*"),
      auth.supabase.from("tasks").select("*"),
    ]);

    const resultErrors = [
      propertiesResult.error,
      auctionsResult.error,
      bidsResult.error,
      analysisResult.error,
      tasksResult.error,
    ].filter(Boolean);

    if (resultErrors.length > 0) {
      return fail("Erro ao agregar dados do dashboard.", 500, resultErrors[0]?.message);
    }

    const properties = (propertiesResult.data ?? []) as Property[];
    const auctions = (auctionsResult.data ?? []) as Auction[];
    const bids = (bidsResult.data ?? []) as Bid[];
    const analysis = (analysisResult.data ?? []) as PropertyAnalysis[];
    const tasks = (tasksResult.data ?? []) as Task[];

    const now = new Date();
    const weekLimit = addDays(now, 7);

    const investedCapital = bids.reduce((acc, bid) => {
      if (bid.status === "won") {
        return acc + (bid.placed_bid ?? bid.max_bid);
      }
      return acc;
    }, 0);

    const weeklyAuctions = auctions.filter((auction) => {
      const firstDate = new Date(auction.first_auction_at);
      return isFutureDate(firstDate) && firstDate <= weekLimit;
    }).length;

    const pendingTasks = tasks.filter((task) => task.status !== "done");
    const riskAlerts = pendingTasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      return isPastDate(dueDate) || dueDate <= addDays(now, 2);
    });

    const upcomingAuctions = sortByDateAscending(
      auctions.filter((auction) => isFutureDate(new Date(auction.first_auction_at))),
      (item) => item.first_auction_at,
    ).slice(0, 5);

    const dashboardData: DashboardData = {
      metrics: {
        total_properties: properties.length,
        ready_for_bid: properties.filter((property) => property.status === "ready_for_bid").length,
        weekly_auctions: weeklyAuctions,
        bids_submitted: bids.filter((bid) => bid.status === "submitted").length,
        won_properties: properties.filter((property) => property.status === "won").length,
        invested_capital: investedCapital,
      },
      auctions_by_month: groupByMonth(auctions, () => 1),
      success_rate: buildSuccessSeries(bids),
      average_roi: groupByMonth(analysis, (item) => item.roi_percent),
      watchlist: properties.filter((property) => property.watchlist).slice(0, 5),
      upcoming_auctions: upcomingAuctions,
      risk_alerts: sortByDateAscending(riskAlerts, (item) => item.due_date).slice(0, 5),
    };

    return ok(dashboardData);
  } catch (error) {
    return fail("Erro ao processar dashboard.", 500, String(error));
  }
}
