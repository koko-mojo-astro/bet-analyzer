-- CreateTable
CREATE TABLE "verified_results" (
    "id" SERIAL NOT NULL,
    "league" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "halftimeGoals" INTEGER NOT NULL,
    "htouHcap" DOUBLE PRECISION NOT NULL,
    "htou01" DOUBLE PRECISION NOT NULL,
    "htou02" DOUBLE PRECISION NOT NULL,
    "htoe01" DOUBLE PRECISION NOT NULL,
    "htoe02" DOUBLE PRECISION NOT NULL,
    "htbg01" DOUBLE PRECISION NOT NULL,
    "htbg02" DOUBLE PRECISION NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeHalfGoals" INTEGER NOT NULL,
    "awayHalfGoals" INTEGER NOT NULL,
    "verified_by" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verified_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verified_results_league_idx" ON "verified_results"("league");

-- CreateIndex
CREATE INDEX "verified_results_htouHcap_htou01_htou02_idx" ON "verified_results"("htouHcap", "htou01", "htou02");

-- CreateIndex
CREATE INDEX "verified_results_htoe01_htoe02_idx" ON "verified_results"("htoe01", "htoe02");

-- CreateIndex
CREATE INDEX "verified_results_htbg01_htbg02_idx" ON "verified_results"("htbg01", "htbg02");