-- CreateEnum
CREATE TYPE "Status" AS ENUM ('idle', 'paused', 'completed');

-- CreateTable
CREATE TABLE "timeboxes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "comment" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "remaining_time" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'idle',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeboxes_pkey" PRIMARY KEY ("id")
);
