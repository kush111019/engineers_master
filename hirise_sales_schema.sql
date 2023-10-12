DROP TABLE IF EXISTS "chat";
CREATE TABLE "public"."chat" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "chat_name" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "last_message" character varying,
    "group_admin" character varying,
    "sales_id" uuid,
    "user_a" uuid,
    "user_b" uuid,
    "is_group_chat" boolean DEFAULT false NOT NULL,
    "company_id" uuid,
    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "chat_company_id" ON "public"."chat" USING btree ("company_id");

CREATE INDEX "chat_id" ON "public"."chat" USING btree ("id");

CREATE INDEX "chat_sales_id" ON "public"."chat" USING btree ("sales_id");


DROP TABLE IF EXISTS "chat_room_members";
CREATE TABLE "public"."chat_room_members" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "room_id" uuid,
    "user_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "group_name" character varying,
    CONSTRAINT "chat_room_members_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "chat_room_members_id" ON "public"."chat_room_members" USING btree ("id");

CREATE INDEX "chat_room_members_room_id" ON "public"."chat_room_members" USING btree ("room_id");

CREATE INDEX "chat_room_members_user_id" ON "public"."chat_room_members" USING btree ("user_id");


DROP TABLE IF EXISTS "commission_split";
CREATE TABLE "public"."commission_split" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "closer_percentage" integer,
    "supporter_percentage" integer,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "user_id" uuid,
    CONSTRAINT "commission_split_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "commission_split_company_id" ON "public"."commission_split" USING btree ("company_id");

CREATE INDEX "commission_split_id" ON "public"."commission_split" USING btree ("id");

CREATE INDEX "commission_split_user_id" ON "public"."commission_split" USING btree ("user_id");


DROP TABLE IF EXISTS "companies";
CREATE TABLE "public"."companies" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "company_name" character varying,
    "company_logo" character varying,
    "company_address" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_imap_enable" boolean DEFAULT false NOT NULL,
    "is_marketing_enable" boolean DEFAULT true NOT NULL,
    "expiry_date" timestamptz DEFAULT timezone('utc'::text, NULL),
    "user_count" numeric,
    "is_locked" boolean DEFAULT false NOT NULL,
    "is_roles_created" boolean DEFAULT false NOT NULL,
    "is_users_created" boolean DEFAULT false NOT NULL,
    "is_leads_created" boolean DEFAULT false NOT NULL,
    "is_customers_created" boolean DEFAULT false NOT NULL,
    "is_products_created" boolean DEFAULT false NOT NULL,
    "is_commissions_created" boolean DEFAULT false NOT NULL,
    "is_slabs_created" boolean DEFAULT false NOT NULL,
    "pro_user_count" numeric,
    "quarter" date DEFAULT date_trunc('year'::text, (CURRENT_DATE)) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "companies_id" ON "public"."companies" USING btree ("id");


DROP TABLE IF EXISTS "configurations";
CREATE TABLE "public"."configurations" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "currency" character varying,
    "phone_format" character varying,
    "date_format" character varying,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "before_closing_days" numeric,
    "after_closing_days" numeric,
    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "configurations_company_id" ON "public"."configurations" USING btree ("company_id");

CREATE INDEX "configurations_id" ON "public"."configurations" USING btree ("id");


DROP TABLE IF EXISTS "connectors";
CREATE TABLE "public"."connectors" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "company_id" uuid,
    "linked_in_token" character varying,
    "hubspot_token" character varying,
    "salesforce_token" character varying,
    "linked_in_status" boolean DEFAULT false,
    "hubspot_status" boolean DEFAULT false,
    "salesforce_status" boolean DEFAULT false,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "hubspot_refresh_token" character varying,
    "hubspot_expiry" timestamptz DEFAULT timezone('utc'::text, NULL),
    "salesforce_last_sync" timestamptz DEFAULT timezone('utc'::text, NULL),
    "hubspot_last_sync" timestamptz DEFAULT timezone('utc'::text, NULL),
    "linked_in_last_sync" timestamptz DEFAULT timezone('utc'::text, NULL),
    "salesforce_refresh_token" character varying,
    "salesforce_expiry" timestamptz DEFAULT timezone('utc'::text, NULL)
) WITH (oids = false);


DROP TABLE IF EXISTS "contact_us";
CREATE TABLE "public"."contact_us" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "full_name" character varying,
    "email" character varying,
    "subject" character varying,
    "messages" character varying,
    "address" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "contact_us_id" ON "public"."contact_us" USING btree ("id");


