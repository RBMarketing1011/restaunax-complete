/*
  Warnings:

  - You are about to drop the column `access_token` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `session_state` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `businessAccountId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `businessAccountId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `business_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."business_accounts" DROP CONSTRAINT "business_accounts_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_businessAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_businessAccountId_fkey";

-- DropIndex
DROP INDEX "public"."accounts_provider_providerAccountId_key";

-- AlterTable
ALTER TABLE "public"."accounts" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "id_token",
DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
DROP COLUMN "refresh_token",
DROP COLUMN "scope",
DROP COLUMN "session_state",
DROP COLUMN "token_type",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "businessAccountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "businessAccountId",
ADD COLUMN     "accountId" TEXT;

-- DropTable
DROP TABLE "public"."business_accounts";

-- DropTable
DROP TABLE "public"."sessions";

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
