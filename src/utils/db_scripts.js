
const db_sql = {

    "Q1"   : `select id, company_name, company_address from companies where company_name = '{var1}'`,
    "Q2"   : `insert into companies(id,company_name,company_logo,company_address) 
              values('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q3"   : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,expiry_date,is_verified,is_admin) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}',false,true) RETURNING *`,          
    "Q4"   : `select id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar,expiry_date, is_verified, is_admin, is_locked from users where email_address = '{var1}' and deleted_at is null` ,
    "Q5"   : `update users set encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' where id = '{var1}' and company_id = '{var4}' RETURNING *`, 
    "Q6"   : `select id, module_name,module_type from modules where deleted_at is null`,
    "Q7"   : `update users set is_verified = true ,updated_at = '{var2}' where id = '{var1}' RETURNING *`, 
    "Q8"   : `select id, full_name,company_id, email_address,mobile_number,phone_number,address,role_id, avatar,expiry_date, is_verified, is_admin, is_locked from users where id = '{var1}' and deleted_at is null ` ,
    "Q9"   : `select id, company_name, company_address, company_logo, is_imap_enable from companies where id = '{var1}' and deleted_at is null`,
    "Q10"  : `update users set full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' where id = '{var8}' and company_id = '{var9}' and deleted_at is null RETURNING * `, 
    "Q11"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q12"  : `select id, role_name, reporter, module_ids from roles where id = '{var1}' and deleted_at is null`,
    "Q13"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','{var2}','{var3}','{var4}') RETURNING *`, 
    "Q14"  : `select id, role_name, reporter , module_ids from roles where company_id = '{var1}' and deleted_at is null` ,
    "Q15"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at from users where company_id = '{var1}' and deleted_at is null ORDER BY created_at desc`,
    "Q16"  : `select id, role_name, reporter from roles where reporter = '{var1}' and deleted_at is null`,
    "Q17"  : `select id, min_amount, max_amount, percentage, is_max, currency from slabs where company_id ='{var1}' and deleted_at is null`,
    "Q18"  : `insert into slabs(id,min_amount, max_amount, percentage, is_max, company_id, currency) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}') returning * `,
    "Q19"  : `update slabs set deleted_at = '{var2}' where company_id = '{var1}' and deleted_at is null returning *`,
    "Q20"  : `insert into permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view, user_id) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}') returning *`,
    "Q21"  : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where role_id = '{var1}' and company_id = '{var2}' and deleted_at is null `,
    "Q22"  : `update users set email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}' where id = '{var6}' and company_id = '{var9}' and deleted_at is null RETURNING * `,
    "Q23"  : `update users set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null RETURNING * `,
    "Q24"  : `select id,email_address, full_name, company_id, avatar,mobile_number,address,role_id from users where id = '{var1}' and deleted_at is null`,
    "Q25"  : `update roles set role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' where id = '{var3}' and company_id = '{var5}' and deleted_at is null returning *`,
    "Q26"  : `update permissions set permission_to_create= '{var1}', permission_to_view = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}' where role_id = '{var5}' and module_id = '{var7}' and deleted_at is null `,
    "Q27"  : `update roles set deleted_at = '{var2}' where id = '{var1}' and deleted_at is null returning *`,
    "Q28"  : `update permissions set deleted_at = '{var2}' where role_id = '{var1}' and deleted_at is null returning * `,
    "Q29"  : `update slabs set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null`,
    "Q30"  : `update users set is_locked = '{var1}', updated_at = '{var3}' where company_id = '{var2}' and deleted_at is null  RETURNING * `,
    "Q31"  : `insert into follow_up_notes (id, sales_commission_id, company_id, user_id, notes) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q32"  : `select id, notes, created_at from follow_up_notes where sales_commission_id = '{var1}' and deleted_at is null`,
    "Q33"  : `update permissions set user_id = '{var2}' where role_id = '{var1}' and deleted_at is null returning *`,
    "Q34"  : `update roles set module_ids = '{var1}' , updated_at = '{var2}' where id = '{var3}' returning * `,
    "Q35"  : `select m.module_name, p.permission_to_view, p.permission_to_create, 
              p.permission_to_update, p.permission_to_delete from modules as m inner join permissions as p on p.module_id = m.id
              inner join roles as r on r.id = p.role_id where m.id = '{var1}' and r.id = '{var2}' 
              and m.deleted_at is null and p.deleted_at is null`,
    "Q36"  : `insert into customers(id, user_id,customer_company_id,customer_name, source, company_id, business_id, revenue_id, address) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}') returning *`,
    "Q37"  : `insert into customer_companies(id, customer_company_name, company_id) values('{var1}','{var2}','{var3}') returning *`,
    "Q38"  : `select id, customer_company_name from customer_companies where id = '{var1}' and deleted_at is null`,
    "Q39"  : `select c.id, c.customer_company_id , c.customer_name, c.source, c.closed_at , c.user_id, c.business_id, c.revenue_id, c.created_at, c.address,
              u.full_name as created_by from customers as c inner join users as u on u.id = c.user_id
              where c.company_id = '{var1}' and c.deleted_at is null and u.deleted_at is null ORDER BY created_at desc`,
    "Q40"  : `update customers set closed_at = '{var1}', updated_at = '{var2}' where id = '{var3}' returning *`,
    "Q41"  : `select m.id as module_id, m.module_name, m.module_type, p.id as permission_id, p.permission_to_view, 
              p.permission_to_create, p.permission_to_update, p.permission_to_delete
              from modules as m inner join permissions as p on p.module_id = m.id
              inner join users as u on u.role_id = p.role_id
              where m.module_name = '{var1}' and u.id = '{var2}' and m.deleted_at is null and p.deleted_at is null`,   
    "Q42"  : `update customers set customer_name = '{var1}', source = '{var2}', updated_at = '{var3}', business_id = '{var4}', revenue_id = '{var5}', address = '{var7}' where id = '{var6}' and company_id = '{var8}' and deleted_at is null returning *`,
    "Q43"  : `insert into sales_commission_logs(id,sales_commission_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_id, business_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date, currency) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}', '{var19}' ) returning *`,
    "Q44"  : `select sl.id, sl.sales_commission_id, sl.customer_commission_split_id, sl.qualification, sl.is_qualified, sl.target_amount, sl.currency, 
              sl.products, sl.target_closing_date, sl.customer_id, sl.is_overwrite, sl.company_id, sl.revenue_id, sl.business_id, sl.closer_id, 
              sl.supporter_id, sl.sales_type, sl.subscription_plan, sl.recurring_date, sl.created_at, u.full_name as closer_name, c.customer_name, c.closed_at, cr.closer_percentage
              from sales_commission_logs as sl inner join users as u on u.id = sl.closer_id
              inner join customers as c on c.id = sl.customer_id
              inner join sales_closer as cr on cr.sales_commission_id = sl.sales_commission_id
              where sl.sales_commission_id = '{var1}' and sl.deleted_at is null and u.deleted_at is null and c.deleted_at is null and cr.deleted_at is null ORDER BY sl.created_at desc`,
    "Q45"  : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_verified) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false) RETURNING *`, 
    "Q46"  : `select id, customer_company_name from customer_companies where company_id = '{var1}' and replace(customer_company_name, ' ', '') ILIKE '%{var2}%' and deleted_at is null`, 
    "Q47"  : `update customers set  deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null returning *`,
    "Q48"  : `insert into commission_split(id, closer_percentage,  supporter_percentage, company_id) values('{var1}','{var2}','{var3}','{var4}') returning * `,
    "Q49"  : `update commission_split set closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  where  id = '{var3}' and company_id = '{var5}' and deleted_at is null returning *`,
    "Q50"  : `select id, closer_percentage, supporter_percentage from commission_split where company_id ='{var1}' and deleted_at is null`,
    "Q51"  : `update commission_split set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}'  and deleted_at is null returning *`,
    "Q52"  : `select c.id, c.customer_company_id ,c.customer_name, c.source, c.closed_at , c.user_id, c.address,
              u.full_name as created_by from customers as c inner join users as u on u.id = c.user_id
              where c.company_id = '{var1}' and c.closed_at is null  and c.deleted_at is null and u.deleted_at is null`,
    "Q53"  : `insert into sales_commission (id, customer_id, customer_commission_split_id, is_overwrite, company_id, business_id, revenue_id, qualification, is_qualified, target_amount, target_closing_date, products, sales_type, subscription_plan, recurring_date, currency ) values ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}','{var12}', '{var13}', '{var14}', '{var15}', '{var16}') returning *`,
    "Q54"  : `select sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_id, 
              sc.revenue_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.products,sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at, 
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.closed_at from sales_commission as sc 
              inner join sales_closer as c on sc.id = c.sales_commission_id
              inner join users as u on u.id = c.closer_id
              inner join customers as cus on cus.id = sc.customer_id
              where sc.company_id = '{var1}' and sc.deleted_at is null and c.deleted_at is null and u.deleted_at is null and cus.deleted_at is null ORDER BY created_at desc`,
    "Q55"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id, business_id, revenue_id, address from customers where id = '{var1}' and deleted_at is null`,
    "Q56"  : `select id, closer_percentage, supporter_percentage from commission_split where id ='{var1}' and company_id = '{var2}' and deleted_at is null`,
    "Q57"  : `insert into sales_supporter(id, commission_split_id ,supporter_id, supporter_percentage, sales_commission_id, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') returning *`,
    "Q58"  : `insert into sales_closer(id, closer_id, closer_percentage, commission_split_id, sales_commission_id, company_id) values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') returning *`,
    "Q59"  : `select id, supporter_id, supporter_percentage from sales_supporter where sales_commission_id = '{var1}' and deleted_at is null `,
    "Q60"  : `update sales_commission set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q61"  : `update sales_supporter set deleted_at = '{var1}' where sales_commission_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q62"  : `update sales_closer set deleted_at = '{var1}' where sales_commission_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q63"  : `update sales_commission set customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_id = '{var7}', revenue_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}',products = '{var13}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}', currency = '{var17}'  where id = '{var5}' and company_id = '{var6}' and deleted_at is null returning *`,
    "Q64"  : `update sales_closer set closer_id = '{var1}', closer_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}' where sales_commission_id = '{var5}' and company_id = '{var6}' and deleted_at is null returning *`,
    "Q65"  : `update sales_supporter set deleted_at = '{var3}' where sales_commission_id = '{var1}' and company_id = '{var2}' and deleted_at is null returning *`,
    "Q66"  : `update follow_up_notes set deleted_at = '{var1}' where id = '{var2}' and deleted_at is null`,
    "Q67"  : `insert into revenue_forecast(id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, user_id, company_id, currency)
              values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}') returning * `,
    "Q68"  : `select id, timeline, revenue, currency, growth_window, growth_percentage, start_date, end_date, created_at 
              from revenue_forecast where company_id = '{var1}' and deleted_at is null`,  
    "Q69"  : `select timeline, revenue, growth_window, growth_percentage, start_date, end_date, created_at from revenue_forecast where id = '{var1}' and company_id = '{var2}' and deleted_at is null  ` ,            
    "Q70"  : `insert into business_contact(id, full_name, email_address, phone_number, customer_company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q71"  : `insert into revenue_contact(id, full_name, email_address, phone_number, customer_company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q72"  : `update business_contact set full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' where id = '{var1}' and deleted_at is null returning *`,
    "Q73"  : `update revenue_contact set full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' where id = '{var1}' and deleted_at is null returning *`,
    "Q74"  : `select id, full_name as business_contact_name, email_address as business_email, phone_number as business_phone_number
              from business_contact where customer_company_id = '{var1}' and deleted_at is null`,
    "Q75"  : `select id, full_name as revenue_contact_name, email_address as revenue_email, phone_number as revenue_phone_number
              from revenue_contact where customer_company_id = '{var1}' and deleted_at is null`,
    "Q76"  : `select id, full_name as business_contact_name, email_address as business_email, phone_number as business_phone_number
              from business_contact where id = '{var1}' and deleted_at is null`,  
    "Q77"  : `select id, full_name as revenue_contact_name, email_address as revenue_email, phone_number as revenue_phone_number
              from revenue_contact where id = '{var1}' and deleted_at is null`,
    "Q78"  : `select target_amount from sales_commission where company_id = '{var1}' and deleted_at is null and EXTRACT(MONTH FROM created_at) = '{var2}'`,
    "Q79"  : `update customers set business_id = '{var2}' where id = '{var1}' returning *`,
    "Q80"  : `update customers set revenue_id = '{var2}' where id = '{var1}' returning *`,
    "Q81"  : `select s.id, s.supporter_id, s.supporter_percentage, u.full_name from sales_supporter as s 
              inner join users as u on u.id = s.supporter_id 
              where s.id ='{var1}' and s.deleted_at is null and u.deleted_at is null `,
    "Q82"  : `select customer_id, sales_type, subscription_plan, recurring_date from sales_commission where deleted_at is null`,
    "Q83"  : `insert into configurations(id, currency, phone_format, date_format,user_id, company_id ) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') returning *`,
    "Q84"  : `select id,currency,phone_format,date_format,user_id,company_id,created_at
              from configurations where company_id = '{var1}' and deleted_at is null `,
    "Q85"  : `update configurations set deleted_at = '{var1}' where company_id = '{var2}' and deleted_at is null returning *`,
    "Q86"  : `select cr.closer_id,cr.closer_percentage, u.full_name from sales_closer as cr 
              inner join users as u on u.id = cr.closer_id where sales_commission_id = '{var1}'
              and cr.deleted_at is null and u.deleted_at is null`,
    "Q87"  : `select sc.id as sales_commission_id, sc.target_amount, sc.target_closing_date,sc.products, c.id as customer_id,
              c.closed_at, c.customer_name  from sales_commission as sc inner join customers as c
              on sc.customer_id = c.id where sc.company_id = '{var1}' and sc.deleted_at is null 
              and c.deleted_at is null Order by c.closed_at asc`,
    "Q88"  : `SELECT DATE_TRUNC('{var2}',c.closed_at) AS  date, sum(sc.target_amount::decimal) as target_amount
              FROM sales_commission as sc inner join customers as c on sc.customer_id = c.id
              where sc.company_id = '{var1}' and c.deleted_at is null and sc.deleted_at is null 
              and c.closed_at is not null GROUP BY DATE_TRUNC('{var2}',c.closed_at) ORDER BY date`,
    "Q89"  : `select cc.id as	customer_company_id, cc.customer_company_name, c.id as customer_id, c.closed_at, sc.id as sales_commission_id,
              sc.target_amount, sc.target_closing_date from customer_companies as cc 
              inner join customers as c on c.customer_company_id = cc.id
              inner join sales_commission as sc on sc.customer_id = c.id 
              where cc.company_id = '{var1}' and cc.deleted_at is null and c.deleted_at is null	and	sc.deleted_at is null`,
    "Q90"  : `select id, target_amount, target_closing_date, customer_id from sales_commission where company_id = '{var1}' and deleted_at is null`,
    "Q91"  : `insert into contact_us(id, full_name, email, subject, messages, address) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') returning *`,
    "Q92"  : `insert into products(id, product_name,product_image,description,available_quantity,price,tax,company_id, currency)values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}')`,
    "Q93"  : `update products set product_name = '{var2}',product_image = '{var3}', description = '{var4}',available_quantity = '{var5}', price = '{var6}', tax = '{var7}', updated_at = '{var8}', currency = '{var10}' where id = '{var1}' and company_id = '{var9}' and deleted_at is null returning * `,
    "Q94"  : `select id, product_name, product_image, description, available_quantity, price, tax, currency, company_id, created_at, updated_at from products where company_id = '{var1}' and deleted_at is null ORDER BY created_at desc`,
    "Q95"  : `update products set deleted_at = '{var2}' where id = '{var1}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q96"  : `select id, product_name, product_image, description, available_quantity, price, tax, company_id, created_at, updated_at from products where id = '{var1}' and company_id = '{var2}' and deleted_at is null`,
    "Q97"  : `insert into products(id, company_id, product_name, product_image, description, available_quantity, price, tax, currency) 
              values ('{var1}','{var2}',$1,$2,$3,$4,$5,$6,$7)`,
    "Q98"  : `select id, name, email, encrypted_password from super_admin where email = '{var1}'`,
    "Q99"  : `select id, company_name, company_logo, company_address, is_imap_enable, created_at from companies where deleted_at is null`,
    "Q100" : `update super_admin set encrypted_password = '{var2}' where email = '{var1}'`,
    "Q101" : `select  sc.target_amount,  c.closed_at ,com.id as company_id, com.company_name from sales_commission as sc 
              inner join customers as c on sc.customer_id = c.id 
              inner join companies as com on sc.company_id = com.id 
              where sc.company_id = '{var1}' and sc.deleted_at is null and c.deleted_at is null Order by c.closed_at asc`,
    "Q102" : `insert into payment_plans(id, product_id, name, description, active_status,
              admin_price_id, admin_amount,user_price_id, user_amount, interval, currency) 
              values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', 
              '{var9}','{var10}','{var11}') returning *`,
    "Q103" : `select id,  name, description, active_status,
              interval, admin_amount,user_amount, currency from payment_plans where active_status = 'true' and  deleted_at is null`,
    "Q104" : `select id, product_id, name, description, active_status,
              admin_price_id,user_price_id, interval, admin_amount,user_amount, currency from payment_plans where id = '{var1}' and deleted_at is null ORDER BY name asc`,  
    "Q105" : `update payment_plans set name = '{var1}', description = '{var2}', 
               updated_at = '{var3}' where id = '{var4}' and deleted_at is null returning *` ,
    "Q106" : `update payment_plans set active_status = '{var1}', updated_at = '{var2}' where id = '{var3}' and deleted_at is null returning *`,
    "Q107" : `insert into transactions(id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt) values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}','{var14}') returning *` ,
    "Q108" : `select id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade, is_canceled, payment_receipt  from transactions where company_id = '{var1}' and deleted_at is null`,
    "Q109" : `select id, name, description, active_status, interval, admin_amount,user_amount, currency from payment_plans where deleted_at is null`,
    "Q110" : `select id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_admin, expiry_date from users where deleted_at is null`,
    "Q111" : `insert into superadmin_config(id, trial_days) values('{var1}', '{var2}') returning *`,
    "Q112" : `select id, trial_days, created_at from superadmin_config where deleted_at is null ORDER BY created_at desc ` ,
    "Q113" : `update users set expiry_date = '{var1}', updated_at = '{var3}' where id = '{var2}' and deleted_at is null returning *`,
    "Q114" : `select id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id,total_amount, immediate_upgrade from transactions where deleted_at is null`,
    "Q115" : `select id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade  from transactions where plan_id = '{var1}' and deleted_at is null`,  
    "Q116" : `update transactions set stripe_customer_id = '{var1}', stripe_subscription_id = '{var2}', 
              stripe_card_id = '{var3}', stripe_token_id = '{var4}', stripe_charge_id = '{var5}', 
              expiry_date = '{var6}', updated_at = '{var7}', total_amount = '{var9}', immediate_upgrade = '{var10}', payment_receipt = '{var11}', user_count = '{var12}', plan_id = '{var13}' where id = '{var8}' and deleted_at is null returning *`,
    "Q117" : `update transactions set stripe_charge_id = '{var1}', payment_receipt = '{var4}', immediate_upgrade = '', updated_at = '{var2}' where id = '{var3}' and deleted_at is null returning *`,
    "Q118" : `update transactions set is_canceled = '{var1}', updated_at = '{var2}' where id = '{var3}' and deleted_at is null returning *`,
    
    "Q119" : `select id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at from chat where is_group_chat = 'false' and ((user_a = '{var1}' and user_b = '{var2}') or (user_a = '{var2}' and user_b = '{var1}')) and deleted_at is null`,
    "Q120" : `insert into message(id, chat_id, sender, content) values('{var1}','{var2}','{var3}','{var4}') returning *`,
    "Q121" : `update chat set last_message = '{var1}', updated_at = '{var3}' where id = '{var2}'  and deleted_at is null returning *`,
    "Q122" : `insert into chat_room_members (id, room_id, user_id, group_name) values('{var1}','{var2}','{var3}','{var4}') returning *` ,
    "Q123" : `select id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at from chat where (user_a = '{var1}' or user_b = '{var1}') and company_id = '{var2}' and is_group_chat = '{var3}' and deleted_at is null`,
    "Q124" : `select id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at from chat where id = '{var1}' and deleted_at is null `,
    "Q125" : `select u.id, u.full_name, u.avatar from chat_room_members as cm 
              inner join users as u on u.id = cm.user_id
              where room_id = '{var1}' and cm.deleted_at is null and u.deleted_at is null`,
    "Q126" : `select sc.id,c.closer_id,sc.customer_id, u.full_name, cc.user_id as creator_id from sales_commission as sc 
              inner join sales_closer as c on sc.id = c.sales_commission_id 
              inner join users as u on c.closer_id = u.id 
              inner join customers as cc on cc.id = sc.customer_id where sc.id = '{var1}'
              and sc.deleted_at is null and c.deleted_at is null and u.deleted_at is null
              and cc.deleted_at is null`,
    "Q127" : `select s.supporter_id, u.full_name from sales_supporter as s
              inner join users as u on s.supporter_id = u.id
              where s.sales_commission_id = '{var1}' 
              and s.deleted_at is null and u.deleted_at is null`,
    "Q128" : `insert into chat(id, chat_name, is_group_chat, user_a, user_b, group_admin, sales_id, company_id) values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}','{var6}','{var7}','{var8}') returning *`,
    "Q129" : `select id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin from chat where id = '{var1}' and company_id = '{var2}' and is_group_chat = '{var3}' and deleted_at is null`,
    "Q130" : `select m.id, m.sender, m.content, m.chat_id, m.read_by, m.created_at, u.full_name,
              u.avatar, u.id as sender_id from message as m inner join users as u on m.sender = u.id 
              where m.id = '{var1}' and m.deleted_at is null`,
    "Q131" : `select m.id as messageId, m.content, m.sender as senderId, m.chat_id, m.read_by, m.created_at,
              u.full_name, u.avatar, c.id, c.chat_name, c.is_group_chat,
              c.group_admin, c.user_a, c.user_b, c.created_at from message as m 
              inner join users as u on m.sender = u.id
              inner join chat as c on m.chat_id = c.id  where chat_id = '{var1}' and m.deleted_at is null ORDER BY m.created_at DESC LIMIT 1`,
    "Q132" :`select m.id as messageId,m.content,m.sender as senderId, m.created_at,
             u.full_name, u.avatar from message as m 
             inner join users as u on m.sender = u.id
            where chat_id = '{var1}' and m.deleted_at is null ORDER BY m.created_at ASC `,
    "Q133" : `select id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at from chat where sales_id = '{var1}' and company_id = '{var2}' and deleted_at is null`, 
    "Q134" :`select room_id, user_id, group_name from chat_room_members where user_id = '{var1}' and deleted_at is null` ,

    "Q135" : `select id, message_id, to_mail, from_mail,from_name, mail_date, subject, mail_html, mail_text, mail_text_as_html, attechments, company_id, read_status, created_at from emails where company_id = '{var1}' and user_id = '{var2}' and deleted_at is null order by mail_date desc`,
    "Q136" : `select b.email_address as business_email, r.email_address as revenue_email
              from business_contact as b 
              inner join customer_companies as c on c.id = b.customer_company_id
              inner join revenue_contact as r on b.customer_company_id = r.customer_company_id
              where '{var1}' IN (b.email_address, r.email_address) and c.company_id = '{var2}' and
              b.deleted_at is null and c.deleted_at is null and r.deleted_at is null`,
    "Q137" : `insert into emails (id, message_id, to_mail, from_mail,from_name, mail_date, subject, 
              mail_html, mail_text, mail_text_as_html, company_id, attechments, user_id) values('{var1}', '{var2}', 
              '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}','{var11}', '{var12}', '{var13}') returning *` ,
    "Q138" : `select id, email, app_password, imap_host, imap_port, smtp_host, smtp_port, user_id from imap_credentials where user_id = '{var1}' and company_id = '{var2}'and deleted_at is null`,
    "Q139" : `update emails set read_status = '{var2}' where message_id = '{var1}' and deleted_at is null returning *`,
    "Q140" : `insert into sent_email(id, from_email, to_email, cc, subject, message, company_id, sales_id, attechments, user_id) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}', '{var8}','{var9}', '{var10}') returning *`,    
    "Q141" : `select id, to_email, from_email, cc, subject, message,attechments, company_id,sales_id, created_at from sent_email where company_id = '{var1}' and sales_id = '{var2}' and user_id = '{var3}' and deleted_at is null order by created_at desc`, 
    "Q142" : `update imap_credentials set deleted_at = '{var1}' where user_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning *`,
    "Q143" : `insert into imap_credentials(id, email, app_password, user_id, imap_host, imap_port, smtp_host, smtp_port, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}') returning *`,
    "Q144" : `select id,full_name,avatar from users where id IN ('{var1}','{var2}') and deleted_at is null`,
    "Q145" : `select u.id, u.full_name, u.company_id, u.email_address, u.encrypted_password, u.mobile_number, u.role_id, 
              u.avatar, u.expiry_date, u.is_verified, u.is_admin, u.is_locked, c.company_name, c.company_address, c.company_logo, c.is_imap_enable,
              r.role_name, r.reporter, r.module_ids, con.id as config_id, con.currency, con.phone_format, con.date_format
              from users as u inner join companies as c on c.id = u.company_id
              inner join roles as r on r.id = u.role_id 
              inner join configurations as con on con.company_id = u.company_id
              where email_address = '{var1}' and u.deleted_at is null 
              and c.deleted_at is null and r.deleted_at is null and con.deleted_at is null`,
    "Q146" : `update companies set is_imap_enable = '{var1}', updated_at = '{var2}' where id = '{var3}' returning *`
   
 }



function dbScript(template, variables) {
    if (variables != null && Object.keys(variables).length > 0) {
        return template.replace(new RegExp("\{([^\{]+)\}", "g"),  (_unused, varName) => {
            return variables[varName];
        });
    }
    return template
}

module.exports = { db_sql, dbScript };