DROP TABLE IF EXISTS "country_details";
CREATE TABLE "public"."country_details" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "country_name" character varying,
    "country_value" character varying,
    "currency_name" character varying,
    "currency_symbol" character varying,
    "date_format" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "country_details_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "country_details_id" ON "public"."country_details" USING btree ("id");


DROP TABLE IF EXISTS "customer_companies";
CREATE TABLE "public"."customer_companies" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "customer_name" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "company_id" uuid,
    "address" character varying,
    "currency" character varying,
    "industry" uuid,
    "archived_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "reason" character varying,
    CONSTRAINT "customer_companies_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "customer_companies_company_id" ON "public"."customer_companies" USING btree ("company_id");

CREATE INDEX "customer_companies_id" ON "public"."customer_companies" USING btree ("id");

CREATE INDEX "customer_companies_industry" ON "public"."customer_companies" USING btree ("industry");

CREATE INDEX "customer_companies_user_id" ON "public"."customer_companies" USING btree ("user_id");


DROP TABLE IF EXISTS "customer_company_employees";
CREATE TABLE "public"."customer_company_employees" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "full_name" character varying,
    "title" uuid,
    "email_address" character varying,
    "phone_number" character varying,
    "address" character varying,
    "source" uuid,
    "linkedin_url" character varying,
    "website" character varying,
    "targeted_value" character varying,
    "assigned_sales_lead_to" uuid,
    "additional_marketing_notes" character varying,
    "creator_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "marketing_qualified_lead" boolean DEFAULT false NOT NULL,
    "is_converted" boolean DEFAULT false NOT NULL,
    "is_rejected" boolean DEFAULT false NOT NULL,
    "reason" character varying,
    "customer_company_id" uuid,
    "emp_type" character varying,
    "sync_id" character varying,
    "sync_source" character varying,
    "pid" uuid,
    CONSTRAINT "customer_company_employees_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "customer_company_employees_assigned_sales_lead_to" ON "public"."customer_company_employees" USING btree ("assigned_sales_lead_to");

CREATE INDEX "customer_company_employees_company_id" ON "public"."customer_company_employees" USING btree ("company_id");

CREATE INDEX "customer_company_employees_creator_id" ON "public"."customer_company_employees" USING btree ("creator_id");

CREATE INDEX "customer_company_employees_customer_company_id" ON "public"."customer_company_employees" USING btree ("customer_company_id");

CREATE INDEX "customer_company_employees_id" ON "public"."customer_company_employees" USING btree ("id");

CREATE INDEX "customer_company_employees_source" ON "public"."customer_company_employees" USING btree ("source");

CREATE INDEX "customer_company_employees_title" ON "public"."customer_company_employees" USING btree ("title");


DROP TABLE IF EXISTS "email_templates";
CREATE TABLE "public"."email_templates" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "company_id" uuid,
    "template" text,
    "created_at" timestamp DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "template_name" character varying,
    "json_template" text,
    "is_master" boolean DEFAULT false NOT NULL,
    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "emails";
CREATE TABLE "public"."emails" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "message_id" character varying,
    "to_mail" character varying,
    "from_mail" character varying,
    "mail_date" timestamptz DEFAULT timezone('utc'::text, NULL),
    "subject" text,
    "mail_html" text,
    "mail_text" text,
    "mail_text_as_html" text,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "from_name" character varying NOT NULL,
    "read_status" boolean DEFAULT false NOT NULL,
    "attechments" character varying,
    "user_id" uuid,
    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "emails_company_id" ON "public"."emails" USING btree ("company_id");

CREATE INDEX "emails_id" ON "public"."emails" USING btree ("id");

CREATE INDEX "emails_user_id" ON "public"."emails" USING btree ("user_id");


DROP TABLE IF EXISTS "event_sender_list";
CREATE TABLE "public"."event_sender_list" (
    "user_id" uuid,
    "event_id" uuid,
    "lead_email" text,
    "template_name" text,
    "template" text,
    "description" text,
    "is_open" boolean,
    "is_booked" boolean,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
) WITH (oids = false);


DROP TABLE IF EXISTS "follow_up_notes";
CREATE TABLE "public"."follow_up_notes" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "sales_id" uuid,
    "company_id" uuid,
    "user_id" uuid,
    "notes" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "follow_up_notes_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "follow_up_notes_company_id" ON "public"."follow_up_notes" USING btree ("company_id");

CREATE INDEX "follow_up_notes_id" ON "public"."follow_up_notes" USING btree ("id");

CREATE INDEX "follow_up_notes_sales_id" ON "public"."follow_up_notes" USING btree ("sales_id");

CREATE INDEX "follow_up_notes_user_id" ON "public"."follow_up_notes" USING btree ("user_id");


