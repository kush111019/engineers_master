--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-12-27 11:11:46

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 242 (class 1259 OID 483548)
-- Name: actual_forecast_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actual_forecast_data (
    id character varying NOT NULL,
    revenue_forecast_id character varying,
    actual_revenue numeric,
    forecast_revenue numeric,
    forecast_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.actual_forecast_data OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 254192)
-- Name: business_contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_contact (
    id character varying NOT NULL,
    full_name character varying,
    email_address character varying,
    phone_number character varying,
    customer_company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    customer_id character varying,
    country_code character varying
);


ALTER TABLE public.business_contact OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 352472)
-- Name: chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat (
    id character varying NOT NULL,
    chat_name character varying,
    is_group_chat boolean,
    last_message character varying,
    group_admin character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_a character varying,
    user_b character varying,
    sales_id character varying,
    company_id character varying
);


ALTER TABLE public.chat OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 344259)
-- Name: chat_room_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_members (
    id character varying NOT NULL,
    room_id character varying,
    user_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    group_name character varying
);


ALTER TABLE public.chat_room_members OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 229571)
-- Name: commission_split; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commission_split (
    id character varying NOT NULL,
    closer_percentage integer,
    supporter_percentage integer,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id character varying
);


ALTER TABLE public.commission_split OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 123134)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id character varying NOT NULL,
    company_name character varying,
    company_logo character varying,
    company_address character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_imap_enable boolean DEFAULT false,
    is_marketing_enable boolean DEFAULT false,
    expiry_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_count numeric
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 262339)
-- Name: configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configurations (
    id character varying NOT NULL,
    currency character varying,
    phone_format character varying,
    date_format character varying,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.configurations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 270531)
-- Name: contact_us; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_us (
    id character varying NOT NULL,
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
-- TOC entry 240 (class 1259 OID 410661)
-- Name: country_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country_details (
    id character varying NOT NULL,
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
-- TOC entry 217 (class 1259 OID 221400)
-- Name: customer_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_companies (
    id character varying NOT NULL,
    customer_company_name character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying
);


ALTER TABLE public.customer_companies OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 221391)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id character varying NOT NULL,
    user_id character varying,
    customer_company_id character varying,
    customer_name character varying,
    source character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying,
    business_contact_id character varying,
    revenue_contact_id character varying,
    address character varying,
    currency character varying,
    lead_id character varying
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 368835)
-- Name: emails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emails (
    id character varying NOT NULL,
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
    company_id character varying,
    from_name character varying,
    read_status boolean DEFAULT false,
    attechments character varying,
    user_id character varying
);


ALTER TABLE public.emails OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 196860)
-- Name: follow_up_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow_up_notes (
    id character varying NOT NULL,
    sales_commission_id character varying,
    company_id character varying,
    user_id character varying,
    notes character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.follow_up_notes OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 385244)
-- Name: imap_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imap_credentials (
    id character varying NOT NULL,
    email character varying,
    app_password character varying,
    user_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    imap_host character varying,
    imap_port numeric,
    smtp_host character varying,
    smtp_port numeric,
    company_id character varying
);


ALTER TABLE public.imap_credentials OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 491778)
-- Name: lead_industries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_industries (
    id character varying NOT NULL,
    industry character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.lead_industries OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 491788)
-- Name: lead_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_sources (
    id character varying NOT NULL,
    source character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.lead_sources OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 491768)
-- Name: lead_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_titles (
    id character varying NOT NULL,
    title character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.lead_titles OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 499922)
-- Name: marketing_budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget (
    id character varying NOT NULL,
    budget_year character varying,
    quarter_one numeric,
    quarter_two numeric,
    quarter_three numeric,
    quarter_four numeric,
    is_finalize boolean DEFAULT false,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.marketing_budget OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 499933)
-- Name: marketing_budget_description; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_description (
    id character varying NOT NULL,
    budget_id character varying,
    amount numeric,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    title character varying
);


ALTER TABLE public.marketing_budget_description OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 499954)
-- Name: marketing_budget_description_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_description_logs (
    id character varying NOT NULL,
    budget_id character varying,
    budget_description_id character varying,
    amount numeric,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    title character varying
);


ALTER TABLE public.marketing_budget_description_logs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 499943)
-- Name: marketing_budget_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_budget_logs (
    id character varying NOT NULL,
    budget_id character varying,
    budget_year character varying,
    quarter_one numeric,
    quarter_two numeric,
    quarter_three numeric,
    quarter_four numeric,
    is_finalize boolean DEFAULT false,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.marketing_budget_logs OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 491729)
