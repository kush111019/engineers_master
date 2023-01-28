
const db_sql = {

    "Q1"   : `SELECT * FROM companies WHERE company_name = '{var1}'`,
    "Q2"   : `INSERT INTO companies(id,company_name,company_logo,company_address,expiry_date, user_count) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') RETURNING *`,
    "Q3"   : `INSERT INTO users(id,full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,expiry_date,created_by,is_verified,is_admin,is_main_admin) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}',false,true,true) RETURNING *`,          
    "Q4"   : `SELECT * FROM users WHERE email_address = '{var1}' AND deleted_at IS NULL` ,
    "Q5"   : `UPDATE users SET encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' WHERE id = '{var1}' AND company_id = '{var4}' RETURNING *`, 
    "Q6"   : `SELECT id, module_name,module_type FROM modules WHERE deleted_at IS NULL`,
    "Q7"   : `UPDATE users SET is_verified = true ,updated_at = '{var2}' WHERE id = '{var1}' RETURNING *`, 
    "Q8"   : `SELECT id, full_name,company_id, email_address,mobile_number,phone_number,address,role_id, avatar,expiry_date, is_verified, is_admin, is_locked, created_by,is_main_admin, created_at FROM users WHERE id = '{var1}' and deleted_at IS NULL` ,
    "Q9"   : `SELECT * FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q10"  : `UPDATE users SET full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' WHERE id = '{var8}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `, 
    "Q11"  : `INSERT INTO roles(id,role_name,reporter,company_id) VALUES('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q12"  : `SELECT * FROM roles WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q13"  : `INSERT INTO roles(id,role_name,reporter,company_id,user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`, 
    "Q14"  : `SELECT * FROM roles WHERE company_id = '{var1}' AND deleted_at IS NULL` ,
    "Q15"  : `SELECT 
                u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                u1.is_main_admin, u1.created_by, u2.full_name AS creator_name 
              FROM 
                users AS u1 
              INNER JOIN 
                users AS u2 ON u2.id = u1.created_by  
              WHERE 
                u1.company_id = '{var1}' AND u1.deleted_at IS NULL 
              ORDER BY 
                created_at DESC`,
    "Q16"  : `SELECT * FROM roles WHERE reporter = '{var1}' AND deleted_at IS NULL`,
    "Q17"  : `SELECT 
                id, min_amount, max_amount, percentage, is_max, slab_ctr, slab_id, 
                slab_name, commission_split_id, currency, user_id, company_id,created_at 
              FROM 
                slabs 
              WHERE 
                company_id ='{var1}' AND deleted_at IS NULL 
              GROUP BY 
                slab_id, id 
              ORDER BY 
                slab_ctr ASC`,
    "Q18"  : `INSERT INTO slabs(id,min_amount, max_amount, percentage, is_max, company_id, currency, slab_ctr, user_id, slab_id, slab_name, commission_split_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}','{var12}') RETURNING * `,
    "Q19"  : `UPDATE slabs SET slab_name = '{var1}', min_amount = '{var2}', max_amount = '{var3}', percentage = '{var4}', is_max = '{var5}', company_id = '{var6}',currency = '{var7}', slab_ctr = '{var8}', user_id = '{var9}', updated_at = '{var12}', commission_split_id = '{var13}' WHERE id = '{var10}' AND slab_id = '{var11}' AND deleted_at IS NULL RETURNING *`,
    "Q20"  : `INSERT INTO permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view_global,permission_to_view_own, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}') RETURNING *`,
    "Q21"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id FROM users WHERE role_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL `,
    "Q22"  : `UPDATE users SET email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}', is_admin = '{var10}' WHERE id = '{var6}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
    "Q23"  : `UPDATE users SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q24"  :  `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at, deleted_at FROM users WHERE company_id = '{var1}' ORDER BY created_at desc`,
    "Q25"  : `UPDATE roles SET role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' WHERE id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
    "Q26"  : `update permissions SET permission_to_create= '{var1}', permission_to_view_global = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}', permission_to_view_own = '{var8}' WHERE role_id = '{var5}' AND module_id = '{var7}' AND deleted_at IS NULL `,
    "Q27"  : `UPDATE roles SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q28"  : `UPDATE permissions SET deleted_at = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING * `,
    "Q29"  : `UPDATE slabs SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
    "Q30"  : `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND is_main_admin = false AND deleted_at IS NULL RETURNING * `,
    "Q31"  : `INSERT INTO follow_up_notes (id, sales_commission_id, company_id, user_id, notes) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q32"  : `SELECT id, notes, created_at FROM follow_up_notes WHERE sales_commission_id = '{var1}' AND deleted_at IS NULL ORDER BY created_at DESC`,
    "Q33"  : `UPDATE permissions SET user_id = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q34"  : `UPDATE roles SET module_ids = '{var1}' , updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
    "Q35"  : `SELECT m.module_name, p.permission_to_view_global,p.permission_to_view_own, p.permission_to_create, 
              p.permission_to_update, p.permission_to_delete FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN roles AS r ON r.id = p.role_id WHERE m.id = '{var1}' AND r.id = '{var2}' 
              AND m.deleted_at IS NULL AND p.deleted_at IS NULL`,
    "Q36"  : `INSERT INTO customers(id, user_id,customer_company_id,customer_name, source, company_id, business_contact_id, revenue_contact_id, address, currency, lead_id) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}', '{var10}', '{var11}') RETURNING *`,
    "Q37"  : `INSERT INTO customer_companies(id, customer_company_name, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
    "Q38"  : `SELECT id, customer_company_name FROM customer_companies WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q39"  : `SELECT 
                c.id, c.customer_company_id, c.customer_name, c.source, 
                c.user_id,c.lead_id, c.business_contact_id, c.revenue_contact_id, 
                c.created_at, c.address, c.currency,c.is_rejected,
                u.full_name AS created_by 
              FROM 
                customers AS c 
              INNER JOIN 
                users AS u ON u.id = c.user_id
              WHERE 
                c.company_id = '{var1}' AND c.deleted_at IS NULL AND 
                u.deleted_at IS NULL AND c.is_rejected = '{var2}' 
              ORDER BY 
                created_at desc`,
    "Q40"  : `UPDATE sales_commission SET closed_at = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q41"  : `SELECT u.id, u.company_id, u.role_id, u.avatar, u.full_name,u.email_address,u.mobile_number,u.phone_number,u.address,u.is_verified,u.created_by,
              m.id AS module_id, m.module_name, m.module_type, p.id AS permission_id, p.permission_to_view_global, p.permission_to_view_own,
              p.permission_to_create, p.permission_to_update, p.permission_to_delete
              FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN users AS u ON u.role_id = p.role_id
              WHERE m.module_name = '{var1}' AND u.id = '{var2}' AND m.deleted_at IS NULL 
              AND p.deleted_at IS NULL AND u.deleted_at IS NULL`,   
    "Q42"  : `UPDATE customers SET customer_name = '{var1}', source = '{var2}', updated_at = '{var3}', business_contact_id = '{var4}', revenue_contact_id = '{var5}', address = '{var7}', currency = '{var9}' WHERE id = '{var6}' AND company_id = '{var8}' AND deleted_at IS NULL RETURNING *`,
    "Q43"  : `INSERT INTO sales_commission_logs(id,sales_commission_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_contact_id, business_contact_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date, currency, slab_id, closer_percentage) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}', '{var19}', '{var20}', '{var21}' ) RETURNING *`,
    "Q44"  : `SELECT sl.id, sl.sales_commission_id, sl.customer_commission_split_id, sl.qualification, sl.is_qualified, sl.target_amount, sl.currency, 
              sl.products, sl.target_closing_date, sl.customer_id, sl.is_overwrite, sl.company_id, sl.revenue_contact_id, sl.business_contact_id, sl.closer_id, 
              sl.supporter_id, sl.sales_type, sl.subscription_plan, sl.recurring_date, sl.created_at,sl.closed_at, u.full_name AS closer_name, c.customer_name, sl.closer_percentage
              FROM sales_commission_logs AS sl INNER JOIN users AS u ON u.id = sl.closer_id
              INNER JOIN customers AS c ON c.id = sl.customer_id
              INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sl.sales_commission_id
              WHERE sl.sales_commission_id = '{var1}' AND sl.deleted_at IS NULL ORDER BY sl.created_at desc`,
    "Q45"  : `INSERT INTO users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_admin,is_verified,created_by) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}',false,'{var11}') RETURNING *`, 
    "Q46"  : `SELECT id, customer_company_name FROM customer_companies WHERE company_id = '{var1}' AND replace(customer_company_name, ' ', '') ILIKE '%{var2}%' AND deleted_at IS NULL`, 
    "Q47"  : `UPDATE customers SET  deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q48"  : `INSERT INTO commission_split(id, closer_percentage,  supporter_percentage, company_id, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING * `,
    "Q49"  : `UPDATE commission_split SET closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  WHERE  id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
    "Q50"  : `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE company_id ='{var1}' AND deleted_at IS NULL`,
    "Q51"  : `UPDATE commission_split SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}'  AND deleted_at IS NULL RETURNING *`,
    "Q52"  : `SELECT 
                c.id, c.customer_company_id ,c.customer_name, c.source, 
                c.user_id,c.lead_id, c.address, c.deleted_at, c.is_rejected,
                u.full_name AS created_by 
              FROM 
                customers AS c 
              INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.company_id = '{var1}' AND is_rejected = '{var2}'`,
    "Q53"  : `INSERT INTO sales_commission (id, customer_id, customer_commission_split_id, is_overwrite, company_id, business_contact_id, revenue_contact_id, qualification, is_qualified, target_amount, target_closing_date, sales_type, subscription_plan, recurring_date, currency, user_id, slab_id, lead_id ) VALUES ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}', '{var13}', '{var14}', '{var15}', '{var16}', '{var17}', '{var18}', '{var19}') RETURNING *`,
    "Q54"  : `SELECT 
                sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
                sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
                sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
                c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name as creator_name 
              FROM 
                sales_commission AS sc 
              INNER JOIN 
                sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN 
                users AS u ON u.id = c.closer_id
              INNER JOIN 
                users AS u1 ON u1.id = sc.user_id
              INNER JOIN 
                customers AS cus ON cus.id = sc.customer_id
              WHERE 
                sc.company_id = '{var1}' AND sc.deleted_at IS NULL 
              ORDER BY 
                sc.created_at DESC`,
    "Q55"  : `SELECT * FROM customers WHERE id = '{var1}'`,
    "Q56"  : `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE id ='{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
    "Q57"  : `INSERT INTO sales_supporter(id, commission_split_id ,supporter_id, supporter_percentage, sales_commission_id, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') RETURNING *`,
    "Q58"  : `INSERT INTO sales_closer(id, closer_id, closer_percentage, commission_split_id, sales_commission_id, company_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,
    "Q59"  : `SELECT id, supporter_id, supporter_percentage FROM sales_supporter WHERE sales_commission_id = '{var1}' AND deleted_at IS NULL `,
    "Q60"  : `UPDATE sales_commission SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q61"  : `UPDATE sales_supporter SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' RETURNING * `,
    "Q62"  : `UPDATE sales_closer SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q63"  : `UPDATE sales_commission SET customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_contact_id = '{var7}', revenue_contact_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}', currency = '{var17}', slab_id = '{var18}', lead_id = '{var19}'  WHERE id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q64"  : `UPDATE sales_closer SET closer_id = '{var1}', closer_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}' WHERE sales_commission_id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q65"  : `UPDATE sales_supporter SET deleted_at = '{var3}' WHERE sales_commission_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q66"  : `UPDATE follow_up_notes SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL`,
    "Q67"  : `INSERT INTO revenue_forecast(id, timeline, revenue, growth_window, growth_percentage, start_date, end_date, user_id, company_id, currency)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}') RETURNING * `,
    "Q68"  : `SELECT 
                f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
                f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
                u.full_name AS creator_name  
              FROM 
                revenue_forecast AS f
              INNER JOIN 
                users AS u ON u.id = f.user_id 
              WHERE 
                f.company_id = '{var1}' AND f.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,  
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
              FROM business_contact WHERE id = '{var1}' AND deleted_at is NULL`,  
    "Q77"  : `SELECT id, full_name AS revenue_contact_name, email_address AS revenue_email, phone_number AS revenue_phone_number
              FROM revenue_contact WHERE id = '{var1}' AND deleted_at is NULL`,
    "Q78"  : `SELECT 
                target_amount
              FROM sales_commission 
              WHERE user_id = '{var1}' AND deleted_at IS NULL AND closed_at BETWEEN '{var2}' AND '{var3}' 
              LIMIT {var4} OFFSET {var5}`,
    "Q79"  : `UPDATE customers SET business_contact_id = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q80"  : `UPDATE customers SET revenue_contact_id = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q81"  : `SELECT s.id, s.supporter_id, s.supporter_percentage, u.full_name, u.email_address FROM sales_supporter AS s 
              INNER JOIN users AS u ON u.id = s.supporter_id WHERE s.id ='{var1}' `,
    "Q82"  : `SELECT customer_id, sales_type, subscription_plan, recurring_date FROM sales_commission WHERE deleted_at IS NULL`,
    "Q83"  : `INSERT INTO configurations(id, currency, phone_format, date_format,user_id, company_id ) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
    "Q84"  : `SELECT id,currency,phone_format,date_format,user_id,company_id,created_at
              FROM configurations WHERE company_id = '{var1}' AND deleted_at IS NULL `,
    "Q85"  : `UPDATE configurations SET deleted_at = '{var1}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q86"  : `SELECT cr.closer_id,cr.closer_percentage, u.full_name FROM sales_closer AS cr 
              INNER JOIN users AS u ON u.id = cr.closer_id WHERE sales_commission_id = '{var1}'
              AND cr.deleted_at IS NULL AND u.deleted_at IS NULL`,

    "Q87"  : `SELECT 
                sc.id AS sales_commission_id, 
                SUM(sc.target_amount::DECIMAL) as amount,
                sc.closed_at, sc.slab_id
              FROM
                sales_commission AS sc 
              WHERE 
                sc.company_id = '{var1}' AND 
                sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
              GROUP BY 
                sc.closed_at,
                sc.id,
                sc.slab_id 
              ORDER BY 
              sc.closed_at {var2}`,

    "Q88"  : `SELECT 
                DATE_TRUNC('{var2}',sc.closed_at) AS  date, 
                sum(sc.target_amount::decimal) AS revenue
              FROM 
                sales_commission AS sc 
              INNER JOIN 
                customers AS c ON sc.customer_id = c.id
              WHERE 
                sc.company_id = '{var1}' AND 
                c.deleted_at IS NULL AND 
                sc.deleted_at IS NULL AND 
                sc.closed_at IS NOT NULL 
              GROUP BY 
                DATE_TRUNC('{var2}',sc.closed_at) 
              ORDER BY 
                date ASC 
              LIMIT {var3} OFFSET {var4}`,

    "Q89"  : `SELECT            
                  c.customer_name,
                  SUM(sc.target_amount::DECIMAL) AS revenue
              FROM 
                  sales_commission sc
                  LEFT JOIN customers c ON c.id = sc.customer_id
              WHERE 
                  sc.closed_at is not null AND 
                  sc.company_id = '{var1}' AND 
                  sc.closed_at BETWEEN '{var5}' AND '{var6}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL 
              GROUP BY 
                  c.customer_name 
              ORDER BY 
                  revenue {var2}
              LIMIT {var3} OFFSET {var4}`,

    "Q90"  : `SELECT 
                  u.full_name AS sales_rep,
                  SUM(sc.target_amount::DECIMAL) AS revenue
              FROM  
                  sales_commission AS sc 
                  INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sc.id
                  INNER JOIN users AS u ON u.id = cr.closer_id
                  INNER JOIN customers AS c ON c.id = sc.customer_id
              WHERE 
                  sc.closed_at is not null 
                  AND sc.company_id = '{var1}' 
                  AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
                  AND sc.deleted_at IS NULL AND c.deleted_at IS NULL
                  AND cr.deleted_at IS NULL AND u.deleted_at IS NULL
              GROUP BY 
                  u.full_name 
              ORDER BY 
                  revenue {var2}
              LIMIT {var3} OFFSET {var4}`,

    "Q91"  : `INSERT INTO contact_us(id, full_name, email, subject, messages, address) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
    "Q92"  : `INSERT INTO products(id, product_name,product_image,description,available_quantity,price,end_of_life,company_id, currency, user_id)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}', '{var10}') RETURNING *`,
    "Q93"  : `UPDATE products SET product_name = '{var2}',product_image = '{var3}', description = '{var4}',available_quantity = '{var5}', price = '{var6}', end_of_life = '{var7}', updated_at = '{var8}', currency = '{var10}' WHERE id = '{var1}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
    "Q94"  : `SELECT 
                p.id, p.product_name, p.product_image, p.description, p.available_quantity, p.price, 
                p.end_of_life, p.currency, p.company_id, p.created_at, p.updated_at, p.user_id, u.full_name as created_by 
              FROM 
                products AS p
              INNER JOIN 
                users AS u ON p.user_id = u.id
              WHERE 
                p.company_id = '{var1}' AND p.deleted_at IS NULL
              ORDER BY 
                created_at DESC`,
    "Q95"  : `UPDATE products SET deleted_at = '{var2}' WHERE id = '{var1}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q96"  : `SELECT id, product_name, product_image, description, available_quantity, price, end_of_life, company_id, created_at, updated_at FROM products WHERE id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
    "Q97"  : `INSERT INTO products(id, company_id,user_id, product_name, product_image, description, available_quantity, price, end_of_life, currency) 
              VALUES ('{var1}','{var2}','{var3}',$1,$2,$3,$4,$5,$6,$7)`,
    "Q98"  : `SELECT id, name, email, encrypted_password FROM super_admin WHERE email = '{var1}'`,
    "Q99"  : `SELECT id, company_name, company_logo, company_address, is_imap_enable, is_marketing_enable, created_at, expiry_date, user_count FROM companies WHERE deleted_at IS NULL`,
    "Q100" : `UPDATE super_admin SET encrypted_password = '{var2}' WHERE email = '{var1}'`,
    "Q101" : `SELECT  sc.target_amount,  sc.closed_at ,com.id AS company_id, com.company_name FROM sales_commission AS sc 
              INNER JOIN customers AS c ON sc.customer_id = c.id 
              INNER JOIN companies AS com ON sc.company_id = com.id 
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND c.deleted_at IS NULL Order by sc.closed_at asc`,
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
    "Q110" : `SELECT id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_main_admin, expiry_date FROM users WHERE deleted_at IS NULL`,
    "Q111" : `INSERT INTO superadmin_config(id, trial_days, trial_users) VALUES('{var1}', '{var2}', '{var3}') RETURNING *`,
    "Q112" : `SELECT id, trial_days,trial_users, created_at FROM superadmin_config WHERE deleted_at IS NULL ORDER BY created_at desc ` ,
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
              u.avatar, u.expiry_date, u.is_verified, u.is_admin, u.is_locked, u.is_main_admin, c.company_name, c.company_address, c.company_logo, c.is_imap_enable,c.is_marketing_enable,
              r.id as role_id,r.role_name, r.reporter, r.module_ids, con.id AS config_id, con.currency, con.phone_format, con.date_format
              FROM users AS u 
              INNER JOIN companies AS c ON c.id = u.company_id
              INNER JOIN roles AS r ON r.id = u.role_id 
              INNER JOIN configurations AS con ON con.company_id = u.company_id
              WHERE LOWER(email_address) = LOWER('{var1}') AND u.deleted_at IS NULL 
              AND c.deleted_at IS NULL AND r.deleted_at IS NULL AND con.deleted_at IS NULL`,
    "Q146" : `UPDATE companies SET is_imap_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q147" : `SELECT id, product_name, product_image, description, available_quantity, price, end_of_life, currency, company_id, created_at, updated_at FROM products WHERE product_name = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL ORDER BY created_at desc `,
    "Q148" : `UPDATE revenue_forecast SET closed_date = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND company_id = '{var4}' RETURNING *`,
    "Q149" : `INSERT INTO upgraded_transactions(id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}','{var14}') RETURNING *`, 
    "Q150" : `SELECT id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt FROM upgraded_transactions WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q151" : `UPDATE upgraded_transactions SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
    "Q152" : `SELECT id,country_name,country_value,currency_name,currency_symbol,date_format,created_at FROM country_details WHERE deleted_at IS NULL`,
    "Q153" : `SELECT 
                  SUM(sc.target_amount::DECIMAL) as revenue, 
                  p.product_name
              FROM 
                  sales_commission AS sc 
              INNER JOIN 
                  customers AS c ON sc.customer_id = c.id 
              INNER JOIN 
                  product_in_sales AS ps ON sc.id = ps.sales_commission_id
              INNER JOIN 
                  products AS p ON p.id = ps.product_id
              WHERE 
                  sc.company_id = '{var1}'
                  AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
                  AND sc.deleted_at IS NULL 
                  AND c.deleted_at IS NULL
                  AND sc.closed_at IS NOT NULL
              GROUP BY 
                  p.product_name
              ORDER BY 
                  revenue {var2}
              LIMIT {var3} OFFSET {var4}`,    
    "Q154" : `SELECT COUNT(*) AS actual_count FROM users WHERE company_id = '{var1}' AND deleted_at IS NULL`,
    "Q155" : `INSERT INTO product_in_sales(id,product_id,sales_commission_id, company_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,  
    "Q156" : `UPDATE product_in_sales SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' RETURNING *`,  
    "Q157" : `SELECT ps.product_id AS id, p.product_name AS name FROM product_in_sales AS ps 
              INNER JOIN products as p ON p.id = ps.product_id
              WHERE ps.sales_commission_id = '{var1}' AND ps.deleted_at IS NULL and p.deleted_at IS NULL` ,
    "Q158" : `UPDATE sales_commission_logs SET closed_at = '{var1}', updated_at = '{var2}' WHERE sales_commission_id = '{var3}' RETURNING *`,
    "Q159" : `SELECT sc.id AS sales_commission_id, sc.target_amount as amount,
              sc.closed_at, sc.slab_id FROM sales_commission AS sc WHERE sc.company_id = '{var1}' 
              AND sc.deleted_at IS NULL`,
    "Q160" : `SELECT 
                id, company_name, company_logo, company_address, is_imap_enable, created_at 
              FROM companies 
              WHERE deleted_at IS NULL AND created_at BETWEEN '{var1}' AND '{var2}'`,
    "Q161"  : `SELECT 
                  sc.id AS sales_commission_id, 
                  SUM(sc.target_amount::DECIMAL) as amount,
                  sc.closed_at, sc.slab_id
                FROM
                  sales_commission AS sc 
                WHERE 
                  sc.company_id = '{var1}' AND 
                  sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
                GROUP BY 
                  sc.closed_at,
                  sc.id, sc.slab_id`,
    "Q162" : `SELECT id, closer_percentage, supporter_percentage, deleted_at FROM commission_split WHERE company_id ='{var1}'`,
    "Q163" : `SELECT u.id, u.full_name, r.id as role_id  FROM roles AS r 
              INNER JOIN users AS u ON u.role_id = r.id 
              WHERE reporter = '{var1}' AND r.deleted_at IS NULL`,
    "Q164" : `SELECT * FROM commission_split WHERE user_id = '{var1}' AND deleted_at IS NULL`,
    "Q165" : `SELECT * FROM slabs WHERE user_id ='{var1}' AND deleted_at IS NULL GROUP BY slab_id, id ORDER BY slab_ctr ASC`,
    "Q166" : `SELECT c.id, c.customer_company_id , c.customer_name, c.source, c.user_id, c.business_contact_id, c.revenue_contact_id, c.created_at, c.address, c.currency,
              u.full_name AS created_by FROM customers AS c INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.user_id = '{var1}' AND c.deleted_at IS NULL AND u.deleted_at IS NULL ORDER BY created_at desc`,
    "Q167" : `SELECT 
                sc.id AS sales_commission_id, 
                SUM(sc.target_amount::DECIMAL) as amount,
                sc.closed_at,sc.slab_id
              FROM
                sales_commission AS sc 
              WHERE 
                sc.user_id = '{var1}' AND 
                sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
              GROUP BY 
                sc.closed_at,
                sc.id,
                sc.slab_id 
              ORDER BY 
              sc.closed_at {var2}`,

    "Q168" : `SELECT sc.id AS sales_commission_id, sc.target_amount as amount,
              sc.closed_at,sc.slab_id FROM sales_commission AS sc WHERE sc.user_id = '{var1}' 
              AND sc.deleted_at IS NULL` ,
    "Q169" : `SELECT 
                p.id, p.product_name, p.product_image, p.description, p.available_quantity, p.price, 
                p.end_of_life, p.currency, p.company_id, p.created_at, p.updated_at, p.user_id, u.full_name as created_by 
              FROM 
                products AS p
              INNER JOIN 
                users AS u ON p.user_id = u.id
              WHERE 
                p.user_id = '{var1}' AND p.deleted_at IS NULL
              ORDER BY 
                created_at DESC`,      
    "Q170" : `SELECT            
                  c.customer_name,
                  SUM(sc.target_amount::DECIMAL) AS revenue
              FROM 
                  sales_commission sc
                  LEFT JOIN customers c ON c.id = sc.customer_id
              WHERE 
                  sc.closed_at is not null AND 
                  sc.user_id = '{var1}' AND 
                  sc.closed_at BETWEEN '{var5}' AND '{var6}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL 
              GROUP BY 
                  c.customer_name 
              ORDER BY 
                  revenue {var2}
              LIMIT {var3} OFFSET {var4}`,
    "Q171" : `SELECT 
                  SUM(sc.target_amount::DECIMAL) as revenue, 
                  p.product_name
              FROM 
                  sales_commission AS sc 
              INNER JOIN 
                  customers AS c ON sc.customer_id = c.id 
              INNER JOIN 
                  product_in_sales AS ps ON sc.id = ps.sales_commission_id
              INNER JOIN 
                  products AS p ON p.id = ps.product_id
              WHERE 
                  sc.user_id = '{var1}'
                  AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
                  AND sc.deleted_at IS NULL 
                  AND c.deleted_at IS NULL
                  AND sc.closed_at IS NOT NULL
              GROUP BY 
                  p.product_name
              ORDER BY 
                  revenue {var2}
              LIMIT {var3} OFFSET {var4}`, 
    "Q172" : `SELECT 
                  u.full_name AS sales_rep,
                  SUM(sc.target_amount::DECIMAL) AS revenue
              FROM  
                  sales_commission AS sc 
                  INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sc.id
                  INNER JOIN users AS u ON u.id = cr.closer_id
              WHERE 
                  sc.closed_at is not null 
                  AND sc.user_id = '{var1}' 
                  AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
                  AND sc.deleted_at IS NULL AND cr.deleted_at IS NULL 
                  AND u.deleted_at IS NULL
              GROUP BY 
                  u.full_name 
              ORDER BY 
                  revenue {var2}
              LIMIT {var3} OFFSET {var4}`,
    "Q173"  : `SELECT 
                DATE_TRUNC('{var2}',sc.closed_at) AS  date, 
                sum(sc.target_amount::decimal) AS revenue
              FROM 
                sales_commission AS sc 
              INNER JOIN 
                customers AS c ON sc.customer_id = c.id
              WHERE 
                sc.user_id = '{var1}' AND 
                c.deleted_at IS NULL AND 
                sc.deleted_at IS NULL AND 
                sc.closed_at IS NOT NULL 
              GROUP BY 
                DATE_TRUNC('{var2}',sc.closed_at) 
              ORDER BY 
                date ASC 
              LIMIT {var3} OFFSET {var4}`,
    "Q174" : `SELECT 
                f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
                f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
                u.full_name AS creator_name  
              FROM 
                revenue_forecast AS f
              INNER JOIN 
                users AS u ON u.id = f.user_id 
              WHERE 
                f.user_id = '{var1}' AND f.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,  
    "Q175" : `SELECT * FROM roles WHERE user_id = '{var1}' AND deleted_at IS NULL`,
    "Q176" : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at, is_main_admin, created_by FROM users WHERE created_by = '{var1}' AND deleted_at IS NULL ORDER BY created_at desc`,
    "Q177" : `SELECT c.id, c.customer_company_id ,c.customer_name, c.source, c.user_id, c.address, c.deleted_at,
              u.full_name AS created_by FROM customers AS c INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.user_id = '{var1}'`,
    "Q178" : `SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.user_id = '{var1}' AND sc.deleted_at IS NULL ORDER BY sc.created_at desc`,
    "Q179"  :`SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL and sc.closed_at IS NULL  ORDER BY sc.created_at desc`,
    "Q180"  :`SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL and sc.closed_at IS NOT NULL  ORDER BY sc.created_at desc`,
    "Q181"  :`SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.user_id = '{var1}' AND sc.deleted_at IS NULL AND sc.closed_at IS NULL ORDER BY sc.created_at desc`,
    "Q182"  :`SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date, sc.created_at, sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name FROM sales_commission AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.user_id = '{var1}' AND sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL ORDER BY sc.created_at desc`,
    "Q183"  :`UPDATE slabs SET deleted_at = '{var1}' WHERE slab_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
    "Q184"  :`SELECT * FROM slabs WHERE slab_id ='{var1}' AND deleted_at IS NULL ORDER BY slab_ctr ASC`,
    "Q185"  :`SELECT u.id, u.full_name, r.id as role_id,r.role_name, r.module_ids, r.reporter  FROM roles AS r 
              INNER JOIN users AS u ON u.role_id = r.id 
              WHERE r.id = '{var1}'  AND r.deleted_at IS NULL`,
    "Q186"  : `SELECT 
                  u.full_name AS user,
                  SUM(sc.target_amount::DECIMAL) AS revenue
              FROM  
                  sales_commission AS sc 
                  INNER JOIN users AS u ON u.id = sc.user_id
              WHERE 
                  sc.closed_at is not null 
                  AND sc.user_id = '{var1}' 
                  AND sc.closed_at BETWEEN '{var4}' AND '{var5}'
                  AND sc.deleted_at IS NULL AND u.deleted_at IS NULL
              GROUP BY 
                  u.full_name 
              LIMIT {var2} OFFSET {var3}`,
    "Q187"  :`SELECT * FROM contact_us WHERE deleted_at IS NULL`,
    "Q188"  :`SELECT * from chat where is_group_chat = 'true' AND company_id = '{var1}' AND deleted_at IS NULL`,
    "Q189"  :`SELECT user_id FROM chat_room_members where room_id = '{var1}' AND deleted_at IS NULL`,
    "Q190"  :`SELECT * FROM actual_forecast_data WHERE revenue_forecast_id = '{var1}' and deleted_at IS null`,
    "Q191"  :`INSERT INTO actual_forecast_data(id, revenue_forecast_id, actual_revenue, forecast_revenue, forecast_date)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q192"  :`UPDATE actual_forecast_data SET deleted_at = '{var1}' WHERE revenue_forecast_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q193"  :`SELECT * FROM actual_forecast_data WHERE revenue_forecast_id = '{var1}' and deleted_at IS null AND forecast_date BETWEEN '{var4}' AND '{var5}' LIMIT '{var2}' OFFSET '{var3}'`,
    "Q194"  :`SELECT 
                f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
                f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
                u.full_name AS creator_name  
              FROM 
                revenue_forecast AS f
              INNER JOIN 
                users AS u ON u.id = f.user_id 
              WHERE 
                f.company_id = '{var1}' AND f.deleted_at IS NULL AND closed_date IS NULL
              ORDER BY 
                timeline ASC`, 
    "Q195"  :`SELECT 
                f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
                f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
                u.full_name AS creator_name  
              FROM 
                revenue_forecast AS f
              INNER JOIN 
                users AS u ON u.id = f.user_id 
              WHERE 
                f.company_id = '{var1}' AND f.deleted_at IS NULL AND closed_date IS NOT NULL
              ORDER BY 
                timeline ASC`,
    "Q196"  :`SELECT 
                f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
                f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
                u.full_name AS creator_name  
              FROM 
                revenue_forecast AS f
              INNER JOIN 
                users AS u ON u.id = f.user_id 
              WHERE 
                user_id = '{var1}' AND deleted_at IS NULL AND closed_date IS NULL 
              ORDER BY 
                timeline ASC`,
    "Q197"  :`SELECT 
                f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
                f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
                u.full_name AS creator_name  
              FROM 
                revenue_forecast AS f
              INNER JOIN 
                users AS u ON u.id = f.user_id 
              WHERE 
                user_id = '{var1}' AND deleted_at IS NULL AND closed_date IS NOT NULL 
              ORDER BY 
                timeline ASC`,   
    "Q198"  :`UPDATE revenue_forecast SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' RETURNING *`,
    "Q199"  :`UPDATE revenue_forecast SET timeline = '{var2}', revenue = '{var3}', growth_window = '{var4}', growth_percentage = '{var5}', start_date = '{var6}', end_date = '{var7}', user_id = '{var8}', company_id = '{var9}', currency = '{var10}' WHERE id = '{var1}' and deleted_at is null RETURNING *`,
    "Q200"  :`SELECT 
                target_amount
              FROM sales_commission 
              WHERE company_id = '{var1}' AND deleted_at IS NULL AND closed_at BETWEEN '{var2}' AND '{var3}' `,

    "Q201"  :`INSERT INTO marketing_leads(id,full_name,title,email_address,phone_number,
              address,organization_name,source,linkedin_url,website,targeted_value,industry_type,marketing_qualified_lead,
              assigned_sales_lead_to,additional_marketing_notes,user_id,company_id)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}',
              '{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', '{var15}','{var16}', '{var17}') RETURNING *`,

    "Q202"  :`SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.organization_name,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u.full_name AS user_name,u.role_id, r.role_name, u1.full_name AS creator_name 
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.assigned_sales_lead_to
              INNER JOIN 
                users AS u1 ON u1.id = l.user_id
              INNER JOIN
                roles AS r ON r.id = u.role_id
              INNER JOIN
                lead_sources AS s ON s.id = l.source
              INNER JOIN
                lead_titles AS t ON t.id = l.title
              INNER JOIN
                lead_industries AS i ON i.id = l.industry_type
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`, 

    "Q203"  :`SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.organization_name,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u.full_name AS user_name,u.role_id, r.role_name, u1.full_name AS creator_name 
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.assigned_sales_lead_to
              INNER JOIN 
                users AS u1 ON u1.id = l.user_id
              INNER JOIN
                roles AS r ON r.id = u.role_id
              INNER JOIN
                lead_sources AS s ON s.id = l.source
              INNER JOIN
                lead_titles AS t ON t.id = l.title
              INNER JOIN
                lead_industries AS i ON i.id = l.industry_type
              WHERE 
                (l.user_id = '{var1}' OR l.assigned_sales_lead_to = '{var1}') AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,
    
    "Q204"  :`UPDATE marketing_leads SET full_name = '{var2}', title = '{var3}',email_address = '{var4}',phone_number = '{var5}',
              address = '{var6}', organization_name = '{var7}',source = '{var8}',linkedin_url = '{var9}',website = '{var10}',targeted_value = '{var11}',
              industry_type = '{var12}',marketing_qualified_lead = '{var13}',assigned_sales_lead_to = '{var14}',additional_marketing_notes = '{var15}',
              updated_at = '{var16}' WHERE id = '{var1}' AND deleted_at is null`,
              
    "Q205"  :`UPDATE marketing_leads SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at is null`,
    
    "Q206"  :`SELECT COUNT(*) from marketing_leads WHERE company_id = '{var1}' AND deleted_at IS NULL`,

    "Q207"  :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q208"  :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.user_id = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q209"  :`select distinct(l.id),l.user_id,l.assigned_sales_lead_to, u.full_name as created_by, l.is_rejected, l.is_converted
              FROM 
                marketing_leads AS l 
              left join 
                users u on u.id = l.user_id
              where 
                l.user_id = '{var1}' or l.assigned_sales_lead_to= '{var1}' AND 
                l.deleted_at IS NULL AND u.deleted_at IS NULL
              ORDER BY 
                u.full_name {var4}
              LIMIT {var2} OFFSET {var3}`,
              
    "Q210"  :`INSERT INTO lead_titles(id, title, company_id ) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
    "Q211"  :`UPDATE lead_titles set title = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q212"  :`UPDATE lead_titles set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
    "Q213"  :`SELECT * FROM lead_titles WHERE company_id = '{var1}'`,

    "Q214"  :`INSERT INTO lead_industries(id, industry, company_id ) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
    "Q215"  :`UPDATE lead_industries set industry = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q216"  :`UPDATE lead_industries set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
    "Q217"  :`SELECT * FROM lead_industries WHERE company_id = '{var1}'`,

    "Q218"  :`INSERT INTO lead_sources(id, source, company_id ) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
    "Q219"  :`UPDATE lead_sources set source = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q220"  :`UPDATE lead_sources set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
    "Q221"  :`SELECT * FROM lead_sources WHERE company_id = '{var1}'`,
    "Q222"  :`UPDATE marketing_leads SET is_converted = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q223"  :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.company_id = '{var1}' AND l.is_converted = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q224"  :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.user_id = '{var1}' AND l.is_converted = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q225" :`SELECT * FROM lead_sources WHERE LOWER(source) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
    "Q226" :`SELECT * FROM lead_titles WHERE LOWER(title) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
    "Q227" :`SELECT * FROM lead_industries WHERE LOWER(industry) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
    "Q228" :`SELECT COUNT(*) from marketing_leads WHERE user_id = '{var1}' AND is_converted = true AND deleted_at IS NULL`,
    "Q229" :`SELECT COUNT(*) from marketing_leads WHERE company_id = '{var1}' AND is_converted = true AND deleted_at IS NULL`,
    "Q230" : `UPDATE companies SET is_marketing_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q231" :`UPDATE companies SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q232" :`UPDATE companies SET expiry_date = '{var1}', user_count = '{var2}', updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *`,

    "Q233" :`INSERT INTO marketing_budget(id, budget_year, quarter_one, quarter_two, quarter_three, quarter_four,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}') RETURNING *`,

    "Q234" :`INSERT INTO marketing_budget_description(id, budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,

    "Q235" :`INSERT INTO marketing_budget_description_logs(id,budget_description_id,budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}') RETURNING *`,

    "Q236" :`INSERT INTO marketing_budget_logs(id,budget_id,budget_year, quarter_one, quarter_two, quarter_three, quarter_four,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}') RETURNING *`,
    "Q237" :`SELECT
              b.id, b.budget_year, b.quarter_one, b.quarter_two, b.quarter_three, 
              b.quarter_four, b.is_finalize,b.created_at, b.user_id, d.id as description_id, d.title, d.amount,
              u.full_name AS creator_name 
             FROM 
              marketing_budget AS b
             INNER JOIN 
              marketing_budget_description AS d ON d.budget_id = b.id
             INNER JOIN 
              users AS u ON u.id = b.user_id 
             WHERE b.company_id = '{var1}' AND b.deleted_at IS NULL AND d.deleted_at IS NULL`,
    "Q238" :`UPDATE marketing_budget SET deleted_at = '{var2}' where id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q239" :`UPDATE marketing_budget_description SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q240" :`SELECT
              b.id, b.budget_year, b.quarter_one, b.quarter_two, b.quarter_three, 
              b.quarter_four, b.is_finalize,b.created_at, b.user_id, d.id as description_id, d.title, d.amount,
              u.full_name AS creator_name  
             FROM 
              marketing_budget AS b
             INNER JOIN 
              marketing_budget_description AS d ON d.budget_id = b.id
             INNER JOIN 
              users AS u ON u.id = b.user_id 
             WHERE b.user_id = '{var1}' AND b.deleted_at IS NULL AND d.deleted_at IS NULL`,
    "Q241" :`UPDATE marketing_budget SET budget_year = '{var1}', quarter_one = '{var2}', quarter_two = '{var3}', quarter_three = '{var4}', 
             quarter_four = '{var5}' WHERE id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q242" :`UPDATE marketing_budget_description SET title = '{var1}', amount = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q243" :`SELECT
               b.id, b.budget_year, b.quarter_one, b.quarter_two, b.quarter_three, 
               b.quarter_four, b.is_finalize,b.created_at, b.user_id, d.id as description_id, d.title, d.amount,
               u.full_name AS creator_name 
             FROM 
               marketing_budget_logs AS b
             INNER JOIN 
               marketing_budget_description_logs AS d ON d.budget_id = b.budget_id
             INNER JOIN 
               users AS u ON u.id = b.user_id 
             WHERE b.budget_id = '{var1}' AND b.deleted_at IS NULL AND d.deleted_at IS NULL`,
    "Q244" :`SELECT
              b.id, b.budget_year, b.quarter_one, b.quarter_two, b.quarter_three, 
              b.quarter_four, b.is_finalize,b.created_at, b.user_id, d.id as description_id, d.title, d.amount,
              u.full_name AS creator_name  
            FROM 
              marketing_budget_logs AS b
            INNER JOIN 
              marketing_budget_description_logs AS d ON d.budget_id = b.budget_id
            INNER JOIN 
              users AS u ON u.id = b.user_id 
            WHERE b.user_id = '{var1}' AND b.budget_id = '{var2}' AND b.deleted_at IS NULL AND d.deleted_at IS NULL`,
    "Q245" : `UPDATE marketing_budget_description SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q246" : `UPDATE marketing_budget SET is_finalize = true, updated_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q247" : `SELECT 
                COUNT(*),
                u.full_name AS assigned_to
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.assigned_sales_lead_to
              WHERE 
                l.assigned_sales_lead_to = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q248" :`SELECT COUNT(*) from marketing_leads WHERE assigned_sales_lead_to = '{var1}'  AND deleted_at IS NULL`,
    "Q249" :`UPDATE companies SET company_logo = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q250" :`UPDATE marketing_leads SET is_rejected = '{var2}', reason = '{var3}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`, 
    "Q251" :`UPDATE customers SET is_rejected = '{var2}' WHERE lead_id = '{var1}' AND deleted_at is null RETURNING *`, 
    "Q252" :`SELECT * from sales_commission WHERE lead_id = '{var1}' AND deleted_at IS NULL`,
    "Q253" :`SELECT COUNT(*) from marketing_leads WHERE company_id = '{var1}' AND is_rejected = '{var2}' AND deleted_at IS NULL`,
    "Q254" :`SELECT COUNT(*) from marketing_leads WHERE user_id = '{var1}' AND is_rejected = true AND deleted_at IS NULL`,
    "Q255" :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.company_id = '{var1}' AND l.is_rejected = '{var5}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q256" : `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                marketing_leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.user_id = '{var1}' AND l.is_rejected = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,

    "Q257" : `SELECT 
                u.full_name AS sales_rep, 
                SUM(sc.target_amount::DECIMAL) as amount,
                sc.closed_at, sc.slab_id
              FROM
                sales_commission AS sc 
              INNER JOIN 
                sales_closer AS cr ON cr.sales_commission_id = sc.id
              INNER JOIN 
                users AS u ON u.id = cr.closer_id
              INNER JOIN 
                customers AS c ON c.id = sc.customer_id
              WHERE 
                sc.closed_at is not null 
                AND sc.company_id = '{var1}'
                AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
                AND sc.deleted_at IS NULL AND c.deleted_at IS NULL
                AND cr.deleted_at IS NULL AND u.deleted_at IS NULL
              GROUP BY 
                sc.closed_at,
                u.full_name,
                sc.slab_id 
              ORDER BY 
              sc.closed_at {var2}`,
     "Q258" : `SELECT 
                  u.full_name AS sales_rep,
                  SUM(sc.target_amount::DECIMAL) as amount,
                    sc.closed_at,sc.slab_id
              FROM  
                  sales_commission AS sc 
              INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sc.id
              INNER JOIN users AS u ON u.id = cr.closer_id
              WHERE 
                  sc.closed_at is not null 
                  AND sc.user_id = '{var1}' 
                  AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
                  AND sc.deleted_at IS NULL AND cr.deleted_at IS NULL 
                  AND u.deleted_at IS NULL
              GROUP BY 
                  u.full_name,
                  sc.closed_at, 
                  sc.slab_id 
              ORDER BY 
                  amount {var2}
              LIMIT {var3} OFFSET {var4}`,
    "Q259" : `SELECT * from sales_commission WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
    "Q260" : `SELECT * from product_in_sales WHERE product_id = '{var1}' AND deleted_at IS NULL`                    
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