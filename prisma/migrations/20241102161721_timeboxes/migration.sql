-- CreateEnum
CREATE TYPE "TimeboxStatus" AS ENUM ('idle', 'running', 'paused', 'completed');

-- CreateTable
CREATE TABLE "timeboxes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "comment" TEXT,
    "start_date_time" TIMESTAMP(3) NOT NULL,
    "end_date_time" TIMESTAMP(3) NOT NULL,
    "remaining_seconds" INTEGER NOT NULL,
    "status" "TimeboxStatus" NOT NULL DEFAULT 'idle',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeboxes_pkey" PRIMARY KEY ("id")
);