DROP TABLE IF EXISTS "forecast";
CREATE TABLE "public"."forecast" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "timeline" character varying,
    "amount" numeric,
    "start_date" character varying,
    "end_date" character varying,
    "pid" character varying NOT NULL,
    "assigned_to" uuid NOT NULL,
    "created_by" uuid NOT NULL,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_accepted" boolean DEFAULT false NOT NULL,
    "company_id" uuid,
    CONSTRAINT "forecast_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "forecast_assigned_to" ON "public"."forecast" USING btree ("assigned_to");

CREATE INDEX "forecast_created_by" ON "public"."forecast" USING btree ("created_by");

CREATE INDEX "forecast_id" ON "public"."forecast" USING btree ("id");


DROP TABLE IF EXISTS "forecast_audit";
CREATE TABLE "public"."forecast_audit" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "forecast_id" uuid NOT NULL,
    "amount" numeric,
    "reason" character varying,
    "created_by" uuid NOT NULL,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "pid" uuid,
    "forecast_amount" numeric,
    "company_id" uuid,
    CONSTRAINT "forecast_audit_id" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "forecast_audit_created_by" ON "public"."forecast_audit" USING btree ("created_by");

CREATE INDEX "forecast_audit_forecast_id" ON "public"."forecast_audit" USING btree ("forecast_id");

CREATE INDEX "forecast_audit_id_index" ON "public"."forecast_audit" USING btree ("id");


DROP TABLE IF EXISTS "forecast_data";
CREATE TABLE "public"."forecast_data" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "forecast_id" uuid NOT NULL,
    "amount" numeric,
    "start_date" character varying,
    "end_date" character varying,
    "type" character varying,
    "created_by" uuid NOT NULL,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "company_id" uuid,
    CONSTRAINT "forecast_data_id" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "forecast_data_created_by" ON "public"."forecast_data" USING btree ("created_by");

CREATE INDEX "forecast_data_forecast_id" ON "public"."forecast_data" USING btree ("forecast_id");

CREATE INDEX "forecast_data_id_index" ON "public"."forecast_data" USING btree ("id");


DROP TABLE IF EXISTS "imap_credentials";
CREATE TABLE "public"."imap_credentials" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "email" character varying,
    "app_password" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "imap_host" character varying,
    "imap_port" numeric,
    "smtp_host" character varying,
    "smtp_port" numeric,
    "user_id" uuid,
    CONSTRAINT "imap_credentials_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "imap_credentials_company_id" ON "public"."imap_credentials" USING btree ("company_id");

CREATE INDEX "imap_credentials_id" ON "public"."imap_credentials" USING btree ("id");

CREATE INDEX "imap_credentials_user_id" ON "public"."imap_credentials" USING btree ("user_id");


DROP TABLE IF EXISTS "lead_industries";
CREATE TABLE "public"."lead_industries" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "industry" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "lead_industries_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "lead_industries_company_id" ON "public"."lead_industries" USING btree ("company_id");

CREATE INDEX "lead_industries_id" ON "public"."lead_industries" USING btree ("id");


DROP TABLE IF EXISTS "lead_sources";
CREATE TABLE "public"."lead_sources" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "source" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "lead_sources_company_id" ON "public"."lead_sources" USING btree ("company_id");

CREATE INDEX "lead_sources_id" ON "public"."lead_sources" USING btree ("id");


DROP TABLE IF EXISTS "lead_titles";
CREATE TABLE "public"."lead_titles" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "title" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "lead_titles_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "lead_titles_company_id" ON "public"."lead_titles" USING btree ("company_id");

CREATE INDEX "lead_titles_id" ON "public"."lead_titles" USING btree ("id");


DROP TABLE IF EXISTS "marketing_budget";
CREATE TABLE "public"."marketing_budget" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "timeline" character varying,
    "amount" numeric,
    "start_date" character varying,
    "end_date" character varying,
    "created_by" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_finalize" boolean DEFAULT false NOT NULL,
    "company_id" uuid,
    CONSTRAINT "marketing_budget_id_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "marketing_budget_company_id" ON "public"."marketing_budget" USING btree ("company_id");

CREATE INDEX "marketing_budget_created_by" ON "public"."marketing_budget" USING btree ("created_by");

CREATE INDEX "marketing_budget_id" ON "public"."marketing_budget" USING btree ("id");


DROP TABLE IF EXISTS "marketing_budget_data";
CREATE TABLE "public"."marketing_budget_data" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "budget_id" uuid NOT NULL,
    "amount" numeric,
    "start_date" character varying,
    "end_date" character varying,
    "created_by" uuid NOT NULL,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "type" character varying,
    CONSTRAINT "marketing_budget_data_id_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "marketing_budget_data_budget_id" ON "public"."marketing_budget_data" USING btree ("budget_id");

