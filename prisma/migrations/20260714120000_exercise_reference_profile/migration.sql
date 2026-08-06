-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "referenceProfile" JSONB,
ADD COLUMN     "referenceProfileAt" TIMESTAMP(3),
ADD COLUMN     "referenceProfileVersion" INTEGER;
