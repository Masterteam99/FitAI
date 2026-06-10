-- AlterTable
ALTER TABLE "users" ADD COLUMN     "premiumGrantedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "challenge_participants_userId_idx" ON "challenge_participants"("userId");