CREATE INDEX "marketing_budget_data_created_by" ON "public"."marketing_budget_data" USING btree ("created_by");

CREATE INDEX "marketing_budget_data_id" ON "public"."marketing_budget_data" USING btree ("id");

COMMENT ON TABLE "public"."marketing_budget_data" IS 'marketing budget data with type ;- Quarterly/Monthly';


DROP TABLE IF EXISTS "marketing_budget_description";
CREATE TABLE "public"."marketing_budget_description" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "budget_id" uuid,
    "title" character varying,
    "amount" numeric,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "marketing_budget_description_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "marketing_budget_description_budget_id" ON "public"."marketing_budget_description" USING btree ("budget_id");

CREATE INDEX "marketing_budget_description_company_id" ON "public"."marketing_budget_description" USING btree ("company_id");

CREATE INDEX "marketing_budget_description_id" ON "public"."marketing_budget_description" USING btree ("id");

CREATE INDEX "marketing_budget_description_user_id" ON "public"."marketing_budget_description" USING btree ("user_id");


DROP TABLE IF EXISTS "marketing_budget_description_logs";
CREATE TABLE "public"."marketing_budget_description_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "budget_id" uuid,
    "budget_description_id" character varying,
    "title" character varying,
    "amount" numeric,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "marketing_budget_description_logs_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "marketing_budget_description_logs_budget_description_id" ON "public"."marketing_budget_description_logs" USING btree ("budget_description_id");

CREATE INDEX "marketing_budget_description_logs_budget_id" ON "public"."marketing_budget_description_logs" USING btree ("budget_id");

CREATE INDEX "marketing_budget_description_logs_company_id" ON "public"."marketing_budget_description_logs" USING btree ("company_id");

CREATE INDEX "marketing_budget_description_logs_id" ON "public"."marketing_budget_description_logs" USING btree ("id");

CREATE INDEX "marketing_budget_description_logs_user_id" ON "public"."marketing_budget_description_logs" USING btree ("user_id");


DROP TABLE IF EXISTS "marketing_budget_logs";
CREATE TABLE "public"."marketing_budget_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "budget_id" uuid,
    "timeline" character varying,
    "amount" character varying,
    "start_date" character varying,
    "end_date" character varying,
    "created_by" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_finalize" boolean DEFAULT false NOT NULL,
    "company_id" uuid,
    CONSTRAINT "marketing_budget_logs_id_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "marketing_budget_logs_budget_id" ON "public"."marketing_budget_logs" USING btree ("budget_id");

CREATE INDEX "marketing_budget_logs_company_id" ON "public"."marketing_budget_logs" USING btree ("company_id");

CREATE INDEX "marketing_budget_logs_id" ON "public"."marketing_budget_logs" USING btree ("id");


DROP TABLE IF EXISTS "message";
CREATE TABLE "public"."message" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "chat_id" uuid,
    "sender" uuid,
    "content" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "read_by" uuid,
    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "message_chat_id" ON "public"."message" USING btree ("chat_id");

CREATE INDEX "message_id" ON "public"."message" USING btree ("id");

CREATE INDEX "message_read_by" ON "public"."message" USING btree ("read_by");

CREATE INDEX "message_sender" ON "public"."message" USING btree ("sender");


DROP TABLE IF EXISTS "modules";
CREATE TABLE "public"."modules" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "module_name" character varying,
    "module_type" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "module_ctr" numeric,
    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "modules_id" ON "public"."modules" USING btree ("id");


DROP TABLE IF EXISTS "notifications";
CREATE TABLE "public"."notifications" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "title" character varying,
    "is_read" boolean DEFAULT false,
    "type_id" uuid NOT NULL,
    "user_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "type" character varying,
    CONSTRAINT "notifications_id_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "notifications_id" ON "public"."notifications" USING btree ("id");

CREATE INDEX "notifications_type_id" ON "public"."notifications" USING btree ("type_id");

CREATE INDEX "notifications_user_id" ON "public"."notifications" USING btree ("user_id");


DROP TABLE IF EXISTS "payment_plans";
CREATE TABLE "public"."payment_plans" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "product_id" character varying,
    "name" character varying,
    "description" character varying,
    "active_status" boolean,
    "interval" character varying,
    "currency" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "admin_price_id" character varying,
    "user_price_id" character varying,
    "user_amount" numeric,
    "admin_amount" numeric,
    "pro_user_price_id" character varying,
    "pro_user_amount" numeric,
    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "payment_plans_id" ON "public"."payment_plans" USING btree ("id");


