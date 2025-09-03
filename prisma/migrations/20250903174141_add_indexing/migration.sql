-- CreateIndex
CREATE INDEX "wpl_delivery_striker_idx" ON "public"."wpl_delivery"("striker");

-- CreateIndex
CREATE INDEX "wpl_delivery_bowler_idx" ON "public"."wpl_delivery"("bowler");

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_striker_idx" ON "public"."wpl_delivery"("match_id", "striker");

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_bowler_idx" ON "public"."wpl_delivery"("match_id", "bowler");

-- CreateIndex
CREATE INDEX "wpl_delivery_batting_team_idx" ON "public"."wpl_delivery"("batting_team");

-- CreateIndex
CREATE INDEX "wpl_delivery_bowling_team_idx" ON "public"."wpl_delivery"("bowling_team");

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_innings_idx" ON "public"."wpl_delivery"("match_id", "innings");

-- CreateIndex
CREATE INDEX "wpl_delivery_player_dismissed_idx" ON "public"."wpl_delivery"("player_dismissed");

-- CreateIndex
CREATE INDEX "wpl_delivery_striker_ball_idx" ON "public"."wpl_delivery"("striker", "ball");

-- CreateIndex
CREATE INDEX "wpl_delivery_bowler_ball_idx" ON "public"."wpl_delivery"("bowler", "ball");

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_batting_team_idx" ON "public"."wpl_delivery"("match_id", "batting_team");

-- CreateIndex
CREATE INDEX "wpl_delivery_match_id_bowling_team_idx" ON "public"."wpl_delivery"("match_id", "bowling_team");

-- CreateIndex
CREATE INDEX "wpl_delivery_striker_match_id_innings_idx" ON "public"."wpl_delivery"("striker", "match_id", "innings");

-- CreateIndex
CREATE INDEX "wpl_delivery_bowler_match_id_innings_idx" ON "public"."wpl_delivery"("bowler", "match_id", "innings");

-- CreateIndex
CREATE INDEX "wpl_match_start_date_idx" ON "public"."wpl_match"("start_date");

-- CreateIndex
CREATE INDEX "wpl_match_league_start_date_idx" ON "public"."wpl_match"("league", "start_date");

-- CreateIndex
CREATE INDEX "wpl_match_info_winner_idx" ON "public"."wpl_match_info"("winner");

-- CreateIndex
CREATE INDEX "wpl_match_info_date_winner_idx" ON "public"."wpl_match_info"("date", "winner");

-- CreateIndex
CREATE INDEX "wpl_official_match_id_official_type_idx" ON "public"."wpl_official"("match_id", "official_type");

-- CreateIndex
CREATE INDEX "wpl_person_registry_match_id_person_name_idx" ON "public"."wpl_person_registry"("match_id", "person_name");

-- CreateIndex
CREATE INDEX "wpl_person_registry_registry_id_idx" ON "public"."wpl_person_registry"("registry_id");

-- CreateIndex
CREATE INDEX "wpl_player_match_id_team_name_idx" ON "public"."wpl_player"("match_id", "team_name");

-- CreateIndex
CREATE INDEX "wpl_player_player_name_idx" ON "public"."wpl_player"("player_name");

-- CreateIndex
CREATE INDEX "wpl_player_team_name_player_name_idx" ON "public"."wpl_player"("team_name", "player_name");

-- CreateIndex
CREATE INDEX "wpl_team_match_id_team_name_idx" ON "public"."wpl_team"("match_id", "team_name");
