-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('delivery', 'pickup');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('pending', 'preparing', 'ready', 'delivered');

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "orderType" "public"."OrderType" NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
