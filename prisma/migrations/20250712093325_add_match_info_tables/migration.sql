-- CreateTable
CREATE TABLE "wpl_match_info" (
    "match_id" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "balls_per_over" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "event" TEXT NOT NULL,
    "match_number" INTEGER NOT NULL,
    "venue" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "toss_winner" TEXT NOT NULL,
    "toss_decision" TEXT NOT NULL,
    "player_of_match" TEXT,
    "winner" TEXT,
    "winner_runs" INTEGER,
    "winner_wickets" INTEGER,

    CONSTRAINT "wpl_match_info_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "wpl_team" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "team_name" TEXT NOT NULL,

    CONSTRAINT "wpl_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wpl_player" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "team_name" TEXT NOT NULL,
    "player_name" TEXT NOT NULL,

    CONSTRAINT "wpl_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wpl_official" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "official_type" TEXT NOT NULL,
    "official_name" TEXT NOT NULL,

    CONSTRAINT "wpl_official_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wpl_person_registry" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "person_name" TEXT NOT NULL,
    "registry_id" TEXT NOT NULL,

    CONSTRAINT "wpl_person_registry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wpl_team" ADD CONSTRAINT "wpl_team_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "wpl_match_info"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wpl_player" ADD CONSTRAINT "wpl_player_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "wpl_match_info"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wpl_official" ADD CONSTRAINT "wpl_official_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "wpl_match_info"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wpl_person_registry" ADD CONSTRAINT "wpl_person_registry_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "wpl_match_info"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;
