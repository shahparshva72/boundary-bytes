-- CreateTable
CREATE TABLE "player_style" (
    "identifier" TEXT NOT NULL,
    "key_cricinfo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT,
    "batting_hand" TEXT,
    "bowling_hand" TEXT,
    "bowling_type" TEXT,
    "bowling_sub_type" TEXT,
    "playing_role" TEXT NOT NULL,
    "playing_role_detail" TEXT NOT NULL,
    "batting_style_raw" TEXT,
    "bowling_style_raw" TEXT,

    CONSTRAINT "player_style_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_style_key_cricinfo_key" ON "player_style"("key_cricinfo");

-- CreateIndex
CREATE INDEX "player_style_name_idx" ON "player_style"("name");

-- CreateIndex
CREATE INDEX "player_style_full_name_idx" ON "player_style"("full_name");

-- CreateIndex
CREATE INDEX "player_style_playing_role_idx" ON "player_style"("playing_role");

-- CreateIndex
CREATE INDEX "player_style_playing_role_detail_idx" ON "player_style"("playing_role_detail");

-- CreateIndex
CREATE INDEX "player_style_batting_hand_idx" ON "player_style"("batting_hand");

-- CreateIndex
CREATE INDEX "player_style_bowling_type_idx" ON "player_style"("bowling_type");
