-- CreateTable
CREATE TABLE "ai_chat_request" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sanitized_question" TEXT,
    "league" TEXT,
    "generated_sql" TEXT,
    "row_count" INTEGER,
    "execution_time_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_code" TEXT,
    "error_message" TEXT,
    "is_accurate" BOOLEAN,
    "feedback_note" TEXT,
    "feedback_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_chat_request_league_idx" ON "ai_chat_request"("league");

-- CreateIndex
CREATE INDEX "ai_chat_request_success_idx" ON "ai_chat_request"("success");

-- CreateIndex
CREATE INDEX "ai_chat_request_is_accurate_idx" ON "ai_chat_request"("is_accurate");

-- CreateIndex
CREATE INDEX "ai_chat_request_created_at_idx" ON "ai_chat_request"("created_at");