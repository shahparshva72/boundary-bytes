-- CreateTable
CREATE TABLE "wpl_match" (
    "match_id" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,

    CONSTRAINT "wpl_match_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "wpl_delivery" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "innings" INTEGER NOT NULL,
    "ball" TEXT NOT NULL,
    "batting_team" TEXT NOT NULL,
    "bowling_team" TEXT NOT NULL,
    "striker" TEXT NOT NULL,
    "non_striker" TEXT NOT NULL,
    "bowler" TEXT NOT NULL,
    "runs_off_bat" INTEGER NOT NULL,
    "extras" INTEGER NOT NULL,
    "wides" INTEGER NOT NULL,
    "noballs" INTEGER NOT NULL,
    "byes" INTEGER NOT NULL,
    "legbyes" INTEGER NOT NULL,
    "penalty" INTEGER NOT NULL,
    "wicket_type" TEXT,
    "player_dismissed" TEXT,
    "other_wicket_type" TEXT,
    "other_player_dismissed" TEXT,

    CONSTRAINT "wpl_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_idx" ON "wpl_delivery"("match_id");

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_innings_ball_idx" ON "wpl_delivery"("match_id", "innings", "ball");

-- AddForeignKey
ALTER TABLE "wpl_delivery" ADD CONSTRAINT "wpl_delivery_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "wpl_match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;
