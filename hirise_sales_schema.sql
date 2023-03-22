--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2023-03-22 12:49:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 557266)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3787 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 210 (class 1259 OID 557277)
-- Name: chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    chat_name character varying,
    is_group_chat boolean,
    last_message character varying,
    group_admin character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_a uuid,
    user_b uuid,
    sales_id uuid,
    company_id uuid
);


ALTER TABLE public.chat OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 557286)
-- Name: chat_room_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_members (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    group_name character varying
);


ALTER TABLE public.chat_room_members OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 557295)
-- Name: commission_split; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commission_split (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    closer_percentage integer,
    supporter_percentage integer,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id uuid
);


ALTER TABLE public.commission_split OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 557302)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_name character varying,
    company_logo character varying,
    company_address character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_imap_enable boolean DEFAULT false,
    is_marketing_enable boolean DEFAULT false,
    expiry_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_count numeric,
    is_locked boolean DEFAULT false,
    is_roles_created boolean DEFAULT false,
    is_users_created boolean DEFAULT false,
    is_leads_created boolean DEFAULT false,
    is_customers_created boolean DEFAULT false,
    is_products_created boolean DEFAULT false,
    is_commissions_created boolean DEFAULT false,
    is_slabs_created boolean DEFAULT false
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 557322)
-- Name: configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configurations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    currency character varying,
    phone_format character varying,
    date_format character varying,
    user_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    before_closing_days numeric,
    after_closing_days numeric
);


ALTER TABLE public.configurations OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 557331)
-- Name: contact_us; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_us (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying,
    email character varying,
    subject character varying,
    messages character varying,
    address character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.contact_us OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 557340)
-- Name: country_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    country_name character varying,
    country_value character varying,
    currency_name character varying,
    currency_symbol character varying,
    date_format character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.country_details OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 557349)
-- Name: customer_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_companies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    customer_name character varying,
    source character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id uuid,
    address character varying,
    currency character varying,
    industry uuid,
    archived_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    reason character varying
);


ALTER TABLE public.customer_companies OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 557358)
-- Name: customer_company_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_company_employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying,
    title uuid,
    email_address character varying,
    phone_number character varying,
    address character varying,
    source uuid,
    linkedin_url character varying,
    website character varying,
    targeted_value character varying,
    industry_type uuid,
    assigned_sales_lead_to uuid,
    additional_marketing_notes character varying,
    creator_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    marketing_qualified_lead boolean DEFAULT false,
    is_converted boolean DEFAULT false,
    is_rejected boolean DEFAULT false,
    customer_company_id uuid,
    reason character varying,
    emp_type character varying
);


ALTER TABLE public.customer_company_employees OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 557370)
-- Name: emails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emails (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    message_id character varying,
    to_mail character varying,
    from_mail character varying,
    mail_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    subject text,
    mail_html text,
    mail_text text,
    mail_text_as_html text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id uuid,
    from_name character varying,
    read_status boolean DEFAULT false,
    attechments character varying,
    user_id uuid
);


ALTER TABLE public.emails OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 557381)
-- Name: follow_up_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow_up_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sales_id uuid,
    company_id uuid,
    user_id uuid,
    notes character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.follow_up_notes OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 557390)
-- Name: forecast; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forecast (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    timeline character varying,
    amount numeric,
    start_date character varying,
    end_date character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    pid character varying,
    assigned_to uuid,
    created_by uuid,
    is_accepted boolean DEFAULT false,
    company_id uuid
);


ALTER TABLE public.forecast OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 557399)
-- Name: forecast_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forecast_audit (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    forecast_id uuid NOT NULL,
    amount numeric,
    reason character varying,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    pid uuid,
    forecast_amount numeric
);


ALTER TABLE public.forecast_audit OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 557408)
-- Name: forecast_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forecast_data (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    amount numeric,
    start_date character varying,
    end_date character varying,
    type character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    forecast_id uuid,
    created_by uuid,
    company_id uuid
);


ALTER TABLE public.forecast_data OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 557417)
-- Name: imap_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imap_credentials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying,
    app_password character varying,
    user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    imap_host character varying,
    imap_port numeric,
    smtp_host character varying,
    smtp_port numeric,
    company_id uuid
);