-- Name: marketing_leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_leads (
    id character varying NOT NULL,
    full_name character varying,
    title character varying,
    email_address character varying,
    phone_number character varying,
    address character varying,
    organization_name character varying,
    source character varying,
    linkedin_url character varying,
    website character varying,
    targeted_value character varying,
    industry_type character varying,
    assigned_sales_lead_to character varying,
    additional_marketing_notes character varying,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    marketing_qualified_lead boolean DEFAULT false,
    is_converted boolean DEFAULT false
);


ALTER TABLE public.marketing_leads OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 352488)
-- Name: message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message (
    id character varying NOT NULL,
    sender character varying,
    content character varying,
    chat_id character varying,
    read_by character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.message OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 360643)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id character varying NOT NULL,
    module_name character varying,
    module_type character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 319683)
-- Name: payment_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_plans (
    id character varying NOT NULL,
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
-- TOC entry 214 (class 1259 OID 131267)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id character varying NOT NULL,
    role_id character varying,
    module_id character varying,
    permission_to_view_global boolean DEFAULT false,
    permission_to_create boolean DEFAULT false,
    permission_to_update boolean DEFAULT false,
    permission_to_delete boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id character varying,
    permission_to_view_own boolean DEFAULT false
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 426193)
-- Name: product_in_sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_in_sales (
    id character varying NOT NULL,
    product_id character varying,
    sales_commission_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.product_in_sales OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 278723)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id character varying NOT NULL,
    product_name character varying,
    product_image character varying,
    description character varying,
    available_quantity character varying,
    price numeric,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    currency character varying,
    user_id character varying,
    end_of_life character varying
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 254200)
-- Name: revenue_contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_contact (
    id character varying NOT NULL,
    full_name character varying,
    email_address character varying,
    phone_number character varying,
    customer_company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    customer_id character varying,
    country_code character varying
);


ALTER TABLE public.revenue_contact OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 254163)
-- Name: revenue_forecast; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_forecast (
    id character varying NOT NULL,
    timeline character varying,
    revenue numeric,
    growth_window numeric,
    growth_percentage numeric,
    start_date character varying,
    end_date character varying,
    user_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    currency character varying,
    closed_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.revenue_forecast OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 123164)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying NOT NULL,
    role_name character varying,
    module_ids character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying,
    reporter character varying,
    user_id character varying
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 237787)
-- Name: sales_closer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_closer (
    id character varying NOT NULL,
    commission_split_id character varying,
    closer_id character varying,
    closer_percentage numeric,
    sales_commission_id character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.sales_closer OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 237771)
-- Name: sales_commission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_commission (
    id character varying NOT NULL,
    customer_id character varying,
    customer_commission_split_id character varying,
    is_overwrite boolean,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    business_contact_id character varying,
    revenue_contact_id character varying,
    qualification character varying,
    is_qualified boolean,
    target_amount character varying,
    target_closing_date character varying,
    subscription_plan character varying,
    sales_type character varying,
    recurring_date character varying,
    currency character varying,
    closed_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id character varying,
    slab_id character varying,
    lead_id character varying
);


ALTER TABLE public.sales_commission OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 221408)
-- Name: sales_commission_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_commission_logs (
    id character varying NOT NULL,
    sales_commission_id character varying,
    customer_commission_split_id character varying,
    qualification character varying,
    is_qualified boolean,
    target_amount character varying,
    target_closing_date character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    customer_id character varying,
    is_overwrite boolean,
    company_id character varying,
    business_contact_id character varying,
    revenue_contact_id character varying,
    closer_id character varying,
    supporter_id character varying,
    subscription_plan character varying,
    sales_type character varying,
    recurring_date character varying,
    products character varying,
    currency character varying,
    closed_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    slab_id character varying,
    closer_percentage numeric
);


ALTER TABLE public.sales_commission_logs OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 237779)
-- Name: sales_supporter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_supporter (
    id character varying NOT NULL,
    commission_split_id character varying,
    supporter_id character varying,
    supporter_percentage numeric,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    sales_commission_id character varying
);


ALTER TABLE public.sales_supporter OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 385235)
-- Name: sent_email; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sent_email (
    id character varying NOT NULL,
    from_email character varying,
    to_email character varying,
    cc character varying,
    subject character varying,
    message character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    sales_id character varying,
    attechments character varying,
    user_id character varying
);


