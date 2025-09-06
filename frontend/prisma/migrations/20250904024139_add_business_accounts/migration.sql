/*
  Warnings:

  - Added the required column `businessAccountId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "businessAccountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "businessAccountId" TEXT;

-- CreateTable
CREATE TABLE "public"."business_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "business_accounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_accounts" ADD CONSTRAINT "business_accounts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
