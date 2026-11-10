CREATE TABLE "competence_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"program_id" integer,
	"deleted_at" timestamp with time zone,
	"payload_raw" jsonb,
	"fio" text NOT NULL,
	"federal_district" text,
	"region" text,
	"city" text,
	"birth_date" text,
	"workplace" text,
	"position" text,
	"phone" text,
	"email" text,
	"colleagues" text,
	"arrival_date" text,
	"arrival_time" text,
	"arrival_place" text,
	"arrival_flight" text,
	"departure_from" text,
	"departure_flight" text,
	"departure_date" text,
	"departure_time" text,
	"agree_consent" text
);
--> statement-breakpoint
ALTER TABLE "competence_applications" ADD CONSTRAINT "competence_applications_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "competence_applications_created_idx" ON "competence_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "competence_applications_email_idx" ON "competence_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "competence_applications_program_idx" ON "competence_applications" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "competence_applications_deleted_idx" ON "competence_applications" USING btree ("deleted_at");