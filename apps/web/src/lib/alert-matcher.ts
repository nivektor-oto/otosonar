import { prisma } from "@/lib/prisma";
import { sendToUser } from "@/lib/push";

interface ListingLike {
  id: string;
  brand: string;
  model: string;
  year: number;
  askingPrice: number;
  city: string;
}

/**
 * Fires relevant PriceAlert push notifications when a new listing is created.
 * Best-effort: errors are swallowed so listing creation is never blocked.
 */
export async function fireMatchingAlerts(listing: ListingLike): Promise<void> {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: {
        active: true,
        brand: { equals: listing.brand, mode: "insensitive" },
        OR: [
          { model: null },
          { model: { equals: listing.model, mode: "insensitive" } },
        ],
      },
      take: 200,
    });

    const sixHoursAgo = Date.now() - 6 * 3600_000;
    const matching = alerts.filter((alert) => {
      if (alert.yearMin && listing.year < alert.yearMin) return false;
      if (alert.yearMax && listing.year > alert.yearMax) return false;
      if (alert.priceMax && listing.askingPrice > alert.priceMax) return false;
      if (alert.cityFilter && alert.cityFilter.toLowerCase() !== listing.city.toLowerCase()) return false;
      if (alert.lastTriggeredAt && alert.lastTriggeredAt.getTime() > sixHoursAgo) return false;
      return true;
    });
    if (matching.length === 0) return;

    const title = `${listing.brand} ${listing.model} · ${listing.year}`;
    const body = `${listing.askingPrice.toLocaleString("tr-TR")} TL · ${listing.city}`;
    const now = new Date();

    // Paralel push + tek batched update — eski for-loop seri zincir N+1'di.
    await Promise.all(
      matching.map((alert) =>
        sendToUser(alert.userId, {
          title,
          body,
          url: `/pazaryeri/${listing.id}`,
        }).catch(() => undefined),
      ),
    );

    await prisma.priceAlert.updateMany({
      where: { id: { in: matching.map((a) => a.id) } },
      data: { lastTriggeredAt: now },
    }).catch(() => undefined);
  } catch {
    // noop
  }
}
