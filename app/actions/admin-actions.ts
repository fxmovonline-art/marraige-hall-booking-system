"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
}

export async function deleteUser(userId: string) {
  try {
    await verifyAdmin();
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete user." };
  }
}

export async function deleteOwnerProfile(ownerProfileId: string) {
  try {
    await verifyAdmin();
    await prisma.ownerProfile.delete({
      where: { id: ownerProfileId },
    });
    revalidatePath("/dashboard/admin/owners");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete owner profile." };
  }
}

export async function deleteHall(hallId: string) {
  try {
    await verifyAdmin();
    await prisma.hall.delete({
      where: { id: hallId },
    });
    revalidatePath("/dashboard/admin/halls");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete hall." };
  }
}
