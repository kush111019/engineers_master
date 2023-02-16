
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
    "Q8"   : `SELECT id, full_name,company_id, email_address,mobile_number,phone_number,address,role_id, avatar,expiry_date, is_verified, is_admin, is_locked, created_by,is_main_admin, created_at, deleted_at, session_time FROM users WHERE id = '{var1}' and deleted_at IS NULL` ,
    "Q9"   : `SELECT * FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q10"  : `UPDATE users SET full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' WHERE id = '{var8}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `, 
    "Q11"  : `INSERT INTO roles(id,role_name,reporter,company_id) VALUES('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q12"  : `SELECT * FROM roles WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q13"  : `INSERT INTO roles(id,role_name,reporter,company_id,user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`, 
    "Q14"  : `SELECT * FROM roles WHERE company_id = '{var1}' AND deleted_at IS NULL` ,
    "Q15"  : `SELECT 
                u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                u1.is_main_admin, u1.created_by, u2.full_name AS creator_name , r.role_name AS roleName
              FROM 
                users AS u1 
              INNER JOIN 
                users AS u2 ON u2.id = u1.created_by  
              INNER JOIN 
                roles as r on r.id = u1.role_id
              WHERE 
                u1.company_id = '{var1}' AND u1.deleted_at IS NULL 
              ORDER BY 
                created_at DESC`,
    "Q16"  : `SELECT * FROM roles WHERE reporter = '{var1}' AND deleted_at IS NULL`,
    "Q17"  : `SELECT
                s.slab_id, s.slab_name, s.commission_split_id, c.closer_percentage,c.supporter_percentage,
                (
                  SELECT json_agg(slabs.*)
                  FROM slabs 
                  WHERE s.slab_id = slabs.slab_id AND slabs.deleted_at IS NULL
                ) AS slabs
              FROM
                slabs AS s
              LEFT JOIN  
                commission_split AS c ON c.id = s.commission_split_id
              WHERE
                s.company_id ='{var1}' AND s.deleted_at IS NULL
              GROUP BY
                s.slab_id, s.id,c.closer_percentage,c.supporter_percentage `,
    "Q18"  : `INSERT INTO slabs(id,min_amount, max_amount, percentage, is_max, company_id, currency, slab_ctr, user_id, slab_id, slab_name, commission_split_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}','{var12}') RETURNING * `,
    "Q19"  : `UPDATE slabs SET slab_name = '{var1}', min_amount = '{var2}', max_amount = '{var3}', percentage = '{var4}', is_max = '{var5}', company_id = '{var6}',currency = '{var7}', slab_ctr = '{var8}', user_id = '{var9}', updated_at = '{var12}', commission_split_id = '{var13}' WHERE id = '{var10}' AND slab_id = '{var11}' AND deleted_at IS NULL RETURNING *`,
    "Q20"  : `INSERT INTO permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view_global,permission_to_view_own, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}') RETURNING *`,
    "Q21"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id FROM users WHERE role_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL `,
    "Q22"  : `UPDATE users SET email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}', is_admin = '{var10}' WHERE id = '{var6}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
    "Q23"  : `UPDATE users SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q24"  :  `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at, deleted_at,is_locked FROM users WHERE company_id = '{var1}' ORDER BY created_at desc`,
    "Q25"  : `UPDATE roles SET role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' WHERE id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
    "Q26"  : `update permissions SET permission_to_create= '{var1}', permission_to_view_global = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}', permission_to_view_own = '{var8}' WHERE role_id = '{var5}' AND module_id = '{var7}' AND deleted_at IS NULL `,
    "Q27"  : `UPDATE roles SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q28"  : `UPDATE permissions SET deleted_at = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING * `,
    "Q29"  : `UPDATE slabs SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
    "Q30"  : `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND is_main_admin = false AND deleted_at IS NULL RETURNING * `,
    "Q31"  : `INSERT INTO follow_up_notes (id, sales_commission_id, company_id, user_id, notes) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q32"  : `SELECT f.id, f.notes, f.created_at, f.user_id, u.full_name, u.avatar 
              FROM follow_up_notes as f
              INNER JOIN users AS u ON u.id = f.user_id
              WHERE sales_commission_id = '{var1}' AND f.deleted_at IS NULL ORDER BY created_at DESC`,
    "Q33"  : `UPDATE permissions SET user_id = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q34"  : `UPDATE roles SET module_ids = '{var1}' , updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
    "Q35"  : `SELECT m.module_name, p.permission_to_view_global,p.permission_to_view_own, p.permission_to_create, 
              p.permission_to_update, p.permission_to_delete FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN roles AS r ON r.id = p.role_id WHERE m.id = '{var1}' AND r.id = '{var2}' 
              AND m.deleted_at IS NULL AND p.deleted_at IS NULL`,
    "Q36"  : `INSERT INTO customers(id, user_id,customer_name, source, company_id, address, currency, industry) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}', '{var8}') RETURNING *`,
    "Q37"  : `INSERT INTO lead_organizations(id, organization_name, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
    "Q38"  : `SELECT id, organization_name FROM lead_organizations WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q39"  : `SELECT 
                cus.id, cus.customer_name, cus.source, 
                cus.user_id, cus.industry,
                cus.created_at, cus.address, cus.currency,
                u.full_name AS created_by,
                (
                  SELECT json_agg(leads.*)
                  FROM (
                    SELECT 
                      leads.id,leads.full_name, leads.title as title_id, leads.email_address,
                      leads.phone_number,leads.address, leads.source as source_id,
                      leads.linkedin_url,leads.website, leads.targeted_value,leads.industry_type as industry_id,
                      leads.assigned_sales_lead_to,leads.additional_marketing_notes,leads.user_id as creator_id,
                      leads.reason, leads.created_at, leads.updated_at, 
                      leads.marketing_qualified_lead, leads.is_rejected, leads.customer_id,
                      u1.full_name as created_by,s.source,t.title,i.industry,c.customer_name
                    FROM leads 
                    LEFT JOIN users AS u1 ON u1.id = leads.user_id
                    LEFT JOIN lead_sources AS s ON s.id = leads.source
                    LEFT JOIN lead_titles AS t ON t.id = leads.title
                    LEFT JOIN lead_industries AS i ON i.id = leads.industry_type
                    LEFT JOIN customers as c ON c.id = leads.customer_id
                    WHERE leads.customer_id = cus.id
                      AND leads.is_rejected = false AND u1.deleted_at IS NULL  
                      AND leads.deleted_at IS NULL
                  ) leads
                ) as lead_data,
                (
                  SELECT json_agg(business_contact.*)
                  FROM business_contact
                  WHERE business_contact.customer_id = cus.id 
                    AND business_contact.deleted_at IS NULL
                ) AS business_contacts,
                (
                  SELECT json_agg(revenue_contact.*)
                  FROM revenue_contact
                  WHERE revenue_contact.customer_id = cus.id 
                    AND revenue_contact.deleted_at IS NULL
                ) AS revenue_contacts
              FROM 
                customers AS cus 
              INNER JOIN 
                users AS u ON u.id = cus.user_id
              WHERE 
                cus.company_id = '{var1}' AND cus.deleted_at IS NULL AND 
                u.deleted_at IS NULL 
              ORDER BY 
                created_at desc`,
    "Q40"  : `UPDATE sales SET closed_at = '{var1}', updated_at = '{var2}', contract = '{var4}' WHERE id = '{var3}' RETURNING *`,
    "Q41"  : `SELECT u.id, u.company_id, u.role_id, u.avatar, u.full_name,u.email_address,u.mobile_number,u.phone_number,u.address,u.is_verified,u.created_by,
              m.id AS module_id, m.module_name, m.module_type, p.id AS permission_id, p.permission_to_view_global, p.permission_to_view_own,
              p.permission_to_create, p.permission_to_update, p.permission_to_delete
              FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN users AS u ON u.role_id = p.role_id
              WHERE m.module_name = '{var1}' AND u.id = '{var2}' AND m.deleted_at IS NULL 
              AND p.deleted_at IS NULL AND u.deleted_at IS NULL`,   
    "Q42"  : `UPDATE customers SET customer_name = '{var1}', source = '{var2}', updated_at = '{var3}', address = '{var4}', currency = '{var5}', industry = '{var8}' WHERE id = '{var6}' AND company_id = '{var7}' AND deleted_at IS NULL RETURNING *`,
    "Q43"  : `INSERT INTO sales_logs(id,sales_commission_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_contact_id, business_contact_id,closer_id, supporter_id, sales_type, subscription_plan, recurring_date, currency, slab_id, closer_percentage) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}', '{var19}', '{var20}', '{var21}' ) RETURNING *`,
    "Q44"  : `SELECT sl.id, sl.sales_commission_id, sl.customer_commission_split_id, sl.qualification, sl.is_qualified, sl.target_amount, sl.currency, 
              sl.products, sl.target_closing_date, sl.customer_id, sl.is_overwrite, sl.company_id, sl.revenue_contact_id, sl.business_contact_id, sl.closer_id, 
              sl.supporter_id, sl.sales_type, sl.subscription_plan, sl.recurring_date, sl.created_at,sl.closed_at, u.full_name AS closer_name, c.customer_name, sl.closer_percentage
              FROM sales_logs AS sl INNER JOIN users AS u ON u.id = sl.closer_id
              INNER JOIN customers AS c ON c.id = sl.customer_id
              INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sl.sales_commission_id
              WHERE sl.sales_commission_id = '{var1}' AND sl.deleted_at IS NULL ORDER BY sl.created_at desc`,
    "Q45"  : `INSERT INTO users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_admin,is_verified,created_by) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}',false,'{var11}') RETURNING *`, 
    "Q46"  : `SELECT id, organization_name FROM lead_organizations WHERE company_id = '{var1}' AND replace(organization_name, ' ', '') ILIKE '%{var2}%' AND deleted_at IS NULL`, 
    "Q47"  : `UPDATE customers SET  deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q48"  : `INSERT INTO commission_split(id, closer_percentage,  supporter_percentage, company_id, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING * `,
    "Q49"  : `UPDATE commission_split SET closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  WHERE  id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
    "Q50"  : `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE company_id ='{var1}' AND deleted_at IS NULL`,
    "Q51"  : `UPDATE commission_split SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}'  AND deleted_at IS NULL RETURNING *`,
    "Q52"  : `SELECT 
                c.id, c.organization_id ,c.customer_name, c.source, 
                c.user_id,c.lead_id, c.address, c.deleted_at, c.is_rejected,
                c.business_contact_id, c.revenue_contact_id ,
                u.full_name AS created_by 
              FROM 
                customers AS c 
              INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.company_id = '{var1}' AND c.is_rejected = '{var2}'`,
    "Q53"  : `INSERT INTO sales (id, customer_id, customer_commission_split_id, is_overwrite, company_id, business_contact_id, revenue_contact_id, qualification, is_qualified, target_amount, target_closing_date, sales_type, subscription_plan, recurring_date, currency, user_id, slab_id, lead_id ,booking_commission) VALUES ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}', '{var13}', '{var14}', '{var15}', '{var16}', '{var17}', '{var18}', '{var19}','{var20}') RETURNING *`,
    "Q54"  : `SELECT
                sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,sc.business_contact_id,
                sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
                sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
                c.closer_id, c.closer_percentage, 
                u.full_name as closer_name, u.email_address as closer_email, 
                cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
                sc.transfered_back_by as transfered_back_by_id ,
                bc.id as business_contact_id ,bc.full_name as business_contact_name, bc.email_address as business_contact_email,
                rc.id as revenue_contact_id ,rc.full_name as revenue_contact_name, rc.email_address as revenue_contact_email,
                slab.slab_name,
                u2.full_name as tranfer_back_by_name,
                (
                  SELECT json_agg(leads.*)
                  FROM (
                    SELECT 
                      leads.id,leads.full_name, leads.title as title_id, leads.email_address,
                      leads.phone_number,leads.address, leads.source as source_id,
                      leads.linkedin_url,leads.website, leads.targeted_value,leads.industry_type as industry_id,
                      leads.assigned_sales_lead_to,leads.additional_marketing_notes,leads.user_id as creator_id,
                      leads.reason, leads.created_at, leads.updated_at, 
                      leads.marketing_qualified_lead, leads.is_rejected, leads.customer_id,
                      u1.full_name as created_by,s.source,t.title,i.industry,c.customer_name
                    FROM leads 
                    LEFT JOIN users AS u1 ON u1.id = leads.user_id
                    LEFT JOIN lead_sources AS s ON s.id = leads.source
                    LEFT JOIN lead_titles AS t ON t.id = leads.title
                    LEFT JOIN lead_industries AS i ON i.id = leads.industry_type
                    LEFT JOIN customers as c ON c.id = leads.customer_id
                    WHERE leads.customer_id = sc.customer_id
                      AND leads.is_rejected = false AND u1.deleted_at IS NULL  
                      AND leads.deleted_at IS NULL
                  ) leads
                ) as lead_data,
                (
                  SELECT json_agg(sales_supporter.*)
                  FROM (
                    SELECT 
                    ss.supporter_id as id ,ss.supporter_percentage as percentage ,u1.full_name as name,u1.email_address as email
                    FROM sales_supporter as ss
                    LEFT JOIN users AS u1 ON u1.id = ss.supporter_id
                    WHERE ss.sales_commission_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
                  ) sales_supporter
                ) as supporters,
                (
                  SELECT json_agg(product_in_sales.*)
                  FROM (
                    SELECT 
                      p.id ,p.product_name as name
                    FROM product_in_sales as pis
                    LEFT JOIN products AS p ON p.id = pis.product_id
                    WHERE sc.id= pis.sales_commission_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
                  ) product_in_sales
                ) as products
            FROM
              sales AS sc
            LEFT JOIN
              sales_closer AS c ON sc.id = c.sales_commission_id
            LEFT JOIN
              users AS u ON u.id = c.closer_id
            LEFT JOIN
              users AS u1 ON u1.id = sc.user_id
            LEFT JOIN
              customers AS cus ON cus.id = sc.customer_id
            LEFT JOIN
              business_contact AS bc ON bc.id = sc.business_contact_id
            LEFT JOIN
              revenue_contact AS rc ON rc.id = sc.revenue_contact_id
            LEFT JOIN
              products AS p ON p.id = sc.revenue_contact_id
            LEFT JOIN
              slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN
              users AS u2 ON u2.id = sc.transfered_back_by
            WHERE
              sc.company_id = '{var1}' AND sc.deleted_at IS NULL
            ORDER BY
              sc.created_at DESC`,
    "Q55"  : `SELECT * FROM customers WHERE id = '{var1}'`,
    "Q56"  : `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE id ='{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
    "Q57"  : `INSERT INTO sales_supporter(id, commission_split_id ,supporter_id, supporter_percentage, sales_commission_id, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') RETURNING *`,
    "Q58"  : `INSERT INTO sales_closer(id, closer_id, closer_percentage, commission_split_id, sales_commission_id, company_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,
    "Q59"  : `SELECT id, supporter_id, supporter_percentage FROM sales_supporter WHERE sales_commission_id = '{var1}' AND deleted_at IS NULL `,
    "Q60"  : `UPDATE sales SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q61"  : `UPDATE sales_supporter SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' RETURNING * `,
    //"Q62"  : `UPDATE sales_closer SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
    "Q63"  : `UPDATE sales SET customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_contact_id = '{var7}', revenue_contact_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}', currency = '{var17}', slab_id = '{var18}', lead_id = '{var19}', booking_commission= '{var20}'  WHERE id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q64"  : `UPDATE sales_closer SET closer_id = '{var1}', closer_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}' WHERE sales_commission_id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    //"Q65"  : `UPDATE sales_supporter SET deleted_at = '{var3}' WHERE sales_commission_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q66"  : `UPDATE follow_up_notes SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL`,
    "Q67"  : `INSERT INTO forecast(timeline, amount, start_date,end_date,pid, assigned_to, created_by)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}') RETURNING * `,
    "Q68"  : `SELECT 
                f.id, f.timeline, f.amount, f.start_date, f.pid,
                f.end_date, f.created_by,f.created_at, f.assigned_to,
                u1.full_name as creator_name, u2.full_name as assigned_name, 
                (
                  SELECT json_agg(forecast_data.*)
                    from forecast_data
                    where forecast_data.forecast_id::uuid = f.id AND forecast_data.deleted_at IS NULL
                ) as forecast_data,
				        (
                  SELECT json_agg(forecast) 
                    from forecast
                    where forecast.pid::varchar = f.id::varchar AND forecast.deleted_at IS NULL
                ) as assigned_forecast
              FROM 
                forecast AS f
              LEFT JOIN users as u1 on u1.id::uuid	 = f.created_by::uuid	
              LEFT JOIN users as u2 on u2.id::uuid	 = f.assigned_to::uuid
              WHERE 
                (f.assigned_to = '{var1}') AND f.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,  
    //"Q69"  : `SELECT * FROM revenue_forecast WHERE id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL  ` ,            
    "Q70"  : `INSERT INTO business_contact(id, full_name, email_address, phone_number, customer_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q71"  : `INSERT INTO revenue_contact(id, full_name, email_address, phone_number, customer_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    "Q72"  : `UPDATE business_contact SET full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q73"  : `UPDATE revenue_contact SET full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q74"  : `SELECT id, full_name AS business_contact_name, email_address AS business_email, phone_number AS business_phone_number
              FROM business_contact WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
    "Q75"  : `SELECT id, full_name AS revenue_contact_name, email_address AS revenue_email, phone_number AS revenue_phone_number
              FROM revenue_contact WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
    "Q76"  : `SELECT id, full_name AS business_contact_name, email_address AS business_email, phone_number AS business_phone_number
              FROM business_contact WHERE id = '{var1}' AND deleted_at is NULL`,  
    "Q77"  : `SELECT id, full_name AS revenue_contact_name, email_address AS revenue_email, phone_number AS revenue_phone_number
              FROM revenue_contact WHERE id = '{var1}' AND deleted_at is NULL`,
    // "Q78"  : `SELECT 
    //             id as sales_commission_id, sales_type
    //           FROM sales 
    //           WHERE user_id = '{var1}' AND deleted_at IS NULL AND closed_at BETWEEN '{var2}' AND '{var3}' 
    //           LIMIT {var4} OFFSET {var5}`,
    "Q79"  : `UPDATE customers SET business_contact_id = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q80"  : `UPDATE customers SET revenue_contact_id = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q81"  : `SELECT s.id, s.supporter_id, s.supporter_percentage, u.full_name, u.email_address FROM sales_supporter AS s 
              INNER JOIN users AS u ON u.id = s.supporter_id WHERE s.id ='{var1}' `,
    //"Q82"  : `SELECT customer_id, sales_type, subscription_plan, recurring_date FROM sales WHERE deleted_at IS NULL`,
    "Q83"  : `INSERT INTO configurations(id, currency, phone_format, date_format,user_id, company_id ) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
    "Q84"  : `SELECT id,currency,phone_format,date_format,user_id,company_id,created_at
              FROM configurations WHERE company_id = '{var1}' AND deleted_at IS NULL `,
    "Q85"  : `UPDATE configurations SET deleted_at = '{var1}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q86"  : `SELECT cr.closer_id,cr.closer_percentage, u.full_name FROM sales_closer AS cr 
              INNER JOIN users AS u ON u.id = cr.closer_id WHERE sales_commission_id = '{var1}'
              AND cr.deleted_at IS NULL AND u.deleted_at IS NULL`,

    "Q87"  : `SELECT sc.id AS sales_commission_id, 
               sc.closed_at,
               booking_commission, 
               revenue_commission from 
               sales as sc 
              LEFT JOIN sales_closer as scl
                on sc.id=scl.sales_commission_id
              LEFT JOIN sales_supporter as ss
                on sc.id=ss.sales_commission_id
              WHERE (
                ss.supporter_id in ({var5}) OR 
                scl.closer_id in ({var5}) OR 
                sc.user_id in ({var5})
            
              ) AND sc.company_id = '{var1}' AND 
                    sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                    sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
             GROUP BY 
                    sc.closed_at,
                    sc.id,
                    sc.booking_commission,
                     sc.revenue_commission
             ORDER BY 
                  sc.closed_at {var2}`,

    "Q88"  : `SELECT 
                sc.id AS sales_commission_id,
                DATE_TRUNC('{var2}',sc.closed_at) AS  date,
                sc.sales_type
              FROM 
                sales AS sc 
              WHERE 
                sc.company_id = '{var1}' AND 
                sc.deleted_at IS NULL AND 
                sc.closed_at IS NOT NULL 
              ORDER BY 
                date ASC `,

    "Q89"  : `SELECT            
                  c.customer_name,
                  sc.id AS sales_commission_id,
                  sc.sales_type
              FROM 
                  sales sc
                  LEFT JOIN customers c ON c.id = sc.customer_id
              WHERE 
                  sc.closed_at is not null AND 
                  sc.company_id = '{var1}' AND 
                  sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL`,

    "Q90"  : `SELECT 
                  u.full_name AS sales_rep,
                  SUM(sc.target_amount::DECIMAL) AS revenue
              FROM  
                  sales AS sc 
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
    "Q99"  : `SELECT id, company_name, company_logo, company_address, is_imap_enable,is_locked, is_marketing_enable, created_at, expiry_date, user_count FROM companies WHERE deleted_at IS NULL`,
    "Q100" : `UPDATE super_admin SET encrypted_password = '{var2}' WHERE email = '{var1}'`,
    // "Q101" : `SELECT  sc.target_amount,  sc.closed_at ,com.id AS company_id, com.company_name FROM sales AS sc 
    //           INNER JOIN customers AS c ON sc.customer_id = c.id 
    //           INNER JOIN companies AS com ON sc.company_id = com.id 
    //           WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND c.deleted_at IS NULL Order by sc.closed_at asc`,
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
    //"Q117" : `UPDATE transactions SET stripe_charge_id = '{var1}', payment_receipt = '{var4}', immediate_upgrade = '', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
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
    "Q126" : `SELECT sc.id,c.closer_id,sc.customer_id, u.full_name, cc.user_id AS creator_id FROM sales AS sc 
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
              INNER JOIN customers AS c ON c.id = b.customer_id
              INNER JOIN revenue_contact AS r ON b.customer_id = r.customer_id
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
    //"Q148" : `UPDATE revenue_forecast SET closed_date = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND company_id = '{var4}' RETURNING *`,
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
                  DISTINCT(sc.id) AS sales_commission_id,
                  sc.sales_type, 
                  p.product_name
              FROM 
                  sales AS sc 
              LEFT JOIN 
                  customers AS c ON sc.customer_id = c.id 
              LEFT JOIN 
                  product_in_sales AS ps ON sc.id = ps.sales_commission_id
              LEFT JOIN 
                  products AS p ON p.id = ps.product_id
              WHERE 
                  sc.company_id = '{var1}'
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
                  AND sc.deleted_at IS NULL 
                  AND c.deleted_at IS NULL
                  AND sc.closed_at IS NOT NULL`,  

    "Q154" : `SELECT COUNT(*) AS actual_count FROM users WHERE company_id = '{var1}' AND deleted_at IS NULL`,
    "Q155" : `INSERT INTO product_in_sales(id,product_id,sales_commission_id, company_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,  
    "Q156" : `UPDATE product_in_sales SET deleted_at = '{var1}' WHERE sales_commission_id = '{var2}' AND company_id = '{var3}' RETURNING *`,  
    "Q157" : `SELECT ps.product_id AS id, p.product_name AS name FROM product_in_sales AS ps 
              INNER JOIN products as p ON p.id = ps.product_id
              WHERE ps.sales_commission_id = '{var1}' AND ps.deleted_at IS NULL and p.deleted_at IS NULL` ,
    "Q158" : `UPDATE sales_logs SET closed_at = '{var1}', updated_at = '{var2}' WHERE sales_commission_id = '{var3}' RETURNING *`,
    "Q159" : `SELECT sc.id AS sales_commission_id, sc.target_amount as amount, sc.target_closing_date,
              sc.closed_at, sc.slab_id,sc.sales_type FROM sales AS sc WHERE sc.company_id = '{var1}' 
              AND sc.deleted_at IS NULL`,
    "Q160" : `SELECT 
                id, company_name, company_logo, company_address, is_imap_enable, created_at, is_locked 
              FROM companies 
              WHERE deleted_at IS NULL AND created_at BETWEEN '{var1}' AND '{var2}' AND is_locked = false`,
    "Q161"  : `SELECT 
                  sc.id AS sales_commission_id, 
                  SUM(sc.target_amount::DECIMAL) as amount,
                  sc.closed_at, sc.slab_id
                FROM
                  sales AS sc 
                WHERE 
                  sc.company_id = '{var1}' AND 
                  sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
                GROUP BY 
                  sc.closed_at,
                  sc.id, sc.slab_id`,
    "Q162" : `SELECT id, closer_percentage, supporter_percentage, deleted_at FROM commission_split WHERE company_id ='{var1}'`,
    // "Q163" : `SELECT u.id, u.full_name, r.id as role_id  FROM roles AS r 
    //           INNER JOIN users AS u ON u.role_id = r.id 
    //           WHERE reporter = '{var1}' AND r.deleted_at IS NULL`,
   // "Q164" : `SELECT * FROM commission_split WHERE user_id = '{var1}' AND deleted_at IS NULL`,
    "Q165" : `SELECT
                s.slab_id, s.slab_name, s.commission_split_id, c.closer_percentage,c.supporter_percentage,
                (
                  SELECT json_agg(slabs.*)
                  FROM slabs 
                  WHERE s.slab_id = slabs.slab_id AND slabs.deleted_at IS NULL
                ) AS slabs
              FROM
                slabs AS s
              LEFT JOIN  
                commission_split AS c ON c.id = s.commission_split_id
              WHERE
                s.user_id IN ({var1}) AND s.deleted_at IS NULL
              GROUP BY
                s.slab_id, s.id,c.closer_percentage,c.supporter_percentage`,
    // "Q166" : `SELECT c.id, c.organization_id , c.customer_name, c.source, c.user_id, c.business_contact_id, c.revenue_contact_id, c.created_at, c.address, c.currency,
    //           u.full_name AS created_by FROM customers AS c INNER JOIN users AS u ON u.id = c.user_id
    //           WHERE c.user_id IN '{var1}' AND c.is_rejected = false AND c.is_qualified = true AND c.deleted_at IS NULL AND u.deleted_at IS NULL ORDER BY created_at desc`,
    "Q167" : `SELECT 
                sc.id AS sales_commission_id,
                sc.closed_at,
                sc.booking_commission,
                sc.revenue_commission
              FROM
                sales AS sc 
              LEFT JOIN 
                sales_closer AS c ON sc.id = c.sales_commission_id  
              LEFT JOIN 
                sales_supporter AS s ON sc.id = s.sales_commission_id  
              WHERE 
                (sc.user_id IN ({var1}) OR c.closer_id IN ({var1}) OR s.supporter_id IN ({var1})) 
                AND sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
              GROUP BY 
                sc.closed_at,
                sc.id,
                sc.booking_commission,
                sc.revenue_commission
              ORDER BY 
              sc.closed_at {var2}`,

    // "Q168" : `SELECT 
    //           sc.id AS sales_commission_id, sc.target_amount as amount, 
    //           sc.closed_at, sc.slab_id, sc.sales_type 
    //           FROM 
    //             sales AS sc 
    //           INNER JOIN 
    //             sales_closer AS c ON sc.id = c.sales_commission_id
    //           INNER JOIN 
    //             sales_supporter AS s ON sc.id = s.sales_commission_id
    //           WHERE 
    //             sc.user_id IN ({var1}) OR c.closer_id IN ({var1}) OR s.supporter_id IN ({var1})
    //           AND sc.deleted_at IS NULL
    //           GROUP BY
    //             sc.id ,
    //             sc.target_amount,
    //             sc.closed_at,
    //             sc.slab_id,
    //             sc.sales_type `,
                
    // "Q169" : `SELECT 
    //             p.id, p.product_name, p.product_image, p.description, p.available_quantity, p.price, 
    //             p.end_of_life, p.currency, p.company_id, p.created_at, p.updated_at, p.user_id, u.full_name as created_by 
    //           FROM 
    //             products AS p
    //           INNER JOIN 
    //             users AS u ON p.user_id = u.id
    //           WHERE 
    //             p.user_id = '{var1}' AND p.deleted_at IS NULL
    //           ORDER BY 
    //             created_at DESC`, 

    "Q170" : `SELECT            
                  DISTINCT(sc.id) AS sales_commission_id,
                  c.customer_name,
                  sc.sales_type
              FROM 
                  sales sc
              LEFT JOIN customers c ON c.id = sc.customer_id
              LEFT JOIN 
                sales_closer AS cl ON sc.id = cl.sales_commission_id  
              LEFT JOIN 
                sales_supporter AS s ON sc.id = s.sales_commission_id 
              WHERE 
                  sc.closed_at is not null AND 
                  (sc.user_id IN ({var1}) OR cl.closer_id IN ({var1}) OR s.supporter_id IN ({var1}))
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL `,
    "Q171" : `SELECT 
                  DISTINCT(sc.id) AS sales_commission_id, 
                  p.product_name,
                  sc.sales_type
              FROM 
                  sales AS sc 
              LEFT JOIN 
                  product_in_sales AS ps ON sc.id = ps.sales_commission_id
              LEFT JOIN 
                  products AS p ON p.id = ps.product_id
              LEFT JOIN 
                sales_closer AS cl ON sc.id = cl.sales_commission_id  
              LEFT JOIN 
                sales_supporter AS s ON sc.id = s.sales_commission_id 
              WHERE 
                  (sc.user_id IN ({var1}) OR cl.closer_id IN ({var1}) OR s.supporter_id IN ({var1}))
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
                  AND sc.deleted_at IS NULL 
                  AND sc.closed_at IS NOT NULL`, 
    // "Q172" : `SELECT 
    //               u.full_name AS sales_rep,
    //               SUM(sc.target_amount::DECIMAL) AS revenue
    //           FROM  
    //               sales AS sc 
    //               INNER JOIN sales_closer AS cr ON cr.sales_commission_id = sc.id
    //               INNER JOIN users AS u ON u.id = cr.closer_id
    //           WHERE 
    //               sc.closed_at is not null 
    //               AND sc.user_id = '{var1}' 
    //               AND sc.closed_at BETWEEN '{var5}' AND '{var6}'
    //               AND sc.deleted_at IS NULL AND cr.deleted_at IS NULL 
    //               AND u.deleted_at IS NULL
    //           GROUP BY 
    //               u.full_name 
    //           ORDER BY 
    //               revenue {var2}
    //           LIMIT {var3} OFFSET {var4}`,
    "Q173"  : `SELECT 
                DISTINCT(sc.id) AS sales_commission_id,
                DATE_TRUNC('{var2}',sc.closed_at) AS  date,
                sc.sales_type
              FROM 
                sales AS sc 
              LEFT JOIN 
                sales_closer AS cl ON sc.id = cl.sales_commission_id  
              LEFT JOIN 
                sales_supporter AS s ON sc.id = s.sales_commission_id 
              WHERE 
              (sc.user_id IN ({var1}) OR cl.closer_id IN ({var1}) OR s.supporter_id IN ({var1})) AND
                sc.deleted_at IS NULL AND 
                sc.closed_at IS NOT NULL 
              ORDER BY 
                date ASC `,
    "Q174" : `SELECT 
                f.id, f.timeline, f.amount, f.start_date, f.pid,
                f.end_date, f.created_by,f.created_at, f.assigned_to,
                u1.full_name as creator_name, u2.full_name as assigned_name, 
                (
                  SELECT json_agg(forecast_data.*)
                    from forecast_data
                    where forecast_data.forecast_id::uuid = f.id
                ) as forecast_data,
                (
                  SELECT json_agg(forecast) 
                    from forecast
                    where forecast.pid::varchar = f.id::varchar
                ) as assigned_forecast
              FROM 
                forecast AS f
              LEFT JOIN users as u1 on u1.id::uuid	 = f.created_by::uuid	
              LEFT JOIN users as u2 on u2.id::uuid	 = f.assigned_to::uuid
              WHERE 
                f.assigned_to::varchar IN ({var1}) AND f.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,  
    // "Q175" : `SELECT * FROM roles WHERE user_id = '{var1}' AND deleted_at IS NULL`,
    "Q176" : `SELECT 
                u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                u1.is_main_admin, u1.created_by, u2.full_name AS creator_name 
              FROM 
                users AS u1 
              INNER JOIN 
                users AS u2 ON u2.id = u1.created_by  
              WHERE 
                u1.created_by = '{var1}' AND u1.deleted_at IS NULL 
              ORDER BY 
                created_at DESC`,
    // "Q177" : `SELECT c.id, c.organization_id ,c.customer_name, c.source, c.user_id, c.address, c.deleted_at,
    //           u.full_name AS created_by FROM customers AS c INNER JOIN users AS u ON u.id = c.user_id
    //           WHERE c.user_id = '{var1}' AND c.is_rejected = '{var2}'`,
    "Q178" : `SELECT
                sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,sc.business_contact_id,
                sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
                sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
                c.closer_id, c.closer_percentage, 
                u.full_name as closer_name, u.email_address as closer_email, 
                cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
                sc.transfered_back_by as transfered_back_by_id ,
                bc.id as business_contact_id ,bc.full_name as business_contact_name, bc.email_address as business_contact_email,
                rc.id as revenue_contact_id ,rc.full_name as revenue_contact_name, rc.email_address as revenue_contact_email,
                slab.slab_name,
                u2.full_name as tranfer_back_by_name,
                sup.supporter_id,
                (
                  SELECT json_agg(leads.*)
                  FROM (
                    SELECT 
                      leads.id,leads.full_name, leads.title as title_id, leads.email_address,
                      leads.phone_number,leads.address, leads.source as source_id,
                      leads.linkedin_url,leads.website, leads.targeted_value,leads.industry_type as industry_id,
                      leads.assigned_sales_lead_to,leads.additional_marketing_notes,leads.user_id as creator_id,
                      leads.reason, leads.created_at, leads.updated_at, 
                      leads.marketing_qualified_lead, leads.is_rejected, leads.customer_id,
                      u1.full_name as created_by,s.source,t.title,i.industry,c.customer_name
                    FROM leads 
                    LEFT JOIN users AS u1 ON u1.id = leads.user_id
                    LEFT JOIN lead_sources AS s ON s.id = leads.source
                    LEFT JOIN lead_titles AS t ON t.id = leads.title
                    LEFT JOIN lead_industries AS i ON i.id = leads.industry_type
                    LEFT JOIN customers as c ON c.id = leads.customer_id
                    WHERE leads.customer_id = sc.customer_id
                      AND leads.is_rejected = false AND u1.deleted_at IS NULL  
                      AND leads.deleted_at IS NULL
                  ) leads
                ) as lead_data,
                (
                  SELECT json_agg(sales_supporter.*)
                  FROM (
                    SELECT 
                    ss.supporter_id as id ,ss.supporter_percentage as percentage ,u1.full_name as name,u1.email_address as email
                    FROM sales_supporter as ss
                    LEFT JOIN users AS u1 ON u1.id = ss.supporter_id
                    WHERE ss.sales_commission_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
                  ) sales_supporter
                ) as supporters,
                (
                  SELECT json_agg(product_in_sales.*)
                  FROM (
                    SELECT 
                      p.id ,p.product_name as name
                    FROM product_in_sales as pis
                    LEFT JOIN products AS p ON p.id = pis.product_id
                    WHERE sc.id= pis.sales_commission_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
                  ) product_in_sales
                ) as products
            FROM
              sales AS sc
            LEFT JOIN
              sales_closer AS c ON sc.id = c.sales_commission_id
            LEFT JOIN 
              sales_supporter AS sup ON sc.id = sup.sales_commission_id
            LEFT JOIN
              users AS u ON u.id = c.closer_id
            LEFT JOIN
              users AS u1 ON u1.id = sc.user_id
            LEFT JOIN
              customers AS cus ON cus.id = sc.customer_id
            LEFT JOIN
              business_contact AS bc ON bc.id = sc.business_contact_id
            LEFT JOIN
              revenue_contact AS rc ON rc.id = sc.revenue_contact_id
            LEFT JOIN
              products AS p ON p.id = sc.revenue_contact_id
            LEFT JOIN
              slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN
              users AS u2 ON u2.id = sc.transfered_back_by
            WHERE
              (sc.user_id IN ({var1}) OR c.closer_id IN ({var1}) OR sup.supporter_id IN ({var1}) )
            ORDER BY
              sc.created_at DESC`,
    "Q179"  :`SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name ,
              sc.transfered_back_by
              FROM sales AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL and sc.closed_at IS NULL  ORDER BY sc.created_at desc`,
    "Q180"  :`SELECT sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name,
              sc.transfered_back_by 
              FROM sales AS sc 
              INNER JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              INNER JOIN users AS u ON u.id = c.closer_id
              INNER JOIN users AS u1 ON u1.id = sc.user_id
              INNER JOIN customers AS cus ON cus.id = sc.customer_id
              WHERE sc.company_id = '{var1}' AND sc.deleted_at IS NULL and sc.closed_at IS NOT NULL  ORDER BY sc.created_at desc`,
    "Q181"  :`SELECT distinct(sc.id), sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date,sc.transfered_back_by, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name,
              sup.supporter_id, sup.supporter_percentage,u2.email_address as supporter_email 
              FROM sales AS sc 
              LEFT JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              LEFT JOIN sales_supporter AS sup ON sc.id = sup.sales_commission_id
              LEFT JOIN users AS u ON u.id = c.closer_id
              LEFT JOIN users AS u1 ON u1.id = sc.user_id
              LEFT JOIN customers AS cus ON cus.id = sc.customer_id
              LEFT JOIN users AS u2 ON u2.id = sup.supporter_id
              WHERE (sc.user_id = '{var1}' OR c.closer_id = '{var1}' OR sup.supporter_id = '{var1}') AND sc.deleted_at IS NULL AND sc.closed_at IS NULL ORDER BY sc.created_at desc`,
    "Q182"  :`SELECT distinct(sc.id), sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date,sc.transfered_back_by, 
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at,sc.slab_id,sc.lead_id,
              c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name AS creator_name,
              sup.supporter_id, sup.supporter_percentage,u2.email_address as supporter_email 
              FROM sales AS sc 
              LEFT JOIN sales_closer AS c ON sc.id = c.sales_commission_id
              LEFT JOIN sales_supporter AS sup ON sc.id = sup.sales_commission_id
              LEFT JOIN users AS u ON u.id = c.closer_id
              LEFT JOIN users AS u1 ON u1.id = sc.user_id
              LEFT JOIN customers AS cus ON cus.id = sc.customer_id
              LEFT JOIN users AS u2 ON u2.id = sup.supporter_id
              WHERE (sc.user_id = '{var1}' OR c.closer_id = '{var1}' OR sup.supporter_id = '{var1}') AND sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL ORDER BY sc.created_at desc`,
    "Q183"  :`UPDATE slabs SET deleted_at = '{var1}' WHERE slab_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
    "Q184"  :`SELECT * FROM slabs WHERE slab_id ='{var1}' AND deleted_at IS NULL ORDER BY slab_ctr ASC`,
    "Q185"  :`SELECT u.id, u.full_name, r.id as role_id,r.role_name, r.module_ids, r.reporter  FROM roles AS r 
              INNER JOIN users AS u ON u.role_id = r.id 
              WHERE r.id = '{var1}'  AND r.deleted_at IS NULL`,
    // "Q186"  : `SELECT 
    //               u.full_name AS user,
    //               sc.target_amount::DECIMAL AS revenue
    //           FROM  
    //               sales AS sc 
    //           INNER JOIN users AS u ON u.id = sc.user_id
    //           INNER JOIN 
    //             sales_closer AS cl ON sc.id = cl.sales_commission_id  
    //           INNER JOIN 
    //             sales_supporter AS s ON sc.id = s.sales_commission_id 
    //           WHERE 
    //               sc.closed_at is not null 
    //               AND (sc.user_id IN ({var1}) OR cl.closer_id IN ({var1}) OR s.supporter_id IN ({var1}))
    //               AND sc.closed_at BETWEEN '{var4}' AND '{var5}'
    //               AND sc.deleted_at IS NULL
    //           GROUP BY 
    //               u.full_name,
    //               sc.target_amount 
    //           LIMIT {var2} OFFSET {var3}`,
    "Q187"  :`SELECT * FROM contact_us WHERE deleted_at IS NULL`,
    "Q188"  :`SELECT * from chat where is_group_chat = 'true' AND company_id = '{var1}' AND deleted_at IS NULL`,
    "Q189"  :`SELECT user_id FROM chat_room_members where room_id = '{var1}' AND deleted_at IS NULL`,
    // "Q190"  :`SELECT * FROM actual_forecast_data WHERE revenue_forecast_id = '{var1}' and deleted_at IS null`,
    // "Q191"  :`INSERT INTO actual_forecast_data(id, revenue_forecast_id, actual_revenue, forecast_revenue, forecast_date)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
    // "Q192"  :`UPDATE actual_forecast_data SET deleted_at = '{var1}' WHERE revenue_forecast_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    // "Q193"  :`SELECT * FROM actual_forecast_data WHERE revenue_forecast_id = '{var1}' and deleted_at IS null AND forecast_date BETWEEN '{var4}' AND '{var5}' LIMIT '{var2}' OFFSET '{var3}'`,
    // "Q194"  :`SELECT 
    //             f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
    //             f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
    //             u.full_name AS creator_name  
    //           FROM 
    //             revenue_forecast AS f
    //           INNER JOIN 
    //             users AS u ON u.id = f.user_id 
    //           WHERE 
    //             f.company_id = '{var1}' AND f.deleted_at IS NULL AND closed_date IS NULL
    //           ORDER BY 
    //             timeline ASC`, 
    // "Q195"  :`SELECT 
    //             f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
    //             f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
    //             u.full_name AS creator_name  
    //           FROM 
    //             revenue_forecast AS f
    //           INNER JOIN 
    //             users AS u ON u.id = f.user_id 
    //           WHERE 
    //             f.company_id = '{var1}' AND f.deleted_at IS NULL AND closed_date IS NOT NULL
    //           ORDER BY 
    //             timeline ASC`,
    // "Q196"  :`SELECT 
    //             f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
    //             f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
    //             u.full_name AS creator_name  
    //           FROM 
    //             revenue_forecast AS f
    //           INNER JOIN 
    //             users AS u ON u.id = f.user_id 
    //           WHERE 
    //             user_id = '{var1}' AND deleted_at IS NULL AND closed_date IS NULL 
    //           ORDER BY 
    //             timeline ASC`,
    // "Q197"  :`SELECT 
    //             f.id, f.timeline, f.revenue, f.growth_window, f.growth_percentage, f.start_date, 
    //             f.end_date, f.user_id, f.company_id, f.currency, f.created_at, f.closed_date,
    //             u.full_name AS creator_name  
    //           FROM 
    //             revenue_forecast AS f
    //           INNER JOIN 
    //             users AS u ON u.id = f.user_id 
    //           WHERE 
    //             user_id = '{var1}' AND deleted_at IS NULL AND closed_date IS NOT NULL 
    //           ORDER BY 
    //             timeline ASC`,   
    "Q198"  :`UPDATE forecast SET deleted_at = '{var1}' WHERE id = '{var2}' OR pid = '{var2}' RETURNING *`,
    "Q199"  :`UPDATE 
                forecast 
              SET 
                timeline = '{var2}', amount = '{var3}', start_date = '{var4}', 
                end_date = '{var5}', updated_at = '{var6}' 
              WHERE 
                id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q200"  :`INSERT INTO leads(id, full_name, title, email_address, phone_number,source, industry_type, customer_id, user_id, company_id)
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}') RETURNING *`,
    "Q201"  :`INSERT INTO leads(id,full_name,title,email_address,phone_number,
              address,source,linkedin_url,website,targeted_value,industry_type,marketing_qualified_lead,
              assigned_sales_lead_to,additional_marketing_notes,user_id,company_id, customer_id)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}',
              '{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', '{var15}','{var16}', '{var17}') RETURNING *`,

    "Q202"  :`SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name, c.customer_name , u2.full_name as assigned_sales_lead_name
              FROM 
                leads AS l
              LEFt JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFt JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`, 

    "Q203"  :`SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                leads AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFt JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                (l.user_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,
    
    "Q204"  :`UPDATE leads SET full_name = '{var2}', title = '{var3}',email_address = '{var4}',phone_number = '{var5}',
              address = '{var6}',source = '{var7}',linkedin_url = '{var8}',website = '{var9}',targeted_value = '{var10}',
              industry_type = '{var11}',marketing_qualified_lead = '{var12}',assigned_sales_lead_to = '{var13}',additional_marketing_notes = '{var14}',
              updated_at = '{var15}', customer_id = '{var16}' WHERE id = '{var1}' AND deleted_at is null`,
              
    "Q205"  :`UPDATE leads SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`,
    
    "Q206"  :`SELECT COUNT(*) from leads WHERE company_id = '{var1}' AND deleted_at IS NULL`,

    "Q207"  :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    // "Q208"  :`SELECT 
    //             COUNT(*),
    //             u.full_name AS created_by
    //           FROM 
    //             leads AS l 
    //           INNER JOIN 
    //             users AS u ON u.id = l.user_id
    //           WHERE 
    //             l.user_id = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
    //           GROUP BY 
    //             u.full_name
    //           ORDER BY 
    //             count {var4}
    //           LIMIT {var2} OFFSET {var3}`,
    "Q209"  :`select 
                distinct(l.id),l.user_id,l.assigned_sales_lead_to, u.full_name as created_by,l.customer_id,
                l.is_rejected, l.is_converted
              FROM 
                leads AS l 
              LEFT JOIN 
                users u ON u.id = l.user_id
              where 
                (l.user_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND 
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
    // "Q222"  :`UPDATE leads SET is_converted = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q223"  :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.company_id = '{var1}' AND l.is_converted = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    // "Q224"  :`SELECT 
    //             COUNT(*),
    //             u.full_name AS created_by
    //           FROM 
    //             leads AS l 
    //           INNER JOIN 
    //             users AS u ON u.id = l.user_id
    //           WHERE 
    //             l.user_id = '{var1}' AND l.is_converted = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
    //           GROUP BY 
    //             u.full_name
    //           ORDER BY 
    //             count {var4}
    //           LIMIT {var2} OFFSET {var3}`,
    "Q225" :`SELECT * FROM lead_sources WHERE LOWER(source) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
    "Q226" :`SELECT * FROM lead_titles WHERE LOWER(title) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
    "Q227" :`SELECT * FROM lead_industries WHERE LOWER(industry) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
    // "Q228" :`SELECT COUNT(*) from leads WHERE user_id = '{var1}' AND is_converted = true AND deleted_at IS NULL`,
    "Q229" :`SELECT COUNT(*) from leads WHERE company_id = '{var1}' AND is_converted = true AND deleted_at IS NULL`,
    "Q230" : `UPDATE companies SET is_marketing_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q231" :`UPDATE companies SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q232" :`UPDATE companies SET expiry_date = '{var1}', user_count = '{var2}', updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *`,

    "Q233" :`INSERT INTO marketing_budget(timeline,amount,start_date,end_date,created_by)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}') RETURNING *`,

    "Q234" :`INSERT INTO marketing_budget_description(id, budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,

    "Q235" :`INSERT INTO marketing_budget_description_logs(id,budget_description_id,budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}') RETURNING *`,

    "Q236" :`INSERT INTO marketing_budget_logs(budget_id,timeline,amount,start_date,end_date,created_by)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,
    "Q237" :`SELECT 
                b.id, b.timeline, b.amount, b.start_date,
                b.end_date, b.created_by,b.created_at,b.is_finalize,
                u1.full_name as creator_name,
                (
                  SELECT json_agg(marketing_budget_data.*)
                    FROM marketing_budget_data
                    WHERE marketing_budget_data.budget_id::uuid = b.id::uuid 
                    AND marketing_budget_data.deleted_at IS NULL
                ) as budget_data,
                (
                  SELECt json_agg(marketing_budget_description.*)
                  FROM marketing_budget_description
                  WHERE marketing_budget_description.budget_id::uuid = b.id::uuid
                  AND marketing_budget_description.deleted_at IS NULL
                )as budget_description
              FROM 
                marketing_budget AS b
              LEFT JOIN users as u1 on u1.id::uuid = b.created_by::uuid	
              WHERE 
                (b.created_by = '{var1}') AND b.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
    "Q238" :`UPDATE marketing_budget SET deleted_at = '{var2}' where id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q239" :`UPDATE marketing_budget_description SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q240" :`SELECT 
                b.id, b.timeline, b.amount, b.start_date,
                b.end_date, b.created_by,b.created_at,
                u1.full_name as creator_name,
                (
                  SELECT json_agg(marketing_budget_data.*)
                    FROM marketing_budget_data
                    WHERE marketing_budget_data.budget_id::uuid = b.id::uuid 
                    AND marketing_budget_data.deleted_at IS NULL
                ) as budget_data,
                (
                  SELECT json_agg(marketing_budget_description.*)
                  FROM marketing_budget_description
                  WHERE marketing_budget_description.budget_id::uuid = b.id::uuid
                  AND marketing_budget_description.deleted_at IS NULL
                )as budget_description
              FROM 
                marketing_budget AS b
              LEFT JOIN users as u1 on u1.id::uuid = b.created_by::uuid	
              WHERE 
                (b.created_by IN ({var1})) AND b.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
    "Q241" :`UPDATE marketing_budget SET timeline = '{var1}', amount = '{var2}', start_date = '{var3}', end_date = '{var4}'
              WHERE id = '{var6}' AND deleted_at IS NULL RETURNING *`,
    "Q242" :`UPDATE marketing_budget_description SET title = '{var1}', amount = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
    "Q243" :`SELECT 
              b.id, b.timeline, b.amount, b.start_date,
              b.end_date, b.created_by,b.created_at,b.is_finalize,
              u1.full_name as creator_name,
              (
                SELECT json_agg(marketing_budget_description_logs.*)
                FROM marketing_budget_description_logs
                WHERE marketing_budget_description_logs.budget_id::uuid = b.budget_id::uuid
                AND marketing_budget_description_logs.deleted_at IS NULL
              )as budget_description
            FROM 
              marketing_budget_logs AS b
            LEFT JOIN users as u1 on u1.id::uuid = b.created_by::uuid	
            WHERE 
              (b.budget_id = '{var1}') AND b.deleted_at IS NULL 
            ORDER BY 
              timeline ASC`,
    "Q244" :`SELECT 
                b.id, b.timeline, b.amount, b.start_date,
                b.end_date, b.created_by,b.created_at,b.is_finalize,
                u1.full_name as creator_name,
                (
                  SELECT json_agg(marketing_budget_description_logs.*)
                  FROM marketing_budget_description_logs
                  WHERE marketing_budget_description_logs.budget_id::uuid = b.budget_id::uuid
                  AND marketing_budget_description_logs.deleted_at IS NULL
                )as budget_description
              FROM 
                marketing_budget_logs AS b
              LEFT JOIN users as u1 on u1.id::uuid = b.created_by::uuid	
              WHERE 
                (b.budget_id = '{var1}' AND b.created_by IN ({var2})) AND b.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
    "Q245" : `UPDATE marketing_budget_description SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
    "Q246" : `UPDATE marketing_budget SET is_finalize = true, updated_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
    "Q247" : `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.assigned_sales_lead_to
              WHERE 
                l.assigned_sales_lead_to = '{var1}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
    "Q248" :`SELECT COUNT(*) from leads WHERE assigned_sales_lead_to = '{var1}'  AND deleted_at IS NULL`,
    "Q249" :`UPDATE companies SET company_logo = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q250" :`UPDATE leads SET is_rejected = '{var2}', reason = '{var3}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`, 
    "Q251" :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customers AS cus 
              INNER JOIN 
                users AS u ON u.id = cus.user_id
              WHERE 
                cus.user_id = '{var1}' AND cus.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`, 
    "Q252" :`SELECT * FROM sales WHERE lead_id = '{var1}' AND deleted_at IS NULL`,
    "Q253" :`SELECT COUNT(*) from leads WHERE company_id = '{var1}' AND is_rejected = '{var2}' AND deleted_at IS NULL`,
    "Q254" :`SELECT COUNT(*) from leads WHERE user_id = '{var1}' AND is_rejected = true AND deleted_at IS NULL`,
    "Q255" :`SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                leads AS l 
              INNER JOIN 
                users AS u ON u.id = l.user_id
              WHERE 
                l.company_id = '{var1}' AND l.is_rejected = '{var5}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
      "Q256" :`SELECT 
                COUNT(*) 
              FROM 
                customers AS c
              LEFT JOIN sales AS s ON c.id = s.customer_id
              WHERE c.company_id = '{var1}' AND s.closed_at IS NOT NULL AND c.deleted_at IS NULL`,

    "Q257" : `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customers AS c
              LEFT JOIN 
                users AS u ON u.id = c.user_id
              LEFT JOIN
                sales AS s ON s.customer_id = c.id
              WHERE 
              c.company_id = '{var1}'  AND c.deleted_at IS NULL AND s.closed_at IS NOT NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
     "Q258" : `SELECT 
                  DISTINCT(sc.id) as sales_commission_id,
                  u.full_name AS sales_rep,
                  sc.closed_at,sc.booking_commission,sc.revenue_commission
              FROM  
                  sales AS sc 
              LEFT JOIN sales_closer AS cr ON cr.sales_commission_id = sc.id
              LEFT JOIN sales_supporter AS s ON s.sales_commission_id = sc.id
              LEFT JOIN users AS u ON u.id = cr.closer_id
              WHERE 
                  sc.closed_at is not null 
                  AND (sc.user_id IN ({var1}) OR cr.closer_id IN ({var1}) OR s.supporter_id IN ({var1}))
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
                  AND sc.deleted_at IS NULL`,

    "Q259" : `SELECT * FROM sales WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
    "Q260" : `SELECT * FROM product_in_sales WHERE product_id = '{var1}' AND deleted_at IS NULL`,
    // "Q261" : `SELECT * FROM lead_organizations WHERE user_id IN ({var1}) AND deleted_at IS NULL`,
    // "Q262" : `SELECT * FROM lead_organizations WHERE company_id = '{var1}' AND deleted_at IS NULL`,
    // "Q263" : `INSERT INTO lead_organizations(id, organization_name, user_id, company_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    // "Q264" : `SELECT * FROM lead_organizations WHERE id = '{var1}' AND deleted_at IS NULL`,
    // "Q265" : `UPDATE lead_organizations SET organization_name = '{var2}', updated_at = '{var3}' WHERE id = '{var1}' RETURNING *`,
    "Q266" : `UPDATE companies SET is_locked = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
    "Q267"  : `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING * `,
    "Q268" : `SELECT 
              u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
              u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
              u1.is_main_admin, u1.created_by, u2.full_name AS creator_name 
            FROM 
              users AS u1 
            INNER JOIN 
              users AS u2 ON u2.id = u1.created_by  
            WHERE 
              u1.id = '{var1}' AND u1.deleted_at IS NULL 
            ORDER BY 
              created_at DESC`,
    "Q269" : `UPDATE sales_closer SET closer_id = '{var1}', updated_at = '{var2}' WHERE sales_commission_id = '{var3}' RETURNING * `,
    "Q270" : `UPDATE sales SET transfer_reason = '{var1}',transfered_back_by = '{var4}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
    "Q271" : `SELECT * FROM sales WHERE id = '{var1}' AND deleted_at is null`,
    "Q272" : `INSERT INTO recognized_revenue(id, recognized_date, recognized_amount, booking_amount, notes, invoice, sales_id, user_id, company_id)
              VALUES('{var0}','{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}')RETURNING *`,
    "Q273" : `SELECT * FROM recognized_revenue WHERE sales_id = '{var1}' AND deleted_at IS NULL`,
    // "Q274" : `SELECT 
    //             SUM(recognized_amount :: DECIMAL) AS recognized_amount
    //           FROM 
    //             recognized_revenue 
    //           WHERE sales_id = '{var1}' AND deleted_at IS NULL
    //           GROUP BY
    //             sales_id`,

    "Q275"  :`SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name , c.customer_name ,u2.full_name as assigned_sales_lead_name
              FROM 
                leads AS l
              LEFT JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_rejected = TRUE
              ORDER BY 
                l.created_at DESC`,
                
    "Q276"  :`SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.organization_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name ,c.customer_name , u2.full_name as assigned_sales_lead_name
              FROM 
                leads AS l
              LEFT JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.marketing_qualified_lead = TRUE
              ORDER BY 
                l.created_at DESC`, 

    "Q277"  :`SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                leads AS l
              LEFT JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                l.company_id = '{var1}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_converted = TRUE
              ORDER BY 
                l.created_at DESC`, 
    "Q278"  :`SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                leads AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFt JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                (l.user_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                 AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                 AND l.is_rejected = TRUE
              ORDER BY 
                l.created_at DESC`,

    "Q279"  :`SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                leads AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFt JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                (l.user_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                  AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                  AND l.marketing_qualified_lead = TRUE
              ORDER BY 
                l.created_at DESC`,
    "Q280"  :`SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                leads AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFt JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                (l.user_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                  AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                  AND l.is_converted = TRUE
              ORDER BY 
                l.created_at DESC`,
    // "Q281"  :`SELECT 
    //             l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
    //             l.address,l.organization_id,l.organization_name,l.source AS source_id,s.source AS source_name,l.linkedin_url,
    //             l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
    //             l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
    //             u1.full_name AS creator_name 
    //           FROM 
    //             leads AS l
    //           INNER JOIN 
    //             users AS u1 ON u1.id = l.user_id
    //           INNER JOIN
    //             lead_sources AS s ON s.id = l.source
    //           INNER JOIN
    //             lead_titles AS t ON t.id = l.title
    //           INNER JOIN
    //             lead_industries AS i ON i.id = l.industry_type
    //           WHERE 
    //             l.assigned_sales_lead_to = '{var1}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
    //             AND l.is_converted = TRUE
    //           ORDER BY 
    //             l.created_at DESC`,
    "Q282"  :`SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name, c.customer_name, u2.full_name as assigned_sales_lead_name
              FROM 
                leads AS l 
              LEFT JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                l.assigned_sales_lead_to = '{var1}'
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

    "Q283"  :`SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.industry_type AS industry_id,i.industry AS industry_name,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.user_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                leads AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.user_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFt JOIN
                lead_industries AS i ON i.id = l.industry_type
              LEFT JOIN 
                customers AS c ON c.id = l.customer_id
              WHERE 
                l.assigned_sales_lead_to IN ({var1})
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,
    "Q284": `INSERT INTO transfered_back_sales(id, transferd_back_by_id, transferd_back_to_id, transfered_back_date,
              sales_id, transfer_reason, user_id, company_id)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}',
              '{var7}','{var8}') RETURNING *`,

    "Q285" : `SELECT 
                t.id, t.transferd_back_by_id, t.transferd_back_to_id, t.transfer_reason,
                t.transfered_back_date, u1.full_name AS transferd_back_by_name, 
                u2.full_name AS transferd_back_to_name, t.sales_id, c.customer_name 
              FROM 
                transfered_back_sales AS t
              INNER JOIN 
                users AS u1 ON u1.id = t.transferd_back_by_id
              INNER JOIN 
                users AS u2 ON u2.id = t.transferd_back_to_id
              INNER JOIN 
                sales AS sc ON sc.id = t.sales_id
              INNER JOIN 
                customers AS c ON sc.customer_id = c.id
              WHERE 
                sales_id = '{var1}'`,
    "Q286" : `UPDATE users SET session_time = '{var2}' WHERE id = '{var1}' RETURNING *`,
    "Q287" : `SELECT * FROM  users  WHERE role_id = '{var1}' and deleted_at IS NULL `,
    "Q288" : `SELECT * FROM  users  WHERE role_id = '{var1}' and id = '{var2}' and deleted_at IS NULL `,
    "Q289" : `INSERT INTO notifications(title, type_id,user_id,type) VALUES ('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q290" : `SELECT * FROM  notifications WHERE user_id= '{var1}' and is_read= false and deleted_at IS NULL`,
    "Q291" : `UPDATE notifications SET is_read = true WHERE id = '{var1}' RETURNING *`,
    "Q292"  : `SELECT 
                sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id, 
                sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount, sc.currency, sc.target_closing_date, 
                sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
                c.closer_id, c.closer_percentage, u.full_name, u.email_address, cus.customer_name, cus.user_id as creater_id, u1.full_name as creator_name,
                sc.transfered_back_by
              FROM 
                sales AS sc 
              LEFT JOIN 
                sales_closer AS c ON sc.id = c.sales_commission_id
              LEFT JOIN 
                users AS u ON u.id = c.closer_id
              LEFT JOIN 
                users AS u1 ON u1.id = sc.user_id
              LEFT JOIN 
                customers AS cus ON cus.id = sc.customer_id
              WHERE 
                sc.company_id = '{var1}' AND sc.id = '{var2}' AND sc.deleted_at IS NULL 
              ORDER BY 
                sc.created_at DESC`,
        "Q293"  : `SELECT 
                id, email_address, full_name, company_id, avatar, mobile_number, 
                phone_number, address, role_id, is_admin, expiry_date, created_at,is_verified, 
                is_main_admin, created_by
              FROM 
                users  
              WHERE 
                company_id = '{var1}' AND id = '{var2}' AND deleted_at IS NULL 
              ORDER BY 
                created_at DESC`, 
        "Q294" : `INSERT INTO forecast_data(forecast_id, amount, start_date, end_date, type, created_by)
                  VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
        // "Q295" : `SELECT * FROM forecast_data WHERE forecast_id = '{var1}'`,       
        "Q296" : `UPDATE sales SET revenue_commission =  '{var1}' WHERE id = '{var2}' RETURNING *`,      
        "Q298" : `SELECT  SUM(target_amount::DECIMAL) as amount, SUM(booking_commission::DECIMAL) as booking_commission, SUM(revenue_commission::DECIMAL) as revenue_commission
                  FROM 
                    sales AS sc 
                  WHERE 
                    company_id = '{var1}' 
                  AND 
                    deleted_at IS NULL`,
        "Q299" : `SELECT  SUM(recognized_amount::DECIMAL) as amount FROM 
                    recognized_revenue 
                  WHERE 
                    company_id = '{var1}' 
                  AND 
                    deleted_at IS NULL`,
        "Q300": `SELECT SUM(recognized_amount::DECIMAL) as amount FROM recognized_revenue
                 WHERE 
                    sales_id = '{var1}' 
                  AND 
                    deleted_at IS NULL`,
        "Q301" : `SELECT DISTINCT(sc.id)
                  FROM 
                    sales AS sc 
                  LEFT JOIN 
                    sales_closer AS c ON sc.id = c.sales_commission_id
                  LEFT JOIN 
                    sales_supporter AS s ON sc.id = s.sales_commission_id
                  WHERE 
                    ( sc.user_id IN ({var1}) OR c.closer_id IN ({var1}) OR s.supporter_id IN ({var1}) )
                  AND sc.deleted_at IS NULL`,

        "Q302" : `SELECT SUM(target_amount::DECIMAL) as amount, SUM(booking_commission::DECIMAL) as booking_commission, SUM(revenue_commission::DECIMAL) as revenue_commission
                  FROM 
                    sales 
                  WHERE 
                    id IN ({var1}) 
                  AND deleted_at IS NULL`,

        "Q303" : `SELECT SUM(recognized_amount::DECIMAL) as amount
                  FROM 
                    recognized_revenue 
                  WHERE 
                  sales_id IN ({var1}) 
                  AND deleted_at IS NULL` , 
        // "Q297" : `UPDATE 
        //             forecast 
        //           SET 
        //             timeline = '{var2}', amount = '{var3}', start_date = '{var4}', 
        //             end_date = '{var5}', assigned_to = '{var6}', updated_at = '{var7}' 
        //           WHERE 
        //             pid = '{var1}' AND deleted_at IS NULL RETURNING *`,
        "Q305" : `UPDATE 
                    forecast_data
                  SET 
                    type = '{var2}', start_date = '{var3}', end_date = '{var4}', amount = '{var5}' 
                  WHERE 
                    id = '{var1}' AND deleted_at IS NULL RETURNING *`,
        "Q306" : `SELECT 
                    f.id, f.timeline, f.amount, f.start_date, f.pid,
                    f.end_date, f.created_by,f.created_at, f.assigned_to,
                    u1.full_name as creator_name, u2.full_name as assigned_name, 
                    (
                      SELECT json_agg(forecast_data.*)
                        from forecast_data
                        where forecast_data.forecast_id::uuid = f.id AND forecast_data.deleted_at IS NULL
                    ) as forecast_data,
                    (
                      SELECT json_agg(forecast)
                        from forecast
                        where forecast.pid::varchar = f.id::varchar AND forecast.deleted_at IS NULL
                    ) as assigned_forecast,
                    (
                      SELECT json_agg(fa.*)
                        from forecast_audit fa
                      WHERE fa.forecast_id::uuid = f.id
                    ) as audit_forecast
                  FROM 
                    forecast AS f
                  LEFT JOIN users as u1 on u1.id::uuid	 = f.created_by::uuid	
                  LEFT JOIN users as u2 on u2.id::uuid	 = f.assigned_to::uuid
                  WHERE 
                    f.id = '{var1}' AND f.deleted_at IS NULL 
                  ORDER BY 
                    timeline ASC`,

      "Q307"  : `UPDATE 
                  forecast
                SET 
                   amount = '{var2}', assigned_to = '{var3}'
                WHERE 
                  id = '{var1}' AND deleted_at IS NULL RETURNING *`,
      "Q308" : `INSERT INTO forecast_audit(forecast_id,amount,reason,created_by)
                VALUES('{var1}', '{var2}', '{var3}', '{var4}') RETURNING *`,
      "Q309" : `UPDATE forecast SET deleted_at = '{var1}' WHERE assigned_to = '{var2}' AND id = '{var3}' RETURNING *`,
      "Q310" : `UPDATE forecast_data SET deleted_at = '{var1}' WHERE forecast_id = '{var2}' RETURNING *`,
      "Q311" : `SELECT start_date, end_date, created_by,amount as forecast_amount,
                  (
                    SELECT json_agg(sc.id)
                    FROM sales as sc
                    LEFT JOIN sales_closer AS c ON c.sales_commission_id = sc.id
                    LEFT JOIN sales_supporter AS s ON s.sales_commission_id = sc.id
                    WHERE 
                      ( sc.user_id::uuid = fd.created_by 
                        OR c.closer_id::uuid = fd.created_by::uuid 
                        OR s.supporter_id::uuid = fd.created_by::uuid ) 
                        AND sc.closed_at BETWEEN fd.start_date::date AND fd.end_date::date 
                        AND sc.deleted_at is null
                  ) AS sales_data
                FROM forecast_data AS fd WHERE fd.forecast_id = '{var1}' AND fd.deleted_at IS NULL`,
      "Q315" : `SELECT 
                  p.id, p.product_name, p.product_image, p.description, p.available_quantity, p.price, 
                  p.end_of_life, p.currency, p.company_id, p.created_at, p.updated_at, p.user_id, u.full_name as created_by 
                FROM 
                  products AS p
                INNER JOIN 
                  users AS u ON p.user_id = u.id
                WHERE 
                  p.user_id IN ({var1}) AND p.deleted_at IS NULL
                ORDER BY 
                  created_at DESC`, 
      "Q316" : `SELECT cus.id, cus.customer_name, cus.source, 
                  cus.user_id,
                  cus.created_at, cus.address, cus.currency,
                  u.full_name AS created_by,
                  (
                    SELECT json_agg(leads.*)
                    FROM (
                      SELECT 
                        leads.id,leads.full_name, leads.title as title_id, leads.email_address,
                        leads.phone_number,leads.address, leads.source as source_id,
                        leads.linkedin_url,leads.website, leads.targeted_value,leads.industry_type as industry_id,
                        leads.assigned_sales_lead_to,leads.additional_marketing_notes,leads.user_id as creator_id,
                        leads.reason, leads.created_at, leads.updated_at, 
                        leads.marketing_qualified_lead, leads.is_rejected, leads.customer_id,
                        u1.full_name as created_by,s.source,t.title,i.industry,c.customer_name
                      FROM leads 
                      LEFT JOIN users AS u1 ON u1.id = leads.user_id
                      LEFT JOIN lead_sources AS s ON s.id = leads.source
                      LEFT JOIN lead_titles AS t ON t.id = leads.title
                      LEFT JOIN lead_industries AS i ON i.id = leads.industry_type
                      LEFT JOIN customers as c ON c.id = leads.customer_id
                      WHERE cus.id  = leads.customer_id 
                        AND leads.is_rejected = false AND u1.deleted_at IS NULL  
                        AND leads.deleted_at IS NULL
                    ) leads
                  ) as lead_data,
                  (
                    SELECT json_agg(business_contact.*)
                    from business_contact
                    where business_contact.customer_id = cus.id
                  ) AS business_contacts,
                  (
                    SELECT json_agg(revenue_contact.*)
                    from revenue_contact
                    where revenue_contact.customer_id = cus.id
                  ) AS revenue_contacts
                  FROM 
                    customers AS cus 
                  INNER JOIN 
                    users AS u ON u.id = cus.user_id
                  WHERE 
                    cus.user_id IN ({var1})
                  ORDER BY 
                    created_at desc`,
      "Q317" : `SELECT 
                  u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                  u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                  u1.is_main_admin, u1.created_by, u2.full_name AS creator_name, r.role_name AS roleName
                FROM
                  users AS u1
                INNER JOIN
                  users AS u2 ON u2.id = u1.created_by  
                INNER JOIN 
                  roles as r on r.id = u1.role_id
                WHERE 
                  u1.id IN ({var1}) AND u1.deleted_at IS NULL 
                ORDER BY 
                  created_at DESC`,
      "Q318" : `SELECT id, closer_percentage, supporter_percentage
                FROM 
                  commission_split
                WHERE 
                  user_id IN ({var1}) AND deleted_at IS NULL`,
      
      "Q312" : `INSERT INTO marketing_budget_data(budget_id, amount, start_date, end_date, type, created_by)
                VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}' ) RETURNING *`,
      "Q313" : `UPDATE marketing_budget_data SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
      "Q314" : `UPDATE marketing_budget_data SET amount = '{var1}', start_date = '{var2}', end_date = '{var3}', type = '{var4}'
                WHERE id = '{var5}' AND deleted_at IS NULL RETURNING *`,
      "Q319" : `SELECT 
                  b.id, b.timeline, b.amount, b.start_date,
                  b.end_date, b.created_by,b.created_at,b.is_finalize,
                  u1.full_name as creator_name,
                  (
                    SELECT json_agg(marketing_budget_data.*)
                      FROM marketing_budget_data
                      WHERE marketing_budget_data.budget_id::uuid = b.id::uuid 
                      AND marketing_budget_data.deleted_at IS NULL
                  ) as budget_data,
                  (
                    SELECT json_agg(marketing_budget_description.*)
                    FROM marketing_budget_description
                    WHERE marketing_budget_description.budget_id::uuid = b.id::uuid
                    AND marketing_budget_description.deleted_at IS NULL
                  )as budget_description
                FROM 
                  marketing_budget AS b
                LEFT JOIN users as u1 on u1.id::uuid = b.created_by::uuid	
                WHERE 
                  (b.id = '{var1}') AND b.deleted_at IS NULL 
                ORDER BY 
                  timeline ASC`,
      // "Q320" : `SELECT 
      //             o.id as organization_id, o.organization_name, u.full_name as created_by,
      //             o.company_id , 
      //             (
      //               SELECT json_agg(leads.*)
      //               FROM (
      //                 SELECT 
      //                   leads.id,leads.full_name, leads.title as title_id, leads.email_address,
      //                   leads.phone_number,leads.address,leads.organization_name, leads.source as source_id,
      //                   leads.linkedin_url,leads.website, leads.targeted_value,leads.industry_type as industry_id,
      //                   leads.assigned_sales_lead_to,leads.additional_marketing_notes,leads.user_id as creator_id,
      //                   leads.reason, leads.created_at, leads.updated_at, 
      //                   leads.marketing_qualified_lead, leads.is_rejected, leads.organization_id,
      //                   u1.full_name as created_by,
      //                   s.source,
      //                   t.title,
      //                   i.industry,
      //                   cus.id as customer_id
      //                 FROM leads 
      //                 LEFT JOIN users AS u1 ON u1.id = leads.user_id
      //                 LEFT JOIN lead_sources AS s ON s.id = leads.source
      //                 LEFT JOIN lead_titles AS t ON t.id = leads.title
      //                 LEFT JOIN lead_industries AS i ON i.id = leads.industry_type
      //                 LEFT JOIN customers as c ON c.lead_id = leads.id
      //                 WHERE o.id = leads.organization_id 
      //                   AND leads.marketing_qualified_lead= true 
      //                   AND leads.is_rejected = false AND u1.deleted_at IS NULL  
      //                   AND leads.deleted_at IS NULL
      //               ) leads
      //             ) as lead_data
      //           FROM lead_organizations AS o
      //           LEFT JOIN users AS u ON u.id = o.user_id
      //           WHERE o.company_id = '{var1}' AND o.deleted_at IS NULL AND u.deleted_at IS NULL 
      //           ORDER BY o.created_at DESC`,
      // "Q321" : `SELECT 
      //             o.id as organization_id, o.organization_name,
      //             SELECT json_agg(leads.*)
      //               FROM (
      //                 SELECT 
      //                   leads.id,leads.full_name, leads.title as title_id, leads.email_address,
      //                   leads.phone_number,leads.address,leads.organization_name, leads.source as source_id,
      //                   leads.linkedin_url,leads.website, leads.targeted_value,leads.industry_type as industry_id,
      //                   leads.assigned_sales_lead_to,leads.additional_marketing_notes,leads.user_id as creator_id,
      //                   leads.reason, leads.created_at, leads.updated_at, 
      //                   leads.marketing_qualified_lead, leads.is_rejected, leads.organization_id,
      //                   u1.full_name as created_by,
      //                   s.source,
      //                   t.title,
      //                   i.industry,
      //                   c.id as customer_id
      //                 FROM leads 
      //                 LEFT JOIN users AS u1 ON u1.id = leads.user_id
      //                 LEFT JOIN lead_sources AS s ON s.id = leads.source
      //                 LEFT JOIN lead_titles AS t ON t.id = leads.title
      //                 LEFT JOIN lead_industries AS i ON i.id = leads.industry_type
      //                 LEFT JOIN customers as c ON c.lead_id = leads.id
      //                 WHERE o.id = leads.organization_id 
      //                   AND leads.marketing_qualified_lead= true 
      //                   AND leads.is_rejected = false AND u1.deleted_at IS NULL  
      //                   AND leads.deleted_at IS NULL
      //               ) leads
      //             ) as lead_data
      //           FROM 
      //             lead_organizations AS o
      //             WHERE (o.user_id IN '{var1}') AND o.deleted_at IS NULL 
      //           ORDER BY 
      //             o.created_at DESC`,
      "Q322" : `UPDATE leads SET updated_at = '{var1}', is_converted = true WHERE id = '{var2}' RETURNING *`,
     // "Q323" : `SELECT id, organization_name FROM lead_organizations WHERE LOWER(organization_name) = LOWER('{var1}') AND deleted_at IS NULL`,
      "Q324" : `SELECT * FROM leads WHERE organization_id = '{var1}' AND deleted_at IS NULL`,
     // "Q325" : `UPDATE lead_organizations SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
      "Q326" :`SELECT * FROM lead_sources WHERE id = '{var1}' and company_id = '{var2}' AND deleted_at IS NULL`,
      "Q327"  : `UPDATE business_contact SET  deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
      "Q328"  : `UPDATE revenue_contact SET  deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  
  
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