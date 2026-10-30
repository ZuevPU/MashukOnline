CREATE TABLE "support_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"page" text,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "support_requests_created_idx" ON "support_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "support_requests_resolved_idx" ON "support_requests" USING btree ("resolved_at");