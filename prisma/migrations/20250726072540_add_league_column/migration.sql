-- AlterTable
ALTER TABLE "wpl_match" ADD COLUMN     "league" TEXT NOT NULL DEFAULT 'WPL';

-- AlterTable
ALTER TABLE "wpl_match_info" ADD COLUMN     "league" TEXT NOT NULL DEFAULT 'WPL';

-- CreateIndex
CREATE INDEX "wpl_match_league_idx" ON "wpl_match"("league");

-- CreateIndex
CREATE INDEX "wpl_match_league_season_idx" ON "wpl_match"("league", "season");

-- CreateIndex
CREATE INDEX "wpl_match_info_league_idx" ON "wpl_match_info"("league");

-- CreateIndex
CREATE INDEX "wpl_match_info_league_season_idx" ON "wpl_match_info"("league", "season");
