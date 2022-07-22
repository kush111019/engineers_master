--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-07-22 14:43:57

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
-- TOC entry 3387 (class 0 OID 123134)
-- Dependencies: 209
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('39c2af6a-3234-451f-95ff-947d8954c747', 'Enginner Master Solution Pvt. ltd', 'http:/localhost:3003/avatar/EMS logo.png', 'MPSDEC IT park indore', '2022-06-15 08:31:10.640186-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('1b115934-21db-48cf-b134-c9c8e6297786', 'Autarky finance ', 'http:/localhost:3003/avatar/EMS logo.png', 'MPSDEC IT park indore', '2022-07-14 04:49:00.417365-07', NULL, NULL);
INSERT INTO public.companies (id, company_name, company_logo, company_address, created_at, updated_at, deleted_at) VALUES ('fbaee8cb-a2ed-4fff-956f-2ec074abc439', 'Engineer master pvt. ltd.', 'http:/localhost:3003/comapnyLogo/favicon.png', 'MPSDEC IT park indore', '2022-07-18 06:52:13.77785-07', NULL, NULL);


--
-- TOC entry 3391 (class 0 OID 123174)
-- Dependencies: 213
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.quotations (id, target_time, target_amount, company_id, created_at, updated_at, deleted_at) VALUES ('f1c94f59-0fda-473d-9378-3f8e32425fbf', 'Quaterly', '1000000', '39c2af6a-3234-451f-95ff-947d8954c747', '2022-06-16 08:54:36.496028-07', NULL, '2022-06-16 23:46:38.818-07');


--
-- TOC entry 3388 (class 0 OID 123144)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('31a09e64-9754-4c12-83cf-e4c657c5dd69', 'Kapil karda', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'kapil@yopmail.com', '8897564897', 'kapil@123#', true, NULL, '2022-07-18 06:52:13.788087-07', '2022-07-17 23:53:09.715-07', NULL, '9e13a763-4ab0-4f04-9a51-0efe446ffc11', ' 0731 498 0457', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('e4c6d400-fee4-4355-857b-b00a96a828eb', 'Mahendra Patidar', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'mahendra@yopmail.com', '9754258352', 'mahendra@1234#', true, NULL, '2022-07-18 07:19:52.777692-07', '2022-07-18 00:21:11.663-07', NULL, '7374e843-a0a4-4cb5-806a-4e323b9326ca', '0731451556', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('6b15adad-56da-4d7f-9c13-06e5e59d777f', 'Shubham Mandloi', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'shubham@yopmail.com', '9754258352', 'shubham@1234#', true, NULL, '2022-07-18 10:30:23.863898-07', '2022-07-18 04:10:39.841-07', NULL, 'd722698f-aec5-4263-8695-4d113b485d28', '0731451556', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('aab65398-6fd3-470f-8c99-a28a0a8c388d', 'Rushabh kawachale', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'rushabh@yopmail.com', '9754258352', '', false, NULL, '2022-07-18 11:13:44.453869-07', NULL, NULL, '972be62f-234d-4c9f-b695-77494e8a960b', '0731451556', NULL, false, NULL);
INSERT INTO public.users (id, full_name, company_id, avatar, email_address, mobile_number, encrypted_password, is_verified, verification_code, created_at, updated_at, deleted_at, role_id, phone_number, address, is_locked, percentage_distribution) VALUES ('40b73380-267a-49f9-bbee-47563bfbf507', 'Rahul Chouhan', '39c2af6a-3234-451f-95ff-947d8954c747', '', 'rahul@yopmail.com', '9754258352', '', false, NULL, '2022-07-18 08:25:41.946396-07', NULL, NULL, 'e93e00fa-976f-495c-af06-99cd682b5bb2', '0731451556', NULL, false, NULL);


--
-- TOC entry 3393 (class 0 OID 123194)
-- Dependencies: 215
-- Data for Name: assigned_quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3397 (class 0 OID 139479)
-- Dependencies: 219
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('6a959041-c97b-470c-879b-9cbb69c83e1d', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'Shubham Sodani', 'CFO', 'ss@yopmail.com', 'htttp://www.mandir.com', '+818 4451 265', '1500000', 'mandir pvt. ltd.', 'will get lead of very good amount from here', '14, MPSDEC', 'Indore', 'Indore', 'India', '452010', '2022-07-14 11:12:29.927445-07', NULL, NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('5f26262b-adc4-4fac-9ad5-9c7f01b6eff6', '1011e6fe-e33a-4d96-877a-fbf3d80a39f5', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'kuldeep', 'manager', 'kdm@yopmail.com', '', '+818 4451 265', '1200000', 'advantal', 'dshfjd', '14, stark street', 'california', 'california', 'USA', '90211', '2022-07-15 05:33:43.794371-07', NULL, NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('06ae589b-7ad2-4279-89c5-ead67f7b76af', '31a09e64-9754-4c12-83cf-e4c657c5dd69', '39c2af6a-3234-451f-95ff-947d8954c747', '327dd6e1-3c39-43a3-b1f0-cc34dbd73b6a', 'Sukanta Ganguly', 'VP', 'sg@yopmail.com', 'htttp://www.clickIpo.com', '+818 4451 265', '2000000', 'Click Ipo', 'will get lead of very good amount from here', '14, stark street', 'california', 'california', 'USA', '90212', '2022-06-17 09:21:51.888777-07', '2022-07-13 03:03:12.265-07', NULL, NULL);
INSERT INTO public.leads (id, user_id, company_id, assigned_to, full_name, designation, email_address, website, phone_number, lead_value, company, description, address, city_name, state_name, country_name, zip_code, created_at, updated_at, deleted_at, supporters) VALUES ('c00e21b0-9993-4bf2-a73b-ac1b9bc65f9d', 'e4c6d400-fee4-4355-857b-b00a96a828eb', '39c2af6a-3234-451f-95ff-947d8954c747', NULL, 'yash', 'sales', 'yash@yopmail.com', '', '+818 4451 265', '1211320', 'CIS', 'dshfjd', '14, stark street', 'indore', 'india', 'USA', '90211', '2022-07-15 05:34:33.760762-07', NULL, NULL, NULL);


--
-- TOC entry 3398 (class 0 OID 196809)
-- Dependencies: 220
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.targets (id, lead_id, supporters, finishing_date, amount, description, created_at, updated_at, deleted_at, company_id) VALUES ('3a8b1eb7-01b8-4938-9143-3ec660b240b9', '06ae589b-7ad2-4279-89c5-ead67f7b76af', '["84fdc2db-1448-4726-8729-70098484eb67","84fdc2db-1448-4726-8729-70098484eb67"]', '10/08/2022', '2000000', 'will get lead of very good amount from here', '2022-07-14 07:18:29.515187-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');
INSERT INTO public.targets (id, lead_id, supporters, finishing_date, amount, description, created_at, updated_at, deleted_at, company_id) VALUES ('45cc450b-0eb2-4928-9ce2-e2f3c25bdd44', '6a959041-c97b-470c-879b-9cbb69c83e1d', '["84fdc2db-1448-4726-8729-70098484eb67"]', '10/08/2022', '1000000', 'please complete it on time', '2022-07-14 11:13:27.807441-07', NULL, NULL, '1b115934-21db-48cf-b134-c9c8e6297786');


--
-- TOC entry 3399 (class 0 OID 196860)
-- Dependencies: 221
-- Data for Name: follow_up_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3389 (class 0 OID 123154)
-- Dependencies: 211
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', 'users', 'company users', '2022-07-22 05:05:23.144657-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('d3009aa6-05c8-46dc-8dc2-b4af0688a352', 'Deal management', 'Deals Module', '2022-07-22 05:06:16.398801-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('17ac6db2-17a1-4010-8598-2364db8e9634', 'Slab Configuration', 'Slab Module', '2022-07-22 05:07:22.069156-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('a8252ca9-e471-4a1d-848d-aef386a4d71c', 'Role wise Config', 'Roles Config Module', '2022-07-22 05:07:58.117159-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('2ec14d7f-daa4-4908-83b6-fe1023b17ca8', 'Reports ', 'Reports  Module', '2022-07-22 05:08:20.455432-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('f40d0d01-d77a-4eca-9d0f-0a1e22606a62', 'Role', 'Roles Module', '2022-07-22 05:10:23.097926-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');
INSERT INTO public.modules (id, module_name, module_type, created_at, updated_at, deleted_at, company_id) VALUES ('f674eb9a-975a-47c6-aa2b-20a86ecf896b', 'Sales management', 'Sales Module', '2022-07-22 06:03:55.606843-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747');


--
-- TOC entry 3390 (class 0 OID 123164)
-- Dependencies: 212
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('7374e843-a0a4-4cb5-806a-4e323b9326ca', 'VP', NULL, '2022-07-18 07:19:04.55859-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '9e13a763-4ab0-4f04-9a51-0efe446ffc11', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('e93e00fa-976f-495c-af06-99cd682b5bb2', 'suporter', NULL, '2022-07-18 12:52:25.255944-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '972be62f-234d-4c9f-b695-77494e8a960b', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('79baf3d7-5fb1-4708-b926-6fc954c664ae', 'Manager', NULL, '2022-07-18 08:24:34.624693-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '7374e843-a0a4-4cb5-806a-4e323b9326ca', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('d722698f-aec5-4263-8695-4d113b485d28', 'HR', NULL, '2022-07-18 10:28:04.717918-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '7374e843-a0a4-4cb5-806a-4e323b9326ca', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('972be62f-234d-4c9f-b695-77494e8a960b', 'BDE', NULL, '2022-07-18 11:12:20.991027-07', '2022-07-21 06:22:12.361-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '79baf3d7-5fb1-4708-b926-6fc954c664ae', 'e93e00fa-976f-495c-af06-99cd682b5bb2');
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('9e13a763-4ab0-4f04-9a51-0efe446ffc11', 'Admin', NULL, '2022-07-18 06:52:13.788087-07', NULL, NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('274c01ae-c192-44fd-b4d0-3c4929c0bc69', 'SM1', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43,2ec14d7f-daa4-4908-83b6-fe1023b17ca8', '2022-07-22 06:20:18.442798-07', '2022-07-22 00:06:34.135-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '9e13a763-4ab0-4f04-9a51-0efe446ffc11', NULL);
INSERT INTO public.roles (id, role_name, module_ids, created_at, updated_at, deleted_at, company_id, reporter, supporter) VALUES ('f4ee9d11-62eb-442c-a698-2fc679dbc5fb', 'QA1', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', '2022-07-22 06:20:18.467622-07', '2022-07-22 00:06:34.156-07', NULL, '39c2af6a-3234-451f-95ff-947d8954c747', '9e13a763-4ab0-4f04-9a51-0efe446ffc11', NULL);


--
-- TOC entry 3396 (class 0 OID 131267)
-- Dependencies: 218
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('044478d6-71e0-42c7-b8e0-5a2e23c73022', 'f4ee9d11-62eb-442c-a698-2fc679dbc5fb', 'f674eb9a-975a-47c6-aa2b-20a86ecf896b', NULL, true, false, true, true, '2022-07-22 06:20:18.467622-07', '2022-07-22 00:06:34.156-07', NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('e3ba1edc-7248-41a9-9472-3c23b14d9017', '7374e843-a0a4-4cb5-806a-4e323b9326ca', 'bc87b1d9-f43f-4921-a3c0-ff8a9bf05693', NULL, true, true, true, false, '2022-07-18 07:19:04.55859-07', NULL, NULL, 'e4c6d400-fee4-4355-857b-b00a96a828eb');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('355cbe2c-6f65-4205-81cc-0e95e071b9d5', '79baf3d7-5fb1-4708-b926-6fc954c664ae', 'bc87b1d9-f43f-4921-a3c0-ff8a9bf05693', NULL, true, true, true, false, '2022-07-18 08:24:34.624693-07', NULL, NULL, '40b73380-267a-49f9-bbee-47563bfbf507');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('a0367cf9-64f9-4abc-8101-f624c2fdf86e', 'd722698f-aec5-4263-8695-4d113b485d28', 'bc87b1d9-f43f-4921-a3c0-ff8a9bf05693', NULL, true, true, true, false, '2022-07-18 10:28:04.717918-07', NULL, NULL, '6b15adad-56da-4d7f-9c13-06e5e59d777f');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('6113742a-9c0f-4819-9b9a-70dcf1550dfa', '972be62f-234d-4c9f-b695-77494e8a960b', 'bc87b1d9-f43f-4921-a3c0-ff8a9bf05693', NULL, true, true, true, false, '2022-07-18 11:12:20.991027-07', NULL, NULL, 'aab65398-6fd3-470f-8c99-a28a0a8c388d');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('f17513e3-7ce0-4bcf-bbab-eab4d0984264', 'e93e00fa-976f-495c-af06-99cd682b5bb2', 'bc87b1d9-f43f-4921-a3c0-ff8a9bf05693', NULL, true, true, true, false, '2022-07-18 12:52:25.255944-07', NULL, NULL, '6b15adad-56da-4d7f-9c13-06e5e59d777f');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('0ee4b012-5b60-4d7b-b2a3-42cad300cf11', '9e13a763-4ab0-4f04-9a51-0efe446ffc11', 'bc87b1d9-f43f-4921-a3c0-ff8a9bf05693', NULL, true, true, true, true, '2022-07-18 06:52:13.788087-07', NULL, NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('e38160b6-3a1e-4830-b012-4946169bff12', '274c01ae-c192-44fd-b4d0-3c4929c0bc69', '85d5a1aa-8eed-439e-be9c-17f7bf4c3f43', NULL, false, true, true, false, '2022-07-22 06:20:18.442798-07', '2022-07-22 00:06:34.135-07', NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');
INSERT INTO public.permissions (id, role_id, module_id, module_name, permission_to_view, permission_to_create, permission_to_update, permission_to_delete, created_at, updated_at, deleted_at, user_id) VALUES ('6eb5aeb6-0558-400b-b497-1e53411c50ec', '274c01ae-c192-44fd-b4d0-3c4929c0bc69', '2ec14d7f-daa4-4908-83b6-fe1023b17ca8', NULL, true, false, true, false, '2022-07-22 06:20:18.442798-07', '2022-07-22 00:06:34.135-07', NULL, '31a09e64-9754-4c12-83cf-e4c657c5dd69');


--
-- TOC entry 3394 (class 0 OID 123204)
-- Dependencies: 216
-- Data for Name: sales_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3392 (class 0 OID 123184)
-- Dependencies: 214
-- Data for Name: slabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('e23e303a-a64d-4d11-ae51-81deb298da3f', '0', '100000', '10%', '39c2af6a-3234-451f-95ff-947d8954c747', false, '2022-07-12 06:44:26.206313-07', '2022-07-12 00:02:20.846-07', NULL);
INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('62804a16-7a4a-4893-9379-5d3da6fe8fb9', '100001', '800000', '5%', '39c2af6a-3234-451f-95ff-947d8954c747', false, '2022-07-12 06:44:26.213732-07', '2022-07-12 00:02:20.85-07', NULL);
INSERT INTO public.slabs (id, min_amount, max_amount, percentage, company_id, is_max, created_at, updated_at, deleted_at) VALUES ('9f14c827-acc0-452c-a9e6-00548508cfec', '800001', '', '3%', '39c2af6a-3234-451f-95ff-947d8954c747', true, '2022-07-12 06:44:26.219801-07', '2022-07-12 00:02:20.854-07', NULL);


--
-- TOC entry 3395 (class 0 OID 123244)
-- Dependencies: 217
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.super_admin (id, name, email, encrypted_password, created_at, deleted_at) VALUES ('ae58c6b5-1bea-41c0-883b-53a9c3069af3', 'superadmin', 'superadmin@hirise.com', '4ff3e8922e53309578d694c2dafb41d744af5c4004716f178552449149cd502e9c7022d18cdef4bbe796652d0862f019653e96796ad5d05bffb0f44baaa33528', '2022-06-14 10:28:06.656036-07', NULL);


-- Completed on 2022-07-22 14:43:57

--
-- PostgreSQL database dump complete
--

