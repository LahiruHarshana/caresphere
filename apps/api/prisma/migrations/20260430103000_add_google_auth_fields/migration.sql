-- AlterTable
ALTER TABLE "User" ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "firebaseUid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
