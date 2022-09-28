
const db_sql = {

    "Q1"   : `select id, company_name, company_address from companies where company_name = '{var1}'`,
    "Q2"   : `insert into companies(id,company_name,company_logo,company_address) 
              values('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q3"   : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,expiry_date,is_verified,is_admin) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}',false,true) RETURNING *`,          
    "Q4"   : `select id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar,expiry_date, is_verified, is_admin, is_locked from users where email_address = '{var1}' and deleted_at is null` ,
    "Q5"   : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,expiry_date from users where email_address = '{var1}' and deleted_at is null ` , 
    "Q6"   : `update users set encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' where email_address = '{var1}' and company_id = '{var4}' RETURNING *`, 
    "Q7"   : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where deleted_at is null` ,
    "Q8"   : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where id = '{var1}' and deleted_at is null`,  
    "Q9"   : `update users set is_verified = true ,updated_at = '{var2}' where email_address = '{var1}' RETURNING *`, 
    "Q10"  : `select id, email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,expiry_date from users where id = '{var1}' and deleted_at is null ` ,
    "Q11"  : `select id, company_name, company_address, company_logo from companies where id = '{var1}' and deleted_at is null`,
    "Q12"  : `update users set full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' where email_address='{var8}' and company_id = '{var9}' and deleted_at is null RETURNING * `, 
    "Q13"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q14"  : `select id, role_name, reporter, module_ids from roles where id = '{var1}' and deleted_at is null` ,
    "Q15"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','{var2}','{var3}','{var4}') RETURNING *`, 
    "Q16"  : `select id, role_name, reporter , module_ids from roles where company_id = '{var1}' and deleted_at is null ` ,
    "Q17"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at from users where company_id = '{var1}' and deleted_at is null`,
    "Q18"  : `select id, role_name ,  reporter from roles where reporter = '{var1}' and deleted_at is null`,
    "Q19"  : `select id, min_amount, max_amount, percentage, is_max from slabs where company_id ='{var1}' and deleted_at is null`,
    "Q20"  : `insert into slabs(id,min_amount, max_amount, percentage, is_max, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') returning * `,
    "Q21"  : `update slabs set deleted_at = '{var2}' where company_id = '{var1}' and deleted_at is null returning *`,
    "Q22"  : `insert into permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') returning *`,
    "Q23"  : `insert into permissions(id, role_id, module_id,user_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view ) values('{var1}','{var2}','{var3}','{var4}',true, true,true,true) returning *`,
    "Q24"  : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where role_id = '{var1}' and company_id = '{var2}' and deleted_at is null `,
    "Q25"  : `update users set email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}' where id = '{var6}' and company_id = '{var9}' and deleted_at is null RETURNING * `,
    "Q26"  : `update users set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null RETURNING * `,
    "Q27"  : `select id,email_address, full_name, company_id, avatar,mobile_number,address,role_id from users where id = '{var1}' and deleted_at is null`,
    "Q28"  : `update roles set role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' where id = '{var3}' and company_id = '{var5}' and deleted_at is null returning *`,
    "Q29"  : `update permissions set permission_to_create= '{var1}', permission_to_view = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}' where role_id = '{var5}' and module_id = '{var7}' and deleted_at is null `,
    "Q30"  : `update roles set deleted_at = '{var2}' where id = '{var1}' and deleted_at is null returning *`,
    "Q31"  : `update permissions set deleted_at = '{var2}' where role_id = '{var1}' and deleted_at is null returning * `,
    "Q32"  : `update slabs set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null`,
    "Q33"  : `update users set is_locked = '{var1}', updated_at = '{var3}' where company_id = '{var2}' and deleted_at is null  RETURNING * `,
    "Q34"  : `select r.id, r.role_name, u.id as user_id , u.full_name
              from roles as r inner join users as u on r.id = u.role_id 
              where r.company_id = '{var1}' and r.deleted_at is null and u.deleted_at is null` ,
    "Q35"  : `insert into follow_up_notes (id, sales_commission_id, company_id, user_id, notes) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q36"  : `select id, notes, created_at from follow_up_notes where sales_commission_id = '{var1}' and deleted_at is null`,
    "Q37"  : `update permissions set user_id = '{var2}' where role_id = '{var1}' and deleted_at is null returning *`,
    "Q38"  : `update roles set module_ids = '{var1}' , updated_at = '{var2}' where id = '{var3}' returning * `,
    "Q39"  : `select permission_to_view, permission_to_create, permission_to_update, permission_to_delete from permissions where role_id = '{var1}' and module_id = '{var2}' and deleted_at is null `,
    "Q40"  : `insert into customers(id, user_id,customer_company_id,customer_name, source, company_id, business_id, revenue_id, address) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}') returning *`,
    "Q41"  : `insert into customer_companies(id, customer_company_name, company_id) values('{var1}','{var2}','{var3}') returning *`,
    "Q42"  : `select id, customer_company_name from customer_companies where id = '{var1}' and deleted_at is null`,
    "Q43"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id,business_id,revenue_id, created_at, address from customers where company_id = '{var1}' and deleted_at is null ORDER BY created_at asc`,
    "Q44"  : `update customers set closed_at = '{var1}', updated_at = '{var2}' where id = '{var3}' returning *`,
    "Q45"  : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where module_name = '{var1}' and deleted_at is null` ,
    "Q46"  : `update customers set customer_name = '{var1}', source = '{var2}', updated_at = '{var3}', business_id = '{var4}', revenue_id = '{var5}', address = '{var7}' where id = '{var6}' and company_id = '{var8}' and deleted_at is null returning *`,
    "Q47"  : `insert into sales_commission_logs(id,sales_commission_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_id, business_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}' ) returning *`,
    "Q48"  : `select id,sales_commission_id, customer_commission_split_id,  qualification, is_qualified, target_amount, products, target_closing_date,customer_id, is_overwrite, company_id, revenue_id, business_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date, created_at from sales_commission_logs where sales_commission_id = '{var1}' and deleted_at is null ORDER BY created_at desc`,
    "Q49"  : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_verified) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false) RETURNING *`, 
    "Q50"  : `update roles set deleted_at = '{var2}' where reporter = '{var1}' and deleted_at is null returning *`,  
    "Q51"  : `select id, customer_company_name from customer_companies where company_id = '{var1}' and replace(customer_company_name, ' ', '') ILIKE '%{var2}%' and deleted_at is null`, 
    "Q52"  : `update customers set  deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null returning *`,
    "Q53"  : `insert into commission_split(id, closer_percentage,  supporter_percentage, company_id) values('{var1}','{var2}','{var3}','{var4}') returning * `,
    "Q54"  : `update commission_split set closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  where  id = '{var3}' and company_id = '{var5}' and deleted_at is null returning *`,
    "Q55"  : `select id, closer_percentage, supporter_percentage from commission_split where company_id ='{var1}' and deleted_at is null`,
    "Q56"  : `update commission_split set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}'  and deleted_at is null returning *`,
    "Q57"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id,address from customers where company_id = '{var1}' and closed_at is null  and deleted_at is null`,
    "Q58"  : `insert into sales_commission (id, customer_id, customer_commission_split_id, is_overwrite, company_id, business_id, revenue_id, qualification, is_qualified, target_amount, target_closing_date, products, sales_type, subscription_plan, recurring_date ) values ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}','{var12}', '{var13}', '{var14}', '{var15}') returning *`,
    "Q59"  : `select sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_id, sc.revenue_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.target_closing_date, sc.products,sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at, c.closer_id, c.closer_percentage from sales_commission as sc 
              inner join sales_closer as c on sc.id = c.sales_commission_id
              where sc.company_id = '{var1}' and sc.deleted_at is null and c.deleted_at is null`,
    "Q60"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id, business_id, revenue_id, address from customers where id = '{var1}' and deleted_at is null`,
    "Q61"  : `select id, closer_percentage, supporter_percentage from commission_split where id ='{var1}' and company_id = '{var2}' and deleted_at is null`,
    "Q62"  : `insert into sales_supporter(id, commission_split_id ,supporter_id, supporter_percentage, sales_commission_id, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') returning *`,
    "Q63"  : `insert into sales_closer(id, closer_id, closer_percentage, commission_split_id, sales_commission_id, company_id) values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') returning *`,
    "Q64"  : `select id, supporter_id, supporter_percentage from sales_supporter where sales_commission_id = '{var1}' and deleted_at is null `,
    "Q65"  : `update sales_commission set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q66"  : `update sales_supporter set deleted_at = '{var1}' where sales_commission_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q67"  : `update sales_closer set deleted_at = '{var1}' where sales_commission_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q68"  : `update sales_commission set customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_id = '{var7}', revenue_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}',products = '{var13}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}'  where id = '{var5}' and company_id = '{var6}' and deleted_at is null returning *`,
    "Q69"  : `update sales_closer set closer_id = '{var1}', closer_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}' where sales_commission_id = '{var5}' and company_id = '{var6}' and deleted_at is null returning *`,
    "Q70"  : `update sales_supporter set deleted_at = '{var3}' where sales_commission_id = '{var1}' and company_id = '{var2}' and deleted_at is null returning *`,
    "Q71"  : `update follow_up_notes set deleted_at = '{var1}' where id = '{var2}' and deleted_at is null`,
    "Q72"  : `insert into revenue_forecast(id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, user_id, company_id)
              values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}') returning * `,
    "Q73"  : `select id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, created_at 
              from revenue_forecast where company_id = '{var1}' and deleted_at is null`,   
    "Q74"  : `update revenue_forecast set timeline = '{var2}', revenue = '{var3}', growth_window = '{var4}', growth_percentage = '{var5}',
              start_date = '{var6}', end_date = '{var7}', updated_at = '{var8}' where id = '{var1}' and company_id = '{var9}' and deleted_at is null returning *` ,   
    "Q75"  : `select timeline, revenue, growth_window, growth_percentage, start_date, end_date, created_at from revenue_forecast where id = '{var1}' and company_id = '{var2}' and deleted_at is null  ` ,            
    "Q76"  : `insert into business_contact(id, full_name, email_address, phone_number, customer_company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q77"  : `insert into revenue_contact(id, full_name, email_address, phone_number, customer_company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q78"  : `update business_contact set full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' where id = '{var1}' and deleted_at is null returning *`,
    "Q79"  : `update revenue_contact set full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' where id = '{var1}' and deleted_at is null returning *`,
    "Q80"  : `select id, full_name as business_contact_name, email_address as business_email, phone_number as business_phone_number
              from business_contact where customer_company_id = '{var1}' and deleted_at is null`,
    "Q81"  : `select id, full_name as revenue_contact_name, email_address as revenue_email, phone_number as revenue_phone_number
              from revenue_contact where customer_company_id = '{var1}' and deleted_at is null`,
    "Q82"  : `select id, full_name as business_contact_name, email_address as business_email, phone_number as business_phone_number
              from business_contact where id = '{var1}' and deleted_at is null`,  
    "Q83"  : `select id, full_name as revenue_contact_name, email_address as revenue_email, phone_number as revenue_phone_number
              from revenue_contact where id = '{var1}' and deleted_at is null`,
    "Q84"  : `select target_amount from sales_commission where company_id = '{var1}' and deleted_at is null and EXTRACT(MONTH FROM created_at) = '{var2}'`,
    "Q85"  : `update customers set business_id = '{var2}' where id = '{var1}' returning *`,
    "Q86"  : `update customers set revenue_id = '{var2}' where id = '{var1}' returning *`,
    "Q87"  : `select id, supporter_id, supporter_percentage from sales_supporter where id = '{var1}'  `,
    "Q88"  : `select customer_id, sales_type, subscription_plan, recurring_date from sales_commission where deleted_at is null`,
    "Q89"  : `insert into configurations(id, currency, phone_format, date_format,user_id, graph_type,  company_id ) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') returning *`,
    "Q90"  : `select id, currency, phone_format, date_format,graph_type, user_id, company_id, created_at from configurations where company_id = '{var1}' and deleted_at is null `,
    "Q91"  : `update configurations set deleted_at = '{var1}' where company_id = '{var2}' and deleted_at is null returning *`,
    "Q92"  : `select cr.closer_id,cr.closer_percentage, u.full_name from sales_closer as cr 
              inner join users as u on u.id = cr.closer_id where sales_commission_id = '{var1}'
              and cr.deleted_at is null and u.deleted_at is null`,
    "Q93"  : `select sc.id as sales_commission_id, sc.target_amount, sc.target_closing_date,sc.products, c.id as customer_id,
              c.closed_at, c.customer_name  from sales_commission as sc inner join customers as c
              on sc.customer_id = c.id where sc.company_id = '{var1}' and sc.deleted_at is null 
              and c.deleted_at is null Order by c.closed_at asc`,
    "Q94"  : `SELECT DATE_TRUNC('{var2}',created_at) AS  date,
              sum(target_amount::decimal) as target_amount
              FROM sales_commission where company_id = '{var1}' and deleted_at is null
              GROUP BY DATE_TRUNC('{var2}',created_at) ORDER BY date;`,
    "Q95"  : `select id, customer_company_name from customer_companies where deleted_at is null  and company_id = '{var1}'`,
    "Q96"  : `select id, closed_at from customers where customer_company_id = '{var1}' and deleted_at is null and closed_at is not null`,
    "Q97"  : `select id, target_amount, target_closing_date from sales_commission where customer_id = '{var1}' and deleted_at is null`,
    "Q98"  : `select id, target_amount, target_closing_date, customer_id from sales_commission where company_id = '{var1}' and deleted_at is null`,
    "Q99"  : `insert into contact_us(id, full_name, email, subject, messages, address) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') returning *`,
    "Q100" : `insert into products(id, product_name,product_image,description,available_quantity,price,tax,company_id)values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}')`,
    "Q101" : `update products set product_name = '{var2}',product_image = '{var3}', description = '{var4}',available_quantity = '{var5}', price = '{var6}', tax = '{var7}', updated_at = '{var8}' where id = '{var1}' and company_id = '{var9}' and deleted_at is null returning * `,
    "Q102" : `select id, product_name, product_image, description, available_quantity, price, tax, company_id, created_at, updated_at from products where company_id = '{var1}' and deleted_at is null`,
    "Q103" : `update products set deleted_at = '{var2}' where id = '{var1}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q104" : `select id, product_name, product_image, description, available_quantity, price, tax, company_id, created_at, updated_at from products where id = '{var1}' and company_id = '{var2}' and deleted_at is null`,
    "Q105" : `insert into products(id, company_id, product_name, product_image, description, available_quantity, price, tax) 
              values ('{var1}','{var2}',$1,$2,$3,$4,$5,$6)`,
    "Q106" : `select id, name, email, encrypted_password from super_admin where email = '{var1}'`,
    "Q107" : `select id, company_name, company_logo, company_address, created_at from companies where deleted_at is null`,
    "Q108" : `update super_admin set encrypted_password = '{var2}' where email = '{var1}'`,
    "Q109" : `select  sc.target_amount,  c.closed_at ,com.id as company_id, com.company_name from sales_commission as sc 
              inner join customers as c on sc.customer_id = c.id 
              inner join companies as com on sc.company_id = com.id 
              where sc.company_id = '{var1}' and sc.deleted_at is null and c.deleted_at is null Order by c.closed_at asc`,
    "Q110" : `insert into payment_plans(id, product_id, name, description, active_status,
              admin_price_id, admin_amount,user_price_id, user_amount, interval, currency) 
              values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', 
              '{var9}','{var10}','{var11}') returning *`,
    "Q111" : `select id,  name, description, active_status,
              interval, admin_amount,user_amount, currency from payment_plans where active_status = 'true' and  deleted_at is null`,
    "Q112" : `select id, product_id, name, description, active_status,
              admin_price_id,user_price_id, interval, admin_amount,user_amount currency from payment_plans where id = '{var1}' and deleted_at is null ORDER BY name asc`,  
    "Q113" : `update payment_plans set name = '{var1}', description = '{var2}', 
               updated_at = '{var3}' where id = '{var4}' and deleted_at is null returning *` ,
    "Q114" : `update payment_plans set active_status = '{var1}', updated_at = '{var2}' where id = '{var3}' and deleted_at is null returning *`,
    "Q115" : `insert into transactions(id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status) values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}') returning *` ,
    "Q116" : `select id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id  from transactions where company_id = '{var1}' and deleted_at is null`,
    "Q117" : `update transactions set payment_status = 'paid' where session_id = '{var1}' and deleted_at is null returning *`,
    "Q118" : `select id, name, description, active_status, interval, admin_amount,user_amount, currency from payment_plans where deleted_at is null`,
    "Q119" : `select id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_admin, expiry_date from users where deleted_at is null`,
    "Q120" : `insert into superadmin_config(id, trial_days) values('{var1}', '{var2}') returning *`,
    "Q121" : `select id, trial_days, created_at from superadmin_config where deleted_at is null ORDER BY created_at desc ` ,
    "Q122" : `update users set expiry_date = '{var1}', updated_at = '{var3}' where id = '{var2}' and deleted_at is null returning *`,
    "Q123" : `select id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id from transactions where deleted_at is null`,
    "Q124" : `select id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id  from transactions where plan_id = '{var1}' and deleted_at is null`                                   

 };



function dbScript(template, variables) {
    if (variables != null && Object.keys(variables).length > 0) {
        return template.replace(new RegExp("\{([^\{]+)\}", "g"),  (_unused, varName) => {
            return variables[varName];
        });
    }
    return template
}

module.exports = { db_sql, dbScript };