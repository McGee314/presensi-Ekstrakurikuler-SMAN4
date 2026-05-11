-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERVISOR';

-- AlterTable
ALTER TABLE "ekskuls" ADD COLUMN     "hari" "DayOfWeek",
ADD COLUMN     "jamMulai" TEXT,
ADD COLUMN     "jamSelesai" TEXT,
ADD COLUMN     "lokasi" TEXT;

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "supervisor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'OPEN',
    "summary" TEXT,
    "closedAt" TIMESTAMP(3),
    "ekskulId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_profiles_userId_key" ON "supervisor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessions_ekskulId_tanggal_key" ON "attendance_sessions"("ekskulId", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentEkskulId_sessionId_key" ON "attendances"("studentEkskulId", "sessionId");

-- AddForeignKey
ALTER TABLE "supervisor_profiles" ADD CONSTRAINT "supervisor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_ekskulId_fkey" FOREIGN KEY ("ekskulId") REFERENCES "ekskuls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
