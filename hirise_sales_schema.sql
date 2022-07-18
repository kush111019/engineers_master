--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-07-15 20:20:15

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
-- TOC entry 3433 (class 1262 OID 123133)
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
-- TOC entry 215 (class 1259 OID 123194)
-- Name: assigned_quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assigned_quotations (
    id character varying NOT NULL,
    quotation_id character varying,
    user_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.assigned_quotations OWNER TO postgres;

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
-- TOC entry 221 (class 1259 OID 196860)
-- Name: follow_up_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow_up_notes (
    id character varying NOT NULL,
    target_id character varying,
    company_id character varying,
    user_id character varying,
    notes character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.follow_up_notes OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 139479)
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id character varying NOT NULL,
    user_id character varying,
    company_id character varying,
    assigned_to character varying,
    full_name character varying,
    designation character varying,
    email_address character varying,
    website character varying,
    phone_number character varying,
    lead_value character varying,
    company character varying,
    description character varying,
    address character varying,
    city_name character varying,
    state_name character varying,
    country_name character varying,
    zip_code character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    supporters character varying[]
);


ALTER TABLE public.leads OWNER TO postgres;

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
    company_id character varying
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 131267)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id character varying NOT NULL,
    role_id character varying,
    module_id character varying,
    module_name character varying,
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
-- TOC entry 213 (class 1259 OID 123174)
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id character varying NOT NULL,
    target_time character varying,
    target_amount character varying,
    company_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 123164)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying NOT NULL,
    role_name character varying,
    role_type character varying,
    module_ids character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 123204)
-- Name: sales_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_entries (
    id character varying NOT NULL,
    user_id character varying,
    amount character varying,
    client_name character varying,
    client_email character varying,
    client_contact character varying,
    description character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying
);


ALTER TABLE public.sales_entries OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 123184)
-- Name: slabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slabs (
    id character varying NOT NULL,
    min_amount character varying,
    max_amount character varying,
    percentage character varying,
    company_id character varying,
    is_max boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.slabs OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 123244)
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
-- TOC entry 220 (class 1259 OID 196809)
-- Name: targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.targets (
    id character varying NOT NULL,
    lead_id character varying,
    supporters character varying,
    finishing_date character varying,
    amount character varying,
    description character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    company_id character varying
);


ALTER TABLE public.targets OWNER TO postgres;

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
    verification_code character varying,
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
-- TOC entry 3264 (class 2606 OID 123203)
-- Name: assigned_quotations assigned_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_quotations
    ADD CONSTRAINT assigned_quotations_pkey PRIMARY KEY (id);


--
-- TOC entry 3252 (class 2606 OID 123143)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3276 (class 2606 OID 196869)
-- Name: follow_up_notes follow_up_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT follow_up_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3272 (class 2606 OID 139488)
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- TOC entry 3256 (class 2606 OID 123163)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- TOC entry 3270 (class 2606 OID 131276)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3260 (class 2606 OID 123183)
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- TOC entry 3258 (class 2606 OID 123173)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3266 (class 2606 OID 123213)
-- Name: sales_entries sales_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT sales_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 123193)
-- Name: slabs slaps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slabs
    ADD CONSTRAINT slaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3268 (class 2606 OID 123252)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3274 (class 2606 OID 196818)
-- Name: targets targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_pkey PRIMARY KEY (id);


--
-- TOC entry 3254 (class 2606 OID 123153)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3280 (class 2606 OID 123234)
-- Name: assigned_quotations assigned_quotations_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_quotations
    ADD CONSTRAINT assigned_quotations_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) NOT VALID;


--
-- TOC entry 3281 (class 2606 OID 123239)
-- Name: assigned_quotations assigned_quotations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_quotations
    ADD CONSTRAINT assigned_quotations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 3285 (class 2606 OID 196830)
-- Name: targets company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


--
-- TOC entry 3287 (class 2606 OID 196875)
-- Name: follow_up_notes company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


--
-- TOC entry 3278 (class 2606 OID 204995)
-- Name: modules company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


--
-- TOC entry 3283 (class 2606 OID 131277)
-- Name: permissions permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) NOT VALID;


--
-- TOC entry 3279 (class 2606 OID 123229)
-- Name: roles roles_module_ids_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_module_ids_fkey FOREIGN KEY (module_ids) REFERENCES public.modules(id) NOT VALID;


--
-- TOC entry 3282 (class 2606 OID 123224)
-- Name: sales_entries sales_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT sales_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 3286 (class 2606 OID 196870)
-- Name: follow_up_notes target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT target_id_fkey FOREIGN KEY (target_id) REFERENCES public.targets(id) NOT VALID;


--
-- TOC entry 3284 (class 2606 OID 196819)
-- Name: targets targets_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) NOT VALID;


--
-- TOC entry 3288 (class 2606 OID 196880)
-- Name: follow_up_notes user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_notes
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- TOC entry 3277 (class 2606 OID 123214)
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


-- Completed on 2022-07-15 20:20:16

--
-- PostgreSQL database dump complete
--

