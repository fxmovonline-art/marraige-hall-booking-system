import { prisma } from "./lib/prisma";

async function test() {
  try {
    console.log("Testing Prisma connection...");
    const user = await prisma.user.findFirst();
    console.log("User found:", user ? "Yes" : "No");

    console.log("Testing Complaint creation...");
    if (user) {
      const complaint = await prisma.complaint.create({
        data: {
          customerId: user.id,
          subject: "Test Subject",
          message: "Test Message",
          status: "PENDING",
        },
      });
      console.log("Complaint created:", complaint.id);
      
      // Cleanup
      await prisma.complaint.delete({ where: { id: complaint.id } });
      console.log("Test complaint deleted.");
    } else {
      console.log("No user found to test complaint creation.");
    }
  } catch (error) {
    console.error("Prisma Test Error:", error);
  } finally {
    process.exit();
  }
}

test();
