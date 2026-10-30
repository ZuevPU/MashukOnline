CREATE TABLE "form_moderators" (
	"form" text NOT NULL,
	"member_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_moderators_form_member_id_pk" PRIMARY KEY("form","member_id")
);
--> statement-breakpoint
ALTER TABLE "form_moderators" ADD CONSTRAINT "form_moderators_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_moderators_member_idx" ON "form_moderators" USING btree ("member_id");