-- CreateTable
CREATE TABLE "match_history" (
    "id" SERIAL NOT NULL,
    "match" TEXT NOT NULL,
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

    CONSTRAINT "match_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_history_league_idx" ON "match_history"("league");

-- CreateIndex
CREATE INDEX "match_history_htouHcap_htou01_htou02_idx" ON "match_history"("htouHcap", "htou01", "htou02");

-- CreateIndex
CREATE INDEX "match_history_htoe01_htoe02_idx" ON "match_history"("htoe01", "htoe02");

-- CreateIndex
CREATE INDEX "match_history_htbg01_htbg02_idx" ON "match_history"("htbg01", "htbg02");
