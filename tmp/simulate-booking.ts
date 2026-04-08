import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function simulate() {
  const hallId = "royal-orchid-banquet";
  const customerId = "cmn744h8p0000gct21wrcvcfz";
  const eventDate = new Date("2026-04-15");
  const slot = "LUNCH";
  const guestCount = 400;
  const totalPrice = 86200;
  const packageName = "Classic";
  const addOns = ["live-music"];
  const paymentMethod = "CASH";

  console.log("Starting simulation for hall:", hallId, "customer:", customerId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete expired locks
      await tx.bookingLock.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      });

      // 2. Check for existing non-cancelled bookings
      const existingBooking = await tx.booking.findFirst({
        where: {
          hallId,
          eventDate,
          slot,
          status: { not: "CANCELLED" },
        },
      });

      if (existingBooking) {
        throw new Error("ALREADY_BOOKED");
      }

      // 3. Create the booking
      console.log("Creating booking...");
      const createdBooking = await tx.booking.create({
        data: {
          customerId,
          hallId,
          eventDate,
          slot: slot as any,
          status: "ADVANCE_PAID",
          startTime: new Date(eventDate.setHours(12, 0, 0, 0)),
          endTime: new Date(eventDate.setHours(16, 0, 0, 0)),
          guestCount,
          totalPrice,
          packageName,
          addOns: addOns,
          contactName: "Test User",
          contactEmail: "tester@example.com",
          contactPhone: "12345678",
        },
      });

      // 4. Create transaction record
      console.log("Creating transaction record...");
      const initialInstallmentAmount = Number((totalPrice * 0.25).toFixed(2));
      const createdTransaction = await tx.transaction.create({
        data: {
          bookingId: createdBooking.id,
          customerId,
          amount: initialInstallmentAmount,
          status: "SUCCESS",
          transactionType: "INITIAL_INSTALLMENT",
          paymentMethod,
          paymentReference: `SIM-${Date.now()}`,
          paidAt: new Date(),
        },
      });

      return { createdBooking, createdTransaction };
    });

    console.log("Simulation Result:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("Simulation Failed!");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    if (error.code) console.error("Prisma Error Code:", error.code);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

simulate();
