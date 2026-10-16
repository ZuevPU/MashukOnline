CREATE TABLE "media_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"program_id" integer,
	"deleted_at" timestamp with time zone,
	"payload_raw" jsonb,
	"fio" text NOT NULL,
	"birth_date" text,
	"country" text,
	"city" text,
	"email" text,
	"phone" text,
	"messenger" jsonb,
	"messenger_link" text,
	"org_name" text,
	"position" text,
	"media_type" jsonb,
	"media_type_other" text,
	"stream" text,
	"links" text,
	"why" text,
	"agree_truth" text,
	"agree_consent" text
);
--> statement-breakpoint
ALTER TABLE "media_applications" ADD CONSTRAINT "media_applications_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_applications_created_idx" ON "media_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_applications_email_idx" ON "media_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "media_applications_program_idx" ON "media_applications" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "media_applications_deleted_idx" ON "media_applications" USING btree ("deleted_at");