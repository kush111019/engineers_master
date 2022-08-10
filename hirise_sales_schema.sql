--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-08-10 17:17:00

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
-- TOC entry 3452 (class 1262 OID 123133)
-- Name: hirise_sales1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE hirise_sales1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';


ALTER DATABASE hirise_sales1 OWNER TO postgres;

\connect hirise_sales1

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
-- TOC entry 225 (class 1259 OID 254192)
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
    customer_id character varying
);


ALTER TABLE public.business_contact OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 229571)
-- Name: commission_split; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commission_split (
    id character varying NOT NULL,
    closer_percentage integer,
    supporter_percentage integer,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
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
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 221400)
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
-- TOC entry 219 (class 1259 OID 221408)
-- Name: customer_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_logs (
    id character varying NOT NULL,
    customer_name character varying,
    source character varying,
    qualification character varying,
    is_qualified boolean,
    target_amount character varying,
    product_match character varying,
    target_closing_date character varying,
    closed_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    customer_id character varying
);


ALTER TABLE public.customer_logs OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 221391)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id character varying NOT NULL,
    user_id character varying,
    customer_company_id character varying,
    customer_name character varying,
    source character varying,
    qualification character varying,
    is_qualified boolean,
    target_amount character varying,
    product_match character varying,
    target_closing_date character varying,
    closed_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying,
    business_id character varying,
    revenue_id character varying
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 196860)
-- Name: follow_up_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow_up_notes (
    id character varying NOT NULL,
    customer_id character varying,
    company_id character varying,
    user_id character varying,
    notes character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.follow_up_notes OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 123154)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id character varying NOT NULL,
    module_name character varying,
    module_type character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    is_create boolean,
    is_update boolean,
    is_read boolean,
    is_delete boolean,
    is_assign boolean
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 131267)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id character varying NOT NULL,
    role_id character varying,
    module_id character varying,
    permission_to_view boolean,
    permission_to_create boolean,
    permission_to_update boolean,
    permission_to_delete boolean,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    user_id character varying
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 254200)
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
    customer_id character varying
);


ALTER TABLE public.revenue_contact OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 254163)
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
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.revenue_forecast OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 123164)
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
    reporter character varying
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 237787)
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
-- TOC entry 221 (class 1259 OID 237771)
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
    business_id character varying,
    revenue_id character varying
);


ALTER TABLE public.sales_commission OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 237779)
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
-- TOC entry 213 (class 1259 OID 123184)
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
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.slabs OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 123244)
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
    percentage_distribution character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3289 (class 2606 OID 123143)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3303 (class 2606 OID 196869)
-- Name: follow_up_notes follow_up_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT follow_up_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3293 (class 2606 OID 123163)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- TOC entry 3301 (class 2606 OID 131276)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3295 (class 2606 OID 123173)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3297 (class 2606 OID 123193)
-- Name: slabs slaps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slabs
    ADD CONSTRAINT slaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3299 (class 2606 OID 123252)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3291 (class 2606 OID 123153)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3306 (class 2606 OID 196875)
-- Name: follow_up_notes company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


--
-- TOC entry 3305 (class 2606 OID 131277)
-- Name: permissions permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) NOT VALID;


--
-- TOC entry 3307 (class 2606 OID 196880)
-- Name: follow_up_notes user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 3304 (class 2606 OID 123214)
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


-- Completed on 2022-08-10 17:17:01

--
-- PostgreSQL database dump complete
--

