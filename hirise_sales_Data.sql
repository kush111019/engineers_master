--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-07-25 15:02:36

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
-- TOC entry 3398 (class 0 OID 123134)
-- Dependencies: 209
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('39c2af6a-3234-451f-95ff-947d8954c747', 'Enginner Master Solution Pvt. ltd', 'http:/localhost:3003/avatar/EMS logo.png', 'MPSDEC IT park indore', '2022-06-15 08:31:10.640186-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('1b115934-21db-48cf-b134-c9c8e6297786', 'Autarky finance ', 'http:/localhost:3003/avatar/EMS logo.png', 'MPSDEC IT park indore', '2022-07-14 04:49:00.417365-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('fbaee8cb-a2ed-4fff-956f-2ec074abc439', 'Engineer master pvt. ltd.', 'http:/localhost:3003/comapnyLogo/favicon.png', 'MPSDEC IT park indore', '2022-07-18 06:52:13.77785-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('6eadede2-ad84-4a48-8042-a35eec9ebe78', 'Tech Mahindra', 'http:/localhost:3003/comapnyLogo/favicon.png', 'Crystal IT park indore', '2022-07-25 06:46:18.972176-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('5e77ea68-5d1c-47b8-a1ca-0312f4e97f49', 'infosys', 'http:/localhost:3003/comapnyLogo/favicon.png', 'Crystal IT park indore', '2022-07-25 06:51:52.574793-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', 'Test Company', 'http:/localhost:3003/comapnyLogo/favicon.png', 'Crystal IT park indore', '2022-07-25 07:18:20.998215-07', NULL, NULL);


--
-- TOC entry 3402 (class 0 OID 123174)
-- Dependencies: 213
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.quotations (id, target_time, target_amount, company_id, created_at, updated_at, deleted_at) VALUES ('f1c94f59-0fda-473d-9378-3f8e32425fbf', 'Quaterly', '1000000', '39c2af6a-3234-451f-95ff-947d8954c747', '2022-06-16 08:54:36.496028-07', NULL, '2022-06-16 23:46:38.818-07');


--
-- TOC entry 3399 (class 0 OID 123144)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('444253ed-9be6-4a82-9cba-75de5ff976e9', 'user2', '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '', 'user2@yopmail.com', '9754258352', 'user@123#', true, NULL, '2022-07-25 07:26:43.866949-07', '2022-07-25 01:05:42.261-07', NULL, '26e240f2-c8cd-4552-b80c-fb06fa86a22e', '0731451556', NULL, false, '5%');
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('2ab7830d-c9c0-4c94-b566-b11cd7784415', 'user3', '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '', 'user3@yopmail.com', '9754258352', '', false, NULL, '2022-07-25 08:11:13.744551-07', NULL, NULL, '26e240f2-c8cd-4552-b80c-fb06fa86a22e', '0731451556', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('409717f6-c330-4580-badf-45a207957d5d', 'Mahendra Patidar', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'mahendra@yopmail.com', '9754258352', '', false, NULL, '2022-07-22 11:26:26.663924-07', '2022-07-22 04:30:03.591-07', NULL, 'da29b304-c227-4863-a0d8-6cb628c237fa', '0731451556', NULL, false, '5%');
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('02da9f24-fe62-4bab-bb4f-41509b6d9826', 'Rahul Chouhan', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'rahul@yopmail.com', '9754258352', '', false, NULL, '2022-07-22 11:26:59.615569-07', '2022-07-22 04:30:03.598-07', NULL, '0993e1ad-e760-4d24-8c55-643bea2d3122', '0731451556', NULL, false, '4%');
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('31a09e64-9754-4c12-83cf-e4c657c5dd69', 'Kapil karda', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'kapil@yopmail.com', '8897564897', 'kapil@123#', true, NULL, '2022-07-18 06:52:13.788087-07', '2022-07-17 23:53:09.715-07', NULL, '2d08d325-98c2-437f-81f2-cc985f7cc0db', ' 0731 498 0457', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('dd625507-d071-4a84-9a77-7884a5c8a639', 'Bhoopendra Shukla', '6eadede2-ad84-4a48-8042-a35eec9ebe78', '', 'bhoopendra@yopmail.com', '8897564897', 'Test@123#', false, NULL, '2022-07-25 06:46:18.972176-07', NULL, NULL, '14340c94-2d96-4867-92b0-a45a1126f941', ' 0731 498 0457', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('adccb601-8293-4a84-8f67-564ce02345f9', 'Chetan', '5e77ea68-5d1c-47b8-a1ca-0312f4e97f49', '', 'chetan@yopmail.com', '8897564897', 'Test@123#', true, NULL, '2022-07-25 06:51:52.574793-07', '2022-07-24 23:52:42.089-07', NULL, '16d76c1e-0737-4501-aa24-009314b7a870', ' 0731 498 0457', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79', 'Test1', '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '', 'test1@yopmail.com', '8897564897', 'Test@123#', true, NULL, '2022-07-25 07:18:20.998215-07', '2022-07-25 00:18:54.889-07', NULL, '524232ac-b486-40ad-828c-ca4ec00cdab8', ' 0731 498 0457', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('3dde5829-3d7c-42d5-bd2a-06744631d91f', 'user1', '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '', 'user1@yopmail.com', '9754258352', 'user@123#', true, NULL, '2022-07-25 07:20:43.709463-07', '2022-07-25 00:23:50.926-07', NULL, '8425c1d6-5d48-4241-b8fd-0fb4e9fac1d2', '0731451556', NULL, false, '5%');


--
-- TOC entry 3404 (class 0 OID 123194)
-- Dependencies: 215
-- Data for Name: assigned_quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3412 (class 0 OID 221400)
-- Dependencies: 223
-- Data for Name: deal_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.deal_companies (id, company_name, created_at, updated_at, deleted_at) VALUES ('33423fab-955a-46c6-96ad-d866da387b40', 'Autarky', '2022-07-25 08:45:35.957196-07', NULL, NULL);


--
-- TOC entry 3413 (class 0 OID 221408)
-- Dependencies: 224
-- Data for Name: deal_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3411 (class 0 OID 221391)
-- Dependencies: 222
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.deals (id, user_id, deal_company_id, lead_name, lead_source, qualification, is_qualified, target_amount, product_match, target_closing_date, closed_at, created_at, updated_at, deleted_at, company_id) VALUES ('cb5ff625-12ca-45ef-9e6f-bb1b08e2dae2', '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79', '33423fab-955a-46c6-96ad-d866da387b40', 'Autarky', 'facebook', '', false, '500000', 'multiple products are matching', '15/08/2022', '2022-07-25 02:25:46.339-07', '2022-07-25 08:45:35.957196-07', '2022-07-25 02:25:46.339-07', NULL, '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7');


--
-- TOC entry 3408 (class 0 OID 139479)
-- Dependencies: 219
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('6a959041-c97b-470c-879b-9cbb69c83e1d', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'Shubham Sodani', 'CFO', 'ss@yopmail.com', 'htttp://www.mandir.com', '+818 4451 265', '1500000', 'mandir pvt. ltd.', 'will get lead of very good amount from here', '14, MPSDEC', 'Indore', 'Indore', 'India', '452010', '2022-07-14 11:12:29.927445-07', NULL, NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('5f26262b-adc4-4fac-9ad5-9c7f01b6eff6', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'kuldeep', 'manager', 'kdm@yopmail.com', '', '+818 4451 265', '1200000', 'advantal', 'dshfjd', '14, stark street', 'california', 'california', 'USA', '90211', '2022-07-15 05:33:43.794371-07', NULL, NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('06ae589b-7ad2-4279-89c5-ead67f7b76af', '31a09e64-9754-4c12-83cf-e4c657c5dd69', '39c2af6a-3234-451f-95ff-947d8954c747', '327dd6e1-3c39-43a3-b1f0-cc34dbd73b6a', 'Sukanta Ganguly', 'VP', 'sg@yopmail.com', 'htttp://www.clickIpo.com', '+818 4451 265', '2000000', 'Click Ipo', 'will get lead of very good amount from here', '14, stark street', 'california', 'california', 'USA', '90212', '2022-06-17 09:21:51.888777-07', '2022-07-13 03:03:12.265-07', NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('c00e21b0-9993-4bf2-a73b-ac1b9bc65f9d', 'e4c6d400-fee4-4355-857b-b00a96a828eb', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'yash', 'sales', 'yash@yopmail.com', '', '+818 4451 265', '1211320', 'CIS', 'dshfjd', '14, stark street', 'indore', 'india', 'USA', '90211', '2022-07-15 05:34:33.760762-07', NULL, NULL, NULL);


--
-- TOC entry 3409 (class 0 OID 196809)
-- Dependencies: 220
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.targets (id, lead_id, supporters, finishing_date, amount, description, created_at, updated_at, deleted_at, company_id) VALUES ('3a8b1eb7-01b8-4938-9143-3ec660b240b9', '06ae589b-7ad2-4279-89c5-ead67f7b76af', '["84fdc2db-1448-4726-8729-70098484eb67","84fdc2db-1448-4726-8729-70098484eb67"]', '10/08/2022', '2000000', 'will get lead of very good amount from here', '2022-07-14 07:18:29.515187-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');
INSERT INTO public.targets (id, lead_id, supporters, finishing_date, amount, description, created_at, updated_at, deleted_at, company_id) VALUES ('45cc450b-0eb2-4928-9ce2-e2f3c25bdd44', '6a959041-c97b-470c-879b-9cbb69c83e1d', '["84fdc2db-1448-4726-8729-70098484eb67"]', '10/08/2022', '1000000', 'please complete it on time', '2022-07-14 11:13:27.807441-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');


--
-- TOC entry 3410 (class 0 OID 196860)
-- Dependencies: 221
-- Data for Name: follow_up_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3400 (class 0 OID 123154)
-- Dependencies: 211
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', 'users', 'company users', '2022-07-22 05:05:23.144657-07', NULL, NULL, true, true, true, true, false);
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('d3009aa6-05c8-46dc-8dc2-b4af0688a352', 'Deal management', 'Deals Module', '2022-07-22 05:06:16.398801-07', NULL, NULL, true, true, true, true, false);
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('17ac6db2-17a1-4010-8598-2364db8e9634', 'Slab Configuration', 'Slab Module', '2022-07-22 05:07:22.069156-07', NULL, NULL, false, true, true, false, false);
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('a8252ca9-e471-4a1d-848d-aef386a4d71c', 'Role wise Config', 'Roles Config Module', '2022-07-22 05:07:58.117159-07', NULL, NULL, false, true, true, false, false);
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('2ec14d7f-daa4-4908-83b6-fe1023b17ca8', 'Reports ', 'Reports  Module', '2022-07-22 05:08:20.455432-07', NULL, NULL, false, false, true, false, false);
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('f40d0d01-d77a-4eca-9d0f-0a1e22606a62', 'Role', 'Roles Module', '2022-07-22 05:10:23.097926-07', NULL, NULL, true, true, true, false, false);
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, is_create, is_update, is_read, is_delete, is_assign) VALUES ('f674eb9a-975a-47c6-aa2b-20a86ecf896b', 'Sales management', 'Sales Module', '2022-07-22 06:03:55.606843-07', NULL, NULL, true, true, true, true, false);


--
-- TOC entry 3401 (class 0 OID 123164)
-- Dependencies: 212
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('2d08d325-98c2-437f-81f2-cc985f7cc0db', 'Admin', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352","17ac6db2-17a1-4010-8598-2364db8e9634",
 "a8252ca9-e471-4a1d-848d-aef386a4d71c","2ec14d7f-daa4-4908-83b6-fe1023b17ca8","f40d0d01-d77a-4eca-9d0f-0a1e22606a62","f674eb9a-975a-47c6-aa2b-20a86ecf896b"]', '2022-07-22 10:36:53.999694-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747', NULL, NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('da29b304-c227-4863-a0d8-6cb628c237fa', 'VP', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","f40d0d01-d77a-4eca-9d0f-0a1e22606a62"]', '2022-07-22 11:13:23.337532-07', '2022-07-22 04:13:23.347-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '2d08d325-98c2-437f-81f2-cc985f7cc0db', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('0993e1ad-e760-4d24-8c55-643bea2d3122', 'SM', '["f674eb9a-975a-47c6-aa2b-20a86ecf896b"]', '2022-07-22 11:13:23.352557-07', '2022-07-22 04:13:23.354-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '2d08d325-98c2-437f-81f2-cc985f7cc0db', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('e302f776-b8b7-442d-8117-3b3d322406ad', 'QA', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","f40d0d01-d77a-4eca-9d0f-0a1e22606a62"]', '2022-07-22 11:56:17.379471-07', '2022-07-22 04:56:17.389-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', 'da29b304-c227-4863-a0d8-6cb628c237fa', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('21ff03d4-273c-4e2d-a597-d8e9532229e4', 'sales Manager', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","f40d0d01-d77a-4eca-9d0f-0a1e22606a62"]', '2022-07-22 12:04:46.224793-07', '2022-07-22 05:04:46.231-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', 'da29b304-c227-4863-a0d8-6cb628c237fa', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('14340c94-2d96-4867-92b0-a45a1126f941', 'Admin', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352","17ac6db2-17a1-4010-8598-2364db8e9634","a8252ca9-e471-4a1d-848d-aef386a4d71c","2ec14d7f-daa4-4908-83b6-fe1023b17ca8","f40d0d01-d77a-4eca-9d0f-0a1e22606a62","f674eb9a-975a-47c6-aa2b-20a86ecf896b"]', '2022-07-25 06:46:18.972176-07', '2022-07-24 23:46:19.024-07', NULL, '6eadede2-ad84-4a48-8042-a35eec9ebe78', '', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('16d76c1e-0737-4501-aa24-009314b7a870', 'Admin', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352","17ac6db2-17a1-4010-8598-2364db8e9634","a8252ca9-e471-4a1d-848d-aef386a4d71c","2ec14d7f-daa4-4908-83b6-fe1023b17ca8","f40d0d01-d77a-4eca-9d0f-0a1e22606a62","f674eb9a-975a-47c6-aa2b-20a86ecf896b"]', '2022-07-25 06:51:52.574793-07', '2022-07-24 23:51:52.631-07', NULL, '5e77ea68-5d1c-47b8-a1ca-0312f4e97f49', '', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('77fb6aa6-16e6-4102-bddf-98dd138af9f2', 'vp', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352"]', '2022-07-25 06:59:57.436442-07', '2022-07-24 23:59:57.444-07', NULL, '5e77ea68-5d1c-47b8-a1ca-0312f4e97f49', '16d76c1e-0737-4501-aa24-009314b7a870', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('4d72c89f-9e6d-4fea-abd9-89082637710f', 'SM', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352"]', '2022-07-25 07:01:07.880008-07', '2022-07-25 00:01:07.887-07', NULL, '5e77ea68-5d1c-47b8-a1ca-0312f4e97f49', '77fb6aa6-16e6-4102-bddf-98dd138af9f2', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('c369d57c-7d07-4849-9579-71e2418c697b', 'QA', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352"]', '2022-07-25 07:01:38.042728-07', '2022-07-25 00:01:38.048-07', NULL, '5e77ea68-5d1c-47b8-a1ca-0312f4e97f49', '4d72c89f-9e6d-4fea-abd9-89082637710f', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('524232ac-b486-40ad-828c-ca4ec00cdab8', 'Admin', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352","17ac6db2-17a1-4010-8598-2364db8e9634","a8252ca9-e471-4a1d-848d-aef386a4d71c","2ec14d7f-daa4-4908-83b6-fe1023b17ca8","f40d0d01-d77a-4eca-9d0f-0a1e22606a62","f674eb9a-975a-47c6-aa2b-20a86ecf896b"]', '2022-07-25 07:18:20.998215-07', '2022-07-25 00:18:21.061-07', NULL, '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('8425c1d6-5d48-4241-b8fd-0fb4e9fac1d2', 'VP', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352"]', '2022-07-25 07:19:55.592787-07', '2022-07-25 00:19:55.599-07', NULL, '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '524232ac-b486-40ad-828c-ca4ec00cdab8', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('26e240f2-c8cd-4552-b80c-fb06fa86a22e', 'SM', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352"]', '2022-07-25 07:25:21.755998-07', '2022-07-25 00:25:21.763-07', NULL, '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '8425c1d6-5d48-4241-b8fd-0fb4e9fac1d2', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('780592fb-a16b-4d80-aac4-a3f6106c673d', 'QA', '["85d5a1aa-8eed-439e-be9c-17f7bf4c3f43","d3009aa6-05c8-46dc-8dc2-b4af0688a352"]', '2022-07-25 08:10:41.972319-07', '2022-07-25 01:10:41.978-07', NULL, '74ba266c-1fe9-4cb3-9d98-21aa2b5536e7', '26e240f2-c8cd-4552-b80c-fb06fa86a22e', NULL);


--
-- TOC entry 3407 (class 0 OID 131267)
-- Dependencies: 218
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('1eb959e8-dbfe-4763-a42d-63cd0800da15', '2d08d325-98c2-437f-81f2-cc985f7cc0db', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-22 10:41:27.969048-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('9b73d717-97fd-442d-a031-c42b599f9bfc', '2d08d325-98c2-437f-81f2-cc985f7cc0db', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, true, true, true, true, '2022-07-22 10:42:30.032806-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('27080e4c-7f42-4076-8ee0-4d3523ff9ddc', '2d08d325-98c2-437f-81f2-cc985f7cc0db', '17ac6db2-17a1-4010-8598-2364db8e9634', NULL, true, true, true, true, '2022-07-22 10:43:08.609327-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('b283411d-0dd8-4534-b2dd-20e53f57a8f1', '2d08d325-98c2-437f-81f2-cc985f7cc0db', 'a8252ca9-e471-4a1d-848d-aef386a4d71c', NULL, true, true, true, true, '2022-07-22 10:43:39.631482-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('2232ff3e-73b9-474c-8bf7-d47fe83491f8', '2d08d325-98c2-437f-81f2-cc985f7cc0db', '2ec14d7f-daa4-4908-83b6-fe1023b17ca8', NULL, true, true, true, true, '2022-07-22 10:44:16.513383-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('10563425-3e21-4c94-b618-d1fd944a397f', '2d08d325-98c2-437f-81f2-cc985f7cc0db', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-22 11:02:50.913204-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('80f5fd81-6882-446c-8713-0a30754270e9', '2d08d325-98c2-437f-81f2-cc985f7cc0db', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', NULL, true, true, true, true, '2022-07-22 11:03:32.979294-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('8f24fab4-8e06-4738-8d94-78f77d352b09', 'da29b304-c227-4863-a0d8-6cb628c237fa', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-22 11:13:23.337532-07', NULL, NULL, '409717f6-c330-4580-badf-45a207957d5d');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('de4746bb-d455-4cc8-aa19-e5ee8daa7b4c', 'da29b304-c227-4863-a0d8-6cb628c237fa', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-22 11:13:23.337532-07', NULL, NULL, '409717f6-c330-4580-badf-45a207957d5d');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('b7d98f59-408e-41a7-b3b9-75427cf59a1e', 'e302f776-b8b7-442d-8117-3b3d322406ad', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-22 11:56:17.379471-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('81d70ae0-37d0-4541-afb7-535173d87cb1', 'e302f776-b8b7-442d-8117-3b3d322406ad', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-22 11:56:17.379471-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('3d796ae1-2822-490f-bf7d-933acd315416', '21ff03d4-273c-4e2d-a597-d8e9532229e4', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-22 12:04:46.224793-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('15174569-3bf5-44c8-9248-146d35c61eeb', '21ff03d4-273c-4e2d-a597-d8e9532229e4', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-22 12:04:46.224793-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('3d7dda3e-4213-464a-b76a-332238b2602a', '14340c94-2d96-4867-92b0-a45a1126f941', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('c45a9468-85e6-4e2f-bb7c-1a837c650cba', '14340c94-2d96-4867-92b0-a45a1126f941', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('79d04451-e4b7-4fed-915f-29c3e0d22650', '14340c94-2d96-4867-92b0-a45a1126f941', '17ac6db2-17a1-4010-8598-2364db8e9634', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('e32bed33-e47a-4d25-865e-202ba21fab0f', '14340c94-2d96-4867-92b0-a45a1126f941', 'a8252ca9-e471-4a1d-848d-aef386a4d71c', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('4507cb86-0e21-4e52-8edf-3793cbd154dd', '14340c94-2d96-4867-92b0-a45a1126f941', '2ec14d7f-daa4-4908-83b6-fe1023b17ca8', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('a63352d2-47f2-4b96-b077-60b031a345fc', '14340c94-2d96-4867-92b0-a45a1126f941', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f2eb1878-6244-4fad-b8d9-21b56a2465e1', '14340c94-2d96-4867-92b0-a45a1126f941', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', NULL, true, true, true, true, '2022-07-25 06:46:18.972176-07', NULL, NULL, 'dd625507-d071-4a84-9a77-7884a5c8a639');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('8940173a-6190-4c69-90bf-5cecd0b208f2', '16d76c1e-0737-4501-aa24-009314b7a870', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('e7308838-7be2-4dee-973a-6d9f3a322b87', '16d76c1e-0737-4501-aa24-009314b7a870', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('682d9c2e-4d3e-41ea-b094-102207e70480', '16d76c1e-0737-4501-aa24-009314b7a870', '17ac6db2-17a1-4010-8598-2364db8e9634', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f0e9f577-a99c-4d38-8143-d1db4cffe0e8', '16d76c1e-0737-4501-aa24-009314b7a870', 'a8252ca9-e471-4a1d-848d-aef386a4d71c', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('2cf83f36-7c2b-4b84-a1cf-11a1ae1d867e', '16d76c1e-0737-4501-aa24-009314b7a870', '2ec14d7f-daa4-4908-83b6-fe1023b17ca8', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('02e5d1e2-86aa-4ea4-9f82-4b7381c29e14', '16d76c1e-0737-4501-aa24-009314b7a870', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('198392c7-3e9a-49d5-8f0a-53c2be94bc1d', '16d76c1e-0737-4501-aa24-009314b7a870', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', NULL, true, true, true, true, '2022-07-25 06:51:52.574793-07', NULL, NULL, 'adccb601-8293-4a84-8f67-564ce02345f9');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('d63c44cd-1c9a-4606-8513-eedf23805801', '77fb6aa6-16e6-4102-bddf-98dd138af9f2', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-25 06:59:57.436442-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f850f794-4f3c-4bfe-891a-36b92e7377a7', '77fb6aa6-16e6-4102-bddf-98dd138af9f2', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, true, true, true, true, '2022-07-25 06:59:57.436442-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f79d34cf-3731-4f51-ab8d-dfe95ec78865', '4d72c89f-9e6d-4fea-abd9-89082637710f', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, false, false, '2022-07-25 07:01:07.880008-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('0bdf39aa-254e-4daf-b8e8-53878c716d56', '4d72c89f-9e6d-4fea-abd9-89082637710f', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, false, false, true, true, '2022-07-25 07:01:07.880008-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('138282a0-4474-4b1a-a729-b235e073ccab', 'c369d57c-7d07-4849-9579-71e2418c697b', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, false, false, false, '2022-07-25 07:01:38.042728-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('17819d11-13b9-4c15-8b3b-1a29b0b3b72c', 'c369d57c-7d07-4849-9579-71e2418c697b', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, false, false, true, false, '2022-07-25 07:01:38.042728-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('b86f5a1f-7064-498c-a1b6-962fbfa173cd', '524232ac-b486-40ad-828c-ca4ec00cdab8', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('5325151a-af7b-4e79-9495-28d7c362b569', '524232ac-b486-40ad-828c-ca4ec00cdab8', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('96386bcc-3773-4c21-a1a7-7eeeab136389', '524232ac-b486-40ad-828c-ca4ec00cdab8', '17ac6db2-17a1-4010-8598-2364db8e9634', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('e73ec893-3d73-433a-ad1b-7dd5d9f38673', '524232ac-b486-40ad-828c-ca4ec00cdab8', 'a8252ca9-e471-4a1d-848d-aef386a4d71c', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('96126b29-f88e-4951-81a6-b1304d773512', '524232ac-b486-40ad-828c-ca4ec00cdab8', '2ec14d7f-daa4-4908-83b6-fe1023b17ca8', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f8fb1531-9697-47e3-8831-f7bf89430d52', '524232ac-b486-40ad-828c-ca4ec00cdab8', 'f40d0d01-d77a-4eca-9d0f-0a1e22606a62', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('74aa3db1-27eb-47d1-b48d-427684e7823a', '524232ac-b486-40ad-828c-ca4ec00cdab8', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', NULL, true, true, true, true, '2022-07-25 07:18:20.998215-07', NULL, NULL, '6d40ed79-ecc5-4fc8-bcde-0ab67bd5dd79');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('ed1c05b0-2fef-4e2a-af04-db3ab7aa56f2', '8425c1d6-5d48-4241-b8fd-0fb4e9fac1d2', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, false, false, false, '2022-07-25 07:19:55.592787-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('21c8c695-7492-47c7-a71f-37e9a94b87c8', '8425c1d6-5d48-4241-b8fd-0fb4e9fac1d2', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, false, false, true, false, '2022-07-25 07:19:55.592787-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('8b271fb3-42fb-4584-8940-ab9bb854e02a', '0993e1ad-e760-4d24-8c55-643bea2d3122', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', NULL, true, true, true, true, '2022-07-22 11:13:23.352557-07', NULL, NULL, '3dde5829-3d7c-42d5-bd2a-06744631d91f');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('4d769e13-918e-4d7a-8eed-8e9117def32e', '780592fb-a16b-4d80-aac4-a3f6106c673d', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, false, false, '2022-07-25 08:10:41.972319-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('4a8192a7-87e5-4a5e-bc72-9a190247855e', '780592fb-a16b-4d80-aac4-a3f6106c673d', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, false, false, true, false, '2022-07-25 08:10:41.972319-07', NULL, NULL, NULL);
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('e5193d0c-ac66-476e-a672-c5cff72063cc', '26e240f2-c8cd-4552-b80c-fb06fa86a22e', 'd3009aa6-05c8-46dc-8dc2-b4af0688a352', NULL, false, true, true, false, '2022-07-25 07:25:21.755998-07', NULL, NULL, '2ab7830d-c9c0-4c94-b566-b11cd7784415');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('03c43992-6381-48fc-a93c-642c3953005f', '26e240f2-c8cd-4552-b80c-fb06fa86a22e', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, true, true, true, false, '2022-07-25 07:25:21.755998-07', NULL, NULL, '2ab7830d-c9c0-4c94-b566-b11cd7784415');


--
-- TOC entry 3405 (class 0 OID 123204)
-- Dependencies: 216
-- Data for Name: sales_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3403 (class 0 OID 123184)
-- Dependencies: 214
-- Data for Name: slabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('e23e303a-a64d-4d11-ae51-81deb298da3f', '0', '100000', '10%', '39c2af6a-3234-451f-95ff-947d8954c747', false, '2022-07-12 06:44:26.206313-07', '2022-07-12 00:02:20.846-07', NULL);
INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('62804a16-7a4a-4893-9379-5d3da6fe8fb9', '100001', '800000', '5%', '39c2af6a-3234-451f-95ff-947d8954c747', false, '2022-07-12 06:44:26.213732-07', '2022-07-12 00:02:20.85-07', NULL);
INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('9f14c827-acc0-452c-a9e6-00548508cfec', '800001', '', '3%', '39c2af6a-3234-451f-95ff-947d8954c747', true, '2022-07-12 06:44:26.219801-07', '2022-07-12 00:02:20.854-07', NULL);


--
-- TOC entry 3406 (class 0 OID 123244)
-- Dependencies: 217
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.super_admin (id, name, email, encrypted_password, created_at, deleted_at) VALUES ('ae58c6b5-1bea-41c0-883b-53a9c3069af3', 'superadmin', 'superadmin@hirise.com', '4ff3e8922e53309578d694c2dafb41d744af5c4004716f178552449149cd502e9c7022d18cdef4bbe796652d0862f019653e96796ad5d05bffb0f44baaa33528', '2022-06-14 10:28:06.656036-07', NULL);


-- Completed on 2022-07-25 15:02:36

--
-- PostgreSQL database dump complete
--