ALTER TABLE public.sent_email OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 123184)
-- Name: slabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slabs (
    id character varying NOT NULL,
    min_amount character varying,
    max_amount character varying,
    percentage numeric,
    company_id character varying,
    is_max boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    currency character varying,
    slab_ctr numeric,
    user_id character varying,
    slab_id character varying,
    slab_name character varying,
    commission_split_id character varying
);


ALTER TABLE public.slabs OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 123244)
-- Name: super_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.super_admin (
    id character varying NOT NULL,
    name character varying,
    email character varying,
    encrypted_password character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.super_admin OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 327875)
-- Name: superadmin_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.superadmin_config (
    id character varying NOT NULL,
    trial_days numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    trial_users numeric
);


ALTER TABLE public.superadmin_config OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 319693)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id character varying NOT NULL,
    user_id character varying,
    company_id character varying,
    plan_id character varying,
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
-- TOC entry 239 (class 1259 OID 409810)
-- Name: upgraded_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upgraded_transactions (
    id character varying NOT NULL,
    user_id character varying,
    company_id character varying,
    plan_id character varying,
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
-- TOC entry 210 (class 1259 OID 123144)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    full_name character varying,
    company_id character varying,
    avatar character varying,
    email_address character varying,
    mobile_number character varying,
    encrypted_password character varying,
    is_verified boolean,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    role_id character varying,
    phone_number character varying,
    address character varying,
    is_locked boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    expiry_date timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    country_code character varying,
    is_main_admin boolean DEFAULT false,
    created_by character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3504 (class 2606 OID 483559)
-- Name: actual_forecast_data actual_forecast_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actual_forecast_data
    ADD CONSTRAINT actual_forecast_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3498 (class 2606 OID 344268)
-- Name: chat_room_members chat_room_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_members
    ADD CONSTRAINT chat_room_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3478 (class 2606 OID 123143)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 368845)
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 196869)
-- Name: follow_up_notes follow_up_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT follow_up_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3508 (class 2606 OID 491787)
-- Name: lead_industries lead_industries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_industries
    ADD CONSTRAINT lead_industries_pkey PRIMARY KEY (id);


--
-- TOC entry 3510 (class 2606 OID 491797)
-- Name: lead_sources lead_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT lead_sources_pkey PRIMARY KEY (id);


--
-- TOC entry 3506 (class 2606 OID 491777)
-- Name: lead_titles lead_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_titles
    ADD CONSTRAINT lead_titles_pkey PRIMARY KEY (id);


--
-- TOC entry 3518 (class 2606 OID 499963)
-- Name: marketing_budget_description_logs marketing_budget_description_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_description_logs
    ADD CONSTRAINT marketing_budget_description_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3514 (class 2606 OID 499942)
-- Name: marketing_budget_description marketing_budget_description_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_description
    ADD CONSTRAINT marketing_budget_description_pkey PRIMARY KEY (id);


--
-- TOC entry 3516 (class 2606 OID 499953)
-- Name: marketing_budget_logs marketing_budget_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget_logs
    ADD CONSTRAINT marketing_budget_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3512 (class 2606 OID 499932)
-- Name: marketing_budget marketing_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_budget
    ADD CONSTRAINT marketing_budget_pkey PRIMARY KEY (id);


--
-- TOC entry 3500 (class 2606 OID 360652)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- TOC entry 3492 (class 2606 OID 319692)
-- Name: payment_plans payment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_plans
    ADD CONSTRAINT payment_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 131276)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3482 (class 2606 OID 123173)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3484 (class 2606 OID 123193)
-- Name: slabs slaps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slabs
    ADD CONSTRAINT slaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3486 (class 2606 OID 123252)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3496 (class 2606 OID 327884)
-- Name: superadmin_config superadmin_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.superadmin_config
    ADD CONSTRAINT superadmin_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3494 (class 2606 OID 319702)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3480 (class 2606 OID 123153)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3521 (class 2606 OID 196875)
-- Name: follow_up_notes company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


--
-- TOC entry 3520 (class 2606 OID 131277)
-- Name: permissions permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) NOT VALID;


--
-- TOC entry 3522 (class 2606 OID 196880)
-- Name: follow_up_notes user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 3519 (class 2606 OID 123214)
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


-- Completed on 2023-01-24 15:13:18

--
-- PostgreSQL database dump complete
--

