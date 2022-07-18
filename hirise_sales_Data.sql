--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-07-15 20:20:57

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
-- TOC entry 3434 (class 0 OID 123194)
-- Dependencies: 215
-- Data for Name: assigned_quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3428 (class 0 OID 123134)
-- Dependencies: 209
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('39c2af6a-3234-451f-95ff-947d8954c747', 'Enginner Master Solution Pvt. ltd', 'http:/localhost:3003/avatar/EMS logo.png', 'MPSDEC IT park indore', '2022-06-15 08:31:10.640186-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('1b115934-21db-48cf-b134-c9c8e6297786', 'Autarky finance ', 'http:/localhost:3003/avatar/EMS logo.png', 'MPSDEC IT park indore', '2022-07-14 04:49:00.417365-07', NULL, NULL);


--
-- TOC entry 3440 (class 0 OID 196860)
-- Dependencies: 221
-- Data for Name: follow_up_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.follow_up_notes (id, target_id, company_id, user_id, notes, created_at, updated_at, deleted_at) VALUES ('8aef1c91-692e-4c90-97c6-e590ca1bdbc5', '3a8b1eb7-01b8-4938-9143-3ec660b240b9', '1b115934-21db-48cf-b134-c9c8e6297786', '84fdc2db-1448-4726-8729-70098484eb67', 'we have to complete this target immidietly ', '2022-07-14 12:01:09.128538-07', NULL, NULL);


--
-- TOC entry 3438 (class 0 OID 139479)
-- Dependencies: 219
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('06ae589b-7ad2-4279-89c5-ead67f7b76af', '327dd6e1-3c39-43a3-b1f0-cc34dbd73b6a', '39c2af6a-3234-451f-95ff-947d8954c747', '327dd6e1-3c39-43a3-b1f0-cc34dbd73b6a', 'Sukanta Ganguly', 'VP', 'sg@yopmail.com', 'htttp://www.clickIpo.com', '+818 4451 265', '2000000', 'Click Ipo', 'will get lead of very good amount from here', '14, stark street', 'california', 'california', 'USA', '90212', '2022-06-17 09:21:51.888777-07', '2022-07-13 03:03:12.265-07', NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('6a959041-c97b-470c-879b-9cbb69c83e1d', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'Shubham Sodani', 'CFO', 'ss@yopmail.com', 'htttp://www.mandir.com', '+818 4451 265', '1500000', 'mandir pvt. ltd.', 'will get lead of very good amount from here', '14, MPSDEC', 'Indore', 'Indore', 'India', '452010', '2022-07-14 11:12:29.927445-07', NULL, NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('5f26262b-adc4-4fac-9ad5-9c7f01b6eff6', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'kuldeep', 'manager', 'kdm@yopmail.com', '', '+818 4451 265', '1200000', 'advantal', 'dshfjd', '14, stark street', 'california', 'california', 'USA', '90211', '2022-07-15 05:33:43.794371-07', NULL, NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('c00e21b0-9993-4bf2-a73b-ac1b9bc65f9d', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'yash', 'sales', 'yash@yopmail.com', '', '+818 4451 265', '1211320', 'CIS', 'dshfjd', '14, stark street', 'indore', 'india', 'USA', '90211', '2022-07-15 05:34:33.760762-07', NULL, NULL, NULL);


--
-- TOC entry 3430 (class 0 OID 123154)
-- Dependencies: 211
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('fdcc5371-385e-424f-a63a-230cd8edb3f9', 'users', 'company users', '2022-06-15 09:22:13.899462-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');


--
-- TOC entry 3437 (class 0 OID 131267)
-- Dependencies: 218
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('a948d716-c3c2-4a5f-82b6-2c9ef224cc69', 'd0fa24ce-25e7-47e2-8872-3bff947ea4d0', '', NULL, true, true, true, true, '2022-06-14 08:23:08.68669-07', NULL, NULL, 'a948d716-c3c2-4a5f-82b6-2c9ef224cc69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '36f2749b-7f48-453b-8d0a-abbcb1ea3b79', '', NULL, true, true, true, true, '2022-06-15 08:31:10.647115-07', NULL, NULL, '1011e6fe-e33a-4d96-877a-fbf3d80a39f5');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f11753f6-c7f7-447a-87fe-52b6847712de', 'b221c231-4f2a-415b-b0d6-07dc0b0fd093', '', NULL, true, true, true, true, '2022-06-15 09:24:19.362022-07', NULL, NULL, 'undefined');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('db42f06e-40ae-4730-9040-b7114d8a659c', '0298f2af-34e7-4500-bbfb-4079742f9609', 'fdcc5371-385e-424f-a63a-230cd8edb3f9', NULL, false, true, true, false, '2022-06-15 09:23:20.599123-07', '2022-06-15 05:56:21.143-07', NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('6c0799ba-3a0e-46b5-a9f0-473c499ee3d5', '7ab6a161-69b1-42de-aeeb-b9ab3b7cfa8c', 'fdcc5371-385e-424f-a63a-230cd8edb3f9', NULL, true, true, true, false, '2022-06-16 05:39:36.517848-07', '2022-06-15 22:56:05.526-07', NULL, '1011e6fe-e33a-4d96-877a-fbf3d80a39f5');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('84fdc2db-1448-4726-8729-70098484eb67', '943bec2a-64a5-4037-8e06-57a1153b4cae', '', NULL, true, true, true, true, '2022-07-14 04:49:00.427782-07', NULL, NULL, '84fdc2db-1448-4726-8729-70098484eb67');


--
-- TOC entry 3432 (class 0 OID 123174)
-- Dependencies: 213
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.quotations (id, target_time, target_amount, company_id, created_at, updated_at, deleted_at) VALUES ('f1c94f59-0fda-473d-9378-3f8e32425fbf', 'Quaterly', '1000000', '39c2af6a-3234-451f-95ff-947d8954c747', '2022-06-16 08:54:36.496028-07', NULL, '2022-06-16 23:46:38.818-07');


--
-- TOC entry 3431 (class 0 OID 123164)
-- Dependencies: 212
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('fbf38f9d-1695-4b8e-bdf7-fa383b1ddc4f', 'Admin', 'company_admin', NULL, '2022-06-10 10:46:44.73775-07', NULL, NULL, '69d1eb9b-4789-4811-9048-a5ef92c3919e');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('3e6b9eed-8243-4911-a94a-85203d7529f4', 'Admin', 'company_admin', NULL, '2022-06-13 05:02:59.726585-07', NULL, NULL, 'a224cfda-e6a4-4e32-8f30-bb0bd5a3d9e0');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('a224cfda-e6a4-4e32-8f30-bb0bd5a3d9e0', 'undefined', 'undefined', NULL, '2022-06-13 06:18:50.059902-07', NULL, NULL, 'undefined');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('886ccfe1-dddc-4bc0-864f-6671b5cff0a0', 'Vp of sales', 'VP', NULL, '2022-06-13 06:23:48.313566-07', NULL, NULL, 'a224cfda-e6a4-4e32-8f30-bb0bd5a3d9e0');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('e238a67b-dda4-439b-a123-ac1a243ef7b5', 'Sales Manager', 'Sales', NULL, '2022-06-14 05:19:29.868709-07', NULL, NULL, 'a224cfda-e6a4-4e32-8f30-bb0bd5a3d9e0');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('d0fa24ce-25e7-47e2-8872-3bff947ea4d0', 'Admin', 'company_admin', NULL, '2022-06-14 08:23:08.68669-07', NULL, NULL, '212398e8-dfd1-4684-b017-9e458fe30ecd');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('36f2749b-7f48-453b-8d0a-abbcb1ea3b79', 'Admin', 'company_admin', NULL, '2022-06-15 08:31:10.647115-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('b221c231-4f2a-415b-b0d6-07dc0b0fd093', 'Admin', 'company_admin', NULL, '2022-06-15 09:24:19.362022-07', NULL, NULL, '9e458852-4c3c-4ece-bd7e-c55d0b8aeb4d');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('0298f2af-34e7-4500-bbfb-4079742f9609', 'VP', 'VP of sales', NULL, '2022-06-15 09:23:20.599123-07', '2022-06-15 05:56:21.143-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('7ab6a161-69b1-42de-aeeb-b9ab3b7cfa8c', 'SSR', 'sales representative', NULL, '2022-06-16 05:39:36.517848-07', '2022-06-15 22:56:05.526-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.roles (id, role_name, role_type, module_ids, created_at, updated_at, deleted_at, company_id) VALUES ('943bec2a-64a5-4037-8e06-57a1153b4cae', 'Admin', 'company_admin', NULL, '2022-07-14 04:49:00.427782-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');


--
-- TOC entry 3435 (class 0 OID 123204)
-- Dependencies: 216
-- Data for Name: sales_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3433 (class 0 OID 123184)
-- Dependencies: 214
-- Data for Name: slabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('e23e303a-a64d-4d11-ae51-81deb298da3f', '0', '100000', '10%', '39c2af6a-3234-451f-95ff-947d8954c747', false, '2022-07-12 06:44:26.206313-07', '2022-07-12 00:02:20.846-07', NULL);
INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('62804a16-7a4a-4893-9379-5d3da6fe8fb9', '100001', '800000', '5%', '39c2af6a-3234-451f-95ff-947d8954c747', false, '2022-07-12 06:44:26.213732-07', '2022-07-12 00:02:20.85-07', NULL);
INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('9f14c827-acc0-452c-a9e6-00548508cfec', '800001', '', '3%', '39c2af6a-3234-451f-95ff-947d8954c747', true, '2022-07-12 06:44:26.219801-07', '2022-07-12 00:02:20.854-07', NULL);


--
-- TOC entry 3436 (class 0 OID 123244)
-- Dependencies: 217
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.super_admin (id, name, email, encrypted_password, created_at, deleted_at) VALUES ('ae58c6b5-1bea-41c0-883b-53a9c3069af3', 'superadmin', 'superadmin@hirise.com', '4ff3e8922e53309578d694c2dafb41d744af5c4004716f178552449149cd502e9c7022d18cdef4bbe796652d0862f019653e96796ad5d05bffb0f44baaa33528', '2022-06-14 10:28:06.656036-07', NULL);


--
-- TOC entry 3439 (class 0 OID 196809)
-- Dependencies: 220
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.targets (id, lead_id, supporters, finishing_date, amount, description, created_at, updated_at, deleted_at, company_id) VALUES ('3a8b1eb7-01b8-4938-9143-3ec660b240b9', '06ae589b-7ad2-4279-89c5-ead67f7b76af', '["84fdc2db-1448-4726-8729-70098484eb67","84fdc2db-1448-4726-8729-70098484eb67"]', '10/08/2022', '2000000', 'will get lead of very good amount from here', '2022-07-14 07:18:29.515187-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');
INSERT INTO public.targets (id, lead_id, supporters, finishing_date, amount, description, created_at, updated_at, deleted_at, company_id) VALUES ('45cc450b-0eb2-4928-9ce2-e2f3c25bdd44', '6a959041-c97b-470c-879b-9cbb69c83e1d', '["84fdc2db-1448-4726-8729-70098484eb67"]', '10/08/2022', '1000000', 'please complete it on time', '2022-07-14 11:13:27.807441-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');


--
-- TOC entry 3429 (class 0 OID 123144)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('1011e6fe-e33a-4d96-877a-fbf3d80a39f5', 'Kapil karda', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'kapi.ems@yopmail.com', '8897564897', 'Ems@123#', true, NULL, '2022-06-15 08:31:10.647115-07', '2022-06-15 01:33:15.239-07', NULL, '36f2749b-7f48-453b-8d0a-abbcb1ea3b79', ' 0731 498 0457', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('327dd6e1-3c39-43a3-b1f0-cc34dbd73b6a', 'Jitendra Patidar', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'jitendra.ems@yopmail.com', '9755486518', 'test@123#', true, NULL, '2022-06-15 09:42:08.347829-07', '2022-07-11 22:37:40.825-07', NULL, '886ccfe1-dddc-4bc0-864f-6671b5cff0a0', '0731 456985', 'Indore, MadhyaPradesh', false, '5%');
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('84fdc2db-1448-4726-8729-70098484eb67', 'Rahul Chouhan', '1b115934-21db-48cf-b134-c9c8e6297786', '', 'rahul@yopmail.com', '8897564897', 'Rahul@123#', true, NULL, '2022-07-14 04:49:00.427782-07', '2022-07-13 21:55:02.027-07', NULL, '943bec2a-64a5-4037-8e06-57a1153b4cae', ' 0731 498 0457', NULL, false, NULL);


-- Completed on 2022-07-15 20:20:58

--
-- PostgreSQL database dump complete
--

