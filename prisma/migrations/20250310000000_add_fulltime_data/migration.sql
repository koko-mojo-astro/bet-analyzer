-- AlterTable
ALTER TABLE "match_history" ADD COLUMN "fulltimeGoals" INTEGER;
ALTER TABLE "match_history" ADD COLUMN "homeFullGoals" INTEGER;
ALTER TABLE "match_history" ADD COLUMN "awayFullGoals" INTEGER;
ALTER TABLE "match_history" ADD COLUMN "ouHcap" DOUBLE PRECISION;
ALTER TABLE "match_history" ADD COLUMN "ou01" DOUBLE PRECISION;
ALTER TABLE "match_history" ADD COLUMN "ou02" DOUBLE PRECISION;
ALTER TABLE "match_history" ADD COLUMN "oe01" DOUBLE PRECISION;
ALTER TABLE "match_history" ADD COLUMN "oe02" DOUBLE PRECISION;
ALTER TABLE "match_history" ADD COLUMN "bg01" DOUBLE PRECISION;
ALTER TABLE "match_history" ADD COLUMN "bg02" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "match_history_ouHcap_ou01_ou02_idx" ON "match_history"("ouHcap", "ou01", "ou02");

-- CreateIndex
CREATE INDEX "match_history_oe01_oe02_idx" ON "match_history"("oe01", "oe02");

-- CreateIndex
CREATE INDEX "match_history_bg01_bg02_idx" ON "match_history"("bg01", "bg02");

-- AlterTable for verified_results
ALTER TABLE "verified_results" ADD COLUMN "fulltimeGoals" INTEGER;
ALTER TABLE "verified_results" ADD COLUMN "homeFullGoals" INTEGER;
ALTER TABLE "verified_results" ADD COLUMN "awayFullGoals" INTEGER;
ALTER TABLE "verified_results" ADD COLUMN "ouHcap" DOUBLE PRECISION;
ALTER TABLE "verified_results" ADD COLUMN "ou01" DOUBLE PRECISION;
ALTER TABLE "verified_results" ADD COLUMN "ou02" DOUBLE PRECISION;
ALTER TABLE "verified_results" ADD COLUMN "oe01" DOUBLE PRECISION;
ALTER TABLE "verified_results" ADD COLUMN "oe02" DOUBLE PRECISION;
ALTER TABLE "verified_results" ADD COLUMN "bg01" DOUBLE PRECISION;
ALTER TABLE "verified_results" ADD COLUMN "bg02" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "verified_results_ouHcap_ou01_ou02_idx" ON "verified_results"("ouHcap", "ou01", "ou02");

-- CreateIndex
CREATE INDEX "verified_results_oe01_oe02_idx" ON "verified_results"("oe01", "oe02");

-- CreateIndex
CREATE INDEX "verified_results_bg01_bg02_idx" ON "verified_results"("bg01", "bg02");