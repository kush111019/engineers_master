
const db_sql = {

  "Q1": `SELECT * FROM companies WHERE company_name = '{var1}'`,
  "Q2": `INSERT INTO companies(company_name,company_logo,company_address,expiry_date, user_count) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
  "Q3": `INSERT INTO users(full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,expiry_date,is_verified,is_admin,is_main_admin) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}',false,true,true) RETURNING *`,
  "Q4": `SELECT * FROM users WHERE email_address = '{var1}' AND deleted_at IS NULL`,
  "Q5": `UPDATE users SET encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' WHERE id = '{var1}' AND company_id = '{var4}' RETURNING *`,
  "Q6": `SELECT id, module_name,module_type FROM modules WHERE deleted_at IS NULL`,
  "Q7": `UPDATE users SET is_verified = true ,updated_at = '{var2}' WHERE id = '{var1}' RETURNING *`,
  "Q8": `SELECT id, full_name,company_id, email_address,mobile_number,phone_number,address,role_id, avatar,expiry_date, is_verified, is_admin, is_locked, created_by,is_main_admin, created_at, deleted_at, session_time FROM users WHERE id = '{var1}' and deleted_at IS NULL`,
  "Q9": `SELECT * FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
  "Q10": `UPDATE users SET full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' WHERE id = '{var8}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
  "Q11": `INSERT INTO roles(role_name,reporter,company_id) VALUES('Admin','','{var1}') RETURNING *`,
  "Q12": `SELECT * FROM roles WHERE id = '{var1}' AND deleted_at IS NULL`,
  "Q13": `INSERT INTO roles(role_name,reporter,company_id,user_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
  "Q14": `SELECT * FROM roles WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  "Q15": `SELECT 
                u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                u1.is_main_admin,u1.is_deactivated, u1.created_by, u2.full_name AS creator_name , r.role_name AS roleName
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
  "Q16": `SELECT * FROM roles WHERE reporter = '{var1}' AND deleted_at IS NULL`,
  "Q17": `SELECT
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
  "Q18": `INSERT INTO slabs(min_amount, max_amount, percentage, is_max, company_id, currency, slab_ctr, user_id, slab_id, slab_name, commission_split_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}') RETURNING * `,
  "Q19": `UPDATE slabs SET slab_name = '{var1}', min_amount = '{var2}', max_amount = '{var3}', percentage = '{var4}', is_max = '{var5}', company_id = '{var6}',currency = '{var7}', slab_ctr = '{var8}', user_id = '{var9}', updated_at = '{var12}', commission_split_id = '{var13}' WHERE id = '{var10}' AND slab_id = '{var11}' AND deleted_at IS NULL RETURNING *`,
  "Q20": `INSERT INTO permissions( role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view_global,permission_to_view_own, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}') RETURNING *`,
  "Q21": `SELECT u.id,u.email_address, u.full_name, u.company_id, 
            u.avatar,u.mobile_number,u.phone_number,u.address,u.role_id ,r.role_name
          FROM users AS u
          LEFT JOIN  
            roles AS r ON r.id = u.role_id
          WHERE u.role_id = '{var1}' AND u.company_id = '{var2}' AND u.deleted_at IS NULL `,
  "Q22": `UPDATE users SET email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}', is_admin = '{var10}' WHERE id = '{var6}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
  "Q23": `UPDATE users SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
  "Q24": `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at, deleted_at,is_locked FROM users WHERE company_id = '{var1}' ORDER BY created_at desc`,
  "Q25": `UPDATE roles SET role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' WHERE id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
  "Q26": `update permissions SET permission_to_create= '{var1}', permission_to_view_global = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}', permission_to_view_own = '{var8}' WHERE role_id = '{var5}' AND module_id = '{var7}' AND deleted_at IS NULL `,
  "Q27": `UPDATE roles SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q28": `UPDATE permissions SET deleted_at = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING * `,
  "Q29": `UPDATE slabs SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
  "Q30": `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND is_main_admin = false AND deleted_at IS NULL RETURNING * `,
  "Q31": `INSERT INTO follow_up_notes (sales_id, company_id, user_id, notes) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
  "Q32": `SELECT f.id, f.notes, f.created_at, f.user_id, u.full_name, u.avatar 
              FROM follow_up_notes as f
              INNER JOIN users AS u ON u.id = f.user_id
              WHERE sales_id = '{var1}' AND f.deleted_at IS NULL ORDER BY created_at DESC`,
  "Q33": `UPDATE permissions SET user_id = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q34": `UPDATE roles SET module_ids = '{var1}' , updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
  "Q35": `SELECT m.id, m.module_name, p.permission_to_view_global,p.permission_to_view_own, p.permission_to_create, 
              p.permission_to_update, p.permission_to_delete FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN roles AS r ON r.id = p.role_id WHERE m.id IN ('{var1}') AND r.id = '{var2}' 
              AND m.deleted_at IS NULL AND p.deleted_at IS NULL
              ORDER BY m.module_ctr ASC`,
  "Q36": `INSERT INTO customer_companies ( user_id,customer_name, company_id, address, currency, industry) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
  "Q37": `INSERT INTO lead_organizations(id, organization_name, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  "Q38": `SELECT id, organization_name FROM lead_organizations WHERE id = '{var1}' AND deleted_at IS NULL`,
  "Q39": `SELECT 
                cus.id, cus.customer_name, 
                cus.user_id, cus.industry as industry_id,
                cus.created_at, cus.address, cus.currency,
                u.full_name AS created_by,
                li.industry,
                (
                  SELECT json_agg(customer_company_employees.*)
                  FROM (
                    SELECT 
                      customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                      customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                      customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                      customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id ,
                      customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, 
                      customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                      customer_company_employees.emp_type,customer_company_employees.is_converted,customer_company_employees.reason,
                      u1.full_name as created_by,s.source,t.title,c.customer_name
                    FROM customer_company_employees 
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                    WHERE customer_company_employees.customer_company_id = cus.id
                      AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                      AND customer_company_employees.deleted_at IS NULL
                  ) customer_company_employees
                ) as lead_data
              FROM 
                customer_companies AS cus 
              LEFT JOIN 
                users AS u ON u.id = cus.user_id
              LEFT JOIN 
			  	      lead_industries AS li ON li.id = cus.industry
              WHERE 
                cus.company_id = '{var1}' AND cus.deleted_at IS NULL AND 
                u.deleted_at IS NULL 
              ORDER BY 
                created_at desc`,
  "Q40": `UPDATE sales SET closed_at = '{var1}', updated_at = '{var2}', contract = '{var4}' WHERE id = '{var3}' RETURNING *`,
  "Q41": `SELECT u.id, u.company_id, u.role_id, u.avatar, u.full_name,u.email_address,u.mobile_number,u.phone_number,u.address,u.is_verified,u.created_by,
              m.id AS module_id, m.module_name, m.module_type, p.id AS permission_id, p.permission_to_view_global, p.permission_to_view_own,
              p.permission_to_create, p.permission_to_update, p.permission_to_delete
              FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
              INNER JOIN users AS u ON u.role_id = p.role_id
              WHERE m.module_name = '{var1}' AND u.id = '{var2}' AND m.deleted_at IS NULL 
              AND p.deleted_at IS NULL AND u.deleted_at IS NULL`,
  "Q42": `UPDATE customer_companies SET customer_name = '{var1}', updated_at = '{var2}', address = '{var3}', currency = '{var4}', industry = '{var7}' WHERE id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
  "Q43": `INSERT INTO 
            sales_logs(sales_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_contact_id, business_contact_id, sales_type, subscription_plan, recurring_date, currency, slab_id, booking_commission,sales_users) 
          VALUES 
            ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}', '{var19}') RETURNING *`,
  "Q44": `SELECT 	  	  
            sl.id, sl.sales_id, sl.customer_commission_split_id,
            sl.qualification, sl.is_qualified, 
            sl.target_amount,sl.booking_commission, sl.currency, 
            sl.target_closing_date, sl.customer_id, sl.is_overwrite, sl.company_id, 
            sl.revenue_contact_id, sl.business_contact_id,  
            sl.sales_type, sl.subscription_plan, sl.recurring_date, 
            sl.created_at,sl.closed_at,  c.customer_name, 
            sl.sales_users,sl.products,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.email_address,
                  customer_company_employees.phone_number,
                  customer_company_employees.creator_id,
                  customer_company_employees.created_at, customer_company_employees.updated_at, 
                  customer_company_employees.customer_company_id,
                  u1.full_name as created_by
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                WHERE( customer_company_employees.id = sl.business_contact_id OR customer_company_employees.id = sl.revenue_contact_id ) 
                AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data        
            
          FROM sales_logs AS sl 
          LEFT JOIN 
            customer_companies AS c ON c.id = sl.customer_id
          WHERE 
            sl.sales_id = '{var1}' AND sl.deleted_at IS NULL 
          ORDER BY
            sl.created_at DESC`,
  "Q45": `INSERT INTO users(full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_admin,is_verified,created_by) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false,'{var10}') RETURNING *`,
  "Q46": `SELECT id, organization_name FROM lead_organizations WHERE company_id = '{var1}' AND replace(organization_name, ' ', '') ILIKE '%{var2}%' AND deleted_at IS NULL`,
  "Q47": `UPDATE customer_companies SET  deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  "Q48": `INSERT INTO commission_split(closer_percentage,  supporter_percentage, company_id, user_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING * `,
  "Q49": `UPDATE commission_split SET closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  WHERE  id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
  "Q50": `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE company_id ='{var1}' AND deleted_at IS NULL`,
  "Q51": `UPDATE commission_split SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}'  AND deleted_at IS NULL RETURNING *`,
  "Q52": `SELECT 
                c.id, c.organization_id ,c.customer_name, c.source, 
                c.user_id,c.lead_id, c.address, c.deleted_at, c.is_rejected,
                c.business_contact_id, c.revenue_contact_id ,
                u.full_name AS created_by 
              FROM 
                customer_companies AS c 
              INNER JOIN users AS u ON u.id = c.user_id
              WHERE c.company_id = '{var1}' AND c.is_rejected = '{var2}'`,
  "Q53": `INSERT INTO sales (customer_id, customer_commission_split_id, is_overwrite, company_id, business_contact_id, revenue_contact_id, qualification, is_qualified, target_amount, target_closing_date, sales_type, subscription_plan, recurring_date, currency, user_id, slab_id, lead_id ,booking_commission) VALUES ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', '{var15}', '{var16}', '{var17}', '{var18}') RETURNING *`,
  "Q54": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,
            sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,
            sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id , 
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id),p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            sc.company_id = '{var1}' AND sc.deleted_at IS NULL
          ORDER BY
            sc.created_at DESC`,
  "Q55": `SELECT * FROM customer_companies WHERE id = '{var1}'`,
  "Q56": `UPDATE users SET created_by = '{var1}' WHERE id ='{var1}'`,
  "Q57": `INSERT INTO 
            sales_users( user_id, user_percentage,user_type, commission_split_id, sales_id, company_id) 
          VALUES
            ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,
  "Q58":`SELECT m.id, m.module_name, p.permission_to_view_global,p.permission_to_view_own, p.permission_to_create, 
          p.permission_to_update, p.permission_to_delete FROM modules AS m INNER JOIN permissions AS p ON p.module_id = m.id
          INNER JOIN roles AS r ON r.id = p.role_id WHERE m.id = '{var1}' AND r.id = '{var2}' 
          AND m.deleted_at IS NULL AND p.deleted_at IS NULL`,
  "Q59": `UPDATE sales SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
  "Q60": `UPDATE sales_users 
          SET 
            deleted_at = '{var1}'
          WHERE 
            sales_id = '{var2}' AND company_id = '{var3}' AND user_type='{var4}' RETURNING * `,
  "Q61": `UPDATE sales_users 
            SET 
              deleted_at = '{var1}'
            WHERE 
              sales_id = '{var2}' AND company_id = '{var3}' RETURNING *  `,
  "Q62": `UPDATE sales SET customer_id = '{var1}', customer_commission_split_id = '{var2}', is_overwrite = '{var3}', updated_at = '{var4}',business_contact_id = '{var7}', revenue_contact_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', target_amount = '{var11}', target_closing_date = '{var12}', sales_type = '{var14}', subscription_plan = '{var15}', recurring_date = '{var16}', currency = '{var17}', slab_id = '{var18}', lead_id = '{var19}', booking_commission= '{var20}'  WHERE id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
  "Q63": `UPDATE sales_users 
          SET 
            user_id = '{var1}', user_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}'
          WHERE 
            sales_id = '{var5}' AND company_id = '{var6}' AND user_type='{var7}' AND deleted_at IS NULL RETURNING *`,
  "Q64": `UPDATE follow_up_notes SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL`,
  "Q65": `INSERT INTO forecast(timeline, amount, start_date,end_date,pid, assigned_to, created_by, company_id ,is_accepted)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}') RETURNING * `,
  "Q66": `SELECT 
                f.id, f.timeline, f.amount, f.start_date, f.pid,
                f.end_date, f.created_by,f.created_at, f.assigned_to,
                u1.full_name as creator_name, u2.full_name as assigned_name,f.is_accepted,
                (
                  SELECT json_agg(forecast_data.*)
                    from forecast_data
                    where forecast_data.forecast_id = f.id AND forecast_data.deleted_at IS NULL
                ) as forecast_data,
				        (
                  SELECT json_agg(forecast) 
                    from forecast
                    where forecast.pid::varchar = f.id::varchar AND forecast.deleted_at IS NULL
                ) as assigned_forecast
              FROM 
                forecast AS f
              LEFT JOIN users as u1 on u1.id	 = f.created_by	
              LEFT JOIN users as u2 on u2.id	 = f.assigned_to
              WHERE 
                f.company_id = '{var1}' AND f.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
  "Q67": `INSERT INTO customer_company_employees 
            ( full_name, email_address, phone_number, customer_company_id, emp_type, creator_id,company_id)
          VALUES
            ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
  "Q68": `SELECT id 
          FROM 
            users 
          WHERE 
            company_id = '{var1}' AND is_main_admin = true`,
  "Q69": `UPDATE customer_company_employees 
          SET 
            full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' 
          WHERE 
            id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q70": `SELECT created_by
            FROM 
              marketing_budget 
            WHERE 
              company_id = '{var1}' AND id = '{var2}'`,
  "Q71": `UPDATE sales SET archived_at = '{var1}' , archived_by = '{var2}' , archived_reason ='{var3}'
          WHERE id = '{var4}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING * `,
  "Q72": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,
            sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.revenue_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason,
            sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.archived_at IS NOT NULL  
          ORDER BY
            sc.created_at DESC`,
  "Q73": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
             sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
              sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage, ss.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            sales_users AS su ON sc.id = su.sales_id
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            (
              sc.user_id IN ({var1})  
            OR
              su.user_id IN ({var1}) 
            ) AND sc.deleted_at is NULL AND sc.archived_at IS NOT NULL   
          GROUP BY 
            sc.id,sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id,
            sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id , u1.full_name ,
            sc.transfered_back_by ,
            slab.slab_name,
            u2.full_name,
            sc.deleted_at 
          ORDER BY
            sc.created_at DESC`,
  "Q74": `SELECT * FROM configurations WHERE company_id = '{var1}' AND deleted_at IS NULL `,
  "Q75": `UPDATE configurations SET deleted_at = '{var1}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  "Q76": `INSERT INTO 
            configurations( currency, phone_format, date_format,user_id, company_id, before_closing_days, after_closing_days )
          VALUES
            ('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}') RETURNING *`,
  "Q77": `SELECT sc.id AS sales_commission_id, 
            sc.closed_at,
            sc.booking_commission, 
            sc.revenue_commission,
            sc.target_amount,
            sc.sales_type,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                su.user_id as id ,su.user_percentage as percentage, su.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as su
                LEFT JOIN users AS u1 ON u1.id = su.user_id
                WHERE su.sales_id= sc.id AND su.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users
          FROM 
            sales as sc 
          LEFT JOIN sales_users as su
            on sc.id=su.sales_id
          WHERE 
            sc.company_id = '{var1}' AND 
            sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
            sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
            AND sc.archived_at IS NULL
          GROUP BY 
            sc.closed_at,
            sc.id,
            sc.booking_commission,
            sc.revenue_commission,
            sc.target_amount
          ORDER BY 
            sc.closed_at {var2}`,

  "Q78": `SELECT 
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

  "Q79": `SELECT            
                  c.customer_name,
                  sc.id AS sales_commission_id,
                  sc.sales_type
              FROM 
                  sales sc
                  LEFT JOIN customer_companies c ON c.id = sc.customer_id
              WHERE 
                  sc.closed_at is not null AND 
                  sc.company_id = '{var1}' AND 
                  sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL`,

  "Q80": `SELECT 
                  u.full_name AS sales_rep,
                  sc.id as sales_id
              FROM  
                  sales AS sc 
                  LEFT JOIN sales_users AS cr ON cr.sales_id = sc.id
                  AND cr.user_type = 'captain' 
                  LEFT JOIN users AS u ON u.id = cr.user_id
              WHERE 
                  sc.company_id = '{var1}' 
                  AND sc.closed_at BETWEEN '{var4}' AND '{var5}'
                  AND sc.deleted_at IS NULL 
                  AND cr.deleted_at IS NULL 
                  AND u.deleted_at IS NULL
              GROUP BY 
                  u.full_name,
                  sc.id 
              LIMIT {var2} OFFSET {var3}`,

  "Q81": `INSERT INTO contact_us(full_name, email, subject, messages, address) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
  "Q82": `INSERT INTO products(product_name,product_image,description,available_quantity,price,end_of_life,company_id, currency, user_id)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}' ) RETURNING *`,
  "Q83": `UPDATE products SET product_name = '{var2}',product_image = '{var3}', description = '{var4}',available_quantity = '{var5}', price = '{var6}', end_of_life = '{var7}', updated_at = '{var8}', currency = '{var10}' WHERE id = '{var1}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
  "Q84": `SELECT 
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
  "Q85": `UPDATE products SET deleted_at = '{var2}' WHERE id = '{var1}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
  "Q86": `SELECT id, product_name, product_image, description, available_quantity, price, end_of_life, company_id, created_at, updated_at FROM products WHERE id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  "Q87": `INSERT INTO products( company_id,user_id, product_name, product_image, description, available_quantity, price, end_of_life, currency) 
              VALUES ('{var1}','{var2}',$1,$2,$3,$4,$5,$6,$7)`,
  "Q88": `SELECT id, name, email, encrypted_password FROM super_admin WHERE email = '{var1}'`,
  "Q89": `SELECT id, company_name, company_logo, company_address, is_imap_enable,is_locked, is_marketing_enable, created_at, expiry_date, user_count FROM companies WHERE deleted_at IS NULL`,
  "Q90": `UPDATE super_admin SET encrypted_password = '{var2}' WHERE email = '{var1}'`,
  "Q91": `INSERT INTO payment_plans(product_id, name, description, active_status,
              admin_price_id, admin_amount,user_price_id, user_amount, interval, currency) 
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', 
              '{var9}','{var10}') RETURNING *`,
  "Q92": `SELECT id,  name, description, active_status,
              interval, admin_amount,user_amount, currency FROM payment_plans WHERE active_status = 'true' AND  deleted_at IS NULL`,
  "Q93": `SELECT id, product_id, name, description, active_status,
              admin_price_id,user_price_id, interval, admin_amount,user_amount, currency FROM payment_plans WHERE id = '{var1}' AND deleted_at IS NULL ORDER BY name asc`,
  "Q94": `UPDATE payment_plans SET name = '{var1}', description = '{var2}', 
               updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *` ,
  "Q95": `UPDATE payment_plans SET active_status = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  "Q96": `INSERT INTO transactions(user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}') RETURNING *` ,
  "Q97": `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade, is_canceled, payment_receipt  FROM transactions WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  "Q98": `SELECT id, name, description, active_status, interval, admin_amount,user_amount, currency FROM payment_plans WHERE deleted_at IS NULL`,
  "Q99": `SELECT id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_main_admin, expiry_date FROM users WHERE deleted_at IS NULL`,
  "Q100": `INSERT INTO superadmin_config(trial_days, trial_users) VALUES('{var1}', '{var2}') RETURNING *`,
  "Q101": `SELECT id, trial_days,trial_users, created_at FROM superadmin_config WHERE deleted_at IS NULL ORDER BY created_at desc `,
  "Q102": `UPDATE users SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  "Q103": `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id,total_amount, immediate_upgrade, upgraded_transaction_id FROM transactions WHERE deleted_at IS NULL AND upgraded_transaction_id is not null`,
  "Q104": `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade  FROM transactions WHERE plan_id = '{var1}' AND deleted_at IS NULL`,
  "Q105": `UPDATE transactions SET stripe_customer_id = '{var1}', stripe_subscription_id = '{var2}', 
              stripe_card_id = '{var3}', stripe_token_id = '{var4}', stripe_charge_id = '{var5}', 
              expiry_date = '{var6}', updated_at = '{var7}', total_amount = '{var9}', immediate_upgrade = '{var10}', payment_receipt = '{var11}', user_count = '{var12}', plan_id = '{var13}', upgraded_transaction_id = '{var14}'  WHERE id = '{var8}' AND deleted_at IS NULL RETURNING *`,
  "Q106": `UPDATE transactions SET is_canceled = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  "Q107": `SELECT id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at FROM chat WHERE is_group_chat = 'false' AND ((user_a = '{var1}' AND user_b = '{var2}') or (user_a = '{var2}' AND user_b = '{var1}')) AND deleted_at IS NULL`,
  "Q108": `INSERT INTO message( chat_id, sender, content) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  "Q109": `UPDATE chat SET last_message = '{var1}', updated_at = '{var3}' WHERE id = '{var2}'  AND deleted_at IS NULL RETURNING *`,
  "Q110": `INSERT INTO chat_room_members ( room_id, user_id, group_name) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  "Q111": `SELECT id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at FROM chat WHERE (user_a = '{var1}' or user_b = '{var1}') AND company_id = '{var2}' AND is_group_chat = '{var3}' AND deleted_at IS NULL`,
  "Q112": `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at FROM chat WHERE id = '{var1}' AND deleted_at IS NULL `,
  "Q113": `SELECT u.id, u.full_name, u.avatar FROM chat_room_members AS cm 
              INNER JOIN users AS u ON u.id = cm.user_id
              WHERE room_id = '{var1}' AND cm.deleted_at IS NULL AND u.deleted_at IS NULL`,
  "Q114": `SELECT 
              sc.id,su.user_id,sc.customer_id, u.full_name
           FROM sales AS sc 
           INNER JOIN sales_users AS su ON sc.id = su.sales_id 
           INNER JOIN users AS u ON su.user_id = u.id 
           WHERE sc.id = '{var1}' 
           AND sc.deleted_at IS NULL AND su.deleted_at IS NULL AND u.deleted_at IS NULL`,
  "Q115": `INSERT INTO chat(chat_name, is_group_chat, user_a, user_b, group_admin, sales_id, company_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}','{var6}','{var7}') RETURNING *`,
  "Q116": `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin FROM chat WHERE id = '{var1}' AND company_id = '{var2}' AND is_group_chat = '{var3}' AND deleted_at IS NULL`,
  "Q117": `SELECT m.id, m.sender, m.content, m.chat_id, m.read_by, m.created_at, u.full_name,
              u.avatar, u.id AS sender_id FROM message AS m INNER JOIN users AS u ON m.sender = u.id 
              WHERE m.id = '{var1}' AND m.deleted_at IS NULL`,
  "Q118": `SELECT m.id AS messageId, m.content, m.sender AS senderId, m.chat_id, m.read_by, m.created_at,
              u.full_name, u.avatar, c.id, c.chat_name, c.is_group_chat,
              c.group_admin, c.user_a, c.user_b, c.created_at FROM message AS m 
              INNER JOIN users AS u ON m.sender = u.id
              INNER JOIN chat AS c ON m.chat_id = c.id  WHERE chat_id = '{var1}' AND m.deleted_at IS NULL ORDER BY m.created_at DESC LIMIT 1`,
  "Q119": `SELECT m.id AS messageId,m.content,m.sender AS senderId, m.created_at,
             u.full_name, u.avatar FROM message AS m 
             INNER JOIN users AS u ON m.sender = u.id
            WHERE chat_id = '{var1}' AND m.deleted_at IS NULL ORDER BY m.created_at ASC `,
  "Q120": `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at FROM chat WHERE sales_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  "Q121": `SELECT room_id, user_id, group_name FROM chat_room_members WHERE user_id = '{var1}' AND deleted_at IS NULL`,

  "Q122": `SELECT id, message_id, to_mail, from_mail,from_name, mail_date, subject, mail_html, mail_text, mail_text_as_html, attechments, company_id, read_status, created_at FROM emails WHERE company_id = '{var1}' AND user_id = '{var2}' AND deleted_at IS NULL order by mail_date desc`,
  "Q123": `SELECT 
             cc.email_address 
           FROM 
             customer_company_employees AS cc
           WHERE 
             '{var1}' IN (cc.email_address) 
             AND cc.company_id = '{var2}' 
             AND (cc.emp_type = 'business' OR cc.emp_type = 'revenue') 
             AND cc.deleted_at IS NULL`,
  "Q124": `INSERT INTO emails ( message_id, to_mail, from_mail,from_name, mail_date, subject, 
              mail_html, mail_text, mail_text_as_html, company_id, attechments, user_id) VALUES('{var1}', '{var2}', 
              '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}','{var11}', '{var12}') RETURNING *` ,
  "Q125": `SELECT id, email, app_password, imap_host, imap_port, smtp_host, smtp_port, user_id FROM imap_credentials WHERE user_id = '{var1}' AND company_id = '{var2}'AND deleted_at IS NULL`,
  "Q126": `UPDATE emails SET read_status = '{var2}' WHERE message_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q127": `INSERT INTO sent_email( from_email, to_email, cc, subject, message, company_id, sales_id, attechments, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}', '{var8}','{var9}') RETURNING *`,
  "Q128": `SELECT id, to_email, from_email, cc, subject, message,attechments, company_id,sales_id, created_at FROM sent_email WHERE company_id = '{var1}' AND sales_id = '{var2}' AND user_id = '{var3}' AND deleted_at IS NULL order by created_at desc`,
  "Q129": `UPDATE imap_credentials SET deleted_at = '{var1}' WHERE user_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  "Q130": `INSERT INTO imap_credentials( email, app_password, user_id, imap_host, imap_port, smtp_host, smtp_port, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}') RETURNING *`,
  "Q131": `SELECT id,full_name,avatar FROM users WHERE id IN ('{var1}','{var2}') AND deleted_at IS NULL`,
  "Q132": `SELECT u.id, u.full_name, u.company_id, u.email_address, u.encrypted_password, u.mobile_number, u.role_id, 
              u.avatar, u.expiry_date, u.is_verified, u.is_admin, u.is_locked, u.is_main_admin,u.is_deactivated, c.company_name, c.company_address, c.company_logo, c.is_imap_enable,c.is_marketing_enable,
              r.id as role_id,r.role_name, r.reporter, r.module_ids, con.id AS config_id, con.currency, con.phone_format, con.date_format, con.before_closing_days, con.after_closing_days
              FROM users AS u 
              INNER JOIN companies AS c ON c.id = u.company_id
              INNER JOIN roles AS r ON r.id = u.role_id 
              INNER JOIN configurations AS con ON con.company_id = u.company_id
              WHERE LOWER(email_address) = LOWER('{var1}') AND u.deleted_at IS NULL 
              AND c.deleted_at IS NULL AND r.deleted_at IS NULL AND con.deleted_at IS NULL`,
  "Q133": `UPDATE companies SET is_imap_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q134": `SELECT id, product_name, product_image, description, available_quantity, price, end_of_life, currency, company_id, created_at, updated_at FROM products WHERE product_name = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL ORDER BY created_at desc `,
  "Q135": `INSERT INTO upgraded_transactions(id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}','{var14}') RETURNING *`,
  "Q136": `SELECT id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt FROM upgraded_transactions WHERE id = '{var1}' AND deleted_at IS NULL`,
  "Q137": `UPDATE upgraded_transactions SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  "Q138": `SELECT id,country_name,country_value,currency_name,currency_symbol,date_format,created_at FROM country_details WHERE deleted_at IS NULL`,
  "Q139": `SELECT 
                  DISTINCT(sc.id) AS sales_commission_id,
                  sc.sales_type, 
                  p.product_name
              FROM 
                  sales AS sc 
              LEFT JOIN 
                  customer_companies AS c ON sc.customer_id = c.id 
              LEFT JOIN 
                  product_in_sales AS ps ON sc.id = ps.sales_id
              LEFT JOIN 
                  products AS p ON p.id = ps.product_id
              WHERE 
                  sc.company_id = '{var1}'
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
                  AND sc.deleted_at IS NULL 
                  AND c.deleted_at IS NULL
                  AND sc.closed_at IS NOT NULL`,

  "Q140": `SELECT COUNT(*) AS actual_count FROM users WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  "Q141": `INSERT INTO product_in_sales(product_id,sales_id, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  "Q142": `UPDATE product_in_sales SET deleted_at = '{var1}' WHERE sales_id = '{var2}' AND company_id = '{var3}' RETURNING *`,
  "Q143": `UPDATE sales_logs SET closed_at = '{var1}', updated_at = '{var2}' WHERE sales_id = '{var3}' RETURNING *`,
  "Q144": `SELECT sc.id AS sales_commission_id, sc.target_amount as amount, sc.target_closing_date,
              sc.closed_at, sc.slab_id,sc.sales_type FROM sales AS sc WHERE sc.company_id = '{var1}' 
              AND sc.deleted_at IS NULL`,
  "Q145": `SELECT 
                id, company_name, company_logo, company_address, is_imap_enable, created_at, is_locked 
              FROM companies 
              WHERE deleted_at IS NULL AND created_at BETWEEN '{var1}' AND '{var2}' AND is_locked = false`,
  "Q146": `SELECT 
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
  "Q147": `SELECT id, closer_percentage, supporter_percentage, deleted_at FROM commission_split WHERE company_id ='{var1}'`,
  "Q148": `SELECT
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
  "Q149": `SELECT 
            sc.id AS sales_commission_id, 
            sc.closed_at,
            sc.booking_commission, 
            sc.revenue_commission,
            sc.target_amount,
            sc.sales_type,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                su.user_id as id ,su.user_percentage as percentage, su.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as su
                LEFT JOIN users AS u1 ON u1.id = su.user_id
                WHERE su.sales_id= sc.id AND su.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users
          FROM 
            sales as sc 
          LEFT JOIN sales_users as su
            on sc.id=su.sales_id
          WHERE (
            su.user_id in ({var1}) OR 
              sc.user_id in ({var1})
            ) 
          AND 
            sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
            sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL AND sc.archived_at IS NULL
          GROUP BY 
            sc.closed_at,
            sc.id,
            sc.booking_commission,
            sc.revenue_commission,
            sc.target_amount
          ORDER BY 
            sc.closed_at {var2}`,

  "Q150": `SELECT            
                  DISTINCT(sc.id) AS sales_commission_id,
                  c.customer_name,
                  sc.sales_type
              FROM 
                  sales sc
              LEFT JOIN customer_companies c ON c.id = sc.customer_id
              LEFT JOIN 
                sales_users AS su ON sc.id = su.sales_id  
              WHERE 
                  sc.closed_at is not null AND 
                  (sc.user_id IN ({var1}) OR su.user_id IN ({var1}) )
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL `,
  "Q151": `SELECT 
                  DISTINCT(sc.id) AS sales_commission_id, 
                  p.product_name,
                  sc.sales_type
              FROM 
                  sales AS sc 
              LEFT JOIN 
                  product_in_sales AS ps ON sc.id = ps.sales_id
              LEFT JOIN 
                  products AS p ON p.id = ps.product_id
              LEFT JOIN 
                sales_users AS su ON sc.id = su.sales_id  
              WHERE 
                  (sc.user_id IN ({var1}) OR su.user_id IN ({var1}))
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
                  AND sc.deleted_at IS NULL 
                  AND sc.closed_at IS NOT NULL`,
   "Q152": `SELECT 
                DISTINCT(sc.id) AS sales_commission_id,
                DATE_TRUNC('{var2}',sc.closed_at) AS  date,
                sc.sales_type
              FROM 
                sales AS sc 
              LEFT JOIN 
                sales_users AS su ON sc.id = su.sales_id  
              WHERE 
              (sc.user_id IN ({var1}) OR su.user_id IN ({var1})) AND
                sc.deleted_at IS NULL AND 
                sc.closed_at IS NOT NULL 
              ORDER BY 
                date ASC `,
  "Q153": `SELECT 
                f.id, f.timeline, f.amount, f.start_date, f.pid,
                f.end_date, f.created_by,f.created_at, f.assigned_to,
                u1.full_name as creator_name, u2.full_name as assigned_name, f.is_accepted, 
                (
                  SELECT json_agg(forecast_data.*)
                    from forecast_data
                    where forecast_data.forecast_id = f.id
                ) as forecast_data,
                (
                  SELECT json_agg(forecast) 
                    from forecast
                    where forecast.pid::varchar = f.id::varchar
                ) as assigned_forecast
              FROM 
                forecast AS f
              LEFT JOIN users as u1 on u1.id	 = f.created_by	
              LEFT JOIN users as u2 on u2.id	 = f.assigned_to
              WHERE 
                f.assigned_to IN ({var1}) AND f.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
  "Q154": `SELECT 
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
   "Q155": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,
            sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,
            sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage, ss.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCt(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            sales_users AS su ON sc.id = su.sales_id
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            (
              sc.user_id IN ({var1})  
            OR
              su.user_id IN ({var1}) 
            ) AND sc.deleted_at is NULL
          GROUP BY 
            sc.id,sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id,
            sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id , u1.full_name ,
            sc.transfered_back_by ,
            slab.slab_name,
            u2.full_name,
            sc.deleted_at 
          ORDER BY
            sc.created_at DESC`,
  "Q156": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,
            sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.revenue_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason,
             sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.closed_at IS NULL AND sc.archived_at IS NULL
          ORDER BY
            sc.created_at DESC`,
  "Q157": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
            sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
             sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL AND sc.archived_at IS NULL
          ORDER BY
            sc.created_at DESC`,
  "Q158": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
             sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
              sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage, ss.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            sales_users AS su ON sc.id = su.sales_id
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            (
              sc.user_id IN ({var1})  
            OR
              su.user_id IN ({var1}) 
            ) AND sc.deleted_at is NULL AND sc.closed_at IS NULL AND sc.archived_at IS NULL
          GROUP BY 
            sc.id,sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id,
            sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id , u1.full_name ,
            sc.transfered_back_by ,
            slab.slab_name,
            u2.full_name,
            sc.deleted_at 
          ORDER BY
            sc.created_at DESC`,
  "Q159": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
            sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
             sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
            sc.transfered_back_by as transfered_back_by_id ,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage, ss.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products
          FROM
            sales AS sc
          LEFT JOIN
            sales_users AS su ON sc.id = su.sales_id
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            (
              sc.user_id IN ({var1})  
            OR
              su.user_id IN ({var1}) 
            ) AND sc.deleted_at is NULL AND sc.closed_at IS NOT NULL AND archived_at IS NULL
          GROUP BY 
            sc.id,sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id,
            sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id , u1.full_name ,
            sc.transfered_back_by ,
            slab.slab_name,
            u2.full_name,
            sc.deleted_at 
          ORDER BY
            sc.created_at DESC`,
  "Q160": `UPDATE slabs SET deleted_at = '{var1}' WHERE slab_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
  "Q161": `SELECT * FROM slabs WHERE slab_id ='{var1}' AND deleted_at IS NULL ORDER BY slab_ctr ASC`,
  "Q162": `SELECT u.id, u.full_name, r.id as role_id,r.role_name, r.module_ids, r.reporter  FROM roles AS r 
              INNER JOIN users AS u ON u.role_id = r.id 
              WHERE r.id = '{var1}'  AND r.deleted_at IS NULL`,
  "Q163": `SELECT * FROM contact_us WHERE deleted_at IS NULL`,
  "Q164": `SELECT * from chat where is_group_chat = 'true' AND company_id = '{var1}' AND deleted_at IS NULL`,
  "Q165": `SELECT user_id FROM chat_room_members where room_id = '{var1}' AND deleted_at IS NULL`,
  "Q166": `UPDATE forecast SET deleted_at = '{var1}' WHERE id = '{var2}' OR pid = '{var2}' RETURNING *`,
  "Q167": `UPDATE 
                forecast 
              SET 
                timeline = '{var2}', amount = '{var3}', start_date = '{var4}', 
                end_date = '{var5}', updated_at = '{var6}' 
              WHERE 
                id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q168": `INSERT INTO customer_company_employees
            (full_name, title, email_address, phone_number,source, customer_company_id, creator_id, company_id,emp_type)
           VALUES
            ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}') RETURNING *`,
  "Q169": `INSERT INTO customer_company_employees (full_name,title,email_address,phone_number,
              address,source,linkedin_url,website,targeted_value,marketing_qualified_lead,
              assigned_sales_lead_to,additional_marketing_notes,creator_id,company_id, customer_company_id,emp_type)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}',
              '{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', '{var15}','{var16}') RETURNING *`,

  "Q170": `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,
                l.created_at,l.is_converted,l.is_rejected,l.reason,
                u1.full_name AS creator_name, c.customer_name ,
                 u2.full_name as assigned_sales_lead_name
              FROM 
                customer_company_employees AS l
              LEFt JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                l.company_id = '{var1}' AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

  "Q171": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.reason,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                customer_company_employees AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND emp_type= '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

  "Q172": `UPDATE customer_company_employees SET full_name = '{var2}', title = '{var3}',email_address = '{var4}',phone_number = '{var5}',
              address = '{var6}',source = '{var7}',linkedin_url = '{var8}',website = '{var9}',targeted_value = '{var10}',
              marketing_qualified_lead = '{var11}',assigned_sales_lead_to = '{var12}',additional_marketing_notes = '{var13}',
              updated_at = '{var14}', customer_company_id = '{var15}' WHERE id = '{var1}' AND deleted_at is null`,

  "Q173": `UPDATE customer_company_employees SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`,

  "Q174": `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND emp_type = 'lead' AND deleted_at IS NULL`,

  "Q175": `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customer_company_employees AS l 
              INNER JOIN 
                users AS u ON u.id = l.creator_id
              WHERE 
                l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
  "Q176"  :`SELECT 
              l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
              l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
              l.website,l.targeted_value,l.marketing_qualified_lead,
              l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
              u1.full_name AS creator_name, c.customer_name , u2.full_name as assigned_sales_lead_name
            FROM 
              customer_company_employees AS l
            LEFt JOIN 
              users AS u1 ON u1.id = l.creator_id
            LEFt JOIN 
              users AS u2 ON u2.id = l.assigned_sales_lead_to
            LEFt JOIN
              lead_sources AS s ON s.id = l.source
            LEFt JOIN
              lead_titles AS t ON t.id = l.title
            LEFT JOIN 
              customer_companies AS c ON c.id = l.customer_company_id
            WHERE 
              l.id = '{var1}' AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
            ORDER BY 
              l.created_at DESC`,
  "Q177": `select 
                distinct(l.id),l.creator_id,l.assigned_sales_lead_to, u.full_name as created_by,l.customer_company_id,
                l.is_rejected, l.marketing_qualified_lead
              FROM 
                customer_company_employees AS l 
              LEFT JOIN 
                users u ON u.id = l.creator_id
              where 
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND 
                l.emp_type = 'lead' AND l.deleted_at IS NULL AND u.deleted_at IS NULL
              ORDER BY 
                u.full_name {var4}
              LIMIT {var2} OFFSET {var3}`,

  "Q178": `INSERT INTO lead_titles( title, company_id ) VALUES('{var1}','{var2}') RETURNING *`,
  "Q179": `UPDATE lead_titles set title = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q180": `UPDATE lead_titles set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  "Q181": `SELECT * FROM lead_titles WHERE company_id = '{var1}' AND deleted_at IS NULL`,

  "Q182": `INSERT INTO lead_industries(industry, company_id ) VALUES('{var1}','{var2}') RETURNING *`,
  "Q183": `UPDATE lead_industries set industry = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q184": `UPDATE lead_industries set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  "Q185": `SELECT * FROM lead_industries WHERE company_id = '{var1}' AND deleted_at IS NULL`,

  "Q186": `INSERT INTO lead_sources(source, company_id ) VALUES('{var1}','{var2}') RETURNING *`,
  "Q187": `UPDATE lead_sources set source = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q188": `UPDATE lead_sources set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  "Q189": `SELECT * FROM lead_sources WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  "Q190": `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customer_company_employees AS l 
              INNER JOIN 
                users AS u ON u.id = l.creator_id
              WHERE 
                l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.marketing_qualified_lead = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
  "Q191": `SELECT * FROM lead_sources WHERE LOWER(source) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
  "Q192": `SELECT * FROM lead_titles WHERE LOWER(title) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
  "Q193": `SELECT * FROM lead_industries WHERE LOWER(industry) = LOWER('{var1}') and company_id = '{var2}' AND deleted_at IS NULL`,
  "Q194": `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND emp_type = 'lead' AND marketing_qualified_lead = true AND deleted_at IS NULL`,
  "Q195": `UPDATE companies SET is_marketing_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q196": `UPDATE companies SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  "Q197": `UPDATE companies SET expiry_date = '{var1}', user_count = '{var2}', updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *`,

  "Q198": `INSERT INTO marketing_budget(timeline,amount,start_date,end_date,created_by, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,

  "Q199": `INSERT INTO marketing_budget_description( budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}') RETURNING *`,

  "Q200": `INSERT INTO marketing_budget_description_logs(budget_description_id,budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,

  "Q201": `INSERT INTO marketing_budget_logs(budget_id,timeline,amount,start_date,end_date,created_by, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}') RETURNING *`,
  "Q202": `SELECT 
                b.id, b.timeline, b.amount, b.start_date,
                b.end_date, b.created_by,b.created_at,b.is_finalize,
                u1.full_name as creator_name,
                (
                  SELECT json_agg(marketing_budget_data.*)
                    FROM marketing_budget_data
                    WHERE marketing_budget_data.budget_id = b.id 
                    AND marketing_budget_data.deleted_at IS NULL
                ) as budget_data,
                (
                  SELECt json_agg(marketing_budget_description.*)
                  FROM marketing_budget_description
                  WHERE marketing_budget_description.budget_id = b.id
                  AND marketing_budget_description.deleted_at IS NULL
                )as budget_description
              FROM 
                marketing_budget AS b
              LEFT JOIN users as u1 on u1.id = b.created_by	
              WHERE 
                (b.company_id = '{var1}') AND b.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
  "Q203": `UPDATE marketing_budget SET deleted_at = '{var2}' where id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q204": `UPDATE marketing_budget_description SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q205": `SELECT 
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
                (b.created_by IN ({var1})) AND b.deleted_at IS NULL 
              ORDER BY 
                timeline ASC`,
  "Q206": `UPDATE marketing_budget SET timeline = '{var1}', amount = '{var2}', start_date = '{var3}', end_date = '{var4}'
              WHERE id = '{var6}' AND deleted_at IS NULL RETURNING *`,
  "Q207": `UPDATE marketing_budget_description SET title = '{var1}', amount = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  "Q208": `SELECT 
              b.id, b.timeline, b.amount, b.start_date,
              b.end_date, b.created_by,b.created_at,b.is_finalize,
              u1.full_name as creator_name,
              (
                SELECT json_agg(marketing_budget_description_logs.*)
                FROM marketing_budget_description_logs
                WHERE marketing_budget_description_logs.budget_id = b.budget_id
                AND marketing_budget_description_logs.deleted_at IS NULL
              )as budget_description
            FROM 
              marketing_budget_logs AS b
            LEFT JOIN users as u1 on u1.id = b.created_by	
            WHERE 
              (b.budget_id = '{var1}') AND b.deleted_at IS NULL 
            ORDER BY 
              timeline ASC`,
  "Q209": `SELECT 
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
  "Q210": `UPDATE marketing_budget_description SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  "Q211": `UPDATE marketing_budget SET is_finalize = true, updated_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q212": `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customer_company_employees AS l 
              INNER JOIN 
                users AS u ON u.id = l.assigned_sales_lead_to
              WHERE 
              l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}
              LIMIT {var2} OFFSET {var3}`,
  "Q213": `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND assigned_sales_lead_to IS NOT NULL AND emp_type = 'lead'  AND deleted_at IS NULL`,
  "Q214": `UPDATE companies SET company_logo = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q215": `UPDATE customer_company_employees SET is_rejected = '{var2}', reason = '{var3}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`,
  "Q216": `SELECT * FROM sales WHERE lead_id = '{var1}' AND deleted_at IS NULL`,
  "Q217": `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND emp_type = 'lead' AND is_rejected = '{var2}' AND deleted_at IS NULL`,
  "Q218": `SELECT 
              COUNT(*),
              u.full_name AS created_by
            FROM 
              customer_company_employees AS l 
            INNER JOIN 
              users AS u ON u.id = l.creator_id
            WHERE 
              l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.is_rejected = '{var5}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
            GROUP BY 
              u.full_name
            ORDER BY 
              count {var4}
            LIMIT {var2} OFFSET {var3}`,
  "Q219": `SELECT 
                DISTINCT(c.id)
              FROM 
                customer_companies AS c
              LEFT JOIN sales AS s ON c.id = s.customer_id
              WHERE c.company_id = '{var1}' AND s.closed_at IS NOT NULL AND c.deleted_at IS NULL`,

  "Q220": `SELECT 
                DISTINCT(c.id),
                u.full_name AS created_by
              FROM 
                customer_companies AS c
              LEFT JOIN 
                users AS u ON u.id = c.user_id
              LEFT JOIN
                sales AS s ON s.customer_id = c.id
              WHERE 
              c.company_id = '{var1}'  AND c.deleted_at IS NULL AND s.closed_at IS NOT NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name,
                c.id
              ORDER BY 
              u.full_name {var4}
              LIMIT {var2} OFFSET {var3}`,
  "Q221": `SELECT 
            sc.id as sales_commission_id,
            sc.closed_at,
            sc.booking_commission,
            sc.revenue_commission,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                su.user_id as id ,su.user_percentage as percentage, su.user_type,u1.full_name as name,u1.email_address as email
                FROM sales_users as su
                LEFT JOIN users AS u1 ON u1.id = su.user_id
                WHERE su.sales_id= sc.id AND su.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users
                  
          FROM  
          sales AS sc 
          LEFT JOIN 
          sales_users AS su 
          ON su.sales_id = sc.id
          WHERE 
          sc.closed_at is not null 
          AND (sc.user_id IN ({var1}) OR su.user_id IN ({var1}) )
          AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
          AND sc.deleted_at IS NULL
          GROUP BY   
          sc.id, sc.closed_at, sc.booking_commission, sc.revenue_commission`,

  "Q222": `SELECT * FROM sales WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
  "Q223": `SELECT * FROM product_in_sales WHERE product_id = '{var1}' AND deleted_at IS NULL`,
  "Q224": `UPDATE companies SET is_locked = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  "Q225": `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING * `,
  "Q226": `SELECT 
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
  "Q227": `UPDATE sales_users
           SET 
            user_id = '{var1}', updated_at = '{var2}' 
           WHERE 
            sales_id = '{var3}' AND user_type='{var4}' RETURNING * `,
  "Q228": `UPDATE sales SET transfer_reason = '{var1}',transfered_back_by = '{var4}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
  "Q229": `SELECT * FROM sales WHERE id = '{var1}' AND deleted_at is null`,
  "Q230": `INSERT INTO recognized_revenue( recognized_date, recognized_amount, booking_amount, notes, invoice, sales_id, user_id, company_id)
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}')RETURNING *`,
  "Q231": `SELECT * FROM recognized_revenue WHERE sales_id = '{var1}' AND deleted_at IS NULL`,
  "Q232": `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,
                l.created_at,l.is_converted,l.is_rejected,l.reason,
                u1.full_name AS creator_name , c.customer_name ,u2.full_name as assigned_sales_lead_name
              FROM 
                customer_company_employees AS l
              LEFT JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                l.company_id = '{var1}'  AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_rejected = TRUE
              ORDER BY 
                l.created_at DESC`,

  "Q233": `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name ,c.customer_name , u2.full_name as assigned_sales_lead_name
              FROM 
                customer_company_employees AS l
              LEFT JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                l.company_id = '{var1}' AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.marketing_qualified_lead = TRUE
              ORDER BY 
                l.created_at DESC`,

  "Q234": `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                customer_company_employees AS l
              LEFT JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                l.company_id = '{var1}' AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_converted = TRUE
              ORDER BY 
                l.created_at DESC`,
  "Q235": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.reason,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                customer_company_employees AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                 AND emp_type= '{var2}'
                 AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                 AND l.is_rejected = TRUE
              ORDER BY 
                l.created_at DESC`,

  "Q236": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                customer_company_employees AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                  AND emp_type= '{var2}'
                  AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                  AND l.marketing_qualified_lead = TRUE
              ORDER BY 
                l.created_at DESC`,
  "Q237": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                customer_company_employees AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                  AND emp_type= '{var2}'
                  AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                  AND l.is_converted = TRUE
              ORDER BY 
                l.created_at DESC`,
  "Q238": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name, c.customer_name, u2.full_name as assigned_sales_lead_name
              FROM 
                customer_company_employees AS l 
              LEFT JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFT JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFT JOIN
                lead_sources AS s ON s.id = l.source
              LEFT JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                l.assigned_sales_lead_to = '{var1}' AND emp_type = '{var2}'
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

  "Q239": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
              FROM 
                customer_company_employees AS l 
              LEFt JOIN 
                users AS u1 ON u1.id = l.creator_id
              LEFt JOIN 
                users AS u2 ON u2.id = l.assigned_sales_lead_to
              LEFt JOIN
                lead_sources AS s ON s.id = l.source
              LEFt JOIN
                lead_titles AS t ON t.id = l.title
              LEFT JOIN 
                customer_companies AS c ON c.id = l.customer_company_id
              WHERE 
                l.assigned_sales_lead_to IN ({var1})
                AND emp_type= '{var2}'
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,
  "Q240": `INSERT INTO transfered_back_sales(transferd_back_by_id, transferd_back_to_id, transfered_back_date,
              sales_id, transfer_reason, user_id, company_id)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}',
              '{var7}') RETURNING *`,

  "Q241": `SELECT 
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
                customer_companies AS c ON sc.customer_id = c.id
              WHERE 
                sales_id = '{var1}'`,
  "Q242": `UPDATE users SET session_time = '{var2}' WHERE id = '{var1}' RETURNING *`,
  "Q243": `SELECT * FROM  users  WHERE role_id = '{var1}' and deleted_at IS NULL `,
  "Q244": `SELECT * FROM  users  WHERE role_id = '{var1}' and id = '{var2}' and deleted_at IS NULL `,
  "Q245": `INSERT INTO notifications(title, type_id,user_id,type) VALUES ('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
  "Q246": `SELECT * FROM  notifications WHERE user_id= '{var1}' and is_read= false and deleted_at IS NULL ORDER BY created_at DESC`,
  "Q247": `SELECT * FROM  notifications WHERE user_id= '{var1}' and deleted_at IS NULL ORDER BY created_at DESC Limit 50`,
  "Q248": `UPDATE notifications SET is_read = true WHERE id = '{var1}' RETURNING *`,
  "Q249": `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
            sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id ,sc.approval_status,
            slab.slab_name,
            u2.full_name as tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT 
                  customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                  customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                  customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                  customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                  customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                  u1.full_name as created_by,s.source,t.title,c.customer_name
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                  AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                  AND customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT 
                ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                FROM sales_users as ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
              ) sales_users
            ) as sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT 
                  DISTINCT(p.id) ,p.product_name as name
                FROM product_in_sales as pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
              ) product_in_sales
            ) as products,
            (
              SELECT json_agg(sales_approval.*)
              FROM (
                SELECT sap.id,sap.percentage,sap.description,sap.sales_id,sap.company_id,sap.approver_user_id,
                  sap.requested_user_id,sap.created_at,sap.updated_at,sap.deleted_at,sap.status,sap.reason,
                  u1.full_name AS approver_user_name,u2.full_name AS requested_user_name
                FROM sales_approval as sap
                LEFT JOIN users as u1 ON u1.id = sap.approver_user_id
                LEFT JOIN users as u2 ON u2.id = sap.requested_user_id
                WHERE sap.sales_id = sc.id AND sap.deleted_at IS NULL AND sap.status = 'Pending'
              ) sales_approval
            ) as sales_approval
          FROM
            sales AS sc
          LEFT JOIN
            users AS u1 ON u1.id = sc.user_id
          LEFT JOIN
            customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN
            slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN
            users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            sc.company_id = '{var1}' AND sc.id = '{var2}' AND sc.deleted_at IS NULL   
          ORDER BY
            sc.created_at DESC`,
  "Q250": `SELECT
            u.id, u.email_address, u.full_name, u.company_id, u.avatar, u.mobile_number,
            u.phone_number, u.address, u.role_id, u.is_admin, u.expiry_date, u.created_at,u.is_verified,
            u.is_main_admin, u.created_by,
            r.role_name
          FROM
            users as u
          LEFT JOIN
            roles as r ON r.id = u.role_id
          WHERE
            u.company_id = '{var1}' AND u.id = '{var2}' AND u.deleted_at IS NULL
          ORDER BY
            u.created_at DESC`,
  "Q251": `INSERT INTO forecast_data(forecast_id, amount, start_date, end_date, type, created_by, company_id)
                VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
  "Q252": `SELECT  sc.target_amount::DECIMAL as subscription_amount,
              sc.booking_commission::DECIMAL as subscription_booking_commission,
              sc.revenue_commission::DECIMAL as subscription_revenue_commission
            FROM
              sales AS sc
            WHERE
              sc.id = '{var1}' AND sc.sales_type = 'Subscription'
            AND
              sc.deleted_at IS NULL AND sc.archived_at IS NULL`,
  "Q253": `UPDATE sales SET revenue_commission =  '{var1}' WHERE id = '{var2}' RETURNING *`,
  "Q254": `SELECT  SUM(target_amount::DECIMAL) as amount, SUM(booking_commission::DECIMAL) as booking_commission, SUM(revenue_commission::DECIMAL) as revenue_commission
            FROM 
              sales 
            WHERE 
              company_id = '{var1}' 
            AND 
              sales_type = '{var2}' 
            AND
              closed_at BETWEEN '{var3}' AND '{var4}'
            AND 
              deleted_at IS NULL
            AND 
              archived_at IS NULL`,
  "Q255": `SELECT  SUM(recognized_amount::DECIMAL) as amount FROM 
                recognized_revenue 
              WHERE 
                company_id = '{var1}' 
              AND
                created_at BETWEEN '{var3}' AND '{var4}'
              AND 
                deleted_at IS NULL`,
  "Q256": `SELECT SUM(recognized_amount::DECIMAL) as amount FROM recognized_revenue
              WHERE 
                sales_id = '{var1}' 
              AND 
                deleted_at IS NULL`,
  "Q257": `SELECT DISTINCT(sc.id)
          FROM
            sales AS sc
          LEFT JOIN
            sales_users AS su ON sc.id = su.sales_id
          WHERE
            ( 
              sc.user_id IN ({var1}) 
            OR 
              su.user_id IN ({var1})
            )
          AND 
            sc.closed_at BETWEEN '{var2}' AND '{var3}'
          AND 
            sc.deleted_at IS NULL AND sc.archived_at IS NULL`,

  "Q258": `SELECT SUM(target_amount::DECIMAL) as amount, 
            SUM(booking_commission::DECIMAL) as booking_commission, 
            SUM(revenue_commission::DECIMAL) as revenue_commission
          FROM 
            sales 
          WHERE 
            id IN ({var1}) AND sales_type = '{var2}'
          AND deleted_at IS NULL AND archived_at IS NULL`,

  "Q259": `SELECT SUM(recognized_amount::DECIMAL) as amount
              FROM 
                recognized_revenue 
              WHERE 
                sales_id IN ({var1}) 
              AND deleted_at IS NULL` ,
  "Q260": `UPDATE 
                forecast_data
              SET 
                deleted_at = '{var2}' 
              WHERE 
                forecast_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q261": `SELECT 
              f.id, f.timeline, f.amount, f.start_date, f.pid,
              f.end_date, f.created_by,f.created_at, f.assigned_to,f.is_accepted,
              u1.full_name as creator_name, u2.full_name as assigned_name, 
              (
                SELECT json_agg(forecast_data.*)
                  FROM forecast_data
                  WHERE forecast_data.forecast_id = f.id AND forecast_data.deleted_at IS NULL
              ) as forecast_data,
              (
                SELECT json_agg(forecast) 
                  FROM (
                    SELECT forecast.*,
                      (
                        SELECT json_agg(forecast_data.*)
                          FROM forecast_data
                          WHERE forecast_data.forecast_id = forecast.id AND forecast_data.deleted_at IS NULL
                      ) as forecast_data
                    FROM forecast
                    WHERE forecast.pid::varchar = f.id::varchar AND forecast.deleted_at IS NULL
                  ) forecast
              ) as assigned_forecast,
              (
                SELECT json_agg(fa.*)
                  FROM forecast_audit fa
                WHERE (fa.forecast_id = f.id OR fa.pid::varchar = f.id::varchar)
              ) as audit_forecast
            FROM 
              forecast AS f
            LEFT JOIN users as u1 on u1.id	 = f.created_by	
            LEFT JOIN users as u2 on u2.id	 = f.assigned_to
            WHERE 
              f.id = '{var1}' AND f.deleted_at IS NULL 
            ORDER BY 
              timeline ASC`,

  "Q262": `UPDATE 
              forecast
            SET 
                amount = '{var2}', assigned_to = '{var3}', is_accepted = {var4}
            WHERE 
              id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q263": `INSERT INTO forecast_audit(forecast_id,amount,reason,created_by,pid, forecast_amount)
            VALUES('{var1}', '{var2}', '{var3}', '{var4}','{var5}', '{var6}') RETURNING *`,
  "Q264": `UPDATE forecast SET deleted_at = '{var1}' WHERE assigned_to = '{var2}' AND id = '{var3}' RETURNING *`,
  "Q265": `UPDATE forecast_data SET deleted_at = '{var1}' WHERE forecast_id = '{var2}' RETURNING *`,
  "Q266": `SELECT DISTINCT(sc.id)
           FROM sales as sc
           LEFT JOIN sales_users AS su ON su.sales_id = sc.id
           WHERE 
            ( 
              sc.user_id = '{var1}'
              OR su.user_id = '{var1}' 
            ) 
            AND sc.closed_at BETWEEN '{var2}'::date AND '{var3}'::date 
            AND sc.deleted_at is null`,
  "Q267": `INSERT INTO marketing_budget_data(budget_id, amount, start_date, end_date, type, created_by)
           VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}' ) RETURNING *`,
  "Q268": `UPDATE marketing_budget_data SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  "Q269": `UPDATE marketing_budget_data SET deleted_at = '{var1}'
            WHERE budget_id = '{var2}' AND deleted_at IS NULL RETURNING *`,       
  "Q270": `SELECT 
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
  "Q271": `SELECT cus.id, cus.customer_name,
              cus.user_id,cus.industry as industry_id,
              cus.created_at, cus.address, cus.currency,
              u.full_name AS created_by,
              li.industry,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, 
                    customer_company_employees.emp_type,customer_company_employees.is_converted,customer_company_employees.reason,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE cus.id  = customer_company_employees.customer_company_id 
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) as lead_data
              FROM 
                customer_companies AS cus 
              LEFT JOIN 
                users AS u ON u.id = cus.user_id
              LEFT JOIN 
			  	      lead_industries AS li ON li.id = cus.industry
              WHERE 
                cus.user_id IN ({var1}) AND cus.deleted_at IS NULL
              ORDER BY 
                created_at desc`,
  "Q272": `SELECT 
              u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
              u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
              u1.is_main_admin, u1.created_by,u1.is_deactivated, u2.full_name AS creator_name, r.role_name AS roleName
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
  "Q273": `SELECT id, closer_percentage, supporter_percentage
            FROM 
              commission_split
            WHERE 
              user_id IN ({var1}) AND deleted_at IS NULL`,
   "Q274": `SELECT 
              b.id, b.timeline, b.amount, b.start_date,
              b.end_date, b.created_by,b.created_at,b.is_finalize,
              u1.full_name as creator_name,
              (
                SELECT json_agg(marketing_budget_data.*)
                  FROM marketing_budget_data
                  WHERE marketing_budget_data.budget_id = b.id 
                  AND marketing_budget_data.deleted_at IS NULL
              ) as budget_data,
              (
                SELECT json_agg(marketing_budget_description.*)
                FROM marketing_budget_description
                WHERE marketing_budget_description.budget_id = b.id
                AND marketing_budget_description.deleted_at IS NULL
              )as budget_description
            FROM 
              marketing_budget AS b
            LEFT JOIN users as u1 on u1.id = b.created_by	
            WHERE 
              (b.id = '{var1}') AND b.deleted_at IS NULL 
            ORDER BY 
              timeline ASC`,
   "Q275": `UPDATE customer_company_employees SET updated_at = '{var1}', is_converted = true WHERE id = '{var2}' RETURNING *`,
   "Q276": `UPDATE companies SET updated_at = '{var1}', is_roles_created = true WHERE id = '{var2}' RETURNING *`,
   "Q277": `UPDATE companies SET updated_at = '{var1}', is_users_created = true WHERE id = '{var2}' RETURNING *`,
   "Q278": `UPDATE companies SET updated_at = '{var1}', is_leads_created = true WHERE id = '{var2}' RETURNING *`,
   "Q279": `UPDATE companies SET updated_at = '{var1}', is_customers_created = true WHERE id = '{var2}' RETURNING *`,
   "Q280": `UPDATE companies SET updated_at = '{var1}', is_products_created = true WHERE id = '{var2}' RETURNING *`,
   "Q281": `UPDATE companies SET updated_at = '{var1}', is_commissions_created = true WHERE id = '{var2}' RETURNING *`,
   "Q282": `UPDATE companies SET updated_at = '{var1}', is_slabs_created = true WHERE id = '{var2}' RETURNING *`,

   "Q283": `UPDATE forecast SET updated_at = '{var1}', is_accepted = true WHERE id = '{var2}' RETURNING *`,
   "Q284": `SELECT 
              is_roles_created, is_users_created, is_leads_created, is_customers_created,
              is_products_created, is_commissions_created, is_slabs_created 
            FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
    "Q285": `SELECT id FROM customer_company_employees WHERE title = '{var1}' AND deleted_at IS NULL`,
    "Q286": `SELECT id FROM customer_company_employees WHERE source = '{var1}' AND deleted_at IS NULL`,
    "Q287": `SELECT id FROM customer_companies WHERE industry = '{var1}' AND deleted_at IS NULL`,
    "Q288": `SELECT id FROM sales WHERE slab_id = '{var1}' AND deleted_at IS NULL`,
    "Q289": `SELECT s.slab_id FROM slabs AS s
             LEFT JOIN 
              sales AS sc ON sc.slab_id = s.slab_id
             WHERE s.id = '{var1}' 
             AND s.deleted_at is null AND sc.deleted_at is null`,
    "Q290": `SELECT sc.id FROM sales AS sc
             LEFT JOIN 
              commission_split AS c ON sc.customer_commission_split_id = c.id
             WHERE sc.customer_commission_split_id = '{var1}' 
             AND c.deleted_at is null AND sc.deleted_at is null`,
    "Q291":`SELECT s.id FROM slabs AS s
            LEFT JOIN 
            commission_split AS c ON s.commission_split_id = c.id
            WHERE s.commission_split_id = '{var1}' 
            AND c.deleted_at is null AND s.deleted_at is null`,
    "Q292": `SELECT * FROM  notifications 
             WHERE type_id= '{var1}' AND type = '{var2}' AND is_read= false AND deleted_at IS NULL 
             ORDER BY created_at DESC`,
    "Q293": `INSERT INTO sales_approval 
              ( percentage, description, sales_id,company_id, requested_user_id, approver_user_id,status)
            VALUES
              ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
    "Q294": `UPDATE sales 
            SET updated_at = '{var1}', approval_status = '{var2}' 
            WHERE id = '{var3}' RETURNING *`,
    "Q295": `UPDATE sales_approval 
            SET updated_at = '{var1}', status = '{var2}' ,reason ='{var3}'
            WHERE id = '{var4}'  AND sales_id = '{var5}' RETURNING *`,
    "Q296": `SELECT * FROM sales_approval WHERE id = '{var1}' AND sales_id = '{var2}' AND deleted_at IS NULL `,
    "Q297": `SELECT sap.id,sap.percentage,sap.description,sap.sales_id,sap.company_id,sap.approver_user_id,
              sap.requested_user_id,sap.created_at,sap.updated_at,sap.deleted_at,sap.status,sap.reason,
              u1.full_name AS approver_user_name,u2.full_name AS requested_user_name
            FROM sales_approval as sap
            LEFT JOIN users as u1 ON u1.id = sap.approver_user_id
            LEFT JOIN users as u2 ON u2.id = sap.requested_user_id
            WHERE sap.sales_id = '{var1}' AND sap.deleted_at IS NULL ORDER BY sap.created_at DESC`,
    "Q298": `SELECT 
              l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
              l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
              l.website,l.targeted_value,l.marketing_qualified_lead,
              l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
              u1.full_name AS creator_name,c.customer_name , u2.full_name as assigned_sales_lead_name 
            FROM 
              customer_company_employees AS l
            LEFT JOIN 
              users AS u1 ON u1.id = l.creator_id
            LEFT JOIN 
              users AS u2 ON u2.id = l.assigned_sales_lead_to
            LEFT JOIN
              lead_sources AS s ON s.id = l.source
            LEFT JOIN
              lead_titles AS t ON t.id = l.title
            LEFT JOIN 
              customer_companies AS c ON c.id = l.customer_company_id
            WHERE 
              l.company_id = '{var1}' AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              AND l.is_converted = FALSE
            ORDER BY 
              l.created_at DESC`,

    "Q299": `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name 
            FROM 
              customer_company_employees AS l 
            LEFt JOIN 
              users AS u1 ON u1.id = l.creator_id
            LEFt JOIN 
              users AS u2 ON u2.id = l.assigned_sales_lead_to
            LEFt JOIN
              lead_sources AS s ON s.id = l.source
            LEFt JOIN
              lead_titles AS t ON t.id = l.title
            LEFT JOIN 
              customer_companies AS c ON c.id = l.customer_company_id
            WHERE 
              (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1}))
                AND emp_type= '{var2}'
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_converted = FALSE
            ORDER BY 
              l.created_at DESC`,
    "Q300": `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
              sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
                sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
              cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
              sc.transfered_back_by as transfered_back_by_id ,
              slab.slab_name,
              u2.full_name as tranfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) as lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                  SELECT 
                  ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                  FROM sales_users as ss
                  LEFT JOIN users AS u1 ON u1.id = ss.user_id
                  WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
                ) sales_users
              ) as sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT 
                    DISTINCT(p.id) ,p.product_name as name
                  FROM product_in_sales as pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
                ) product_in_sales
              ) as products
            FROM
              sales AS sc
            LEFT JOIN
              users AS u1 ON u1.id = sc.user_id
            LEFT JOIN
              customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN
              slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN
              users AS u2 ON u2.id = sc.transfered_back_by
            WHERE
              sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.sales_type = '{var2}'
            ORDER BY
              sc.created_at DESC`,

    "Q301": `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
              sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
              sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
              cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
              sc.transfered_back_by as transfered_back_by_id ,
              slab.slab_name,
              u2.full_name as tranfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) as lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                  SELECT 
                  ss.user_id as id ,ss.user_percentage as percentage, ss.user_type,u1.full_name as name,u1.email_address as email
                  FROM sales_users as ss
                  LEFT JOIN users AS u1 ON u1.id = ss.user_id
                  WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
                ) sales_users
              ) as sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT 
                    DISTINCT(p.id) ,p.product_name as name
                  FROM product_in_sales as pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
                ) product_in_sales
              ) as products
            FROM
              sales AS sc
            LEFT JOIN
              sales_users AS su ON sc.id = su.sales_id
            LEFT JOIN
              users AS u1 ON u1.id = sc.user_id
            LEFT JOIN
              customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN
              slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN
              users AS u2 ON u2.id = sc.transfered_back_by
            WHERE
              (
                sc.user_id IN ({var1})  
              OR
                su.user_id IN ({var1}) 
              ) AND sc.deleted_at is NULL AND sc.sales_type = '{var2}'
            GROUP BY 
              sc.id,sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id,
              sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
              cus.customer_name, cus.user_id , u1.full_name ,
              sc.transfered_back_by ,
              slab.slab_name,
              u2.full_name,
              sc.deleted_at 
            ORDER BY
              sc.created_at DESC`,

    "Q302" :`SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
              sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
                sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
              cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
              sc.transfered_back_by as transfered_back_by_id ,
              slab.slab_name,
              u2.full_name as tranfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) as lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                  SELECT 
                  ss.user_id as id ,ss.user_percentage as percentage,ss.user_type ,u1.full_name as name,u1.email_address as email
                  FROM sales_users as ss
                  LEFT JOIN users AS u1 ON u1.id = ss.user_id
                  WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
                ) sales_users
              ) as sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT 
                    DISTINCT(p.id) ,p.product_name as name
                  FROM product_in_sales as pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
                ) product_in_sales
              ) as products
            FROM
              sales AS sc
            LEFT JOIN
              users AS u1 ON u1.id = sc.user_id
            LEFT JOIN
              customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN
              slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN
              users AS u2 ON u2.id = sc.transfered_back_by
            WHERE
              sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.revenue_commission::decimal > 0 AND sc.archived_at IS NULL
            ORDER BY
              sc.created_at DESC`,

  "Q303": `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
              sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
              sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
              cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
              sc.transfered_back_by as transfered_back_by_id ,
              slab.slab_name,
              u2.full_name as tranfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type, 
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE ( customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id )
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) as lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                  SELECT 
                  ss.user_id as id ,ss.user_percentage as percentage, ss.user_type,u1.full_name as name,u1.email_address as email
                  FROM sales_users as ss
                  LEFT JOIN users AS u1 ON u1.id = ss.user_id
                  WHERE ss.sales_id= sc.id AND ss.deleted_at IS NULL AND  u1.deleted_at IS NULL
                ) sales_users
              ) as sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT 
                    DISTINCT(p.id) ,p.product_name as name
                  FROM product_in_sales as pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND  p.deleted_at IS NULL
                ) product_in_sales
              ) as products
            FROM
              sales AS sc
            LEFT JOIN
              sales_users AS su ON sc.id = su.sales_id
            LEFT JOIN
              users AS u1 ON u1.id = sc.user_id
            LEFT JOIN
              customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN
              slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN
              users AS u2 ON u2.id = sc.transfered_back_by
            WHERE
              (
                sc.user_id IN ({var1})  
              OR
                su.user_id IN ({var1}) 
              ) AND sc.deleted_at is NULL AND sc.revenue_commission::decimal > 0 AND archived_at IS NULL
            GROUP BY 
              sc.id,sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite,sc.business_contact_id,
              sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.revenue_contact_id,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission, sc.currency, sc.target_closing_date,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, sc.created_at,sc.user_id, sc.closed_at, sc.slab_id,sc.lead_id,
              cus.customer_name, cus.user_id , u1.full_name ,
              sc.transfered_back_by ,
              slab.slab_name,
              u2.full_name,
              sc.deleted_at 
            ORDER BY
              sc.created_at DESC`,

    "Q304": `SELECT 
              sc.id AS sales_commission_id,
              sc.target_amount,
              DATE_TRUNC('{var2}',sc.archived_at) AS  date,
              sc.sales_type
            FROM 
              sales AS sc 
            WHERE 
              sc.company_id = '{var1}' AND 
              sc.deleted_at IS NULL AND 
              sc.archived_at IS NOT NULL 
            ORDER BY 
              date ASC `,

    "Q305": `SELECT 
              DISTINCT(sc.id) AS sales_commission_id,
              sc.target_amount,
              DATE_TRUNC('{var2}',sc.archived_at) AS  date,
              sc.sales_type
            FROM 
              sales AS sc 
            LEFT JOIN 
              sales_users AS su ON sc.id = su.sales_id  
            WHERE 
            (sc.user_id IN ({var1}) OR su.user_id IN ({var1})) AND
              sc.deleted_at IS NULL AND 
              sc.archived_at IS NOT NULL 
            ORDER BY 
              date ASC `,
    "Q306": `SELECT id,
                (
                  select json_agg(forecast_data.created_by) from forecast_data where forecast_data.forecast_id = forecast.id
                  AND forecast_data.deleted_at IS NULL
                ) as forecast_data_creator,
                (
                  select json_agg(forecast_data.*) from forecast_data where forecast_data.forecast_id = '{var1}' 
                  AND forecast_data.deleted_at IS NULL
                ) as forecast_data
            FROM forecast  
            where forecast.id = '{var1}'  
              OR forecast.pid = '{var1}'  and forecast.deleted_at is null`,
    "Q307": `SELECT * FROM sales_users WHERE user_id = '{var1}' AND user_type = 'captain' AND deleted_at IS NULL`,
    "Q308": `SELECT * FROM customer_company_employees WHERE assigned_sales_lead_to = '{var1}' AND emp_type = 'lead' AND deleted_at IS NULL`,
    "Q309": `UPDATE sales_users set user_id = '{var2}' WHERE user_id = '{var1}' AND user_type = 'captain' AND deleted_at IS NULL`,
    "Q310": `Update customer_company_employees set assigned_sales_lead_to = '{var2}' WHERE assigned_sales_lead_to = '{var1}' AND emp_type = 'lead' AND deleted_at IS NULL`,
    "Q311": `UPDATE users SET is_deactivated = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING * `,

}

function dbScript(template, variables) {
  if (variables != null && Object.keys(variables).length > 0) {
    template = template.replace(new RegExp("\{([^\{]+)\}", "g"), (_unused, varName) => {
      return variables[varName];
    });
  }
  template = template.replace(/'null'/g, null);
  return template
}

module.exports = { db_sql, dbScript };