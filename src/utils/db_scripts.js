
const db_sql = {

    "Q1"   : `select id, company_name, company_address from companies where company_name = '{var1}'`,
    "Q2"   : `insert into companies(id,company_name,company_logo,company_address) 
              values('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q3"   : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,is_verified,is_admin) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}',false,true) RETURNING *`,          
    "Q4"   : `select id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_admin from users where email_address = '{var1}' and deleted_at is null` ,
    "Q6"   : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where email_address = '{var1}' and deleted_at is null ` , 
    "Q7"   : `update users set encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' where email_address = '{var1}' and company_id = '{var4}' RETURNING *`, 
    "Q8"   : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where deleted_at is null` ,
    "Q9"   : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where id = '{var1}' and deleted_at is null`,  
    "Q10"  : `update users set is_verified = true ,updated_at = '{var2}' where email_address = '{var1}' RETURNING *`, 
    "Q11"  : `SELECT id, name, email FROM super_admin WHERE email='{var1}' and deleted_at is null`,
    "Q12"  : `select id, email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where id = '{var1}' and deleted_at is null ` ,
    "Q13"  : `select id, company_name, company_logo, company_address from companies where deleted_at is null`,
    "Q14"  : `select id, company_name, company_address, company_logo from companies where id = '{var1}' and deleted_at is null`,
    "Q15"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where deleted_at is null`,
    "Q16"  : `select id, company_name , company_logo, company_address from companies where id = '{var1}' and deleted_at is null`,
    "Q17"  : `update users set full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' where email_address='{var8}' and company_id = '{var9}' and deleted_at is null RETURNING * `, 
    "Q18"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q19"  : `select id, role_name, reporter, module_ids from roles where id = '{var1}' and deleted_at is null` ,
    "Q20"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','{var2}','{var3}','{var4}') RETURNING *`, 
    "Q21"  : `select id, role_name, reporter , module_ids from roles where company_id = '{var1}' and deleted_at is null ` ,
    "Q23"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin, created_at from users where company_id = '{var1}' and deleted_at is null`,
    "Q24"  : `select id, role_name ,  reporter from roles where reporter = '{var1}' and deleted_at is null`,
    "Q25"  : `select id, min_amount, max_amount, percentage, is_max from slabs where company_id ='{var1}' and deleted_at is null`,
    "Q26"  : `update users set role_id = null, updated_at = '{var2}' where role_id = '{var1}' and deleted_at is null returning *`,
    "Q28"  : `insert into slabs(id,min_amount, max_amount, percentage, is_max, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') returning * `,
    "Q31"  : `update slabs set deleted_at = '{var2}' where company_id = '{var1}' and deleted_at is null returning *`,
    "Q32"  : `insert into permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') returning *`,
    "Q33"  : `insert into permissions(id, role_id, module_id,user_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view ) values('{var1}','{var2}','{var3}','{var4}',true, true,true,true) returning *`,
    "Q34"  : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where role_id = '{var1}' and company_id = '{var2}' and deleted_at is null `,
    "Q35"  : `select permission_to_view, permission_to_create, permission_to_update, permission_to_delete from permissions where user_id = '{var1}' `,
    "Q36"  : `insert into sales_entries(id, user_id, client_name, client_email, client_contact, amount, description) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') returning *`,
    "Q37"  : `select id, amount, description, client_name, client_email, client_contact where user_id = '{var1}' and deleted_at is null`,
    "Q38"  : `select id, amount, description, client_name, client_email, client_contact where company_id = '{var1}' and deleted_at is null`,
    "Q39"  : `update users set email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}' where id = '{var6}' and company_id = '{var9}' and deleted_at is null RETURNING * `,
    "Q40"  : `update users set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null RETURNING * `,
    "Q41"  : `select id,email_address, full_name, company_id, avatar,mobile_number,address,role_id from users where id = '{var1}' and deleted_at is null`,
    "Q42"  : `update roles set role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' where id = '{var3}' and company_id = '{var5}' and deleted_at is null returning *`,
    "Q43"  : `update permissions set permission_to_create= '{var1}', permission_to_view = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}' where role_id = '{var5}' and module_id = '{var7}' and deleted_at is null `,
    "Q44"  : `update roles set deleted_at = '{var2}' where id = '{var1}' and deleted_at is null returning *`,
    "Q45"  : `update permissions set deleted_at = '{var2}' where role_id = '{var1}' and deleted_at is null returning * `,
    "Q47"  : `update slabs set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null`,
    "Q52"  : `update users set is_locked = '{var1}', updated_at = '{var3}' where id = '{var2}' and deleted_at is null and is_locked = false RETURNING * `,
    "Q54"  : `update customers set supporter = '{var1}', updated_at = '{var3}' where id = '{var2}' and deleted_at is null returning *`,
    "Q56"  : `select r.id, r.role_name, u.id as user_id , u.full_name
              from roles as r inner join users as u on r.id = u.role_id 
              where r.company_id = '{var1}' and r.deleted_at is null and u.deleted_at is null` ,
    "Q61"  : `insert into follow_up_notes (id, sales_commission_id, company_id, user_id, notes) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q62"  : `select id, notes, created_at from follow_up_notes where sales_commission_id = '{var1}' and deleted_at is null`,
    "Q63"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id, address from customers where company_id ='{var1}' and deleted_at is null and (created_at BETWEEN '{var2}' AND '{var3}') `,
    "Q64"  : `update permissions set user_id = '{var2}' where role_id = '{var1}' and deleted_at is null returning *`,
    "Q65"  : `update roles set module_ids = '{var1}' , updated_at = '{var2}' where id = '{var3}' returning * `,
    "Q66"  : `select permission_to_view, permission_to_create, permission_to_update, permission_to_delete from permissions where role_id = '{var1}' and module_id = '{var2}' and deleted_at is null `,
    "Q67"  : `insert into customers(id, user_id,customer_company_id,customer_name, source, company_id, business_id, revenue_id, address) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}') returning *`,
    "Q68"  : `insert into customer_companies(id, customer_company_name, company_id) values('{var1}','{var2}','{var3}') returning *`,
    "Q69"  : `select id, customer_company_name from customer_companies where id = '{var1}' and deleted_at is null`,
    "Q70"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id,business_id,revenue_id, created_at, address from customers where company_id = '{var1}' and deleted_at is null ORDER BY created_at asc`,
    "Q71"  : `update customers set closed_at = '{var1}', updated_at = '{var2}' where id = '{var3}' returning *`,
    "Q72"  : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where module_name = '{var1}' and deleted_at is null` ,
    "Q73"  : `update customers set customer_name = '{var1}', source = '{var2}', updated_at = '{var3}', business_id = '{var4}', revenue_id = '{var5}', address = '{var7}' where id = '{var6}' and company_id = '{var8}' and deleted_at is null returning *`,
    "Q74"  : `insert into sales_commission_logs(id,sales_commission_id, customer_commission_split_id, qualification, is_qualified, target_amount,product_match, target_closing_date,customer_id, is_overwrite, company_id, revenue_id, business_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}' ) returning *`,
    "Q75"  : `select id,sales_commission_id, customer_commission_split_id,  qualification, is_qualified, target_amount, product_match, target_closing_date,customer_id, is_overwrite, company_id, revenue_id, business_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date, created_at from sales_commission_logs where sales_commission_id = '{var1}' and deleted_at is null ORDER BY created_at desc`,
    "Q76"  : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_verified) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false) RETURNING *`, 
    "Q77"  : `update roles set deleted_at = '{var2}' where reporter = '{var1}' and deleted_at is null returning *`,  
    "Q79"  : `select id, customer_company_name from customer_companies where company_id = '{var1}' and replace(customer_company_name, ' ', '') ILIKE '%{var2}%' and deleted_at is null`, 
    "Q80"  : `update customers set  deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null returning *`,
    "Q81"  : `insert into commission_split(id, closer_percentage,  supporter_percentage, company_id) values('{var1}','{var2}','{var3}','{var4}') returning * `,
    "Q82"  : `update commission_split set closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  where  id = '{var3}' and company_id = '{var5}' and deleted_at is null returning *`,
    "Q83"  : `select id, closer_percentage, supporter_percentage from commission_split where company_id ='{var1}' and deleted_at is null`,
    "Q84"  : `update commission_split set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}'  and deleted_at is null returning *`,
    "Q85"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id,address from customers where company_id = '{var1}' and closed_at is null  and deleted_at is null`,
    "Q86"  : `insert into sales_commission (id, customer_id, customer_commission_split_id, is_overwrite, company_id, business_id, revenue_id, qualification, is_qualified, target_amount, target_closing_date, product_match, sales_type, subscription_plan, recurring_date ) values ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}','{var12}', '{var13}', '{var14}', '{var15}') returning *`,
    "Q87"  : `select sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_id, sc.revenue_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.target_closing_date, sc.product_match,sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at, c.closer_id, c.closer_percentage from sales_commission as sc 
              inner join sales_closer as c on sc.id = c.sales_commission_id
              where sc.company_id = '{var1}' and sc.deleted_at is null and c.deleted_at is null`,
    "Q88"  : `select id,customer_company_id ,customer_name, source, closed_at , user_id, business_id, revenue_id, address from customers where id = '{var1}' and deleted_at is null`,
    "Q89"  : `select id, closer_percentage, supporter_percentage from commission_split where id ='{var1}' and company_id = '{var2}' and deleted_at is null`,
    "Q90"  : `update commission_split set closer_id = '{var1}' where id = '{var2}' and deleted_at is null returning *`,
    "Q91"  : `insert into sales_supporter(id, commission_split_id ,supporter_id, supporter_percentage, sales_commission_id, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') returning *`,
    "Q92"  : `select id, supporter_id, supporter_percentage from sales_supporter where commission_split_id = '{var1}' and deleted_at is null `,
    "Q93"  : `insert into sales_closer(id, closer_id, closer_percentage, commission_split_id, sales_commission_id, company_id) values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') returning *`,
    "Q94"  : `select id, supporter_id, supporter_percentage from sales_supporter where sales_commission_id = '{var1}' and deleted_at is null `,
    "Q95"  : `update sales_commission set deleted_at = '{var1}' where id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q96"  : `update sales_supporter set deleted_at = '{var1}' where sales_commission_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q97"  : `update sales_closer set deleted_at = '{var1}' where sales_commission_id = '{var2}' and company_id = '{var3}' and deleted_at is null returning * `,
    "Q98"  : `update sales_commission set customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_id = '{var7}', revenue_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}',product_match = '{var13}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}'  where id = '{var5}' and company_id = '{var6}' and deleted_at is null returning *`,
    "Q99"  : `update sales_closer set closer_id = '{var1}', closer_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}' where sales_commission_id = '{var5}' and company_id = '{var6}' and deleted_at is null returning *`,
    "Q100" : `update sales_supporter set deleted_at = '{var3}' where sales_commission_id = '{var1}' and company_id = '{var2}' and deleted_at is null returning *`,
    "Q101" : `select sc.id as id , sc.customer_id as customerId , d.customer_name as customerName, sc.customer_commission_split_id, sc.is_overwrite as is_overwrite, c.closer_id as closerId, c.closer_percentage as closerPercentage
              from sales_commission as sc inner join sales_closer as c on sc.id = c.sales_commission_id
              inner join customers as d on sc.customer_id = d.id
              where sc.company_id = '{var1}' and replace(d.customer_name, ' ', '') ILIKE '%{var8}%' and sc.deleted_at is null
              and c.deleted_at is null and (sc.created_at BETWEEN '{var2}' AND '{var3}') 
              ORDER BY {var6} {var7} LIMIT '{var4}' OFFSET '{var5}'`,

    "Q102" : `select sc.id as id , sc.customer_id as customerId , d.customer_name as customerName, sc.customer_commission_split_id, sc.is_overwrite as is_overwrite, c.closer_id as closerId, c.closer_percentage as closerPercentage
              from sales_commission as sc inner join sales_closer as c on sc.id = c.sales_commission_id
              inner join customers as d on sc.customer_id = d.id
              where sc.company_id = '{var1}' and sc.deleted_at is null
              and c.deleted_at is null and (sc.created_at BETWEEN '{var2}' AND '{var3}')`,

    "Q103" : `select sc.id as id , sc.customer_id as customerId , d.customer_name as customerName, sc.customer_commission_split_id, sc.is_overwrite as is_overwrite, c.closer_id as closerId, c.closer_percentage as closerPercentage
              from sales_commission as sc inner join sales_closer as c on sc.id = c.sales_commission_id
              inner join customers as d on sc.customer_id = d.id
              where sc.company_id = '{var1}' and sc.deleted_at is null
              and c.deleted_at is null and (sc.created_at BETWEEN '{var2}' AND '{var3}') 
              ORDER BY {var6} {var7} LIMIT '{var4}' OFFSET '{var5}'`,

    "Q104" : `select sc.id as id , sc.customer_id as customerId , d.customer_name as customerName, sc.customer_commission_split_id, sc.is_overwrite as is_overwrite, c.closer_id as closerId, c.closer_percentage as closerPercentage
              from sales_commission as sc inner join sales_closer as c on sc.id = c.sales_commission_id
              inner join customers as d on sc.customer_id = d.id
              where sc.company_id = '{var1}' and replace(d.customer_name, ' ', '') ILIKE '%{var6}%' and sc.deleted_at is null
              and c.deleted_at is null and (sc.created_at BETWEEN '{var2}' AND '{var3}') 
              LIMIT '{var4}' OFFSET '{var5}'`,

    "Q105" : `update follow_up_notes set deleted_at = '{var1}' where id = '{var2}' and deleted_at is null`,
    "Q106" : `insert into revenue_forecast(id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, user_id, company_id)
              values('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}') returning * `,
    "Q107" : `select id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, created_at 
              from revenue_forecast where company_id = '{var1}' and deleted_at is null`,   
    "Q108" : `update revenue_forecast set timeline = '{var2}', revenue = '{var3}', growth_window = '{var4}', growth_percentage = '{var5}',
              start_date = '{var6}', end_date = '{var7}', updated_at = '{var8}' where id = '{var1}' and company_id = '{var9}' and deleted_at is null returning *` ,   
    "Q109" : `select timeline, revenue, growth_window, growth_percentage, start_date, end_date, created_at from revenue_forecast where id = '{var1}' and company_id = '{var2}' and deleted_at is null  ` ,            
    "Q110" : `select target_amount, closed_at from customers where closed_at is not null  and deleted_at is null and (closed_at BETWEEN '{var1}' AND '{var2}')`,
    "Q111" : `insert into business_contact(id, full_name, email_address, phone_number, customer_company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q112" : `insert into revenue_contact(id, full_name, email_address, phone_number, customer_company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q113" : `update business_contact set full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' where id = '{var1}' and deleted_at is null returning *`,
    "Q114" : `update revenue_contact set full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' where id = '{var1}' and deleted_at is null returning *`,
    "Q115" : `select id, full_name as business_contact_name, email_address as business_email, phone_number as business_phone_number
              from business_contact where customer_company_id = '{var1}' and deleted_at is null`,
    "Q116" : `select id, full_name as revenue_contact_name, email_address as revenue_email, phone_number as revenue_phone_number
              from revenue_contact where customer_company_id = '{var1}' and deleted_at is null`,
    "Q117" : `select id, full_name as business_contact_name, email_address as business_email, phone_number as business_phone_number
              from business_contact where id = '{var1}' and deleted_at is null`,  
    "Q118" : `select id, full_name as revenue_contact_name, email_address as revenue_email, phone_number as revenue_phone_number
              from revenue_contact where id = '{var1}' and deleted_at is null`,
    "Q119" : `select target_amount from sales_commission where company_id = '{var1}' and deleted_at is null and EXTRACT(MONTH FROM created_at) = '{var2}'`,
    "Q120" : `update customers set business_id = '{var2}' where id = '{var1}' returning *`,
    "Q121" : `update customers set revenue_id = '{var2}' where id = '{var1}' returning *`,
    "Q122" : `select id, supporter_id, supporter_percentage from sales_supporter where id = '{var1}'  `,
    "Q123" : `select customer_id, sales_type, subscription_plan, recurring_date from sales_commission where deleted_at is null`,
    "Q124" : `insert into configurations(id, currency, phone_format, date_format, user_id, company_id ) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') returning *`,
    "Q125" : `select id, currency, phone_format, date_format, user_id, company_id, created_at from configurations where company_id = '{var1}' and deleted_at is null `,
    "Q126" : `update configurations set deleted_at = '{var1}' where company_id = '{var2}' and deleted_at is null returning *`,
    "Q127" : `select cr.closer_id,cr.closer_percentage, u.full_name from sales_closer as cr 
              inner join users as u on u.id = cr.closer_id where sales_commission_id = '{var1}'
              and cr.deleted_at is null and u.deleted_at is null`,
    "Q128" : `select sc.id as sales_commission_id, sc.target_amount, sc.target_closing_date, c.id as customer_id,
              c.closed_at, c.customer_name  from sales_commission as sc inner join customers as c
              on sc.customer_id = c.id where sc.company_id = '{var1}' and sc.deleted_at is null 
              and c.deleted_at is null`,
    "Q129" : `SELECT DATE_TRUNC('{var2}',created_at) AS  date,
              sum(target_amount::decimal) as target_amount
              FROM sales_commission where company_id = '{var1}' and deleted_at is null
              GROUP BY DATE_TRUNC('{var2}',created_at);`,
    "Q130" : `select id, customer_company_name from customer_companies where deleted_at is null  and company_id = '{var1}'`,
    "Q131" : `select id, closed_at from customers where customer_company_id = '{var1}' and deleted_at is null and closed_at is not null`,
    "Q132" : `select id, target_amount, target_closing_date from sales_commission where customer_id = '{var1}' and deleted_at is null`,
    "Q133" : `select id, target_amount, target_closing_date from sales_commission where company_id = '{var1}' and deleted_at is null`,
    "Q134" : `insert into contact_us(id, full_name, email, subject, messages, address) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') returning *`,

        

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