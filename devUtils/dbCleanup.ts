import 'dotenv/config';
/* Import Next.js prisma client module. */
import { prisma } from "@/lib/db";

async function cleanup() {
  const idsToDelete = [
    "acfe468d-4bd2-4739-8cc5-cfffadad13fa", 
    "e90e238c-5804-463b-8349-4bc37f1a212f", 
    "95947190-21ff-48db-8ead-e554307359f3", 
    "78570b62-c6be-4102-93a4-3e8f9e98b510", 
    "34107770-717b-4486-b816-d5f6e14de0b8", 
    "7e4c1c10-fce9-43f4-ba08-35e907709c85"
  ];

  await prisma.dBSortingEntry.deleteMany({
    where: { sortingId: { in: idsToDelete } },
  });

  await prisma.dBSorting.deleteMany({
    where: { id: { in: idsToDelete } },
  });

  console.log("Deleted duplicates:", idsToDelete);
}

cleanup().finally(() => prisma.$disconnect());