ALTER TABLE public.imap_credentials OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 557426)
-- Name: lead_industries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_industries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    industry character varying,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.lead_industries OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 557435)
-- Name: lead_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_sources (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    source character varying,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.lead_sources OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 557444)
-- Name: lead_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_titles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.lead_titles OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 557453)
-- Name: marketing_budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    timeline character varying,
    amount numeric,
    start_date character varying,
    end_date character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_finalize boolean DEFAULT false,
    company_id uuid
);


ALTER TABLE public.marketing_budget OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 557463)
-- Name: marketing_budget_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_data (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    budget_id uuid NOT NULL,
    amount numeric,
    start_date character varying,
    end_date character varying,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    type character varying
);


ALTER TABLE public.marketing_budget_data OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 557472)
-- Name: marketing_budget_description; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_description (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    budget_id uuid,
    amount numeric,
    user_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    title character varying
);


ALTER TABLE public.marketing_budget_description OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 557481)
-- Name: marketing_budget_description_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_description_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    budget_id uuid,
    budget_description_id character varying,
    amount numeric,
    user_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    title character varying
);


ALTER TABLE public.marketing_budget_description_logs OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 557490)
-- Name: marketing_budget_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    budget_id uuid,
    timeline character varying,
    amount character varying,
    start_date character varying,
    end_date character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_finalize boolean DEFAULT false,
    company_id uuid
);


ALTER TABLE public.marketing_budget_logs OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 557500)
-- Name: message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender uuid,
    content character varying,
    chat_id uuid,
    read_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.message OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 557509)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    module_name character varying,
    module_type character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    module_ctr numeric
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 557518)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying,
    type_id uuid NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_read boolean DEFAULT false NOT NULL,
    type character varying
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 557528)
-- Name: payment_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id character varying,
    name character varying,
    description character varying,
    active_status boolean,
    admin_price_id character varying,
    "interval" character varying,
    admin_amount numeric,
    currency character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_price_id character varying,
    user_amount numeric
);


ALTER TABLE public.payment_plans OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 557537)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role_id uuid,
    module_id uuid,
    permission_to_view_global boolean DEFAULT false,
    permission_to_create boolean DEFAULT false,
    permission_to_update boolean DEFAULT false,
    permission_to_delete boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id uuid,
    permission_to_view_own boolean DEFAULT false
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 557549)
-- Name: product_in_sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_in_sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    sales_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.product_in_sales OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 557556)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_name character varying,
    product_image character varying,
    description character varying,
    available_quantity character varying,
    price numeric,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    currency character varying,
    user_id uuid,
    end_of_life character varying
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 557565)
-- Name: recognized_revenue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recognized_revenue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sales_id uuid,
    booking_amount character varying,
    recognized_amount character varying,
    recognized_date character varying,
    notes character varying,
    invoice character varying,
    company_id uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.recognized_revenue OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 557574)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role_name character varying,
    module_ids character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id uuid,
    reporter character varying,
    user_id uuid
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 557583)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid,
    customer_commission_split_id uuid,
    is_overwrite boolean,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    business_contact_id uuid,
    revenue_contact_id uuid,
    qualification character varying,
    is_qualified boolean,
    target_amount character varying,
    target_closing_date character varying,
    subscription_plan character varying,
    sales_type character varying,
    recurring_date character varying,
    currency character varying,
    closed_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id uuid,
    slab_id uuid,
    lead_id uuid,
    contract character varying,
    booking_commission character varying,
    transfer_reason character varying,
    transfered_back_by uuid,
    revenue_commission character varying,
    archived_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    archived_by uuid,
    archived_reason character varying,
    approval_status boolean
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 565458)
-- Name: sales_approval; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_approval (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    percentage numeric,
    description character varying,
    sales_id uuid,
    company_id uuid,
    approver_user_id uuid,
    requested_user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    status character varying,
    reason character varying
);


