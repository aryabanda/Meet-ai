/*
  Warnings:

  - A unique constraint covering the columns `[meetingId,userId]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invitation_meetingId_userId_key" ON "Invitation"("meetingId", "userId");