DROP TABLE IF EXISTS "permissions";
CREATE TABLE "public"."permissions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "role_id" uuid,
    "module_id" uuid,
    "module_name" character varying,
    "permission_to_view_global" boolean DEFAULT false,
    "permission_to_create" boolean DEFAULT false,
    "permission_to_update" boolean DEFAULT false,
    "permission_to_delete" boolean DEFAULT false,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "user_id" uuid,
    "permission_to_view_own" boolean DEFAULT false,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "permissions_id" ON "public"."permissions" USING btree ("id");

CREATE INDEX "permissions_module_id" ON "public"."permissions" USING btree ("module_id");

CREATE INDEX "permissions_role_id" ON "public"."permissions" USING btree ("role_id");

CREATE INDEX "permissions_user_id" ON "public"."permissions" USING btree ("user_id");


DROP TABLE IF EXISTS "pro_quarter_config";
CREATE TABLE "public"."pro_quarter_config" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "company_id" uuid,
    "quarter" character varying,
    "start_date" character varying,
    "end_date" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL)
) WITH (oids = false);


DROP TABLE IF EXISTS "pro_scheduled_events";
CREATE TABLE "public"."pro_scheduled_events" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "event_id" uuid,
    "date" character varying,
    "lead_name" character varying,
    "lead_email" character varying,
    "description" character varying,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "start_time" character varying,
    "end_time" character varying,
    "timezone" character varying
) WITH (oids = false);


DROP TABLE IF EXISTS "pro_user_availability";
CREATE TABLE "public"."pro_user_availability" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "schedule_name" character varying,
    "timezone" character varying,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL)
) WITH (oids = false);


DROP TABLE IF EXISTS "pro_user_events";
CREATE TABLE "public"."pro_user_events" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "event_name" character varying,
    "meet_link" character varying,
    "description" character varying,
    "event_url" character varying,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "duration" numeric,
    "availability_id" uuid
) WITH (oids = false);


DROP TABLE IF EXISTS "pro_user_time_slot";
CREATE TABLE "public"."pro_user_time_slot" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "availability_id" uuid,
    "days" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "start_time" character varying,
    "end_time" character varying,
    "checked" boolean DEFAULT false,
    "user_id" uuid
) WITH (oids = false);


DROP TABLE IF EXISTS "product_in_sales";
CREATE TABLE "public"."product_in_sales" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "product_id" uuid,
    "sales_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "product_in_sales_id_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "product_in_sales_company_id" ON "public"."product_in_sales" USING btree ("company_id");

CREATE INDEX "product_in_sales_product_id" ON "public"."product_in_sales" USING btree ("product_id");

CREATE INDEX "product_in_sales_sales_id" ON "public"."product_in_sales" USING btree ("sales_id");


DROP TABLE IF EXISTS "products";
CREATE TABLE "public"."products" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "product_name" character varying,
    "product_image" character varying,
    "description" character varying,
    "available_quantity" character varying,
    "price" numeric,
    "end_of_life" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "currency" character varying,
    "user_id" uuid,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "products_company_id" ON "public"."products" USING btree ("company_id");

CREATE INDEX "products_id" ON "public"."products" USING btree ("id");

CREATE INDEX "products_user_id" ON "public"."products" USING btree ("user_id");


DROP TABLE IF EXISTS "recognized_commission";
CREATE TABLE "public"."recognized_commission" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "sales_id" uuid,
    "user_id" uuid,
    "company_id" uuid,
    "commission_amount" numeric,
    "user_type" character varying,
    "recognized_date" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "recognized_amount" character varying
) WITH (oids = false);


DROP TABLE IF EXISTS "recognized_revenue";
CREATE TABLE "public"."recognized_revenue" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "sales_id" uuid,
    "booking_amount" character varying,
    "recognized_amount" character varying,
    "recognized_date" character varying,
    "notes" character varying,
    "invoice" character varying,
    "company_id" uuid,
    "user_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "recognized_revenue_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "recognized_revenue_company_id" ON "public"."recognized_revenue" USING btree ("company_id");

CREATE INDEX "recognized_revenue_id" ON "public"."recognized_revenue" USING btree ("id");

CREATE INDEX "recognized_revenue_sales_id" ON "public"."recognized_revenue" USING btree ("sales_id");

CREATE INDEX "recognized_revenue_user_id" ON "public"."recognized_revenue" USING btree ("user_id");


DROP TABLE IF EXISTS "roles";
CREATE TABLE "public"."roles" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "role_name" character varying,
    "module_ids" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "company_id" uuid,
    "reporter" character varying,
    "user_id" uuid,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "roles_company_id" ON "public"."roles" USING btree ("company_id");