ALTER TABLE public.sales_approval OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 557593)
-- Name: sales_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sales_id uuid,
    customer_commission_split_id uuid,
    qualification character varying,
    is_qualified boolean,
    target_amount character varying,
    target_closing_date character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    customer_id uuid,
    is_overwrite boolean,
    company_id uuid,
    business_contact_id uuid,
    revenue_contact_id uuid,
    subscription_plan character varying,
    sales_type character varying,
    recurring_date character varying,
    currency character varying,
    closed_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    slab_id uuid,
    booking_commission character varying,
    revenue_commission character varying,
    sales_users character varying,
    products character varying
);


ALTER TABLE public.sales_logs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 557603)
-- Name: sales_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    commission_split_id uuid,
    user_id uuid,
    user_percentage numeric,
    user_type character varying,
    sales_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.sales_users OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 557612)
-- Name: sent_email; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sent_email (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    from_email character varying,
    to_email character varying,
    cc character varying,
    subject character varying,
    message character varying,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    sales_id uuid,
    attechments character varying,
    user_id uuid
);


ALTER TABLE public.sent_email OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 557621)
-- Name: slabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slabs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    min_amount character varying,
    max_amount character varying,
    percentage numeric,
    company_id uuid,
    is_max boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    currency character varying,
    slab_ctr numeric,
    user_id uuid,
    slab_id uuid,
    slab_name character varying,
    commission_split_id uuid
);


ALTER TABLE public.slabs OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 557631)
-- Name: super_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.super_admin (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying,
    email character varying,
    encrypted_password character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.super_admin OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 557639)
-- Name: superadmin_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.superadmin_config (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    trial_days numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    trial_users numeric
);


ALTER TABLE public.superadmin_config OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 557648)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    company_id uuid,
    plan_id uuid,
    stripe_customer_id character varying,
    payment_status character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    stripe_subscription_id character varying,
    expiry_date character varying,
    user_count numeric,
    stripe_token_id character varying,
    stripe_card_id character varying,
    stripe_charge_id character varying,
    total_amount numeric,
    immediate_upgrade boolean,
    is_canceled boolean DEFAULT false,
    payment_receipt character varying,
    upgraded_transaction_id character varying
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 557658)
-- Name: transfered_back_sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transfered_back_sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    transferd_back_by_id uuid,
    transferd_back_by_name character varying,
    transferd_back_to_id uuid,
    transferd_back_to_name character varying,
    transfered_back_date character varying,
    sales_id uuid,
    user_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    transfer_reason character varying
);


ALTER TABLE public.transfered_back_sales OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 557667)
-- Name: upgraded_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upgraded_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    company_id uuid,
    plan_id uuid,
    stripe_customer_id character varying,
    payment_status character varying,
    stripe_subscription_id character varying,
    expiry_date character varying,
    user_count numeric,
    stripe_token_id character varying,
    stripe_card_id character varying,
    stripe_charge_id character varying,
    total_amount numeric,
    is_canceled boolean DEFAULT false,
    payment_receipt character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.upgraded_transactions OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 557677)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying,
    company_id uuid,
    avatar character varying,
    email_address character varying,
    mobile_number character varying,
    encrypted_password character varying,
    is_verified boolean,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    role_id uuid,
    phone_number character varying,
    address character varying,
    is_locked boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    expiry_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    country_code character varying,
    is_main_admin boolean DEFAULT false,
    created_by uuid,
    session_time timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_deactivated boolean DEFAULT false,
    assigned_to uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3560 (class 2606 OID 557692)
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 557694)
-- Name: chat_room_members chat_room_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_members
    ADD CONSTRAINT chat_room_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3564 (class 2606 OID 557696)
-- Name: commission_split commission_split_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commission_split
    ADD CONSTRAINT commission_split_pkey PRIMARY KEY (id);


--
-- TOC entry 3566 (class 2606 OID 557698)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3568 (class 2606 OID 557700)
-- Name: configurations configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configurations
    ADD CONSTRAINT configurations_pkey PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 557702)
-- Name: contact_us contact_us_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_us
    ADD CONSTRAINT contact_us_pkey PRIMARY KEY (id);


--
-- TOC entry 3572 (class 2606 OID 557704)
-- Name: country_details country_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country_details
    ADD CONSTRAINT country_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3574 (class 2606 OID 557706)
