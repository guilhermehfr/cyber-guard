-- AlterTable
ALTER TABLE "Player" ADD COLUMN "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Player_googleId_key" ON "Player"("googleId");