CREATE INDEX "roles_id" ON "public"."roles" USING btree ("id");

CREATE INDEX "roles_user_id" ON "public"."roles" USING btree ("user_id");


DROP TABLE IF EXISTS "sales";
CREATE TABLE "public"."sales" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "customer_id" uuid,
    "customer_commission_split_id" uuid,
    "is_overwrite" boolean,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "business_contact_id" uuid,
    "revenue_contact_id" uuid,
    "qualification" character varying,
    "is_qualified" boolean,
    "target_amount" character varying DEFAULT '0',
    "target_closing_date" character varying,
    "subscription_plan" character varying,
    "sales_type" character varying,
    "recurring_date" character varying,
    "currency" character varying,
    "closed_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "user_id" uuid,
    "slab_id" uuid,
    "lead_id" uuid,
    "contract" character varying,
    "transfer_reason" character varying,
    "transfered_back_by" uuid,
    "booking_commission" character varying DEFAULT '0',
    "revenue_commission" character varying DEFAULT '0',
    "archived_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "archived_by" uuid,
    "archived_reason" character varying,
    "approval_status" character varying,
    "committed_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_service_performed" boolean DEFAULT false NOT NULL,
    "service_perform_note" character varying,
    "service_performed_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "sales_business_contact_id" ON "public"."sales" USING btree ("business_contact_id");

CREATE INDEX "sales_company_id" ON "public"."sales" USING btree ("company_id");

CREATE INDEX "sales_customer_commission_split_id" ON "public"."sales" USING btree ("customer_commission_split_id");

CREATE INDEX "sales_customer_id" ON "public"."sales" USING btree ("customer_id");

CREATE INDEX "sales_id" ON "public"."sales" USING btree ("id");

CREATE INDEX "sales_lead_id" ON "public"."sales" USING btree ("lead_id");

CREATE INDEX "sales_revenue_contact_id" ON "public"."sales" USING btree ("revenue_contact_id");

CREATE INDEX "sales_slab_id" ON "public"."sales" USING btree ("slab_id");

CREATE INDEX "sales_user_id" ON "public"."sales" USING btree ("user_id");

COMMENT ON COLUMN "public"."sales"."qualification" IS 'commitment';

COMMENT ON COLUMN "public"."sales"."is_qualified" IS 'is_committed';


DROP TABLE IF EXISTS "sales_approval";
CREATE TABLE "public"."sales_approval" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "percentage" numeric,
    "description" character varying,
    "sales_id" uuid,
    "company_id" uuid,
    "approver_user_id" uuid,
    "requested_user_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "status" character varying,
    "reason" character varying,
    CONSTRAINT "sales_approval_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "sales_logs";
CREATE TABLE "public"."sales_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "sales_id" uuid,
    "customer_commission_split_id" uuid,
    "qualification" character varying,
    "is_qualified" boolean,
    "target_amount" character varying,
    "products" character varying,
    "target_closing_date" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "customer_id" uuid,
    "is_overwrite" boolean,
    "company_id" uuid,
    "business_contact_id" uuid,
    "revenue_contact_id" uuid,
    "subscription_plan" character varying,
    "sales_type" character varying,
    "recurring_date" character varying,
    "currency" character varying,
    "closed_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "slab_id" uuid,
    "booking_commission" character varying,
    "revenue_commission" character varying,
    "sales_users" character varying,
    CONSTRAINT "sales_logs_id_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "sales_logs_business_contact_id" ON "public"."sales_logs" USING btree ("business_contact_id");

CREATE INDEX "sales_logs_company_id" ON "public"."sales_logs" USING btree ("company_id");

CREATE INDEX "sales_logs_customer_commission_split_id" ON "public"."sales_logs" USING btree ("customer_commission_split_id");

CREATE INDEX "sales_logs_customer_id" ON "public"."sales_logs" USING btree ("customer_id");

CREATE INDEX "sales_logs_id" ON "public"."sales_logs" USING btree ("id");

CREATE INDEX "sales_logs_revenue_contact_id" ON "public"."sales_logs" USING btree ("revenue_contact_id");

CREATE INDEX "sales_logs_sales_id" ON "public"."sales_logs" USING btree ("sales_id");

CREATE INDEX "sales_logs_slab_id" ON "public"."sales_logs" USING btree ("slab_id");

COMMENT ON COLUMN "public"."sales_logs"."qualification" IS 'commitement';

COMMENT ON COLUMN "public"."sales_logs"."is_qualified" IS 'is_commited';


