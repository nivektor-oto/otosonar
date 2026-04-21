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

    for (const alert of alerts) {
      if (alert.yearMin && listing.year < alert.yearMin) continue;
      if (alert.yearMax && listing.year > alert.yearMax) continue;
      if (alert.priceMax && listing.askingPrice > alert.priceMax) continue;
      if (alert.cityFilter && alert.cityFilter.toLowerCase() !== listing.city.toLowerCase()) continue;

      // Push once per alert per listing (simple debounce via lastTriggeredAt for same day)
      const sixHoursAgo = Date.now() - 6 * 3600_000;
      if (alert.lastTriggeredAt && alert.lastTriggeredAt.getTime() > sixHoursAgo) continue;

      const title = `${listing.brand} ${listing.model} · ${listing.year}`;
      const body = `${listing.askingPrice.toLocaleString("tr-TR")} ₺ · ${listing.city}`;

      await sendToUser(alert.userId, {
        title,
        body,
        url: `/pazaryeri/${listing.id}`,
      }).catch(() => undefined);

      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { lastTriggeredAt: new Date() },
      }).catch(() => undefined);
    }
  } catch {
    // noop
  }
}