-- Name: customer_companies customer_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_companies
    ADD CONSTRAINT customer_companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3576 (class 2606 OID 557708)
-- Name: customer_company_employees customer_company_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_company_employees
    ADD CONSTRAINT customer_company_employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3578 (class 2606 OID 557710)
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- TOC entry 3580 (class 2606 OID 557712)
-- Name: follow_up_notes follow_up_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT follow_up_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3582 (class 2606 OID 557714)
-- Name: forecast forecast_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forecast
    ADD CONSTRAINT forecast_pkey PRIMARY KEY (id);


--
-- TOC entry 3584 (class 2606 OID 557716)
-- Name: imap_credentials imap_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imap_credentials
    ADD CONSTRAINT imap_credentials_pkey PRIMARY KEY (id);


--
-- TOC entry 3586 (class 2606 OID 557718)
-- Name: lead_industries lead_industries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_industries
    ADD CONSTRAINT lead_industries_pkey PRIMARY KEY (id);


--
-- TOC entry 3588 (class 2606 OID 557720)
-- Name: lead_sources lead_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT lead_sources_pkey PRIMARY KEY (id);


--
-- TOC entry 3590 (class 2606 OID 557722)
-- Name: lead_titles lead_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_titles
    ADD CONSTRAINT lead_titles_pkey PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 557724)
-- Name: marketing_budget_data marketing_budget_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_data
    ADD CONSTRAINT marketing_budget_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3598 (class 2606 OID 557726)
-- Name: marketing_budget_description_logs marketing_budget_description_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_description_logs
    ADD CONSTRAINT marketing_budget_description_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3596 (class 2606 OID 557728)
-- Name: marketing_budget_description marketing_budget_description_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_description
    ADD CONSTRAINT marketing_budget_description_pkey PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 557730)
-- Name: marketing_budget_logs marketing_budget_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_logs
    ADD CONSTRAINT marketing_budget_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 557732)
-- Name: marketing_budget marketing_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget
    ADD CONSTRAINT marketing_budget_pkey PRIMARY KEY (id);


--
-- TOC entry 3602 (class 2606 OID 557734)
-- Name: message message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- TOC entry 3604 (class 2606 OID 557736)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- TOC entry 3606 (class 2606 OID 557738)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 557740)
-- Name: payment_plans payment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_plans
    ADD CONSTRAINT payment_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3610 (class 2606 OID 557742)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3612 (class 2606 OID 557744)
-- Name: product_in_sales product_in_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_in_sales
    ADD CONSTRAINT product_in_sales_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 557746)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 557748)
-- Name: recognized_revenue recognized_revenue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recognized_revenue
    ADD CONSTRAINT recognized_revenue_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 557750)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3642 (class 2606 OID 565468)
-- Name: sales_approval sales_approval_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_approval
    ADD CONSTRAINT sales_approval_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 557752)
-- Name: sales_logs sales_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_logs
    ADD CONSTRAINT sales_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 2606 OID 557754)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 3624 (class 2606 OID 557756)
-- Name: sales_users sales_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_users
    ADD CONSTRAINT sales_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 557758)
-- Name: sent_email sent_email_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sent_email
    ADD CONSTRAINT sent_email_pkey PRIMARY KEY (id);


--
-- TOC entry 3628 (class 2606 OID 557760)
-- Name: slabs slabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slabs
    ADD CONSTRAINT slabs_pkey PRIMARY KEY (id);


--
-- TOC entry 3630 (class 2606 OID 557762)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 557764)
-- Name: superadmin_config superadmin_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.superadmin_config
    ADD CONSTRAINT superadmin_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 557766)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3636 (class 2606 OID 557768)
-- Name: transfered_back_sales transfered_back_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfered_back_sales
    ADD CONSTRAINT transfered_back_sales_pkey PRIMARY KEY (id);


--
-- TOC entry 3638 (class 2606 OID 557770)
-- Name: upgraded_transactions upgraded_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upgraded_transactions
    ADD CONSTRAINT upgraded_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 557772)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


-- Completed on 2023-03-22 12:49:43

--
-- PostgreSQL database dump complete
--