DROP TABLE IF EXISTS "sales_playbook";
CREATE TABLE "public"."sales_playbook" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "company_id" uuid,
    "user_id" uuid,
    "resources" text,
    "background" text,
    "vision_mission" text,
    "vision_mission_image" character varying,
    "product_image" character varying,
    "customer_profiling" text,
    "lead_processes" text,
    "sales_strategies" text,
    "scenario_data" jsonb,
    "sales_best_practices" text,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "sales_best_practices_image" character varying,
    "documentation_title" text,
    "documentation" text,
    "sales_stack" text,
    "sales_stack_title" text,
    "resources_title" text,
    "vision_mission_title" text,
    "background_title" text,
    "company_overview_title" text,
    "customer_profiling_title" text,
    "sales_processes_title" text,
    "qualified_lead_title" text,
    "lead_processes_title" text,
    "sales_strategies_title" text,
    "top_customer_title" text,
    "top_product_title" text,
    "sales_analysis_title" text,
    "sales_scenarios_title" text,
    "team_role_title" text,
    "sales_best_practice_title" text,
    "product_pricing_title" text,
    "sales_presentation_title" text
) WITH (oids = false);


DROP TABLE IF EXISTS "sales_users";
CREATE TABLE "public"."sales_users" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "commission_split_id" uuid,
    "user_id" uuid,
    "user_percentage" numeric,
    "user_type" character varying,
    "sales_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "sales_users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "sales_users_commission_split_id" ON "public"."sales_users" USING btree ("commission_split_id");

CREATE INDEX "sales_users_company_id" ON "public"."sales_users" USING btree ("company_id");

CREATE INDEX "sales_users_id" ON "public"."sales_users" USING btree ("id");

CREATE INDEX "sales_users_sales_id" ON "public"."sales_users" USING btree ("sales_id");

CREATE INDEX "sales_users_user_id" ON "public"."sales_users" USING btree ("user_id");

COMMENT ON TABLE "public"."sales_users" IS 'sales captain and sales support details with type';


DROP TABLE IF EXISTS "sent_email";
CREATE TABLE "public"."sent_email" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "from_email" character varying,
    "to_email" character varying,
    "cc" character varying,
    "subject" character varying,
    "message" character varying,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "sales_id" uuid,
    "attechments" character varying,
    "user_id" uuid,
    CONSTRAINT "sent_email_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "sent_email_company_id" ON "public"."sent_email" USING btree ("company_id");

CREATE INDEX "sent_email_id" ON "public"."sent_email" USING btree ("id");

CREATE INDEX "sent_email_sales_id" ON "public"."sent_email" USING btree ("sales_id");

CREATE INDEX "sent_email_user_id" ON "public"."sent_email" USING btree ("user_id");


DROP TABLE IF EXISTS "slabs";
CREATE TABLE "public"."slabs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "min_amount" character varying,
    "max_amount" character varying,
    "percentage" numeric,
    "company_id" uuid,
    "is_max" boolean DEFAULT false,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "currency" character varying,
    "slab_ctr" numeric,
    "user_id" uuid,
    "slab_id" uuid,
    "slab_name" character varying,
    "commission_split_id" uuid,
    CONSTRAINT "slaps_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "slabs_commission_split_id" ON "public"."slabs" USING btree ("commission_split_id");

CREATE INDEX "slabs_company_id" ON "public"."slabs" USING btree ("company_id");

CREATE INDEX "slabs_id" ON "public"."slabs" USING btree ("id");

CREATE INDEX "slabs_slab_id" ON "public"."slabs" USING btree ("slab_id");

CREATE INDEX "slabs_user_id" ON "public"."slabs" USING btree ("user_id");


DROP TABLE IF EXISTS "super_admin";
CREATE TABLE "public"."super_admin" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" character varying,
    "email" character varying,
    "encrypted_password" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "super_admin_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "super_admin_id" ON "public"."super_admin" USING btree ("id");


DROP TABLE IF EXISTS "superadmin_config";
CREATE TABLE "public"."superadmin_config" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "trial_days" numeric,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "trial_users" numeric,
    CONSTRAINT "superadmin_config_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "superadmin_config_id" ON "public"."superadmin_config" USING btree ("id");


DROP TABLE IF EXISTS "transactions";
CREATE TABLE "public"."transactions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "company_id" uuid,
    "plan_id" uuid,
    "stripe_customer_id" character varying,
    "payment_status" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "stripe_subscription_id" character varying,
    "user_count" numeric,
    "expiry_date" character varying,
    "stripe_token_id" character varying,
    "stripe_card_id" character varying,
    "stripe_charge_id" character varying,
    "total_amount" numeric,
    "immediate_upgrade" boolean,
    "is_canceled" boolean DEFAULT false NOT NULL,
    "payment_receipt" character varying,
    "upgraded_transaction_id" character varying,
    "pro_user_count" numeric,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "transactions_company_id" ON "public"."transactions" USING btree ("company_id");

