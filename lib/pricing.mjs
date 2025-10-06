import { ROOM_RULES } from "./roomRules.mjs";

// For converting date formats.
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// A function to calculate nr of nights.
export function calculateNights(checkInDate, checkOutDate) {
  const inD = parseDate(checkInDate);
  const outD = parseDate(checkOutDate);
  const diffMs = outD - inD;
  if (isNaN(diffMs) || diffMs <= 0) {
    throw new Error("Invalid dates: checkOutDate must be after checkInDate");
  }
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Function for checkign room capacity.
export function validateCapacity({ numGuests, rooms }) {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    throw new Error("At least one room must be selected");
  }
  if (!Number.isInteger(numGuests) || numGuests < 1) {
    throw new Error("numGuests must be a positive integer");
  }

  let totalCapacity = 0;
  for (const { type, quantity } of rooms) {
    const rule = ROOM_RULES[type];
    if (!rule) throw new Error(`Unknown room type: ${type}`);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for ${type}`);
    }
    totalCapacity += rule.maxGuestsPerRoom * quantity;
  }
  if (numGuests > totalCapacity) {
    throw new Error(
      `Too many guests: capacity ${totalCapacity} < requested ${numGuests}`
    );
  }
}

// Total price calculation.
export function calculateTotalPrice({ rooms, nights }) {
  let total = 0;
  for (const { type, quantity } of rooms) {
    const rule = ROOM_RULES[type];
    if (!rule) throw new Error(`Unknown room type: ${type}`);
    total += rule.pricePerNight * quantity * nights;
  }
  return total;
}
