--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-08-05 18:50:43

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
-- TOC entry 3364 (class 1262 OID 115061)
-- Name: hirise_sales; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE hirise_sales WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';


ALTER DATABASE hirise_sales OWNER TO postgres;

\connect hirise_sales

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
-- TOC entry 209 (class 1259 OID 115062)
-- Name: company_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_admin (
    id character varying NOT NULL,
    company_name character varying,
    company_logo character varying,
    email character varying,
    phone character varying,
    address character varying,
    password character varying,
    status character varying,
    is_verified boolean,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    code character varying,
    token character varying
);


ALTER TABLE public.company_admin OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 115070)
-- Name: quotation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation (
    id character varying NOT NULL,
    vp_id character varying,
    sm_id character varying,
    company_id character varying,
    time_period character varying,
    amount character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.quotation OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 115078)
-- Name: sales_managers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_managers (
    id character varying NOT NULL,
    vp_id character varying,
    company_id character varying,
    avatar character varying,
    name character varying,
    email character varying,
    phone character varying,
    address character varying,
    password character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    token character varying
);


ALTER TABLE public.sales_managers OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 115086)
-- Name: slab; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slab (
    id character varying NOT NULL,
    sm_id character varying,
    vp_id character varying,
    from_percentage character varying,
    to_percentage character varying,
    amount character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.slab OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 115094)
-- Name: super_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.super_admin (
    id character varying NOT NULL,
    name character varying,
    email character varying,
    password character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);


ALTER TABLE public.super_admin OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 115101)
-- Name: vp_sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vp_sales (
    id character varying NOT NULL,
    company_id character varying NOT NULL,
    name character varying,
    avatar character varying,
    phone character varying,
    address character varying,
    password character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    email character varying,
    token character varying
);


ALTER TABLE public.vp_sales OWNER TO postgres;

--
-- TOC entry 3201 (class 2606 OID 115110)
-- Name: company_admin company_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_admin
    ADD CONSTRAINT company_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3203 (class 2606 OID 115112)
-- Name: quotation quotation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation
    ADD CONSTRAINT quotation_pkey PRIMARY KEY (id);


--
-- TOC entry 3205 (class 2606 OID 115114)
-- Name: sales_managers sales_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_managers
    ADD CONSTRAINT sales_managers_pkey PRIMARY KEY (id);


--
-- TOC entry 3207 (class 2606 OID 115116)
-- Name: slab slab_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slab
    ADD CONSTRAINT slab_pkey PRIMARY KEY (id);


--
-- TOC entry 3209 (class 2606 OID 115118)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3211 (class 2606 OID 115120)
-- Name: vp_sales vp_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vp_sales
    ADD CONSTRAINT vp_sales_pkey PRIMARY KEY (id);


--
-- TOC entry 3212 (class 2606 OID 115121)
-- Name: quotation quotation_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation
    ADD CONSTRAINT quotation_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_admin(id) NOT VALID;


--
-- TOC entry 3213 (class 2606 OID 115126)
-- Name: quotation quotation_sm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation
    ADD CONSTRAINT quotation_sm_id_fkey FOREIGN KEY (sm_id) REFERENCES public.sales_managers(id) NOT VALID;


--
-- TOC entry 3214 (class 2606 OID 115131)
-- Name: quotation quotation_vp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation
    ADD CONSTRAINT quotation_vp_id_fkey FOREIGN KEY (vp_id) REFERENCES public.vp_sales(id) NOT VALID;


--
-- TOC entry 3215 (class 2606 OID 115136)
-- Name: sales_managers sales_managers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_managers
    ADD CONSTRAINT sales_managers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_admin(id) NOT VALID;


--
-- TOC entry 3216 (class 2606 OID 115141)
-- Name: sales_managers sales_managers_vp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_managers
    ADD CONSTRAINT sales_managers_vp_id_fkey FOREIGN KEY (vp_id) REFERENCES public.vp_sales(id) NOT VALID;


--
-- TOC entry 3217 (class 2606 OID 115146)
-- Name: slab slab_sm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slab
    ADD CONSTRAINT slab_sm_id_fkey FOREIGN KEY (sm_id) REFERENCES public.sales_managers(id) NOT VALID;


--
-- TOC entry 3218 (class 2606 OID 115151)
-- Name: slab slab_vp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slab
    ADD CONSTRAINT slab_vp_id_fkey FOREIGN KEY (vp_id) REFERENCES public.vp_sales(id) NOT VALID;


--
-- TOC entry 3219 (class 2606 OID 115161)
-- Name: vp_sales vp_sales_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vp_sales
    ADD CONSTRAINT vp_sales_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_admin(id) NOT VALID;


-- Completed on 2022-08-05 18:50:46

--
-- PostgreSQL database dump complete
--