CREATE INDEX "transactions_id" ON "public"."transactions" USING btree ("id");

CREATE INDEX "transactions_plan_id" ON "public"."transactions" USING btree ("plan_id");

CREATE INDEX "transactions_upgraded_transaction_id" ON "public"."transactions" USING btree ("upgraded_transaction_id");

CREATE INDEX "transactions_user_id" ON "public"."transactions" USING btree ("user_id");


DROP TABLE IF EXISTS "transfered_back_sales";
CREATE TABLE "public"."transfered_back_sales" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "transferd_back_by_id" uuid,
    "transferd_back_to_id" uuid,
    "sales_id" uuid,
    "user_id" uuid,
    "company_id" uuid,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "transfer_reason" character varying,
    "transfered_back_date" timestamptz DEFAULT timezone('utc'::text, NULL),
    CONSTRAINT "transfered_back_sales_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "transfered_back_sales_company_id" ON "public"."transfered_back_sales" USING btree ("company_id");

CREATE INDEX "transfered_back_sales_id" ON "public"."transfered_back_sales" USING btree ("id");

CREATE INDEX "transfered_back_sales_sales_id" ON "public"."transfered_back_sales" USING btree ("sales_id");

CREATE INDEX "transfered_back_sales_transferd_back_by_id" ON "public"."transfered_back_sales" USING btree ("transferd_back_by_id");

CREATE INDEX "transfered_back_sales_transferd_back_to_id" ON "public"."transfered_back_sales" USING btree ("transferd_back_to_id");

CREATE INDEX "transfered_back_sales_user_id" ON "public"."transfered_back_sales" USING btree ("user_id");


DROP TABLE IF EXISTS "upgraded_transactions";
CREATE TABLE "public"."upgraded_transactions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "company_id" uuid,
    "plan_id" uuid,
    "stripe_customer_id" character varying,
    "payment_status" character varying,
    "stripe_subscription_id" character varying,
    "expiry_date" character varying,
    "user_count" numeric,
    "stripe_token_id" character varying,
    "stripe_card_id" character varying,
    "stripe_charge_id" character varying,
    "total_amount" numeric,
    "is_canceled" boolean DEFAULT false,
    "payment_receipt" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "pro_user_count" numeric,
    CONSTRAINT "upgraded_transactions_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "upgraded_transactions_company_id" ON "public"."upgraded_transactions" USING btree ("company_id");

CREATE INDEX "upgraded_transactions_id" ON "public"."upgraded_transactions" USING btree ("id");

CREATE INDEX "upgraded_transactions_plan_id" ON "public"."upgraded_transactions" USING btree ("plan_id");

CREATE INDEX "upgraded_transactions_user_id" ON "public"."upgraded_transactions" USING btree ("user_id");


DROP TABLE IF EXISTS "user_commissions";
CREATE TABLE "public"."user_commissions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "sales_id" uuid,
    "user_id" uuid,
    "company_id" uuid,
    "total_commission_amount" numeric,
    "bonus_amount" numeric DEFAULT '0',
    "notes" character varying,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "user_type" character varying
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
CREATE TABLE "public"."users" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "full_name" character varying,
    "company_id" uuid,
    "avatar" character varying,
    "email_address" character varying,
    "mobile_number" character varying,
    "encrypted_password" character varying,
    "is_verified" boolean,
    "created_at" timestamptz DEFAULT timezone('utc', now()),
    "updated_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "deleted_at" timestamptz DEFAULT timezone('utc'::text, NULL),
    "role_id" uuid,
    "phone_number" character varying,
    "address" character varying,
    "is_locked" boolean DEFAULT false,
    "is_admin" boolean DEFAULT false,
    "expiry_date" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_main_admin" boolean DEFAULT false,
    "created_by" uuid,
    "session_time" timestamptz DEFAULT timezone('utc'::text, NULL),
    "is_deactivated" boolean DEFAULT false,
    "assigned_to" uuid,
    "is_pro_user" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "users_company_id" ON "public"."users" USING btree ("company_id");

CREATE INDEX "users_created_by" ON "public"."users" USING btree ("created_by");

CREATE INDEX "users_id" ON "public"."users" USING btree ("id");

CREATE INDEX "users_role_id" ON "public"."users" USING btree ("role_id");


-- 2023-10-12 04:41:11.563902+00
