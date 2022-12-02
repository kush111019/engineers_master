
const db_sql = {

    "Q1"   : `SELECT * FROM companies WHERE company_name = '{var1}'`,
    "Q2"   : `INSERT INTO companies(id,company_name,company_logo,company_address) 
              VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q3"   : `INSERT INTO users(id,full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,expiry_date,is_verified,is_admin) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}',false,true) RETURNING *`,          
    "Q4"   : `SELECT * FROM users WHERE email_address = '{var1}' AND deleted_at IS NULL` ,
    "Q5"   : `UPDATE users SET encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' WHERE id = '{var1}' AND company_id = '{var4}' RETURNING *`, 
    "Q6"   : `SELECT id, module_name,module_type FROM modules WHERE deleted_at IS NULL`,
    "Q7"   : `UPDATE users SET is_verified = true ,updated_at = '{var2}' WHERE id = '{var1}' RETURNING *`, 
    "Q8"   : `SELECT id, full_name,company_id, email_address,mobile_number,phone_number,address,role_id, avatar,expiry_date, is_verified, is_admin, is_locked FROM users WHERE id = '{var1}' AND deleted_at IS NULL ` ,
    "Q9"   : `SELECT * FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q10"  : `UPDATE users SET full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' WHERE id = '{var8}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `, 
    "Q11"  : `INSERT INTO roles(id,role_name,reporter,company_id) VALUES('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q12"  : `SELECT * FROM roles WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q13"  : `INSERT INTO roles(id,role_name,reporter,company_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`, 
    "Q14"  : `SELECT * FROM roles WHERE company_id = '{var1}' AND deleted_at IS NULL` ,
    "Q15"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at FROM users WHERE company_id = '{var1}' AND deleted_at IS NULL ORDER BY created_at desc`,
    "Q16"  : `SELECT * FROM roles WHERE reporter = '{var1}' AND deleted_at IS NULL`,
    "Q17"  : `SELECT * FROM slabs WHERE company_id ='{var1}' AND deleted_at IS NULL ORDER BY slab_ctr ASC`,
    "Q18"  : `INSERT INTO slabs(id,min_amount, max_amount, percentage, is_max, company_id, currency, slab_ctr) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}', '{var8}') RETURNING * `,
    "Q19"  : `UPDATE slabs SET deleted_at = '{var2}' WHERE company_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q20"  : `INSERT INTO permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}') RETURNING *`,
    "Q21"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id FROM users WHERE role_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL `,
    "Q22"  : `UPDATE users SET email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}' WHERE id = '{var6}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
    "Q23"  : `UPDATE users SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
   // "Q24"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,address,role_id FROM users WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q25"  : `UPDATE roles SET role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' WHERE id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
    "Q26"  : `update permissions SET permission_to_create= '{var1}', permission_to_view = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}' WHERE role_id = '{var5}' AND module_id = '{var7}' AND deleted_at IS NULL `,
    "Q27"  : `UPDATE roles SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q28"  : `UPDATE permissions SET deleted_at = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING * `,
    "Q29"  : `UPDATE slabs SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
    "Q30"  : `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND deleted_at IS NULL  RETURNING * `,
    "Q31"  : `INSERT INTO follow_up_notes (id, sales_commission_id, company_id, user_id, notes) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q32"  : `SELECT id, notes, created_at FROM follow_up_notes WHERE sales_commission_id = '{var1}' AND deleted_at IS NULL`,
    "Q33"  : `UPDATE permissions SET user_id = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q34"  : `UPDATE roles SET module_ids = '{var1}' , updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
    "Q35"  : `SELECT m.module_name, p.permission_to_view, p.permission_to_create, 
              p.permission_to_update, p.permission_to_delete FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN roles AS r ON r.id = p.role_id WHERE m.id = '{var1}' AND r.id = '{var2}' 
              AND m.deleted_at IS NULL AND p.deleted_at IS NULL`,
    "Q36"  : `INSERT INTO customers(id, user_id,customer_company_id,customer_name, source, company_id, business_id, revenue_id, address, currency) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}', '{var10}') RETURNING *`,
    "Q37"  : `INSERT INTO customer_companies(id, customer_company_name, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
    "Q38"  : `SELECT id, customer_company_name FROM customer_companies WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q39"  : `SELECT c.id, c.customer_company_id , c.customer_name, c.source, c.closed_at , c.user_id, c.business_id, c.revenue_id, c.created_at, c.address, c.currency,
              u.full_name AS created_by FROM customers AS c INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.company_id = '{var1}' AND c.deleted_at IS NULL AND u.deleted_at IS NULL ORDER BY created_at desc`,
    "Q40"  : `UPDATE customers SET closed_at = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q41"  : `SELECT u.id, u.company_id, u.role_id, u.avatar, u.full_name,u.email_address,u.mobile_number,u.phone_number,u.address,
              m.id AS module_id, m.module_name, m.module_type, p.id AS permission_id, p.permission_to_view, 
              p.permission_to_create, p.permission_to_update, p.permission_to_delete
              FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN users AS u ON u.role_id = p.role_id
              WHERE m.module_name = '{var1}' AND u.id = '{var2}' AND m.deleted_at IS NULL 
              AND p.deleted_at IS NULL AND u.deleted_at IS NULL`,   
    "Q42"  : `UPDATE customers SET customer_name = '{var1}', source = '{var2}', updated_at = '{var3}', business_id = '{var4}', revenue_id = '{var5}', address = '{var7}', currency = '{var9}' WHERE id = '{var6}' AND company_id = '{var8}' AND deleted_at IS NULL RETURNING *`,
    "Q43"  : `INSERT INTO sales_commission_logs(id,sales_commission_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_id, business_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date, currency) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}', '{var19}' ) RETURNING *`,
    "Q44"  : `SELECT sl.id, sl.sales_commission_id, sl.customer_commission_split_id, sl.qualification, sl.is_qualified, sl.target_amount, sl.currency, 
              sl.products, sl.target_closing_date, sl.customer_id, sl.is_overwrite, sl.company_id, sl.revenue_id, sl.business_id, sl.closer_id, 
              sl.supporter_id, sl.sales_type, sl.subscription_plan, sl.recurring_date, sl.created_at, u.full_name AS closer_name, c.customer_name, c.closed_at, cr.closer_percentage
              FROM sales_commission_logs AS sl INNER JOIN users AS u ON u.id = sl.closer_id
              INNER JOIN customers AS c ON c.id = sl.customer_id
              INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sl.sales_commission_id
              WHERE sl.sales_commission_id = '{var1}' AND sl.deleted_at IS NULL AND u.deleted_at IS NULL AND c.deleted_at IS NULL AND cr.deleted_at IS NULL ORDER BY sl.created_at desc`,
    "Q45"  : `INSERT INTO users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_verified) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false) RETURNING *`, 
    "Q46"  : `SELECT id, customer_company_name FROM customer_companies WHERE company_id = '{var1}' AND replace(customer_company_name, ' ', '') ILIKE '%{var2}%' AND deleted_at IS NULL`, 
    "Q47"  : `UPDATE customers SET  deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q48"  : `INSERT INTO commission_split(id, closer_percentage,  supporter_percentage, company_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING * `,
    "Q49"  : `UPDATE commission_split SET closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  WHERE  id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
    "Q50"  : `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE company_id ='{var1}' AND deleted_at IS NULL`,
    "Q51"  : `UPDATE commission_split SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}'  AND deleted_at IS NULL RETURNING *`,
    "Q52"  : `SELECT c.id, c.customer_company_id ,c.customer_name, c.source, c.closed_at , c.user_id, c.address,
              u.full_name AS created_by FROM customers AS c INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.company_id = '{var1}' AND c.closed_at IS NULL  AND c.deleted_at IS NULL AND u.deleted_at IS NULL`,
    "Q53"  : `INSERT INTO sales_commission (id, customer_id, customer_commission_split_id, is_overwrite, company_id, business_id, revenue_id, qualification, is_qualified, target_amount, target_closing_date, products, sales_type, subscription_plan, recurring_date, currency ) VALUES ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}','{var12}', '{var13}', '{var14}', '{var15}', '{var16}') RETURNING *`,
    "Q54"  : `SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_id, 
              sc.revenue_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.products,sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at, 
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.closed_at FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND c.deleted_at IS NULL AND u.deleted_at IS NULL AND cus.deleted_at IS NULL ORDER BY created_at desc`,
    "Q55"  : `SELECT * FROM customers WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q56"  : `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE id ='{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
    "Q57"  : `INSERT INTO sales_supporter(id, commission_split_id ,supporter_id, supporter_percentage, sales_commission_id, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') RETURNING *`,
    "Q58"  : `INSERT INTO sales_closer(id, closer_id, closer_percentage, commission_split_id, sales_commission_id, company_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,
    "Q59"  : `SELECT id, supporter_id, supporter_percentage FROM sales_supporter WHERE sales_commission_id = '{var1}' AND deleted_at IS NULL `,
    "Q60"  : `UPDATE sales_commission SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q61"  : `UPDATE sales_supporter SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q62"  : `UPDATE sales_closer SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q63"  : `UPDATE sales_commission SET customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_id = '{var7}', revenue_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}',products = '{var13}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}', currency = '{var17}'  WHERE id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q64"  : `UPDATE sales_closer SET closer_id = '{var1}', closer_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}' WHERE sales_commission_id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q65"  : `UPDATE sales_supporter SET deleted_at = '{var3}' WHERE sales_commission_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q66"  : `UPDATE follow_up_notes SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL`,
    "Q67"  : `INSERT INTO revenue_forecast(id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, user_id, company_id, currency)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}') RETURNING * `,
    "Q68"  : `SELECT * FROM revenue_forecast WHERE company_id = '{var1}' AND deleted_at IS NULL ORDER BY timeline asc`,  
    "Q69"  : `SELECT * FROM revenue_forecast WHERE id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL  ` ,            
    "Q70"  : `INSERT INTO business_contact(id, full_name, email_address, phone_number, customer_company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q71"  : `INSERT INTO revenue_contact(id, full_name, email_address, phone_number, customer_company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q72"  : `UPDATE business_contact SET full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q73"  : `UPDATE revenue_contact SET full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q74"  : `SELECT id, full_name AS business_contact_name, email_address AS business_email, phone_number AS business_phone_number
              FROM business_contact WHERE customer_company_id = '{var1}' AND deleted_at IS NULL`,
    "Q75"  : `SELECT id, full_name AS revenue_contact_name, email_address AS revenue_email, phone_number AS revenue_phone_number
              FROM revenue_contact WHERE customer_company_id = '{var1}' AND deleted_at IS NULL`,
    "Q76"  : `SELECT id, full_name AS business_contact_name, email_address AS business_email, phone_number AS business_phone_number
              FROM business_contact WHERE id = '{var1}' AND deleted_at IS NULL`,  
    "Q77"  : `SELECT id, full_name AS revenue_contact_name, email_address AS revenue_email, phone_number AS revenue_phone_number
              FROM revenue_contact WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q78"  : `SELECT target_amount FROM sales_commission WHERE company_id = '{var1}' AND deleted_at IS NULL AND EXTRACT(MONTH FROM created_at) = '{var2}'`,
    "Q79"  : `UPDATE customers SET business_id = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q80"  : `UPDATE customers SET revenue_id = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q81"  : `SELECT s.id, s.supporter_id, s.supporter_percentage, u.full_name FROM sales_supporter AS s 
              INNER JOIN users AS u ON u.id = s.supporter_id WHERE s.id ='{var1}' `,
    "Q82"  : `SELECT customer_id, sales_type, subscription_plan, recurring_date FROM sales_commission WHERE deleted_at IS NULL`,
    "Q83"  : `INSERT INTO configurations(id, currency, phone_format, date_format,user_id, company_id ) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
    "Q84"  : `SELECT id,currency,phone_format,date_format,user_id,company_id,created_at
              FROM configurations WHERE company_id = '{var1}' AND deleted_at IS NULL `,
    "Q85"  : `UPDATE configurations SET deleted_at = '{var1}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q86"  : `SELECT cr.closer_id,cr.closer_percentage, u.full_name FROM sales_closer AS cr 
              INNER JOIN users AS u ON u.id = cr.closer_id WHERE sales_commission_id = '{var1}'
              AND cr.deleted_at IS NULL AND u.deleted_at IS NULL`,
    "Q87"  : `SELECT sc.id AS sales_commission_id, sc.target_amount, sc.target_closing_date,sc.products, c.id AS customer_id,
              c.closed_at, c.customer_name  FROM sales_commission AS sc INNER JOIN customers AS c
              ON sc.customer_id = c.id WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL 
              AND c.deleted_at IS NULL Order by c.closed_at DESC`,
    "Q88"  : `SELECT DATE_TRUNC('{var2}',c.closed_at) AS  date, sum(sc.target_amount::decimal) AS target_amount
              FROM sales_commission AS sc INNER JOIN customers AS c ON sc.customer_id = c.id
              WHERE sc.company_id = '{var1}' AND c.deleted_at IS NULL AND sc.deleted_at IS NULL 
              AND c.closed_at is not null GROUP BY DATE_TRUNC('{var2}',c.closed_at) ORDER BY date DESC LIMIT {var3} OFFSET {var4}`,
    "Q89"  : `SELECT cc.id as	customer_company_id, cc.customer_company_name, c.id AS customer_id, c.closed_at, sc.id AS sales_commission_id,
              sc.target_amount::DECIMAL, sc.target_closing_date FROM customer_companies AS cc 
              INNER JOIN customers AS c ON c.customer_company_id = cc.id
              INNER JOIN sales_commission AS sc ON sc.customer_id = c.id 
              WHERE cc.company_id = '{var1}' AND cc.deleted_at IS NULL AND c.deleted_at IS NULL	
              AND	sc.deleted_at IS NULL ORDER BY sc.target_amount::DECIMAL {var2} LIMIT {var3} OFFSET {var4}`,
    "Q90"  : `SELECT id, target_amount, target_closing_date, customer_id FROM sales_commission WHERE company_id = '{var1}' AND deleted_at IS NULL`,
    "Q91"  : `INSERT INTO contact_us(id, full_name, email, subject, messages, address) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
    "Q92"  : `INSERT INTO products(id, product_name,product_image,description,available_quantity,price,tax,company_id, currency)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}')`,
    "Q93"  : `UPDATE products SET product_name = '{var2}',product_image = '{var3}', description = '{var4}',available_quantity = '{var5}', price = '{var6}', tax = '{var7}', updated_at = '{var8}', currency = '{var10}' WHERE id = '{var1}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
    "Q94"  : `SELECT id, product_name, product_image, description, available_quantity, price, tax, currency, company_id, created_at, updated_at FROM products WHERE company_id = '{var1}' AND deleted_at IS NULL ORDER BY created_at desc`,
    "Q95"  : `UPDATE products SET deleted_at = '{var2}' WHERE id = '{var1}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q96"  : `SELECT id, product_name, product_image, description, available_quantity, price, tax, company_id, created_at, updated_at FROM products WHERE id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
    "Q97"  : `INSERT INTO products(id, company_id, product_name, product_image, description, available_quantity, price, tax, currency) 
              VALUES ('{var1}','{var2}',$1,$2,$3,$4,$5,$6,$7)`,
    "Q98"  : `SELECT id, name, email, encrypted_password FROM super_admin WHERE email = '{var1}'`,
    "Q99"  : `SELECT id, company_name, company_logo, company_address, is_imap_enable, created_at FROM companies WHERE deleted_at IS NULL`,
    "Q100" : `UPDATE super_admin SET encrypted_password = '{var2}' WHERE email = '{var1}'`,
    "Q101" : `SELECT  sc.target_amount,  c.closed_at ,com.id AS company_id, com.company_name FROM sales_commission AS sc 
              INNER JOIN customers AS c ON sc.customer_id = c.id 
              INNER JOIN companies AS com ON sc.company_id = com.id 
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND c.deleted_at IS NULL Order by c.closed_at asc`,
    "Q102" : `INSERT INTO payment_plans(id, product_id, name, description, active_status,
              admin_price_id, admin_amount,user_price_id, user_amount, interval, currency) 
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', 
              '{var9}','{var10}','{var11}') RETURNING *`,
    "Q103" : `SELECT id,  name, description, active_status,
              interval, admin_amount,user_amount, currency FROM payment_plans WHERE active_status = 'true' AND  deleted_at IS NULL`,
    "Q104" : `SELECT id, product_id, name, description, active_status,
              admin_price_id,user_price_id, interval, admin_amount,user_amount, currency FROM payment_plans WHERE id = '{var1}' AND deleted_at IS NULL ORDER BY name asc`,  
    "Q105" : `UPDATE payment_plans SET name = '{var1}', description = '{var2}', 
               updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *` ,
    "Q106" : `UPDATE payment_plans SET active_status = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q107" : `INSERT INTO transactions(id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}','{var14}') RETURNING *` ,
    "Q108" : `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade, is_canceled, payment_receipt  FROM transactions WHERE company_id = '{var1}' AND deleted_at IS NULL`,
    "Q109" : `SELECT id, name, description, active_status, interval, admin_amount,user_amount, currency FROM payment_plans WHERE deleted_at IS NULL`,
    "Q110" : `SELECT id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_admin, expiry_date FROM users WHERE deleted_at IS NULL`,
    "Q111" : `INSERT INTO superadmin_config(id, trial_days) VALUES('{var1}', '{var2}') RETURNING *`,
    "Q112" : `SELECT id, trial_days, created_at FROM superadmin_config WHERE deleted_at IS NULL ORDER BY created_at desc ` ,
    "Q113" : `UPDATE users SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q114" : `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id,total_amount, immediate_upgrade, upgraded_transaction_id FROM transactions WHERE deleted_at IS NULL AND upgraded_transaction_id is not null`,
    "Q115" : `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade  FROM transactions WHERE plan_id = '{var1}' AND deleted_at IS NULL`,  
    "Q116" : `UPDATE transactions SET stripe_customer_id = '{var1}', stripe_subscription_id = '{var2}', 
              stripe_card_id = '{var3}', stripe_token_id = '{var4}', stripe_charge_id = '{var5}', 
              expiry_date = '{var6}', updated_at = '{var7}', total_amount = '{var9}', immediate_upgrade = '{var10}', payment_receipt = '{var11}', user_count = '{var12}', plan_id = '{var13}', upgraded_transaction_id = '{var14}'  WHERE id = '{var8}' AND deleted_at IS NULL RETURNING *`,
    "Q117" : `UPDATE transactions SET stripe_charge_id = '{var1}', payment_receipt = '{var4}', immediate_upgrade = '', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q118" : `UPDATE transactions SET is_canceled = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q119" : `SELECT id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at FROM chat WHERE is_group_chat = 'false' AND ((user_a = '{var1}' AND user_b = '{var2}') or (user_a = '{var2}' AND user_b = '{var1}')) AND deleted_at IS NULL`,
    "Q120" : `INSERT INTO message(id, chat_id, sender, content) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q121" : `UPDATE chat SET last_message = '{var1}', updated_at = '{var3}' WHERE id = '{var2}'  AND deleted_at IS NULL RETURNING *`,
    "Q122" : `INSERT INTO chat_room_members (id, room_id, user_id, group_name) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *` ,
    "Q123" : `SELECT id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at FROM chat WHERE (user_a = '{var1}' or user_b = '{var1}') AND company_id = '{var2}' AND is_group_chat = '{var3}' AND deleted_at IS NULL`,
    "Q124" : `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at FROM chat WHERE id = '{var1}' AND deleted_at IS NULL `,
    "Q125" : `SELECT u.id, u.full_name, u.avatar FROM chat_room_members AS cm 
              INNER JOIN users AS u ON u.id = cm.user_id
              WHERE room_id = '{var1}' AND cm.deleted_at IS NULL AND u.deleted_at IS NULL`,
    "Q126" : `SELECT sc.id,c.closer_id,sc.customer_id, u.full_name, cc.user_id AS creator_id FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id 
              INNER JOIN users AS u ON c.closer_id = u.id 
              INNER JOIN customers AS cc ON cc.id = sc.customer_id WHERE sc.id = '{var1}'
              AND sc.deleted_at IS NULL AND c.deleted_at IS NULL AND u.deleted_at IS NULL
              AND cc.deleted_at IS NULL`,
    "Q127" : `SELECT s.supporter_id, u.full_name FROM sales_supporter AS s
              INNER JOIN users AS u ON s.supporter_id = u.id
              WHERE s.sales_commission_id = '{var1}' 
              AND s.deleted_at IS NULL AND u.deleted_at IS NULL`,
    "Q128" : `INSERT INTO chat(id, chat_name, is_group_chat, user_a, user_b, group_admin, sales_id, company_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}','{var6}','{var7}','{var8}') RETURNING *`,
    "Q129" : `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin FROM chat WHERE id = '{var1}' AND company_id = '{var2}' AND is_group_chat = '{var3}' AND deleted_at IS NULL`,
    "Q130" : `SELECT m.id, m.sender, m.content, m.chat_id, m.read_by, m.created_at, u.full_name,
              u.avatar, u.id AS sender_id FROM message AS m INNER JOIN users AS u ON m.sender = u.id 
              WHERE m.id = '{var1}' AND m.deleted_at IS NULL`,
    "Q131" : `SELECT m.id AS messageId, m.content, m.sender AS senderId, m.chat_id, m.read_by, m.created_at,
              u.full_name, u.avatar, c.id, c.chat_name, c.is_group_chat,
              c.group_admin, c.user_a, c.user_b, c.created_at FROM message AS m 
              INNER JOIN users AS u ON m.sender = u.id
              INNER JOIN chat AS c ON m.chat_id = c.id  WHERE chat_id = '{var1}' AND m.deleted_at IS NULL ORDER BY m.created_at DESC LIMIT 1`,
    "Q132" :`SELECT m.id AS messageId,m.content,m.sender AS senderId, m.created_at,
             u.full_name, u.avatar FROM message AS m 
             INNER JOIN users AS u ON m.sender = u.id
            WHERE chat_id = '{var1}' AND m.deleted_at IS NULL ORDER BY m.created_at ASC `,
    "Q133" : `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at FROM chat WHERE sales_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`, 
    "Q134" :`SELECT room_id, user_id, group_name FROM chat_room_members WHERE user_id = '{var1}' AND deleted_at IS NULL` ,

    "Q135" : `SELECT id, message_id, to_mail, from_mail,from_name, mail_date, subject, mail_html, mail_text, mail_text_as_html, attechments, company_id, read_status, created_at FROM emails WHERE company_id = '{var1}' AND user_id = '{var2}' AND deleted_at IS NULL order by mail_date desc`,
    "Q136" : `SELECT b.email_address AS business_email, r.email_address AS revenue_email
              FROM business_contact AS b 
              INNER JOIN customer_companies AS c ON c.id = b.customer_company_id
              INNER JOIN revenue_contact AS r ON b.customer_company_id = r.customer_company_id
              WHERE '{var1}' IN (b.email_address, r.email_address) AND c.company_id = '{var2}' AND
              b.deleted_at IS NULL AND c.deleted_at IS NULL AND r.deleted_at IS NULL`,
    "Q137" : `INSERT INTO emails (id, message_id, to_mail, from_mail,from_name, mail_date, subject, 
              mail_html, mail_text, mail_text_as_html, company_id, attechments, user_id) VALUES('{var1}', '{var2}', 
              '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}','{var11}', '{var12}', '{var13}') RETURNING *` ,
    "Q138" : `SELECT id, email, app_password, imap_host, imap_port, smtp_host, smtp_port, user_id FROM imap_credentials WHERE user_id = '{var1}' AND company_id = '{var2}'AND deleted_at IS NULL`,
    "Q139" : `UPDATE emails SET read_status = '{var2}' WHERE message_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q140" : `INSERT INTO sent_email(id, from_email, to_email, cc, subject, message, company_id, sales_id, attechments, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}', '{var8}','{var9}', '{var10}') RETURNING *`,    
    "Q141" : `SELECT id, to_email, from_email, cc, subject, message,attechments, company_id,sales_id, created_at FROM sent_email WHERE company_id = '{var1}' AND sales_id = '{var2}' AND user_id = '{var3}' AND deleted_at IS NULL order by created_at desc`, 
    "Q142" : `UPDATE imap_credentials SET deleted_at = '{var1}' WHERE user_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q143" : `INSERT INTO imap_credentials(id, email, app_password, user_id, imap_host, imap_port, smtp_host, smtp_port, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}') RETURNING *`,
    "Q144" : `SELECT id,full_name,avatar FROM users WHERE id IN ('{var1}','{var2}') AND deleted_at IS NULL`,
    "Q145" : `SELECT u.id, u.full_name, u.company_id, u.email_address, u.encrypted_password, u.mobile_number, u.role_id, 
              u.avatar, u.expiry_date, u.is_verified, u.is_admin, u.is_locked, c.company_name, c.company_address, c.company_logo, c.is_imap_enable,
              r.role_name, r.reporter, r.module_ids, con.id AS config_id, con.currency, con.phone_format, con.date_format
              FROM users AS u INNER JOIN companies AS c ON c.id = u.company_id
              INNER JOIN roles AS r ON r.id = u.role_id 
              INNER JOIN configurations AS con ON con.company_id = u.company_id
              WHERE email_address = '{var1}' AND u.deleted_at IS NULL 
              AND c.deleted_at IS NULL AND r.deleted_at IS NULL AND con.deleted_at IS NULL`,
    "Q146" : `UPDATE companies SET is_imap_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q147" : `SELECT id, product_name, product_image, description, available_quantity, price, tax, currency, company_id, created_at, updated_at FROM products WHERE product_name = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL ORDER BY created_at desc `,
    "Q148" : `UPDATE revenue_forecast SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' RETURNING *`,
    "Q149" : `INSERT INTO upgraded_transactions(id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}','{var14}') RETURNING *`, 
    "Q150" : `SELECT id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt FROM upgraded_transactions WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q151" : `UPDATE upgraded_transactions SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
    "Q152" : `SELECT id,country_name,country_value,currency_name,currency_symbol,date_format,created_at FROM country_details WHERE deleted_at IS NULL`,
    "Q153" : `SELECT sc.id AS sales_commission_id, sc.target_amount::DECIMAL, sc.target_closing_date,sc.products, c.id AS customer_id,
              c.closed_at, c.customer_name  FROM sales_commission AS sc INNER JOIN customers AS c
              ON sc.customer_id = c.id WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL 
              AND c.deleted_at IS NULL ORDER BY sc.target_amount::DECIMAL {var2}`,
    "Q154" : `SELECT id, target_amount::DECIMAL, target_closing_date, customer_id FROM sales_commission WHERE company_id = '{var1}' AND deleted_at IS NULL ORDER BY target_amount::DECIMAL {var2} LIMIT {var3} OFFSET {var4}`,                           
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