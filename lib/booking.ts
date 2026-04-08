export type BookingSlotValue = "LUNCH" | "DINNER";

export function isBookingSlotValue(value: unknown): value is BookingSlotValue {
  return value === "LUNCH" || value === "DINNER";
}

export function normalizeEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getSlotRange(eventDateUtc: Date, slot: BookingSlotValue) {
  const startHour = slot === "LUNCH" ? 13 : 19;
  const endHour = slot === "LUNCH" ? 16 : 23;

  const startTime = new Date(eventDateUtc);
  startTime.setUTCHours(startHour, 0, 0, 0);

  const endTime = new Date(eventDateUtc);
  endTime.setUTCHours(endHour, 0, 0, 0);

  return { startTime, endTime };
}

export function getLockExpiration(now: Date) {
  return new Date(now.getTime() + 15 * 60 * 1000);
}
