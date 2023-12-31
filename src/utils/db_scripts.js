const db_sql = {
  Q1: `SELECT * FROM companies WHERE company_name = '{var1}'`,
  Q2: `INSERT INTO companies(company_name,company_logo,company_address,expiry_date, user_count) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
  Q3: `INSERT INTO users(full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,expiry_date,is_verified,is_admin,is_main_admin) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}',false,true,true) RETURNING *`,
  Q4: `SELECT * FROM users WHERE email_address = '{var1}' AND deleted_at IS NULL`,
  Q5: `UPDATE users SET encrypted_password = '{var2}', is_verified = true, updated_at = '{var3}' WHERE id = '{var1}' AND company_id = '{var4}' RETURNING *`,
  Q6: `SELECT id, module_name,module_type FROM modules WHERE deleted_at IS NULL`,
  Q7: `UPDATE users SET is_verified = true ,updated_at = '{var2}' WHERE id = '{var1}' RETURNING *`,
  Q8: `SELECT id, full_name,company_id, email_address,mobile_number,phone_number,address,role_id, avatar,expiry_date, is_verified, is_admin, is_locked,is_deactivated, created_by,is_main_admin, created_at, deleted_at, session_time FROM users WHERE id = '{var1}' and deleted_at IS NULL`,
  Q9: `SELECT * FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
  Q10: `UPDATE users SET full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' WHERE id = '{var8}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
  Q11: `INSERT INTO roles(role_name,reporter,company_id) VALUES('Admin','','{var1}') RETURNING *`,
  Q12: `SELECT * FROM roles WHERE id = '{var1}' AND deleted_at IS NULL`,
  Q13: `INSERT INTO roles(role_name,reporter,company_id,user_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
  Q14: `SELECT * FROM roles WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  Q15: `SELECT 
                u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                u1.is_main_admin,u1.is_deactivated,u1.created_by, u2.full_name AS creator_name , r.role_name AS roleName,
                u1.assigned_to,u3.full_name as assigned_user_name, u1.updated_at,u1.is_pro_user
              FROM 
                users AS u1 
              LEFT JOIN 
                users AS u2 ON u2.id = u1.created_by
			        LEFT JOIN 
                users AS u3 ON u3.id = u1.assigned_to
              LEFT JOIN 
                roles as r on r.id = u1.role_id
              WHERE 
                u1.company_id = '{var1}' AND u1.deleted_at IS NULL 
              ORDER BY 
                created_at DESC`,
  Q16: `SELECT * FROM roles WHERE reporter = '{var1}' AND deleted_at IS NULL`,
  Q17: `SELECT
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
                s.slab_id, s.id,c.closer_percentage,c.supporter_percentage
              ORDER BY
                s.created_at ASC   `,
  Q18: `INSERT INTO slabs(min_amount, max_amount, percentage, is_max, company_id, currency, slab_ctr, user_id, slab_id, slab_name, commission_split_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}', '{var8}','{var9}','{var10}','{var11}') RETURNING * `,
  Q19: `UPDATE slabs SET slab_name = '{var1}', min_amount = '{var2}', max_amount = '{var3}', percentage = '{var4}', is_max = '{var5}', company_id = '{var6}',currency = '{var7}', slab_ctr = '{var8}', user_id = '{var9}', updated_at = '{var12}', commission_split_id = '{var13}' WHERE id = '{var10}' AND slab_id = '{var11}' AND deleted_at IS NULL RETURNING *`,
  Q20: `INSERT INTO permissions( role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view_global,permission_to_view_own, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}') RETURNING *`,
  Q21: `SELECT u.id,u.email_address, u.full_name, u.company_id, 
            u.avatar,u.mobile_number,u.phone_number,u.address,u.role_id ,r.role_name
          FROM users AS u
          LEFT JOIN  
            roles AS r ON r.id = u.role_id
          WHERE u.role_id = '{var1}' AND u.company_id = '{var2}' AND u.deleted_at IS NULL `,
  Q22: `UPDATE users SET email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}',avatar = '{var8}', is_admin = '{var10}', is_pro_user = '{var11}' WHERE id = '{var6}' AND company_id = '{var9}' AND is_deactivated = false AND deleted_at IS NULL RETURNING * `,
  Q23: `UPDATE users SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
  Q24: `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id,is_admin,expiry_date, created_at, deleted_at,is_locked FROM users WHERE company_id = '{var1}' ORDER BY created_at desc`,
  Q25: `UPDATE roles SET role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' WHERE id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
  Q26: `update permissions SET permission_to_create= '{var1}', permission_to_view_global = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}', permission_to_view_own = '{var8}' WHERE role_id = '{var5}' AND module_id = '{var7}' AND deleted_at IS NULL `,
  Q27: `UPDATE roles SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q28: `UPDATE permissions SET deleted_at = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING * `,
  Q29: `UPDATE slabs SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
  Q30: `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND is_main_admin = false AND deleted_at IS NULL RETURNING * `,
  Q31: `INSERT INTO customer_company_employees_activities (sales_id, company_id, user_id, notes, notes_type, lead_id, product_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}', '{var7}') RETURNING *`,
  Q32: `SELECT f.id, f.notes, f.notes_type, f.created_at, f.user_id, u.full_name, u.avatar, p.id as product_id, p.product_name
              FROM customer_company_employees_activities as f
              LEFT JOIN users AS u ON u.id = f.user_id
              LEFT JOIN products AS p on p.id = f.product_id
              WHERE (sales_id = '{var1}' OR lead_id = '{var1}') AND f.deleted_at IS NULL ORDER BY created_at DESC`,
  Q33: `UPDATE permissions SET user_id = '{var2}' WHERE role_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q34: `UPDATE roles SET module_ids = '{var1}' , updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
  Q35: `SELECT m.id, m.module_name, p.permission_to_view_global,p.permission_to_view_own,
              p.permission_to_create, p.permission_to_update, p.permission_to_delete 
              FROM modules AS m 
              LEFT JOIN permissions AS p ON p.module_id = m.id
              LEFT JOIN roles AS r ON r.id = p.role_id 
              WHERE m.id IN ('{var1}') AND r.id = '{var2}' 
              AND m.deleted_at IS NULL AND p.deleted_at IS NULL
              ORDER BY m.module_ctr ASC`,
  Q36: `INSERT INTO customer_companies ( user_id,customer_name, company_id, address, currency, industry) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
  Q37: `INSERT INTO lead_organizations(id, organization_name, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  Q38: `SELECT id, organization_name FROM lead_organizations WHERE id = '{var1}' AND deleted_at IS NULL`,
  Q39: `SELECT 
                cus.id, cus.customer_name, 
                cus.user_id, cus.industry as industry_id,
                cus.created_at, cus.address, cus.currency,cus.archived_at,
                u.full_name AS created_by,cus.reason,
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
                cus.company_id = '{var1}' AND cus.deleted_at IS NULL
                AND u.deleted_at IS NULL 
              ORDER BY 
                created_at desc`,
  Q40: `UPDATE sales SET closed_at = '{var1}', updated_at = '{var2}', contract = '{var4}' WHERE id = '{var3}' RETURNING *`,
  Q41: `SELECT u.id, u.company_id, u.role_id, u.avatar, u.full_name,u.email_address,u.mobile_number,u.phone_number,u.address,u.is_verified,u.created_by,
              m.id AS module_id, m.module_name, m.module_type, p.id AS permission_id, p.permission_to_view_global, p.permission_to_view_own,
              p.permission_to_create, p.permission_to_update, p.permission_to_delete
              FROM modules AS m 
              LEFT JOIN permissions AS p ON p.module_id = m.id
              LEFT JOIN users AS u ON u.role_id = p.role_id
              WHERE m.module_name = '{var1}' AND u.id = '{var2}' AND m.deleted_at IS NULL 
              AND p.deleted_at IS NULL AND u.deleted_at IS NULL`,
  Q42: `UPDATE customer_companies SET customer_name = '{var1}', updated_at = '{var2}', address = '{var3}', currency = '{var4}', industry = '{var7}' WHERE id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *`,
  Q43: `INSERT INTO 
            sales_logs(sales_id, customer_commission_split_id, qualification, is_qualified, target_amount,products, target_closing_date,customer_id, is_overwrite, company_id, revenue_contact_id, business_contact_id, sales_type, subscription_plan, recurring_date, currency, slab_id, booking_commission,sales_users) 
          VALUES 
            ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}', '{var15}','{var16}', '{var17}', '{var18}', '{var19}') RETURNING *`,
  Q44: `SELECT 	  	  
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
  Q45: `INSERT INTO users(full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_admin,is_verified,created_by,is_pro_user) 
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false,'{var10}','{var11}') RETURNING *`,
  Q46: `SELECT id, organization_name FROM lead_organizations WHERE company_id = '{var1}' AND replace(organization_name, ' ', '') ILIKE '%{var2}%' AND deleted_at IS NULL`,
  Q47: `UPDATE customer_companies SET  deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q48: `INSERT INTO commission_split(closer_percentage,  supporter_percentage, company_id, user_id) VALUES('{var1}','{var2}','{var3}','{var4}') RETURNING * `,
  Q49: `UPDATE commission_split SET closer_percentage = '{var1}', supporter_percentage = '{var2}' , updated_at = '{var4}'  WHERE  id = '{var3}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
  Q50: `SELECT id, closer_percentage, supporter_percentage FROM commission_split WHERE company_id ='{var1}' AND deleted_at IS NULL`,
  Q51: `UPDATE commission_split SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}'  AND deleted_at IS NULL RETURNING *`,
  Q52: `SELECT 
                c.id, c.organization_id ,c.customer_name, c.source, 
                c.user_id,c.lead_id, c.address, c.deleted_at, c.is_rejected,
                c.business_contact_id, c.revenue_contact_id ,
                u.full_name AS created_by 
              FROM 
                customer_companies AS c 
              LEFT JOIN users AS u ON u.id = c.user_id
              WHERE c.company_id = '{var1}' AND c.is_rejected = '{var2}'`,
  Q53: `INSERT INTO 
            sales (customer_id, customer_commission_split_id, is_overwrite, company_id, 
            business_contact_id, revenue_contact_id, qualification, is_qualified, 
            target_amount, target_closing_date, sales_type, subscription_plan, 
            recurring_date, currency, user_id, slab_id, lead_id ,booking_commission,
            committed_at, is_service_performed, service_perform_note, service_performed_at) 
          VALUES ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', 
            '{var8}','{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', 
            '{var15}', '{var16}', '{var17}', '{var18}', '{var19}', '{var20}', '{var21}', '{var22}') 
          RETURNING *`,
  Q54: `SELECT 
            sc.id, 
            sc.customer_id, 
            sc.customer_commission_split_id AS commission_split_id, 
            sc.is_overwrite, 
            sc.qualification, 
            sc.is_qualified, 
            sc.target_amount, 
            sc.booking_commission, 
            sc.revenue_commission, 
            sc.currency, 
            sc.target_closing_date, 
            sc.archived_at, 
            sc.archived_by, 
            sc.archived_reason, 
            sc.sales_type, 
            sc.subscription_plan, 
            sc.recurring_date, 
            sc.contract, 
            sc.transfer_reason, 
            sc.created_at, 
            sc.user_id AS creator_id, 
            sc.closed_at, 
            sc.slab_id, 
            sc.is_service_performed, 
            sc.committed_at, 
            sc.service_performed_at, 
            sc.service_perform_note, 
            cus.customer_name, 
            cus.user_id AS customer_creator, 
            u1.full_name AS created_by, 
            u1.email_address AS creator_email, 
            sc.transfered_back_by AS transfered_back_by_id, 
            slab.slab_name, 
            sc.approval_status, 
            u2.full_name AS tranfer_back_by_name,
            (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                    SELECT 
                        customer_company_employees.id, 
                        customer_company_employees.full_name, 
                        customer_company_employees.title AS title_id, 
                        customer_company_employees.email_address, 
                        customer_company_employees.phone_number, 
                        customer_company_employees.address, 
                        customer_company_employees.source AS source_id, 
                        customer_company_employees.linkedin_url, 
                        customer_company_employees.website, 
                        customer_company_employees.targeted_value, 
                        customer_company_employees.assigned_sales_lead_to, 
                        customer_company_employees.additional_marketing_notes, 
                        customer_company_employees.creator_id, 
                        customer_company_employees.reason, 
                        customer_company_employees.created_at, 
                        customer_company_employees.updated_at, 
                        customer_company_employees.emp_type, 
                        customer_company_employees.marketing_qualified_lead, 
                        customer_company_employees.is_rejected, 
                        customer_company_employees.customer_company_id, 
                        u1.full_name AS created_by, 
                        s.source, 
                        t.title, 
                        c.customer_name
                    FROM customer_company_employees
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                    WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false
                    AND u1.deleted_at IS NULL
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
            ) AS lead_data,
            (
                SELECT json_agg(sales_users.*)
                FROM (
                    SELECT 
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                ) sales_users
            ) AS sales_users,
            (
                SELECT json_agg(product_in_sales.*)
                FROM (
                    SELECT DISTINCT(p.id), p.product_name AS name
                    FROM product_in_sales AS pis
                    LEFT JOIN products AS p ON p.id = pis.product_id
                    WHERE sc.id = pis.sales_id
                    AND sc.deleted_at IS NULL
                    AND p.deleted_at IS NULL
                ) product_in_sales
            ) AS products,
            CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) AS recognized_amount,
            CASE
                WHEN sc.closed_at IS NOT NULL THEN 
                    CASE
                        WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) < CAST(sc.target_amount AS NUMERIC) THEN true
                        WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) = CAST(sc.target_amount AS NUMERIC) THEN false
                        ELSE false
                    END
                ELSE null
            END AS is_partial_recognized
          FROM sales AS sc
          LEFT JOIN users AS u1 ON u1.id = sc.user_id
          LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
          LEFT JOIN recognized_revenue AS rr ON rr.sales_id = sc.id
          WHERE sc.company_id = '{var1}'
          AND sc.deleted_at IS NULL
          GROUP BY sc.id, cus.customer_name, u1.full_name, u1.email_address, slab.slab_name, u2.full_name, cus.user_id
          ORDER BY sc.created_at DESC;
          `,
  Q55: `SELECT * FROM customer_companies WHERE id = '{var1}'`,
  Q56: `UPDATE users SET created_by = '{var1}' WHERE id ='{var1}'`,
  Q57: `INSERT INTO 
            sales_users( user_id, user_percentage,user_type, commission_split_id, sales_id, company_id) 
          VALUES
            ('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,
  Q58: `SELECT m.id, m.module_name, p.permission_to_view_global,p.permission_to_view_own, p.permission_to_create, 
          p.permission_to_update, p.permission_to_delete 
          FROM modules AS m 
          LEFT JOIN permissions AS p ON p.module_id = m.id
          LEFT JOIN roles AS r ON r.id = p.role_id 
          WHERE m.id = '{var1}' AND r.id = '{var2}' 
          AND m.deleted_at IS NULL AND p.deleted_at IS NULL`,
  Q59: `UPDATE sales SET deleted_at = '{var1}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
  Q60: `UPDATE sales_users 
          SET 
            deleted_at = '{var1}'
          WHERE 
            sales_id = '{var2}' AND company_id = '{var3}' AND user_type='{var4}' RETURNING * `,
  Q61: `UPDATE sales_users 
            SET 
              deleted_at = '{var1}'
            WHERE 
              sales_id = '{var2}' AND company_id = '{var3}' RETURNING *  `,
  Q62: `UPDATE sales 
          SET 
            customer_id = '{var1}', customer_commission_split_id = '{var2}', 
            is_overwrite = '{var3}', updated_at = '{var4}',business_contact_id = '{var7}', 
            revenue_contact_id = '{var8}', qualification = '{var9}', is_qualified = '{var10}', 
            target_amount = '{var11}', target_closing_date = '{var12}', sales_type = '{var14}', 
            subscription_plan = '{var15}', recurring_date = '{var16}', currency = '{var17}', 
            slab_id = '{var18}', lead_id = '{var19}', booking_commission= '{var20}',
            committed_at = '{var21}', is_service_performed = '{var22}', service_perform_note = '{var23}',
            service_performed_at = '{var24}'   
          WHERE 
            id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL 
          RETURNING *`,
  Q63: `UPDATE sales_users 
          SET 
            user_id = '{var1}', user_percentage = '{var2}', commission_split_id = '{var3}', updated_at = '{var4}'
          WHERE 
            sales_id = '{var5}' AND company_id = '{var6}' AND user_type='{var7}' AND deleted_at IS NULL RETURNING *`,
  Q64: `UPDATE customer_company_employees_activities SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL`,
  Q65: `INSERT INTO forecast(timeline, amount, start_date,end_date,pid, assigned_to, created_by, company_id ,is_accepted)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}','{var9}') RETURNING * `,
  Q66: `SELECT 
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
  Q67: `INSERT INTO customer_company_employees 
            ( full_name, email_address, phone_number, customer_company_id, emp_type, creator_id,company_id)
          VALUES
            ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
  Q68: `SELECT id 
          FROM 
            users 
          WHERE 
            company_id = '{var1}' AND is_main_admin = true`,
  Q69: `UPDATE customer_company_employees 
          SET 
            full_name = '{var2}', email_address = '{var3}', phone_number = '{var4}', updated_at = '{var5}' 
          WHERE 
            id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q70: `SELECT created_by
            FROM 
              marketing_budget 
            WHERE 
              company_id = '{var1}' AND id = '{var2}'`,
  Q71: `UPDATE sales SET archived_at = '{var1}' , archived_by = '{var2}' , archived_reason ='{var3}'
          WHERE id = '{var4}' AND company_id = '{var5}' AND deleted_at IS NULL RETURNING * `,
  Q72: `SELECT
  sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,
  sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
  sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
  sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason,
  sc.created_at, sc.user_id as creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
  sc.is_service_performed, sc.committed_at, sc.service_performed_at, sc.service_perform_note,
  cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by, u1.email_address as creator_email,
  sc.transfered_back_by as transfered_back_by_id,
  slab.slab_name, sc.approval_status,
  u2.full_name as transfer_back_by_name,
  (
      SELECT json_agg(customer_company_employees.*)
      FROM (
          SELECT 
              customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
              customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source as source_id,
              customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
              customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
              customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
              customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
              u1.full_name as created_by, s.source, t.title, c.customer_name
          FROM customer_company_employees 
          LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
          LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
          LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
          LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
          WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
          AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
          AND customer_company_employees.deleted_at IS NULL
      ) customer_company_employees
  ) as lead_data,
  (
SELECT json_agg(sales_users.*)
FROM (
SELECT 
    ss.user_id AS id, 
    SUM(ss.user_percentage) AS percentage, 
    ss.user_type, 
    u1.full_name AS name, 
    u1.email_address AS email
FROM sales_users AS ss
LEFT JOIN users AS u1 ON u1.id = ss.user_id
WHERE ss.sales_id = sc.id
AND ss.deleted_at IS NULL
AND u1.deleted_at IS NULL
GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
) sales_users
) as sales_users,
  (
      SELECT json_agg(product_in_sales.*)
      FROM (
          SELECT 
              DISTINCT(p.id), p.product_name as name
          FROM product_in_sales as pis
          LEFT JOIN products AS p ON p.id = pis.product_id
          WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
      ) product_in_sales
  ) as products,
  COALESCE(rr.recognized_amount, 0) as recognized_amount,
  CASE
      WHEN COALESCE(rr.recognized_amount, 0) < CAST(sc.target_amount AS NUMERIC) THEN true
      WHEN COALESCE(rr.recognized_amount, 0) = CAST(sc.target_amount AS NUMERIC) THEN false
      ELSE false
  END AS is_partial_recognized
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
LEFT JOIN
  (
      SELECT sales_id, SUM(recognized_amount::numeric) as recognized_amount
      FROM recognized_revenue
      WHERE deleted_at IS NULL
      GROUP BY sales_id
  ) rr ON rr.sales_id = sc.id
WHERE
  sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.archived_at IS NOT NULL
ORDER BY
  sc.created_at DESC;`,
  Q73: `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id AS commission_split_id,
              sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
              sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
              sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id AS creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id AS customer_creator, u1.full_name AS created_by,
              sc.transfered_back_by AS transfered_back_by_id,
              slab.slab_name, sc.approval_status,
              u2.full_name AS transfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT
                    customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title AS title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source AS source_id,
                    customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name AS created_by, s.source, t.title, c.customer_name
                  FROM customer_company_employees
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                  WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) AS lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                    SELECT 
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                ) sales_users
            ) AS sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT DISTINCT(p.id), p.product_name AS name
                  FROM product_in_sales AS pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
              ) AS products,
              COALESCE(CAST(rr.recognized_amount AS NUMERIC)) AS recognized_amount,
              CASE
                WHEN COALESCE(SUM(CAST(rr.recognized_amount AS NUMERIC)) < CAST(sc.target_amount AS NUMERIC)) THEN true
                WHEN COALESCE(SUM(CAST(rr.recognized_amount AS NUMERIC)) = CAST(sc.target_amount AS NUMERIC)) THEN false
                ELSE false
              END AS is_partial_recognized
            FROM sales AS sc
            LEFT JOIN sales_users AS su ON sc.id = su.sales_id
            LEFT JOIN users AS u1 ON u1.id = sc.user_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
            LEFT JOIN (
            SELECT sales_id, SUM(CAST(recognized_amount AS NUMERIC)) AS recognized_amount
              FROM recognized_revenue
              WHERE deleted_at IS NULL
              GROUP BY sales_id
            ) AS rr ON rr.sales_id = sc.id
            WHERE
              (sc.user_id IN ({var1}) OR su.user_id IN ({var1}))
              AND sc.deleted_at IS NULL AND sc.archived_at IS NOT NULL
            GROUP BY
              sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite, sc.business_contact_id,
              sc.revenue_contact_id, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission,
              sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason, sc.sales_type, sc.subscription_plan,
              sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id, u1.full_name, sc.transfered_back_by, slab.slab_name, sc.approval_status,
              u2.full_name, sc.deleted_at,rr.recognized_amount
            ORDER BY
              sc.created_at DESC;`,
  Q74: `SELECT * FROM configurations WHERE company_id = '{var1}' AND deleted_at IS NULL `,
  Q75: `UPDATE configurations SET deleted_at = '{var1}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q76: `INSERT INTO 
            configurations( currency, phone_format, date_format,user_id, company_id, before_closing_days, after_closing_days )
          VALUES
            ('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}', '{var7}') RETURNING *`,
  Q77: `SELECT sc.id AS sales_commission_id, 
            sc.closed_at,
            sc.booking_commission, 
            sc.revenue_commission,
            sc.target_amount,
            sc.sales_type,
            sc.archived_at,
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
          GROUP BY 
            sc.closed_at,
            sc.id,
            sc.booking_commission,
            sc.revenue_commission,
            sc.target_amount
          ORDER BY 
            sc.closed_at {var2}`,

  Q78: `SELECT 
                sc.id AS sales_commission_id,
                DATE_TRUNC('{var2}',sc.closed_at) AS  date,
                sc.sales_type, sc.target_amount, sc.archived_at
              FROM 
                sales AS sc 
              WHERE 
                sc.company_id = '{var1}' AND 
                sc.deleted_at IS NULL AND 
                sc.closed_at IS NOT NULL 
              ORDER BY 
                date ASC `,

  Q79: `SELECT            
                  c.customer_name,
                  sc.id AS sales_commission_id,
                  sc.sales_type, sc.archived_at,sc.target_amount
              FROM 
                  sales sc
                  LEFT JOIN customer_companies c ON c.id = sc.customer_id
              WHERE 
                  sc.closed_at IS NOT null AND 
                  sc.company_id = '{var1}' AND 
                  sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL`,

  Q80: `SELECT 
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

  Q81: `INSERT INTO contact_us(full_name, email, subject, messages, address) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
  Q82: `INSERT INTO products(product_name,product_image,description,available_quantity,price,end_of_life,company_id, currency, user_id)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}' ) RETURNING *`,
  Q83: `UPDATE products SET product_name = '{var2}',product_image = '{var3}', description = '{var4}',available_quantity = '{var5}', price = '{var6}', end_of_life = '{var7}', updated_at = '{var8}', currency = '{var10}' WHERE id = '{var1}' AND company_id = '{var9}' AND deleted_at IS NULL RETURNING * `,
  Q84: `SELECT 
                p.id, p.product_name, p.product_image, p.description, p.available_quantity, p.price, 
                p.end_of_life, p.currency, p.company_id, p.created_at, p.updated_at, p.user_id, u.full_name as created_by 
              FROM 
                products AS p
              LEFT JOIN 
                users AS u ON p.user_id = u.id
              WHERE 
                p.company_id = '{var1}' AND p.deleted_at IS NULL
              ORDER BY 
                created_at DESC`,
  Q85: `UPDATE products SET deleted_at = '{var2}' WHERE id = '{var1}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING * `,
  Q86: `SELECT id, product_name, product_image, description, available_quantity, price, end_of_life, company_id, created_at, updated_at FROM products WHERE id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  Q87: `INSERT INTO products( company_id,user_id, product_name, product_image, description, available_quantity, price, end_of_life, currency) 
              VALUES ('{var1}','{var2}',$1,$2,$3,$4,$5,$6,$7)`,
  Q88: `SELECT id, name, email, encrypted_password FROM super_admin WHERE email = '{var1}'`,
  Q89: `SELECT id, company_name, company_logo, company_address, is_imap_enable,is_locked, is_marketing_enable, created_at, expiry_date, user_count FROM companies WHERE deleted_at IS NULL`,
  Q90: `UPDATE super_admin SET encrypted_password = '{var2}' WHERE email = '{var1}'`,
  Q91: `INSERT INTO payment_plans(product_id, name, description, active_status,
              admin_price_id, admin_amount,user_price_id, user_amount,pro_user_price_id, pro_user_amount, interval, currency) 
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', 
              '{var9}','{var10}','{var11}','{var12}') RETURNING *`,
  Q92: `SELECT id,  name, description, active_status,
              interval, admin_amount,user_amount,pro_user_amount, currency FROM payment_plans WHERE active_status = 'true' AND  deleted_at IS NULL`,
  Q93: `SELECT id, product_id, name, description, active_status,
              admin_price_id,user_price_id,pro_user_price_id, interval, admin_amount,user_amount,pro_user_amount, currency FROM payment_plans WHERE id = '{var1}' AND deleted_at IS NULL ORDER BY name asc`,
  Q94: `UPDATE payment_plans SET name = '{var1}', description = '{var2}', 
               updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *`,
  Q95: `UPDATE payment_plans SET active_status = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q96: `INSERT INTO transactions(user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt,pro_user_count) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}', '{var14}') RETURNING *`,
  Q97: `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,pro_user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade, is_canceled, payment_receipt  FROM transactions WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  Q98: `SELECT id, name, description, active_status, interval, admin_amount,user_amount,pro_user_amount, currency FROM payment_plans WHERE deleted_at IS NULL`,
  Q99: `SELECT id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id, avatar, is_verified, is_main_admin, expiry_date FROM users WHERE deleted_at IS NULL`,
  Q100: `INSERT INTO superadmin_config(trial_days, trial_users) VALUES('{var1}', '{var2}') RETURNING *`,
  Q101: `SELECT id, trial_days,trial_users, created_at FROM superadmin_config WHERE deleted_at IS NULL ORDER BY created_at desc `,
  Q102: `UPDATE users SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q103: `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id,total_amount, immediate_upgrade, upgraded_transaction_id FROM transactions WHERE deleted_at IS NULL AND upgraded_transaction_id IS NOT null`,
  Q104: `SELECT id, user_id, company_id, plan_id, stripe_customer_id, payment_status, expiry_date,user_count,stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, total_amount, immediate_upgrade  FROM transactions WHERE plan_id = '{var1}' AND deleted_at IS NULL`,
  Q105: `UPDATE transactions SET stripe_customer_id = '{var1}', stripe_subscription_id = '{var2}', 
              stripe_card_id = '{var3}', stripe_token_id = '{var4}', stripe_charge_id = '{var5}', 
              expiry_date = '{var6}', updated_at = '{var7}', total_amount = '{var9}', immediate_upgrade = '{var10}', payment_receipt = '{var11}', user_count = '{var12}', plan_id = '{var13}', upgraded_transaction_id = '{var14}', pro_user_count = '{var15}' , is_canceled = '{var16}'  WHERE id = '{var8}' AND deleted_at IS NULL RETURNING *`,
  Q106: `UPDATE transactions SET is_canceled = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q107: `SELECT id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, 
              created_at FROM chat 
          WHERE is_group_chat = 'false' AND 
          ((user_a = '{var1}' AND user_b = '{var2}') or (user_a = '{var2}' AND user_b = '{var1}')) 
          AND deleted_at IS NULL`,
  Q108: `INSERT INTO message( chat_id, sender, content) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  Q109: `UPDATE chat SET last_message = '{var1}', updated_at = '{var3}' WHERE id = '{var2}'  AND deleted_at IS NULL RETURNING *`,
  Q110: `INSERT INTO chat_room_members ( room_id, user_id, group_name) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  Q111: `SELECT id, chat_name, is_group_chat, last_message, group_admin,user_a, user_b, created_at FROM chat WHERE (user_a = '{var1}' or user_b = '{var1}') AND company_id = '{var2}' AND is_group_chat = '{var3}' AND deleted_at IS NULL`,
  Q112: `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at FROM chat WHERE id = '{var1}' AND deleted_at IS NULL `,
  Q113: `SELECT u.id, u.full_name, u.avatar FROM chat_room_members AS cm 
              LEFT JOIN users AS u ON u.id = cm.user_id
              WHERE room_id = '{var1}' AND cm.deleted_at IS NULL AND u.deleted_at IS NULL`,
  Q114: `SELECT 
              sc.id,su.user_id,su.user_percentage,su.user_type,sc.customer_id,sc.target_amount,sc.slab_id,
              u.full_name, u.created_by
           FROM sales AS sc 
           LEFT JOIN sales_users AS su ON sc.id = su.sales_id 
           LEFT JOIN users AS u ON su.user_id = u.id 
           WHERE sc.id = '{var1}' 
           AND sc.deleted_at IS NULL AND su.deleted_at IS NULL AND u.deleted_at IS NULL`,
  Q115: `INSERT INTO chat(chat_name, is_group_chat, user_a, user_b, group_admin, sales_id, company_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}','{var6}','{var7}') RETURNING *`,
  Q116: `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin FROM chat WHERE id = '{var1}' AND company_id = '{var2}' AND is_group_chat = '{var3}' AND deleted_at IS NULL`,
  Q117: `SELECT m.id, m.sender, m.content, m.chat_id, m.read_by, m.created_at, u.full_name,
              u.avatar, u.id AS sender_id FROM message AS m LEFT JOIN users AS u ON m.sender = u.id 
              WHERE m.id = '{var1}' AND m.deleted_at IS NULL`,
  Q118: `SELECT m.id AS messageId, m.content, m.sender AS senderId, m.chat_id, m.read_by, m.created_at,
              u.full_name, u.avatar, c.id, c.chat_name, c.is_group_chat,
              c.group_admin, c.user_a, c.user_b, c.created_at as user_created_at FROM message AS m 
              LEFT JOIN users AS u ON m.sender = u.id
              LEFT JOIN chat AS c ON m.chat_id = c.id  WHERE chat_id = '{var1}' AND m.deleted_at IS NULL ORDER BY m.created_at DESC LIMIT 1`,
  Q119: `SELECT m.id AS messageId,m.content,m.sender AS senderId, m.created_at,
             u.full_name, u.avatar FROM message AS m 
             LEFT JOIN users AS u ON m.sender = u.id
            WHERE chat_id = '{var1}' AND m.deleted_at IS NULL ORDER BY m.created_at ASC `,
  Q120: `SELECT id, chat_name, is_group_chat, user_a, user_b, last_message, group_admin, created_at, updated_at FROM chat WHERE sales_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  Q121: `SELECT room_id, user_id, group_name FROM chat_room_members WHERE user_id = '{var1}' AND deleted_at IS NULL`,

  Q122: `SELECT id, message_id, to_mail, from_mail,from_name, mail_date, subject, mail_html, mail_text, mail_text_as_html, attechments, company_id, read_status, created_at FROM emails WHERE company_id = '{var1}' AND user_id = '{var2}' AND deleted_at IS NULL order by mail_date desc`,
  Q123: `SELECT 
             cc.email_address 
           FROM 
             customer_company_employees AS cc
           WHERE 
             '{var1}' IN (cc.email_address) 
             AND cc.company_id = '{var2}' 
             AND (cc.emp_type = 'business' OR cc.emp_type = 'revenue') 
             AND cc.deleted_at IS NULL`,
  Q124: `INSERT INTO emails ( message_id, to_mail, from_mail,from_name, mail_date, subject, 
              mail_html, mail_text, mail_text_as_html, company_id, attechments, user_id) VALUES('{var1}', '{var2}', 
              '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}','{var11}', '{var12}') RETURNING *`,
  Q125: `SELECT id, email, app_password, imap_host, imap_port, smtp_host, smtp_port, user_id FROM imap_credentials WHERE user_id = '{var1}' AND company_id = '{var2}'AND deleted_at IS NULL ORDER BY updated_at DESC`,
  Q126: `UPDATE emails SET read_status = '{var2}' WHERE message_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q127: `INSERT INTO sent_email( from_email, to_email, cc, subject, message, company_id, sales_id, attechments, user_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}', '{var8}','{var9}') RETURNING *`,
  Q128: `SELECT id, to_email, from_email, cc, subject, message,attechments, company_id,sales_id, created_at FROM sent_email WHERE company_id = '{var1}' AND sales_id = '{var2}' AND user_id = '{var3}' AND deleted_at IS NULL order by created_at desc`,
  Q129: `UPDATE imap_credentials SET deleted_at = '{var1}' WHERE user_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q130: `INSERT INTO imap_credentials( email, app_password, user_id, imap_host, imap_port, smtp_host, smtp_port, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}') RETURNING *`,
  Q131: `SELECT id,full_name,avatar FROM users WHERE id IN ('{var1}','{var2}') AND deleted_at IS NULL`,
  Q132: `SELECT u.id, u.full_name, u.company_id, u.email_address, u.encrypted_password, u.mobile_number, u.role_id, 
              u.avatar, u.expiry_date, u.is_verified, u.is_admin, u.is_locked, u.is_main_admin,u.is_deactivated, c.company_name, c.company_address, c.company_logo, c.is_imap_enable,c.is_marketing_enable,
              r.id as role_id,r.role_name, r.reporter, r.module_ids, con.id AS config_id, con.currency, con.phone_format, con.date_format, con.before_closing_days, con.after_closing_days
              FROM users AS u 
              LEFT JOIN companies AS c ON c.id = u.company_id
              LEFT JOIN roles AS r ON r.id = u.role_id 
              LEFT JOIN configurations AS con ON con.company_id = u.company_id
              WHERE LOWER(email_address) = LOWER(TRIM('{var1}')) AND u.deleted_at IS NULL 
              AND c.deleted_at IS NULL AND r.deleted_at IS NULL AND con.deleted_at IS NULL`,
  Q133: `UPDATE companies SET is_imap_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q134: `SELECT id, product_name, product_image, description, available_quantity, price, end_of_life, currency, company_id, created_at, updated_at FROM products WHERE product_name = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL ORDER BY created_at desc `,
  Q135: `INSERT INTO upgraded_transactions(user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt, pro_user_count) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', 
              '{var6}', '{var7}','{var8}', '{var9}', '{var10}','{var11}','{var12}','{var13}','{var14}') RETURNING *`,
  Q136: `SELECT id, user_id, company_id, plan_id, stripe_customer_id,
              stripe_subscription_id, stripe_card_id, stripe_token_id, stripe_charge_id, expiry_date,
              user_count, payment_status,total_amount, payment_receipt FROM upgraded_transactions WHERE id = '{var1}' AND deleted_at IS NULL`,
  Q137: `UPDATE upgraded_transactions SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q138: `SELECT id,country_name,country_value,currency_name,currency_symbol,date_format,created_at FROM country_details WHERE deleted_at IS NULL`,
  Q139: `SELECT 
                  DISTINCT(sc.id) AS sales_commission_id,
                  sc.sales_type, sc.target_amount, sc.archived_at, 
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

  Q140: `SELECT COUNT(*) AS actual_count FROM users WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  Q141: `INSERT INTO product_in_sales(product_id,sales_id, company_id) VALUES('{var1}','{var2}','{var3}') RETURNING *`,
  Q142: `UPDATE product_in_sales SET deleted_at = '{var1}' WHERE sales_id = '{var2}' AND company_id = '{var3}' RETURNING *`,
  Q143: `UPDATE sales_logs SET closed_at = '{var1}', updated_at = '{var2}' WHERE sales_id = '{var3}' RETURNING *`,
  Q144: `SELECT sc.id AS sales_commission_id, sc.target_amount as amount, sc.target_closing_date,
              sc.closed_at, sc.slab_id,sc.sales_type FROM sales AS sc WHERE sc.company_id = '{var1}' 
              AND sc.deleted_at IS NULL`,
  Q145: `SELECT 
                id, company_name, company_logo, company_address, is_imap_enable, created_at, is_locked 
              FROM companies 
              WHERE deleted_at IS NULL AND created_at BETWEEN '{var1}' AND '{var2}' AND is_locked = false`,
  Q146: `SELECT
      sc.company_id,
      sc.id AS sales_commission_id,
          SUM(
            CASE
              WHEN sc.archived_at IS NULL THEN sc.target_amount::DECIMAL
              ELSE 0  -- Ignore other cases
            END
          ) AS amount,
          sc.closed_at,
          sc.slab_id
        FROM
          sales AS sc
        WHERE
          sc.company_id = '{var1}' AND
          sc.deleted_at IS NULL AND
          sc.closed_at IS NOT NULL
        GROUP BY
        sc.company_id,
          sc.closed_at,
          sc.id,
          sc.slab_id
          `,
  Q147: `SELECT id, closer_percentage, supporter_percentage, deleted_at FROM commission_split WHERE company_id ='{var1}'`,
  Q148: `SELECT
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
  Q149: `SELECT 
            sc.id AS sales_commission_id, 
            sc.closed_at,
            sc.booking_commission, 
            sc.revenue_commission,
            sc.target_amount,
            sc.sales_type,
            sc.archived_at,
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
            sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
          GROUP BY 
            sc.closed_at,
            sc.id,
            sc.booking_commission,
            sc.revenue_commission,
            sc.target_amount
          ORDER BY 
            sc.closed_at {var2}`,

  Q150: `SELECT            
                  DISTINCT(sc.id) AS sales_commission_id,
                  c.customer_name,
                  sc.sales_type, sc.archived_at, sc.target_amount
              FROM 
                  sales sc
              LEFT JOIN customer_companies c ON c.id = sc.customer_id
              LEFT JOIN 
                sales_users AS su ON sc.id = su.sales_id  
              WHERE 
                  sc.closed_at IS NOT null AND 
                  (sc.user_id IN ({var1}) OR su.user_id IN ({var1}) )
                  AND sc.closed_at BETWEEN '{var3}' AND '{var4}' AND
                  c.deleted_at IS NULL AND
                  sc.deleted_at IS NULL `,
  Q151: `SELECT 
                  DISTINCT(sc.id) AS sales_commission_id, 
                  p.product_name,
                  sc.sales_type, sc.target_amount, sc.archived_at
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
  Q152: `SELECT 
                DISTINCT(sc.id) AS sales_commission_id,
                DATE_TRUNC('{var2}',sc.closed_at) AS  date,
                sc.sales_type, sc.target_amount, sc.archived_at
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
  Q153: `SELECT 
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
  Q154: `SELECT 
                u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
                u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
                u1.is_main_admin, u1.created_by, u2.full_name AS creator_name 
              FROM 
                users AS u1 
              LEFT JOIN 
                users AS u2 ON u2.id = u1.created_by  
              WHERE 
                u1.created_by = '{var1}' AND u1.deleted_at IS NULL 
              ORDER BY 
                created_at DESC`,
  Q155: `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id AS commission_split_id, sc.is_overwrite,
              sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
              sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
              sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at,
              sc.user_id AS creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id AS customer_creator, u1.full_name AS created_by,
              sc.transfered_back_by AS transfered_back_by_id,
              slab.slab_name, sc.approval_status,
              u2.full_name AS transfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT
                    customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title AS title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source AS source_id,
                    customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name AS created_by, s.source, t.title, c.customer_name
                  FROM customer_company_employees
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                  WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) AS lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                    SELECT 
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                ) sales_users
            ) AS sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT
                    DISTINCT (p.id), p.product_name AS name
                  FROM product_in_sales AS pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
              ) AS products,
              -- Additional fields
              rr.recognized_amount AS recognized_amount,
              CASE
                WHEN rr.recognized_amount < CAST(sc.target_amount AS NUMERIC) THEN true
                WHEN rr.recognized_amount = CAST(sc.target_amount AS NUMERIC) THEN false
                ELSE false
              END AS is_partial_recognized
            FROM sales AS sc
            LEFT JOIN users AS u1 ON u1.id = sc.user_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
            LEFT JOIN (
              SELECT sales_id, SUM(recognized_amount::NUMERIC) AS recognized_amount
              FROM recognized_revenue
              WHERE deleted_at IS NULL
              GROUP BY sales_id
            ) rr ON rr.sales_id = sc.id
            LEFT JOIN sales_users AS su ON sc.id = su.sales_id
            WHERE
              (
                sc.user_id IN ({var1})
                OR su.user_id IN ({var1})
              )
              AND sc.deleted_at IS NULL
            GROUP BY
              sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount,
              sc.booking_commission, sc.revenue_commission, sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by,
              sc.archived_reason, sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at,
              sc.user_id, sc.closed_at, sc.slab_id, sc.lead_id, cus.customer_name, cus.user_id, u1.full_name, sc.transfered_back_by,
              slab.slab_name, u2.full_name, sc.deleted_at,rr.recognized_amount
            ORDER BY
              sc.created_at DESC;`,
  Q156: `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, sc.is_overwrite,
            sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
            sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
            sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason,
            sc.created_at, sc.user_id as creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
            sc.is_service_performed, sc.committed_at, sc.service_performed_at, sc.service_perform_note,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by, u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id,
            slab.slab_name, sc.approval_status,
            u2.full_name as tranfer_back_by_name,
            (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                    SELECT
                        customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by, s.source, t.title, c.customer_name
                    FROM customer_company_employees
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                    WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                  SELECT 
                      ss.user_id AS id, 
                      SUM(ss.user_percentage) AS percentage, 
                      ss.user_type, 
                      u1.full_name AS name, 
                      u1.email_address AS email
                  FROM sales_users AS ss
                  LEFT JOIN users AS u1 ON u1.id = ss.user_id
                  WHERE ss.sales_id = sc.id
                  AND ss.deleted_at IS NULL
                  AND u1.deleted_at IS NULL
                  GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
              ) sales_users
          ) as sales_users,
            (
                SELECT json_agg(product_in_sales.*)
                FROM (
                    SELECT 
                        DISTINCT(p.id), p.product_name as name
                    FROM product_in_sales as pis
                    LEFT JOIN products AS p ON p.id = pis.product_id
                    WHERE sc.id= pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
            ) as products,
            CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) as recognized_amount,
            CASE
                WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) < CAST(sc.target_amount AS NUMERIC) THEN true
                WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) = CAST(sc.target_amount AS NUMERIC) THEN false
                ELSE false
            END AS is_partial_recognized
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
          LEFT JOIN
            recognized_revenue AS rr ON rr.sales_id = sc.id
          WHERE
            sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.closed_at IS NULL AND sc.archived_at IS NULL
          GROUP BY
            sc.id, cus.customer_name, u1.full_name, u1.email_address, slab.slab_name, u2.full_name, cus.user_id
          ORDER BY
            sc.created_at DESC;`,
  Q157: ` SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
              sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
              sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
              sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, 
              sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
              sc.is_service_performed, sc.committed_at,sc.service_performed_at, sc.service_perform_note,
              cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
              sc.transfered_back_by as transfered_back_by_id ,
              slab.slab_name,sc.approval_status,
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
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
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
            CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) as recognized_amount,
              CASE
                  WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) < CAST(sc.target_amount AS NUMERIC) THEN true
                  WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) = CAST(sc.target_amount AS NUMERIC) THEN false
                  ELSE false
              END AS is_partial_recognized
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
            LEFT JOIN
              recognized_revenue AS rr ON rr.sales_id = sc.id
            WHERE
              sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
            GROUP BY
              sc.id, cus.customer_name, u1.full_name, u1.email_address, slab.slab_name, u2.full_name, cus.user_id
            ORDER BY
              sc.created_at DESC`,
  Q158: `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
            sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
            sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
            sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id as creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,
            sc.transfered_back_by as transfered_back_by_id,
            slab.slab_name, sc.approval_status,
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
                        u1.full_name as created_by, s.source, t.title, c.customer_name
                    FROM customer_company_employees
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                    WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                        AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                        AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
            ) as lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                  SELECT 
                      ss.user_id AS id, 
                      SUM(ss.user_percentage) AS percentage, 
                      ss.user_type, 
                      u1.full_name AS name, 
                      u1.email_address AS email
                  FROM sales_users AS ss
                  LEFT JOIN users AS u1 ON u1.id = ss.user_id
                  WHERE ss.sales_id = sc.id
                  AND ss.deleted_at IS NULL
                  AND u1.deleted_at IS NULL
                  GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
              ) sales_users
          ) as sales_users,
            (
                SELECT json_agg(product_in_sales.*)
                FROM (
                    SELECT DISTINCT(p.id), p.product_name as name
                    FROM product_in_sales as pis
                    LEFT JOIN products AS p ON p.id = pis.product_id
                    WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
            ) as products,
            COALESCE(SUM(CAST(rr.recognized_amount AS NUMERIC)), 0) as recognized_amount,
            CASE
                WHEN COALESCE(SUM(CAST(rr.recognized_amount AS NUMERIC)), 0) < CAST(sc.target_amount AS NUMERIC) THEN true
                WHEN COALESCE(SUM(CAST(rr.recognized_amount AS NUMERIC)), 0) = CAST(sc.target_amount AS NUMERIC) THEN false
                ELSE false
            END AS is_partial_recognized
          FROM sales AS sc
          LEFT JOIN sales_users AS su ON sc.id = su.sales_id
          LEFT JOIN users AS u1 ON u1.id = sc.user_id
          LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
          LEFT JOIN recognized_revenue AS rr ON rr.sales_id = sc.id AND rr.deleted_at IS NULL
          WHERE
            (sc.user_id IN ({var1}) OR su.user_id IN ({var1}))
            AND sc.deleted_at IS NULL AND sc.closed_at IS NULL AND sc.archived_at IS NULL
          GROUP BY
            sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite, sc.business_contact_id,
            sc.archived_at, sc.archived_by, sc.archived_reason,
            sc.revenue_contact_id, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.currency, sc.target_closing_date,
            sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id, sc.closed_at, sc.slab_id, sc.lead_id,
            cus.customer_name, cus.user_id, u1.full_name,
            sc.transfered_back_by,
            slab.slab_name,
            u2.full_name,
            sc.deleted_at
          ORDER BY
            sc.created_at DESC; `,
  Q159: `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id AS commission_split_id,
              sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
              sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
              sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id AS creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id AS customer_creator, u1.full_name AS created_by,
              sc.transfered_back_by AS transfered_back_by_id,
              slab.slab_name, sc.approval_status,
              u2.full_name AS tranfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT
                    customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title AS title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source AS source_id,
                    customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name AS created_by, s.source, t.title, c.customer_name
                  FROM customer_company_employees
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                  WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) AS lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                    SELECT 
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                ) sales_users
            ) AS sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT DISTINCT(p.id), p.product_name AS name
                  FROM product_in_sales AS pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
              ) AS products,
              rr.recognized_amount AS recognized_amount,
              CASE
                WHEN rr.recognized_amount < CAST(sc.target_amount AS NUMERIC) THEN true
                WHEN rr.recognized_amount = CAST(sc.target_amount AS NUMERIC) THEN false
                ELSE false
              END AS is_partial_recognized
            FROM sales AS sc
            LEFT JOIN sales_users AS su ON sc.id = su.sales_id
            LEFT JOIN users AS u1 ON u1.id = sc.user_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
            LEFT JOIN (
              SELECT sales_id, SUM(recognized_amount::NUMERIC) AS recognized_amount
              FROM recognized_revenue
              WHERE deleted_at IS NULL
              GROUP BY sales_id
            ) rr ON rr.sales_id = sc.id
            WHERE
              (sc.user_id IN ({var1}) OR su.user_id IN ({var1}))
              AND sc.deleted_at IS NULL AND sc.closed_at IS NOT NULL
            GROUP BY
              sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite, sc.business_contact_id,
              sc.archived_at, sc.archived_by, sc.archived_reason,
              sc.revenue_contact_id, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.currency, sc.target_closing_date,
              sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id, u1.full_name,rr.recognized_amount,
              sc.transfered_back_by,
              slab.slab_name,
              u2.full_name,
              sc.deleted_at
            ORDER BY
              sc.created_at DESC;`,
  Q160: `UPDATE slabs SET deleted_at = '{var1}' WHERE slab_id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL`,
  Q161: `SELECT * FROM slabs WHERE slab_id ='{var1}' AND deleted_at IS NULL ORDER BY slab_ctr ASC`,
  Q162: `SELECT u.id, u.full_name, r.id as role_id,r.role_name, r.module_ids, r.reporter  FROM roles AS r 
              LEFT JOIN users AS u ON u.role_id = r.id 
              WHERE r.id = '{var1}'  AND r.deleted_at IS NULL`,
  Q163: `SELECT * FROM contact_us WHERE deleted_at IS NULL`,
  Q164: `SELECT * from chat where is_group_chat = 'true' AND company_id = '{var1}' AND deleted_at IS NULL`,
  Q165: `SELECT user_id FROM chat_room_members where room_id = '{var1}' AND deleted_at IS NULL`,
  Q166: `UPDATE forecast SET deleted_at = '{var1}' WHERE id = '{var2}' OR pid = '{var2}' RETURNING *`,
  Q167: `UPDATE 
                forecast 
              SET 
                timeline = '{var2}', amount = '{var3}', start_date = '{var4}', 
                end_date = '{var5}', updated_at = '{var6}' 
              WHERE 
                id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q168: `INSERT INTO customer_company_employees
            (full_name, title, email_address, phone_number,source, customer_company_id, creator_id, company_id,emp_type)
           VALUES
            ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}') RETURNING *`,
  Q169: `INSERT INTO customer_company_employees (full_name,title,email_address,phone_number,
              address,source,linkedin_url,website,targeted_value,marketing_qualified_lead,
              assigned_sales_lead_to,additional_marketing_notes,creator_id,company_id, customer_company_id,emp_type, sync_id, sync_source,pid,marketing_activities)
              VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}',
              '{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', '{var15}','{var16}', '{var17}', '{var18}','{var19}' , '{var20}') RETURNING *`,
  Q170: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,
                l.created_at,l.is_converted,l.is_rejected,l.reason,
                u1.full_name AS creator_name, c.customer_name, c.currency,
                u2.full_name as assigned_sales_lead_name,
                (
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                l.company_id = '{var1}' AND emp_type = '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

  Q171: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.reason,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND l.emp_type= '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

  Q172: `UPDATE customer_company_employees SET full_name = '{var2}', title = '{var3}',email_address = '{var4}',phone_number = '{var5}',
              address = '{var6}',source = '{var7}',linkedin_url = '{var8}',website = '{var9}',targeted_value = '{var10}',
              marketing_qualified_lead = '{var11}',assigned_sales_lead_to = '{var12}',additional_marketing_notes = '{var13}',
              updated_at = '{var14}', customer_company_id = '{var15}', marketing_activities = '{var16}' WHERE id = '{var1}' AND deleted_at is null`,

  Q173: `UPDATE customer_company_employees SET deleted_at = '{var2}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`,

  Q174: `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND emp_type = 'lead' AND pid IS NULL AND deleted_at IS NULL`,

  Q175: `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customer_company_employees AS l 
              LEFT JOIN 
                users AS u ON u.id = l.creator_id
              WHERE 
                l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.pid IS NULL AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4} `,
  Q176: `SELECT 
              l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
              l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
              l.website,l.targeted_value,l.marketing_qualified_lead,l.marketing_activities,
              l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
              u1.full_name AS creator_name, c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name, sc.id AS sales_id
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
            LEFT JOIN 
              sales AS sc ON sc.lead_id = l.id
            WHERE 
              l.id = '{var1}' AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
            ORDER BY 
              l.created_at DESC`,
  Q177: `select 
                distinct(l.id),l.creator_id,l.assigned_sales_lead_to, u.full_name as created_by,l.customer_company_id,
                l.is_rejected, l.marketing_qualified_lead
              FROM 
                customer_company_employees AS l 
              LEFT JOIN 
                users u ON u.id = l.creator_id
              where 
                (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND 
                l.emp_type = 'lead' AND l.pid IS NULL AND l.deleted_at IS NULL AND u.deleted_at IS NULL
              ORDER BY 
                u.full_name {var4}
              LIMIT {var2} OFFSET {var3}`,

  Q178: `INSERT INTO lead_titles( title, company_id ) VALUES('{var1}','{var2}') RETURNING *`,
  Q179: `UPDATE lead_titles set title = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q180: `UPDATE lead_titles set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q181: `SELECT * FROM lead_titles WHERE company_id = '{var1}' AND deleted_at IS NULL`,

  Q182: `INSERT INTO lead_industries(industry, company_id ) VALUES('{var1}','{var2}') RETURNING *`,
  Q183: `UPDATE lead_industries set industry = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q184: `UPDATE lead_industries set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q185: `SELECT * FROM lead_industries WHERE company_id = '{var1}' AND deleted_at IS NULL`,

  Q186: `INSERT INTO lead_sources(source, company_id ) VALUES('{var1}','{var2}') RETURNING *`,
  Q187: `UPDATE lead_sources set source = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q188: `UPDATE lead_sources set deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q189: `SELECT * FROM lead_sources WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  Q190: `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customer_company_employees AS l 
              LEFT JOIN 
                users AS u ON u.id = l.creator_id
              WHERE 
                l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.pid IS NULL AND l.marketing_qualified_lead = true AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}`,
  Q191: `SELECT * FROM lead_sources WHERE LOWER(source) = LOWER(TRIM('{var1}')) and company_id = '{var2}' AND deleted_at IS NULL`,
  Q192: `SELECT * FROM lead_titles WHERE LOWER(title) = LOWER(TRIM('{var1}')) and company_id = '{var2}' AND deleted_at IS NULL`,
  Q193: `SELECT * FROM lead_industries WHERE LOWER(industry) = LOWER(TRIM('{var1}')) and company_id = '{var2}' AND deleted_at IS NULL`,
  Q194: `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND emp_type = 'lead' AND pid IS NULL AND marketing_qualified_lead = true AND deleted_at IS NULL`,
  Q195: `UPDATE companies SET is_marketing_enable = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q196: `UPDATE companies SET expiry_date = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q197: `UPDATE companies SET expiry_date = '{var1}', user_count = '{var2}',pro_user_count = '{var3}', updated_at = '{var4}' WHERE id = '{var5}' AND deleted_at IS NULL RETURNING *`,

  Q198: `INSERT INTO marketing_budget(timeline,amount,start_date,end_date,created_by, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,

  Q199: `INSERT INTO marketing_budget_description( budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}') RETURNING *`,

  Q200: `INSERT INTO marketing_budget_description_logs(budget_description_id,budget_id,title, amount,user_id, company_id)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}') RETURNING *`,

  Q201: `INSERT INTO marketing_budget_logs(budget_id,timeline,amount,start_date,end_date,created_by, company_id, edit_logs)
             VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}') RETURNING *`,
  Q202: `SELECT 
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
  Q203: `UPDATE marketing_budget SET deleted_at = '{var2}' where id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q2031: `SELECT DISTINCT cce.id
            FROM customer_company_employees cce
            JOIN marketing_budget_description mbd ON cce.marketing_activities LIKE CONCAT('%', mbd.id, '%')
            JOIN marketing_budget mb ON mbd.budget_id= mb.id
            WHERE mb.id = '{var1}';`,
  Q204: `UPDATE marketing_budget_description SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q205: `SELECT 
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
  Q206: `UPDATE marketing_budget SET timeline = '{var1}', amount = '{var2}', start_date = '{var3}', end_date = '{var4}'
              WHERE id = '{var6}' AND deleted_at IS NULL RETURNING *`,
  Q207: `UPDATE marketing_budget_description SET title = '{var1}', amount = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q208: `SELECT 
              b.id, b.timeline, b.amount, b.start_date,
              b.end_date, b.created_by,b.created_at,b.is_finalize, b.edit_logs,
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
  Q209: `SELECT 
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
  Q210: `UPDATE marketing_budget_description SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q211: `UPDATE marketing_budget SET is_finalize = true, updated_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q212: `SELECT 
                COUNT(*),
                u.full_name AS created_by
              FROM 
                customer_company_employees AS l 
              LEFT JOIN 
                users AS u ON u.id = l.assigned_sales_lead_to
              WHERE 
              l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.pid IS NULL AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
              GROUP BY 
                u.full_name
              ORDER BY 
                count {var4}`,
  Q213: `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND assigned_sales_lead_to IS NOT NULL AND emp_type = 'lead' AND pid IS NULL  AND deleted_at IS NULL`,
  Q214: `UPDATE companies SET company_logo = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q215: `UPDATE customer_company_employees SET is_rejected = '{var2}', reason = '{var3}' WHERE id = '{var1}' AND deleted_at is null RETURNING *`,
  Q216: `SELECT * FROM sales WHERE lead_id = '{var1}' AND deleted_at IS NULL`,
  Q217: `SELECT COUNT(*) from customer_company_employees WHERE company_id = '{var1}' AND emp_type = 'lead' AND pid IS NULL AND is_rejected = '{var2}' AND deleted_at IS NULL`,
  Q218: `SELECT 
              COUNT(*),
              u.full_name AS created_by
            FROM 
              customer_company_employees AS l 
            LEFT JOIN 
              users AS u ON u.id = l.creator_id
            WHERE 
              l.company_id = '{var1}' AND l.emp_type = 'lead' AND l.pid IS NULL AND l.is_rejected = '{var5}' AND l.deleted_at IS NULL AND u.deleted_at IS NULL 
            GROUP BY 
              u.full_name
            ORDER BY 
              count {var4}`,
  Q219: `SELECT 
                DISTINCT(c.id)
              FROM 
                customer_companies AS c
              LEFT JOIN sales AS s ON c.id = s.customer_id
              WHERE c.company_id = '{var1}' AND s.closed_at IS NOT NULL AND c.deleted_at IS NULL`,

  Q220: `SELECT 
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
              u.full_name {var4}`,
  Q221: `SELECT 
            sc.id as sales_commission_id,
            sc.closed_at, 
            sc.archived_at, 
            sc.target_amount,
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
          sc.closed_at IS NOT null 
          AND (sc.user_id IN ({var1}) OR su.user_id IN ({var1}) )
          AND sc.closed_at BETWEEN '{var3}' AND '{var4}'
          AND sc.deleted_at IS NULL
          GROUP BY   
          sc.id, sc.closed_at, sc.booking_commission, sc.revenue_commission`,

  Q222: `SELECT * FROM sales WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
  Q223: `SELECT * FROM product_in_sales WHERE product_id = '{var1}' AND deleted_at IS NULL`,
  Q224: `UPDATE companies SET is_locked = '{var1}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING *`,
  Q225: `UPDATE users SET is_locked = '{var1}', updated_at = '{var3}' WHERE company_id = '{var2}' AND deleted_at IS NULL RETURNING * `,
  Q226: `SELECT 
              u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
              u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
              u1.is_main_admin, u1.created_by, u2.full_name AS creator_name 
            FROM 
              users AS u1 
            LEFT JOIN 
              users AS u2 ON u2.id = u1.created_by  
            WHERE 
              u1.id = '{var1}' AND u1.deleted_at IS NULL 
            ORDER BY 
              created_at DESC`,
  Q227: `UPDATE sales_users
           SET 
            user_id = '{var1}', updated_at = '{var2}' 
           WHERE 
            sales_id = '{var3}' AND user_type='{var4}' RETURNING * `,
  Q228: `UPDATE sales SET transfer_reason = '{var1}',transfered_back_by = '{var4}', updated_at = '{var2}' WHERE id = '{var3}' RETURNING * `,
  Q229: `SELECT * FROM sales WHERE id = '{var1}' AND deleted_at is null`,
  Q230: `INSERT INTO recognized_revenue( recognized_date, recognized_amount, booking_amount, notes, invoice, sales_id, user_id, company_id)
              VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}')RETURNING *`,
  Q231: `SELECT * FROM recognized_revenue WHERE sales_id = '{var1}' AND deleted_at IS NULL`,
  Q232: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,
                l.created_at,l.is_converted,l.is_rejected,l.reason,
                u1.full_name AS creator_name , c.customer_name,  c.currency, u2.full_name as assigned_sales_lead_name,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                l.company_id = '{var1}'  AND l.emp_type = '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_rejected = TRUE
              ORDER BY 
                l.created_at DESC`,

  Q233: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name ,c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                l.company_id = '{var1}' AND l.emp_type = '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.marketing_qualified_lead = TRUE
              ORDER BY 
                l.created_at DESC`,

  Q234: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name,c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                l.company_id = '{var1}' AND l.emp_type = '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_converted = TRUE
              ORDER BY 
                l.created_at DESC`,
  Q235: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.reason,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                 AND l.emp_type= '{var2}' AND l.pid IS NULL
                 AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                 AND l.is_rejected = TRUE
              ORDER BY 
                l.created_at DESC`,

  Q236: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                  AND l.emp_type= '{var2}' AND l.pid IS NULL
                  AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                  AND l.marketing_qualified_lead = TRUE
              ORDER BY 
                l.created_at DESC`,
  Q237: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                  AND l.emp_type= '{var2}' AND l.pid IS NULL
                  AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                  AND l.is_converted = TRUE
              ORDER BY 
                l.created_at DESC`,
  Q238: `SELECT 
                DISTINCT(l.id), l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
                u1.full_name AS creator_name, c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name,
                ( 
                  SELECT  json_agg(customer_company_employees.*) :: TEXT
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                l.assigned_sales_lead_to = '{var1}' AND l.emp_type = '{var2}' AND l.pid IS NULL
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,

  Q239: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                AND l.emp_type= '{var2}' AND l.pid IS NULL
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              ORDER BY 
                l.created_at DESC`,
  Q240: `INSERT INTO transfered_back_sales(transferd_back_by_id, transferd_back_to_id, transfered_back_date,
              sales_id, transfer_reason, user_id, company_id)VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}',
              '{var7}') RETURNING *`,

  Q241: `SELECT 
                t.id, t.transferd_back_by_id, t.transferd_back_to_id, t.transfer_reason,
                t.transfered_back_date, u1.full_name AS transferd_back_by_name, 
                u2.full_name AS transferd_back_to_name, t.sales_id, c.customer_name 
              FROM 
                transfered_back_sales AS t
              LEFT JOIN 
                users AS u1 ON u1.id = t.transferd_back_by_id
              LEFT JOIN 
                users AS u2 ON u2.id = t.transferd_back_to_id
              LEFT JOIN 
                sales AS sc ON sc.id = t.sales_id
              LEFT JOIN 
                customer_companies AS c ON sc.customer_id = c.id
              WHERE 
                sales_id = '{var1}'`,
  Q242: `UPDATE users SET session_time = '{var2}' WHERE id = '{var1}' RETURNING *`,
  Q243: `SELECT * FROM  users  WHERE role_id = '{var1}' and deleted_at IS NULL and is_deactivated='false'`,
  Q244: `SELECT * FROM  users  WHERE role_id = '{var1}' and id = '{var2}' and deleted_at IS NULL `,
  Q245: `INSERT INTO notifications(title, type_id,user_id,type) VALUES ('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
  Q246: `SELECT * FROM  notifications WHERE user_id= '{var1}' and is_read= false and deleted_at IS NULL ORDER BY created_at DESC`,
  Q247: `SELECT * FROM  notifications WHERE user_id= '{var1}' and deleted_at IS NULL ORDER BY created_at DESC Limit 50`,
  Q248: `UPDATE notifications SET is_read = true WHERE id = '{var1}' RETURNING *`,
  Q249: `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id,
            sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
            sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
            sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason,
            sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
            sc.is_service_performed, sc.committed_at,sc.service_performed_at, sc.service_perform_note,
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
                  u1.full_name as created_by,s.source,t.title,c.customer_name, u2.full_name as lead_assigned_to
                FROM customer_company_employees 
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
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
  Q250: `SELECT
            u.id, u.email_address, u.full_name, u.company_id, u.avatar, u.mobile_number,
            u.phone_number, u.address, u.role_id, u.is_admin, u.expiry_date, u.created_at,u.is_verified, u.is_deactivated,
            u.is_main_admin, u.created_by,u.is_pro_user,
            r.role_name
          FROM
            users as u
          LEFT JOIN
            roles as r ON r.id = u.role_id
          WHERE
            u.company_id = '{var1}' AND u.id = '{var2}' AND u.deleted_at IS NULL
          ORDER BY
            u.created_at DESC`,
  Q251: `INSERT INTO forecast_data(forecast_id, amount, start_date, end_date, type, created_by, company_id)
                VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
  Q252: `SELECT  sc.target_amount::DECIMAL as subscription_amount,
              sc.booking_commission::DECIMAL as subscription_booking_commission,
              sc.revenue_commission::DECIMAL as subscription_revenue_commission,
              sc.archived_at
            FROM
              sales AS sc
            WHERE
              sc.id = '{var1}' AND sc.sales_type = 'Subscription'
            AND
              sc.deleted_at IS NULL `,
  Q253: `UPDATE sales SET revenue_commission =  '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q254: ` SELECT 
              id as sales_id, target_amount, booking_commission, revenue_commission, archived_at
            FROM 
              sales 
            WHERE 
              company_id = '{var1}' 
            AND 
              sales_type = '{var2}' 
            AND
              closed_at BETWEEN '{var3}' AND '{var4}'
            AND 
              deleted_at IS NULL`,
  Q255: `SELECT  SUM(recognized_amount::DECIMAL) as amount FROM 
                recognized_revenue 
              WHERE 
                company_id = '{var1}' 
              AND
                created_at BETWEEN '{var3}' AND '{var4}'
              AND 
                deleted_at IS NULL`,
  Q256: `SELECT SUM(recognized_amount::DECIMAL) as amount FROM recognized_revenue
              WHERE 
                sales_id = '{var1}' 
              AND 
                deleted_at IS NULL`,
  Q257: `SELECT DISTINCT(sc.id)
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
            sc.deleted_at IS NULL`,

  Q258: `SELECT 
             id as sales_id, target_amount, booking_commission, 
             revenue_commission, archived_at
          FROM 
             sales
          WHERE 
            id IN ({var1}) AND sales_type = '{var2}'
          AND deleted_at IS NULL`,

  Q259: `SELECT SUM(recognized_amount::DECIMAL) as amount
              FROM 
                recognized_revenue 
              WHERE 
                sales_id IN ({var1}) 
              AND deleted_at IS NULL`,
  Q260: `UPDATE 
                forecast_data
              SET 
                deleted_at = '{var2}' 
              WHERE 
                forecast_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q261: `SELECT 
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

  Q262: `UPDATE 
              forecast
            SET 
                amount = '{var2}', assigned_to = '{var3}', is_accepted = {var4}
            WHERE 
              id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q263: `INSERT INTO forecast_audit(forecast_id,amount,reason,created_by,pid, forecast_amount)
            VALUES('{var1}', '{var2}', '{var3}', '{var4}','{var5}', '{var6}') RETURNING *`,
  Q264: `UPDATE forecast SET deleted_at = '{var1}' WHERE assigned_to = '{var2}' AND id = '{var3}' RETURNING *`,
  Q265: `UPDATE forecast_data SET deleted_at = '{var1}' WHERE forecast_id = '{var2}' RETURNING *`,
  Q266: `SELECT DISTINCT(sc.id)
           FROM sales as sc
           LEFT JOIN sales_users AS su ON su.sales_id = sc.id
           WHERE 
            ( 
              sc.user_id IN ({var1})
              OR su.user_id IN ({var1})
            ) 
            AND sc.closed_at BETWEEN '{var2}'::date AND '{var3}'::date 
            AND sc.deleted_at is null`,
  Q267: `INSERT INTO marketing_budget_data(budget_id, amount, start_date, end_date, type, created_by)
           VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}' ) RETURNING *`,
  Q268: `UPDATE marketing_budget_data SET deleted_at = '{var2}' where budget_id = '{var1}' AND deleted_at IS NULL RETURNING *`,
  Q269: `UPDATE marketing_budget_data SET deleted_at = '{var1}'
            WHERE budget_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q270: `SELECT 
              p.id, p.product_name, p.product_image, p.description, p.available_quantity, p.price, 
              p.end_of_life, p.currency, p.company_id, p.created_at, p.updated_at, p.user_id, u.full_name as created_by 
            FROM 
              products AS p
            LEFT JOIN 
              users AS u ON p.user_id = u.id
            WHERE 
              p.user_id IN ({var1}) AND p.deleted_at IS NULL
            ORDER BY 
              created_at DESC`,
  Q271: `SELECT cus.id, cus.customer_name,
              cus.user_id,cus.industry as industry_id,
              cus.created_at, cus.address, cus.currency,cus.archived_at,
              u.full_name AS created_by,cus.reason,
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
                cus.user_id IN ({var1}) 
                AND cus.deleted_at IS NULL
              ORDER BY 
                created_at desc`,
  Q272: `SELECT 
              u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
              u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
              u1.is_main_admin, u1.created_by,u1.is_deactivated, u2.full_name AS creator_name, r.role_name AS roleName,
              u1.assigned_to,u3.full_name as assigned_user_name, u1.updated_at
              FROM 
                users AS u1 
              LEFT JOIN 
                users AS u2 ON u2.id = u1.created_by
			        LEFT JOIN 
                users AS u3 ON u3.id = u1.assigned_to
              LEFT JOIN 
                roles as r on r.id = u1.role_id
            WHERE 
              u1.id IN ({var1}) AND u1.deleted_at IS NULL 
            ORDER BY 
              created_at DESC`,
  Q273: `SELECT id, closer_percentage, supporter_percentage
            FROM 
              commission_split
            WHERE 
              user_id IN ({var1}) AND deleted_at IS NULL`,
  Q274: `SELECT 
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
  Q275: `UPDATE customer_company_employees SET updated_at = '{var1}', is_converted = true WHERE id = '{var2}' RETURNING *`,
  Q276: `UPDATE companies SET updated_at = '{var1}', is_roles_created = true WHERE id = '{var2}' RETURNING *`,
  Q277: `UPDATE companies SET updated_at = '{var1}', is_users_created = true WHERE id = '{var2}' RETURNING *`,
  Q278: `UPDATE companies SET updated_at = '{var1}', is_leads_created = true WHERE id = '{var2}' RETURNING *`,
  Q279: `UPDATE companies SET updated_at = '{var1}', is_customers_created = true WHERE id = '{var2}' RETURNING *`,
  Q280: `UPDATE companies SET updated_at = '{var1}', is_products_created = true WHERE id = '{var2}' RETURNING *`,
  Q281: `UPDATE companies SET updated_at = '{var1}', is_commissions_created = true WHERE id = '{var2}' RETURNING *`,
  Q282: `UPDATE companies SET updated_at = '{var1}', is_slabs_created = true WHERE id = '{var2}' RETURNING *`,

  Q283: `UPDATE forecast SET updated_at = '{var1}', is_accepted = true WHERE id = '{var2}' RETURNING *`,
  Q2841: `SELECT count(id) from marketing_budget WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  Q284: `SELECT
              is_roles_created, is_users_created, is_leads_created, is_customers_created,
              is_products_created, is_commissions_created, is_slabs_created
            FROM companies WHERE id = '{var1}' AND deleted_at IS NULL`,
  Q285: `SELECT id FROM customer_company_employees WHERE title = '{var1}' AND deleted_at IS NULL`,
  Q286: `SELECT id FROM customer_company_employees WHERE source = '{var1}' AND deleted_at IS NULL`,
  Q287: `SELECT id FROM customer_companies WHERE industry = '{var1}' AND deleted_at IS NULL`,
  Q288: `SELECT id FROM sales WHERE slab_id = '{var1}' AND deleted_at IS NULL`,
  Q289: `SELECT s.slab_id FROM slabs AS s
             LEFT JOIN 
              sales AS sc ON sc.slab_id = s.slab_id
             WHERE s.id = '{var1}' 
             AND s.deleted_at is null AND sc.deleted_at is null`,
  Q290: `SELECT sc.id FROM sales AS sc
             LEFT JOIN 
              commission_split AS c ON sc.customer_commission_split_id = c.id
             WHERE sc.customer_commission_split_id = '{var1}' 
             AND c.deleted_at is null AND sc.deleted_at is null`,
  Q291: `SELECT s.id FROM slabs AS s
            LEFT JOIN 
            commission_split AS c ON s.commission_split_id = c.id
            WHERE s.commission_split_id = '{var1}' 
            AND c.deleted_at is null AND s.deleted_at is null`,
  Q292: `SELECT * FROM  notifications 
             WHERE type_id= '{var1}' AND type = '{var2}' AND is_read= false AND deleted_at IS NULL 
             ORDER BY created_at DESC`,
  Q293: `INSERT INTO sales_approval 
              ( percentage, description, sales_id,company_id, requested_user_id, approver_user_id,status)
            VALUES
              ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
  Q294: `UPDATE sales 
            SET updated_at = '{var1}', approval_status = '{var2}' 
            WHERE id = '{var3}' RETURNING *`,
  Q295: `UPDATE sales_approval 
            SET updated_at = '{var1}', status = '{var2}' ,reason ='{var3}'
            WHERE id = '{var4}'  AND sales_id = '{var5}' RETURNING *`,
  Q296: `SELECT * FROM sales_approval WHERE id = '{var1}' AND sales_id = '{var2}' AND deleted_at IS NULL `,
  Q297: `SELECT sap.id,sap.percentage,sap.description,sap.sales_id,sap.company_id,sap.approver_user_id,
              sap.requested_user_id,sap.created_at,sap.updated_at,sap.deleted_at,sap.status,sap.reason,
              u1.full_name AS approver_user_name,u2.full_name AS requested_user_name
            FROM sales_approval as sap
            LEFT JOIN users as u1 ON u1.id = sap.approver_user_id
            LEFT JOIN users as u2 ON u2.id = sap.requested_user_id
            WHERE sap.sales_id = '{var1}' AND sap.deleted_at IS NULL ORDER BY sap.created_at DESC`,
  Q298: `SELECT 
              l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
              l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
              l.website,l.targeted_value,l.marketing_qualified_lead,
              l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,
              u1.full_name AS creator_name,c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
              ( 
                SELECT  json_agg(customer_company_employees.*)
                    FROM (
                    SELECT 
                      customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                      customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                      customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                      customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                      customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                      customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                      u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                    FROM customer_company_employees 
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                    WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                  ) customer_company_employees 
                ) as child_lead
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
              l.company_id = '{var1}' AND l.emp_type = '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              AND l.is_converted = FALSE
            ORDER BY 
              l.created_at DESC`,

  Q299: `SELECT 
                l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
                l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
                l.website,l.targeted_value,l.marketing_qualified_lead,
                l.assigned_sales_lead_to,l.additional_marketing_notes,
                l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.emp_type,
                u1.full_name AS creator_name,  c.customer_name, c.currency, u2.full_name as assigned_sales_lead_name ,
                ( 
                  SELECT  json_agg(customer_company_employees.*)
                      FROM (
                      SELECT 
                        customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                      FROM customer_company_employees 
                      LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                      LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                      LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                      LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                      LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                      WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                    ) customer_company_employees 
                  ) as child_lead
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
                AND l.emp_type= '{var2}' AND l.pid IS NULL
                AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
                AND l.is_converted = FALSE
            ORDER BY 
              l.created_at DESC`,
  Q300: `SELECT
                sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
                sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
                sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
                sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, 
                sc.created_at, sc.user_id as creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
                sc.is_service_performed, sc.committed_at, sc.service_performed_at, sc.service_perform_note,
                cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by, u1.email_address as creator_email,
                sc.transfered_back_by as transfered_back_by_id,
                slab.slab_name, sc.approval_status,
                u2.full_name as tranfer_back_by_name,
                (
                    SELECT json_agg(customer_company_employees.*)
                    FROM (
                        SELECT 
                            customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                            customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source as source_id,
                            customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                            customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                            customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                            customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                            u1.full_name as created_by, s.source, t.title, c.customer_name
                        FROM customer_company_employees 
                        LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                        LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                        LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                        LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                        WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                        AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                        AND customer_company_employees.deleted_at IS NULL
                    ) customer_company_employees
                ) as lead_data,
                (
                  SELECT json_agg(sales_users.*)
                  FROM (
                      SELECT 
                          ss.user_id AS id, 
                          SUM(ss.user_percentage) AS percentage, 
                          ss.user_type, 
                          u1.full_name AS name, 
                          u1.email_address AS email
                      FROM sales_users AS ss
                      LEFT JOIN users AS u1 ON u1.id = ss.user_id
                      WHERE ss.sales_id = sc.id
                      AND ss.deleted_at IS NULL
                      AND u1.deleted_at IS NULL
                      GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                  ) sales_users
              ) as sales_users,
                (
                    SELECT json_agg(product_in_sales.*)
                    FROM (
                        SELECT 
                            DISTINCT(p.id), p.product_name as name
                        FROM product_in_sales as pis
                        LEFT JOIN products AS p ON p.id = pis.product_id
                        WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                    ) product_in_sales
                ) as products,
                CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) as recognized_amount,
                CASE
                    WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) < CAST(sc.target_amount AS NUMERIC) THEN true
                    WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) = CAST(sc.target_amount AS NUMERIC) THEN false
                    ELSE false
                END AS is_partial_recognized
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
              LEFT JOIN
                recognized_revenue AS rr ON rr.sales_id = sc.id
              WHERE
                sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.sales_type = '{var2}'
              GROUP BY
                sc.id, cus.customer_name, u1.full_name, u1.email_address, slab.slab_name, u2.full_name, cus.user_id
              ORDER BY
                sc.created_at DESC;`,
  Q301: `SELECT
        sc.id, sc.customer_id, sc.customer_commission_split_id AS commission_split_id,
        sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
        sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
        sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason,
        sc.created_at, sc.user_id AS creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
        sc.is_service_performed, sc.committed_at, sc.service_performed_at, sc.service_perform_note,
        cus.customer_name, cus.user_id AS customer_creator, u1.full_name AS created_by, u1.email_address AS creator_email,
        sc.transfered_back_by AS transfered_back_by_id,
        slab.slab_name, sc.approval_status,
        u2.full_name AS transfer_back_by_name,
        (
            SELECT json_agg(customer_company_employees.*)
            FROM (
                SELECT
                    customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title AS title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source AS source_id,
                    customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name AS created_by, s.source, t.title, c.customer_name
                FROM customer_company_employees
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL
                    AND customer_company_employees.deleted_at IS NULL
            ) customer_company_employees
        ) AS lead_data,
        (
            SELECT json_agg(sales_users.*)
            FROM (
                SELECT
                    ss.user_id AS id,
                    SUM(ss.user_percentage) AS percentage,
                    ss.user_type,
                    u1.full_name AS name,
                    u1.email_address AS email
                FROM sales_users AS ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
            ) sales_users
        ) AS sales_users,
        (
            SELECT json_agg(product_in_sales.*)
            FROM (
                SELECT DISTINCT(p.id), p.product_name AS name
                FROM product_in_sales AS pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
            ) product_in_sales
        ) AS products,
        CAST(SUM(rr.recognized_amount::NUMERIC) AS NUMERIC) AS recognized_amount,
        CASE
            WHEN CAST(SUM(rr.recognized_amount::NUMERIC) AS NUMERIC) < CAST(sc.target_amount AS NUMERIC) THEN true
            WHEN CAST(SUM(rr.recognized_amount::NUMERIC) AS NUMERIC) = CAST(sc.target_amount AS NUMERIC) THEN false
            ELSE false
        END AS is_partial_recognized
    FROM
        sales AS sc
    LEFT JOIN users AS u1 ON u1.id = sc.user_id
    LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
    LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
    LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
    LEFT JOIN recognized_revenue AS rr ON rr.sales_id = sc.id
    LEFT JOIN sales_users AS su ON su.sales_id = sc.id -- Add the missing join
    WHERE
        (sc.user_id IN ({var1})
            OR su.user_id IN ({var1}))
        AND sc.deleted_at IS NULL AND sc.sales_type = '{var2}'
    GROUP BY
        sc.id, cus.customer_name, u1.full_name, u1.email_address, slab.slab_name, u2.full_name, cus.user_id
    ORDER BY
        sc.created_at DESC;`,
  Q302: `SELECT
                sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
                sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
                sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
                sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, 
                sc.created_at, sc.user_id as creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
                sc.is_service_performed, sc.committed_at, sc.service_performed_at, sc.service_perform_note,
                cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by, u1.email_address as creator_email,
                sc.transfered_back_by as transfered_back_by_id,
                slab.slab_name, sc.approval_status,
                u2.full_name as tranfer_back_by_name,
                (
                    SELECT json_agg(customer_company_employees.*)
                    FROM (
                        SELECT 
                            customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                            customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source as source_id,
                            customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                            customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                            customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                            customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                            u1.full_name as created_by, s.source, t.title, c.customer_name
                        FROM customer_company_employees 
                        LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                        LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                        LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                        LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                        WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                        AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                        AND customer_company_employees.deleted_at IS NULL
                    ) customer_company_employees
                ) as lead_data,
                (
                  SELECT json_agg(sales_users.*)
                  FROM (
                      SELECT 
                          ss.user_id AS id, 
                          SUM(ss.user_percentage) AS percentage, 
                          ss.user_type, 
                          u1.full_name AS name, 
                          u1.email_address AS email
                      FROM sales_users AS ss
                      LEFT JOIN users AS u1 ON u1.id = ss.user_id
                      WHERE ss.sales_id = sc.id
                      AND ss.deleted_at IS NULL
                      AND u1.deleted_at IS NULL
                      GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                  ) sales_users
              ) as sales_users,
                (
                    SELECT json_agg(product_in_sales.*)
                    FROM (
                        SELECT 
                            DISTINCT(p.id), p.product_name as name
                        FROM product_in_sales as pis
                        LEFT JOIN products AS p ON p.id = pis.product_id
                        WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                    ) product_in_sales
                ) as products,
                COALESCE(rr.recognized_amount, 0) as recognized_amount,
                CASE
                    WHEN COALESCE(rr.recognized_amount, 0) < CAST(sc.target_amount AS NUMERIC) THEN true
                    WHEN COALESCE(rr.recognized_amount, 0) = CAST(sc.target_amount AS NUMERIC) THEN false
                    ELSE false
                END AS is_partial_recognized
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
              LEFT JOIN
                (
                    SELECT sales_id, SUM(recognized_amount::numeric) as recognized_amount
                    FROM recognized_revenue
                    WHERE deleted_at IS NULL
                    GROUP BY sales_id
                ) rr ON rr.sales_id = sc.id
              WHERE
                sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.revenue_commission::decimal > 0 
              ORDER BY
                sc.created_at DESC;`,
  Q303: `SELECT
              sc.id, sc.customer_id, sc.customer_commission_split_id AS commission_split_id,
              sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
              sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
              sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id AS creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id AS customer_creator, u1.full_name AS created_by,
              sc.transfered_back_by AS transfered_back_by_id,
              slab.slab_name, sc.approval_status,
              u2.full_name AS transfer_back_by_name,
              (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                  SELECT
                    customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title AS title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source AS source_id,
                    customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name AS created_by, s.source, t.title, c.customer_name
                  FROM customer_company_employees
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                  WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
              ) AS lead_data,
              (
                SELECT json_agg(sales_users.*)
                FROM (
                    SELECT 
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                ) sales_users
            ) AS sales_users,
              (
                SELECT json_agg(product_in_sales.*)
                FROM (
                  SELECT DISTINCT(p.id), p.product_name AS name
                  FROM product_in_sales AS pis
                  LEFT JOIN products AS p ON p.id = pis.product_id
                  WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
              ) AS products,
              COALESCE(rr.recognized_amount, 0) AS recognized_amount,
              CASE
                WHEN COALESCE(rr.recognized_amount, 0) < CAST(sc.target_amount AS NUMERIC) THEN true
                WHEN COALESCE(rr.recognized_amount, 0) = CAST(sc.target_amount AS NUMERIC) THEN false
                ELSE false
              END AS is_partial_recognized
            FROM sales AS sc
            LEFT JOIN sales_users AS su ON sc.id = su.sales_id
            LEFT JOIN users AS u1 ON u1.id = sc.user_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
            LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
            LEFT JOIN (
              SELECT sales_id, SUM(CAST(recognized_amount AS NUMERIC)) AS recognized_amount
              FROM recognized_revenue
              WHERE deleted_at IS NULL
              GROUP BY sales_id
            ) AS rr ON rr.sales_id = sc.id
            WHERE
              (sc.user_id IN ({var1}) OR su.user_id IN ({var1}))
              AND sc.deleted_at IS NULL AND sc.revenue_commission::DECIMAL > 0 AND sc.archived_at IS NULL
            GROUP BY
              sc.id, sc.customer_id, sc.customer_commission_split_id, sc.is_overwrite, sc.business_contact_id,
              sc.archived_at, sc.archived_by, sc.archived_reason,
              sc.revenue_contact_id, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.currency, sc.target_closing_date,
              sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, sc.created_at, sc.user_id, sc.closed_at, sc.slab_id, sc.lead_id,
              cus.customer_name, cus.user_id, u1.full_name,
              sc.transfered_back_by,
              rr.recognized_amount,
              slab.slab_name,
              u2.full_name,
              sc.deleted_at
                          ORDER BY
                            sc.created_at DESC;`,

  Q304: `SELECT 
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

  Q305: `SELECT 
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
  Q306: `SELECT id,assigned_to,pid,
                (
                  select json_agg(forecast_data.created_by) from forecast_data where forecast_data.forecast_id = forecast.id
                  AND forecast_data.deleted_at IS NULL
                ) as forecast_data_creator,
                (
                  select json_agg(forecast_data.*) from forecast_data where forecast_data.forecast_id = '{var1}' 
                  AND forecast_data.deleted_at IS NULL
                ) as forecast_data
            FROM forecast  
            where (forecast.id = '{var1}'  
              OR forecast.pid = '{var1}')  and forecast.deleted_at is null`,
  Q307: `SELECT 
              (
                SELECT json_agg(roles.id)
                FROM roles 
                WHERE user_id = '{var1}'  AND deleted_at IS NULL
              )as roles_data,
              (
                SELECT json_agg(users.id) 
                FROM users 
                WHERE created_by = '{var1}' AND deleted_at IS NULL
              )as users_data,
              (
                  SELECT json_agg(su.id)
                  FROM sales_users su
                  INNER JOIN sales s ON su.sales_id = s.id
                  WHERE su.user_id = '{var1}'
                      AND su.deleted_at IS NULL
                      AND s.archived_at IS NULL
                      AND (
                          s.closed_at IS NULL OR
                          (
                              s.closed_at IS NOT NULL AND (
                                  (
                                      SELECT SUM(rr.recognized_amount::numeric)
                                      FROM recognized_revenue rr
                                      WHERE rr.sales_id = s.id
                                  ) < s.target_amount::numeric OR
                                  (
                                      SELECT SUM(rr.recognized_amount::numeric)
                                      FROM recognized_revenue rr
                                      WHERE rr.sales_id = s.id
                                  ) IS NULL
                              )
                          )
                      )
              ) AS sales_users,
              (
                SELECT json_agg(customer_companies.id) 
                FROM customer_companies 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as customer_companies,
              (
                SELECT json_agg(customer_company_employees.id) 
                FROM customer_company_employees 
                WHERE (assigned_sales_lead_to = '{var1}' OR 
                creator_id = '{var1}') AND deleted_at IS NULL
              )as customer_company_employees,
              (
                SELECT json_agg(products.id) 
                FROM products 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as products_data,
              (
                SELECT json_agg(slabs.id) 
                FROM slabs 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as slabs_data,
              (
                SELECT json_agg(commission_split.id) 
                FROM commission_split 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as commission_split_data,
              (
                SELECT json_agg(chat.id) 
                FROM chat 
                WHERE (group_admin = '{var1}' OR user_a = '{var1}' OR user_b = '{var1}') 
                AND deleted_at IS NULL
              )as chat_data,
              (
                SELECT json_agg(chat_room_members.id)
                FROM chat_room_members 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as chat_room_members_data,
              (
                SELECT json_agg(marketing_budget.id) 
                FROM marketing_budget 
                WHERE created_by = '{var1}' AND deleted_at IS NULL
              )as marketing_budget_data,
              (
                SELECT json_agg(marketing_budget_data.id) 
                FROM marketing_budget_data 
                WHERE created_by = '{var1}' AND deleted_at IS NULL
              )as marketing_budget_data_data,
              (
                SELECT json_agg(marketing_budget_description.id) 
                FROM marketing_budget_description 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as marketing_budget_description_data,
              (
                SELECT json_agg(forecast.id)
                FROM forecast 
                WHERE (created_by = '{var1}' OR assigned_to = '{var1}')
                AND deleted_at IS NULL
              )as forecast_data,
              (
                SELECT json_agg(forecast_audit.id)
                FROM forecast_audit 
                WHERE created_by = '{var1}' AND deleted_at IS NULL
              )as forecast_audit_data,
              (
                SELECT json_agg(forecast_data.id)
                FROM forecast_data 
                WHERE created_by = '{var1}' AND deleted_at IS NULL
              )as forecast_data_data,
              (
                SELECT json_agg(recognized_revenue.id)
                FROM recognized_revenue 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as recognized_revenue_data,
              (
                SELECT json_agg(pro_user_availability.id)
                FROM pro_user_availability 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as user_availability_data,
              (
                SELECT json_agg(pro_scheduled_events.id)
                FROM pro_scheduled_events 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as pro_scheduled_events_data,
              (
                SELECT json_agg(pro_user_events.id)
                FROM pro_user_events 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as pro_user_events_data,
              (
                SELECT json_agg(pro_user_time_slot.id)
                FROM pro_user_time_slot 
                WHERE user_id = '{var1}' AND deleted_at IS NULL
              )as pro_user_time_slot_data
              
            FROM users where id = '{var1}' AND deleted_at IS NULL and is_deactivated = false`,
  Q308: `SELECT * FROM customer_company_employees 
             WHERE company_id = '{var1}' AND sync_id IS NOT NULL AND emp_type = 'lead' AND deleted_at IS NULL`,
  Q309: `UPDATE {var1} set {var2} = '{var3}' WHERE id IN ({var4}) AND deleted_at IS NULL`,
  Q310: `UPDATE {var1} set {var2} = '{var3}' WHERE id IN ({var4}) AND {var5} = '{var6}' AND deleted_at IS NULL`,
  Q311: `UPDATE users SET is_deactivated = '{var1}', updated_at = '{var3}', assigned_to = '{var4}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING * `,
  Q312: `SELECT * FROM customer_companies 
             WHERE LOWER(customer_name) = LOWER(TRIM('{var1}')) 
                AND company_id = '{var2}'
                AND deleted_at IS NULL`,
  Q313: `UPDATE customer_companies SET archived_at = '{var1}', reason = '{var4}' WHERE id = '{var2}' AND company_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q314: `SELECT 
              u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
              u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
              u1.is_main_admin,u1.is_deactivated,u1.created_by, u2.full_name AS creator_name , r.role_name AS roleName,
              u1.assigned_to,u3.full_name as assigned_user_name, u1.updated_at, u1.is_pro_user
            FROM 
              users AS u1 
            LEFT JOIN 
              users AS u2 ON u2.id = u1.created_by
            LEFT JOIN 
              users AS u3 ON u3.id = u1.assigned_to
            LEFT JOIN 
              roles as r on r.id = u1.role_id
            WHERE 
              u1.company_id = '{var1}' 
              AND u1.deleted_at IS NULL
              AND u1.is_deactivated = '{var2}' 
            ORDER BY 
              created_at DESC`,
  Q315: `SELECT 
              u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
              u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
              u1.is_main_admin, u1.created_by,u1.is_deactivated, u2.full_name AS creator_name, r.role_name AS roleName,
              u1.assigned_to,u3.full_name as assigned_user_name, u1.updated_at
              FROM 
                users AS u1 
              LEFT JOIN 
                users AS u2 ON u2.id = u1.created_by
              LEFT JOIN 
                users AS u3 ON u3.id = u1.assigned_to
              LEFT JOIN 
                roles as r on r.id = u1.role_id
            WHERE 
              u1.id IN ({var1}) AND u1.deleted_at IS NULL 
              AND u1.is_deactivated = '{var2}'
            ORDER BY 
              created_at DESC`,
  Q316: `INSERT INTO connectors
              (user_id,company_id,linked_in_token,linked_in_status)
            VALUES
               ('{var1}','{var2}','{var3}','{var4}') RETURNING *`,

  Q317: `SELECT * 
            FROM 
              connectors 
            WHERE 
              company_id = '{var2}' 
              AND user_id = '{var1}' 
              AND deleted_at IS NULL`,

  Q318: `SELECT com.id as company_id, c.user_id, c.salesforce_token,c.salesforce_status,
               c.linked_in_token,c.linked_in_status, c.hubspot_token,c.hubspot_status,
               c.hubspot_refresh_token,c.hubspot_expiry,
               c.linked_in_last_sync, c.salesforce_last_sync, c.hubspot_last_sync,
               c.salesforce_refresh_token, c.salesforce_expiry 
            FROM companies AS com
            LEFT JOIN connectors AS c ON c.company_id = com.id
            WHERE com.deleted_at IS NULL`,

  Q319: `UPDATE connectors SET {var1} = '{var2}',{var3} = '{var4}',
                   updated_at = '{var5}'
            WHERE user_id = '{var6}' AND company_id = '{var7}' AND deleted_at IS NULL RETURNING * `,

  Q320: `UPDATE connectors SET hubspot_token = '{var1}', hubspot_status = '{var2}',
              hubspot_refresh_token = '{var3}',hubspot_expiry = '{var4}' 
            WHERE user_id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *  `,
  Q321: `INSERT INTO connectors
              (user_id,company_id,salesforce_token,salesforce_status, salesforce_refresh_token, salesforce_expiry)
            VALUES
              ('{var1}','{var2}','{var3}','{var4}', '{var5}', '{var6}') RETURNING *`,
  Q322: `SELECT * FROM customer_company_employees WHERE sync_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  Q323: `INSERT INTO connectors
              (user_id,company_id,hubspot_token,hubspot_status,hubspot_refresh_token,hubspot_expiry)
            VALUES
              ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
  Q324: `UPDATE connectors SET {var0} = '{var1}',
                updated_at = '{var2}'
            WHERE user_id = '{var3}' AND company_id = '{var4}' AND deleted_at IS NULL RETURNING *`,
  Q325: `UPDATE connectors SET salesforce_token = '{var1}', salesforce_status = '{var2}',
                salesforce_refresh_token = '{var3}',salesforce_expiry = '{var4}' 
            WHERE user_id = '{var5}' AND company_id = '{var6}' AND deleted_at IS NULL RETURNING *  `,

  Q326: `SELECT
              l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
              l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
              l.website,l.targeted_value,l.marketing_qualified_lead,
              l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,
              l.created_at,l.is_converted,l.is_rejected,l.reason,l.sync_source,
              u1.full_name AS creator_name , c.customer_name ,u2.full_name as assigned_sales_lead_name,
              ( 
              SELECT  json_agg(customer_company_employees.*)
                  FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                ) customer_company_employees 
              ) as child_lead
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
              l.company_id = '{var1}' AND l.pid IS NULL  AND emp_type = '{var2}' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
              AND l.sync_id IS NOT NULL AND l.sync_source IS NOT NULL
            ORDER BY
              l.created_at DESC`,

  Q327: `SELECT 
              l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
              l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
              l.website,l.targeted_value,l.marketing_qualified_lead,
              l.assigned_sales_lead_to,l.additional_marketing_notes,l.creator_id,l.company_id,
              l.created_at,l.is_converted,l.is_rejected,l.reason,l.sync_source,
              u1.full_name AS creator_name , c.customer_name ,u2.full_name as assigned_sales_lead_name,
              ( 
                SELECT  json_agg(customer_company_employees.*)
                    FROM (
                    SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,customer_company_employees.sync_source,
                    u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name
                    FROM customer_company_employees 
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                    WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                  ) customer_company_employees 
                ) as child_lead
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
              l.company_id = '{var1}' AND emp_type = '{var2}' AND l.sync_source = '{var3}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
              AND l.sync_id IS NOT NULL AND l.sync_source IS NOT NULL 
            ORDER BY 
              l.created_at DESC`,

  Q328: `UPDATE users SET is_pro_user = true WHERE company_id = '{var1}' AND is_main_admin = '{var2}' AND deleted_at IS NULL`,
  Q329: `SELECT u.id, u.full_name, u.company_id, u.email_address, u.encrypted_password, u.mobile_number, u.role_id, 
              u.avatar, u.expiry_date, u.is_verified, u.is_admin, u.is_locked, u.is_main_admin,u.is_deactivated, c.company_name, c.company_address, c.company_logo, c.is_imap_enable,c.is_marketing_enable,
              r.id as role_id,r.role_name, r.reporter, r.module_ids, con.id AS config_id, con.currency, con.phone_format, con.date_format, con.before_closing_days, con.after_closing_days
            FROM users AS u 
              LEFT JOIN companies AS c ON c.id = u.company_id
              LEFT JOIN roles AS r ON r.id = u.role_id 
              LEFT JOIN configurations AS con ON con.company_id = u.company_id
            WHERE LOWER(email_address) = LOWER(TRIM('{var1}')) AND u.is_pro_user = true AND u.deleted_at IS NULL 
              AND c.deleted_at IS NULL AND r.deleted_at IS NULL AND con.deleted_at IS NULL`,
  Q330: `INSERT INTO email_templates(user_id, company_id, template, template_name, json_template)
             VALUES('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
  Q331: `SELECT * FROM email_templates
             WHERE user_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  Q332: `UPDATE email_templates SET template = '{var4}', template_name = '{var3}', json_template = '{var5}', updated_at = '{var2}' WHERE id = '{var1}' AND deleted_at IS NULL`,
  Q333: `UPDATE email_templates SET deleted_at = '{var2}' WHERE id = '{var1}'`,
  Q334: `INSERT INTO user_commissions(user_id, sales_id, company_id, total_commission_amount,user_type)
             VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}') RETURNING *`,
  Q335: `SELECT 
                DISTINCT(uc.id), uc.user_id,u.full_name,uc.user_type, uc.total_commission_amount, 
                uc.bonus_amount, uc.notes,
                uc.sales_id,cus.customer_name AS sales_name       
             FROM user_commissions AS uc
             LEFT JOIN users AS u ON u.id = uc.user_id
             LEFT JOIN sales AS sc ON sc.id = uc.sales_id
             LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
             WHERE uc.user_id IN ({var1}) AND uc.company_id = '{var2}' AND uc.deleted_at IS NULL
              AND sc.deleted_at IS NULL`,
  Q336: `SELECT 
                DISTINCT(uc.id), uc.user_id, u.full_name,uc.user_type, uc.total_commission_amount, uc.bonus_amount, uc.notes,
                uc.sales_id,cus.customer_name AS sales_name       
            FROM user_commissions AS uc
            LEFT JOIN users AS u ON u.id = uc.user_id
            LEFT JOIN sales AS sc ON sc.id = uc.sales_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            WHERE uc.sales_id = '{var1}' AND uc.company_id = '{var2}' AND uc.deleted_at IS NULL
             AND sc.deleted_at IS NULL`,
  Q337: `UPDATE user_commissions SET total_commission_amount = '{var1}' 
             WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q338: `UPDATE user_commissions SET bonus_amount = '{var2}',
             notes = '{var3}', updated_at = '{var4}' 
            WHERE id = '{var1}' AND deleted_at IS NULL RETURNING * `,
  Q339: `SELECT * FROM user_commissions WHERE user_id = '{var1}' AND sales_id = '{var2}' AND user_type = '{var3}' AND deleted_at IS NULL`,
  Q340: `SELECT 
            DISTINCT(uc.id), uc.user_id, u.full_name, uc.total_commission_amount, 
            uc.bonus_amount, uc.notes,
            uc.sales_id,uc.user_type,cus.customer_name AS sales_name       
            FROM user_commissions AS uc
            LEFT JOIN users AS u ON u.id = uc.user_id
            LEFT JOIN sales AS sc ON sc.id = uc.sales_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            WHERE uc.id = '{var1}' AND uc.deleted_at IS NULL
              AND sc.deleted_at IS NULL`,
  Q341: `INSERT INTO imap_credentials( email, app_password, user_id, smtp_host, smtp_port, company_id) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
  Q342: `INSERT INTO pro_user_availability(schedule_name, timezone, user_id, company_id) VALUES ('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
  Q343: `INSERT INTO pro_user_time_slot(days,start_time, end_time, availability_id, company_id, checked, user_id) VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}', '{var7}') RETURNING *`,
  Q344: `SELECT ua.id, ua.schedule_name, ua.timezone, ua.created_at,
              ua.user_id, u.full_name,
              (
                SELECT json_agg(pro_user_time_slot.*)
                FROM pro_user_time_slot
                WHERE ua.id = pro_user_time_slot.availability_id AND deleted_at IS NULL
              )as time_slots
            FROM pro_user_availability as ua
            LEFT JOIN users as u ON u.id = ua.user_id
            WHERE ua.user_id = '{var1}' AND ua.company_id = '{var2}' AND ua.deleted_at IS NULL`,
  Q3441: `SELECT id, schedule_name, timezone, created_at,
            user_id,
            (
              SELECT json_agg(pro_user_time_slot.*)
              FROM pro_user_time_slot
              WHERE id = pro_user_time_slot.availability_id AND deleted_at IS NULL
            )as time_slots
          FROM pro_user_availability
          WHERE user_id IS NULL AND company_id IS NULL AND deleted_at IS NULL`,
  Q345: `INSERT INTO pro_user_events(event_name, meet_link, description, user_id, company_id, duration, availability_id) VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}') RETURNING *`,
  Q346: `SELECT pe.id, pe.event_name, pe.meet_link, pe.description,pe.duration, pe.event_url, 
            pe.availability_id,pe.user_id,pe.company_id,pe.created_at,pe.updated_at,
            pe.deleted_at
           FROM pro_user_events AS pe
           WHERE pe.user_id = '{var1}' AND pe.company_id = '{var2}' 
           AND pe.deleted_at IS NULL `,
  Q3461: `SELECT pe.id, pe.event_name, pe.meet_link, pe.description,pe.duration, pe.event_url, 
            pe.availability_id,pe.user_id,pe.company_id,pe.created_at,pe.updated_at,
            pe.deleted_at
          FROM pro_user_events AS pe
          WHERE pe.user_id IS NULL AND pe.company_id IS NULL
          AND pe.deleted_at IS NULL`,
  Q347: `UPDATE pro_user_events SET event_url = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q348: `SELECT e.id AS event_id, e.event_name, e.meet_link, e.description, e.event_url,
                e.duration, e.availability_id, e.company_id, 
                e.user_id AS creator_id, u.full_name AS creator_name, u.email_address AS creator_email,
                a.schedule_name, a.timezone,
                (
                SELECT json_agg(availability)
                FROM (
                    SELECT ua.id, ua.schedule_name, ua.timezone, ua.created_at,
                            ua.user_id, u.full_name,
                          (
                            SELECT json_agg(pro_user_time_slot.*)
                            FROM pro_user_time_slot
                            WHERE ua.id = pro_user_time_slot.availability_id AND pro_user_time_slot.deleted_at IS NULL AND pro_user_time_slot.checked = 'true'
                          ) AS time_slots
                    FROM pro_user_availability AS ua
                    LEFT JOIN users AS u ON u.id = ua.user_id
                    WHERE ua.id = e.availability_id AND ua.deleted_at IS NULL
                ) AS availability
                ) AS availability_time_slots
            FROM pro_user_events AS e 
            LEFT JOIN pro_user_availability AS a ON a.id = e.availability_id
            LEFT JOIN users AS u ON u.id = e.user_id 
            WHERE e.id = '{var1}' AND e.deleted_at IS NULL`,
  Q349: `INSERT INTO pro_scheduled_events(event_id, date, start_time, end_time, lead_name, lead_email, description, user_id, company_id, timezone )
            VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}') RETURNING *`,
  Q350: `SELECT se.id, se.event_id,ue.event_name, se.date, se.start_time, se.end_time, se.lead_name, 
            se.lead_email, se.description as lead_description, se.timezone, se.created_at,
            se.user_id, u.full_name AS creator_name, u.email_address AS creator_email,
            ue.meet_link, ue.description as creator_description, ue.duration
            FROM pro_scheduled_events AS se
            LEFT JOIN users AS u ON u.id = se.user_id
            LEFT JOIN pro_user_events AS ue ON ue.id = se.event_id
            WHERE se.user_id = '{var1}' AND se.company_id = '{var2}' AND se.deleted_at IS NULL ORDER BY created_at desc`,
  Q351: ` SELECT ua.id, ua.schedule_name, ua.timezone, ua.created_at,
              ua.user_id, u.full_name,
              (
                SELECT json_agg(time_slot)
                FROM (
                  SELECT *
                  FROM pro_user_time_slot
                  WHERE ua.id = pro_user_time_slot.availability_id AND pro_user_time_slot.deleted_at IS NULL 
                  ORDER BY CASE pro_user_time_slot.days
                      WHEN 'Sunday' THEN 1
                      WHEN 'Monday' THEN 2
                      WHEN 'Tuesday' THEN 3
                      WHEN 'Wednesday' THEN 4
                      WHEN 'Thursday' THEN 5
                      WHEN 'Friday' THEN 6
                      WHEN 'Saturday' THEN 7
                  END
                ) AS time_slot
              ) AS time_slots
            FROM pro_user_availability AS ua
            LEFT JOIN users AS u ON u.id = ua.user_id
            WHERE ua.id = '{var1}' AND ua.deleted_at IS NULL`,
  Q352: `UPDATE pro_user_availability SET schedule_name = '{var1}', timezone = '{var2}', updated_at = '{var4}' WHERE id = '{var3}' RETURNING *`,
  Q353: `UPDATE pro_user_time_slot SET checked = '{var1}', start_time = '{var2}', end_time = '{var3}', updated_at = '{var5}' WHERE id = '{var4}' RETURNING *`,
  Q354: `UPDATE pro_user_availability SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q355: `UPDATE pro_user_time_slot SET deleted_at = '{var1}' WHERE availability_id = '{var2}' RETURNING *`,
  Q356: `UPDATE pro_user_time_slot SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q357: `UPDATE pro_user_events SET event_name = '{var1}', meet_link = '{var2}', description = '{var3}', duration = '{var4}', availability_id = '{var5}', updated_at = '{var7}' WHERE id = '{var6}' RETURNING *`,
  Q358: `UPDATE pro_user_events SET deleted_at = '{var1}' WHERE id = '{var2}' RETURNING *`,
  Q359: `SELECT assigned_to FROM forecast WHERE (id = '{var1}' OR pid = '{var1}') AND deleted_at IS NULL`,
  Q360: `SELECT * from imap_credentials WHERE user_id = '{var1}' AND company_id = '{var2}' AND deleted_at IS NULL`,
  Q361: `UPDATE imap_credentials SET email = '{var1}', app_password = '{var2}', smtp_host = '{var3}', smtp_port = '{var4}', updated_at = '{var6}' WHERE id = '{var5}' AND deleted_at IS NULL RETURNING *`,
  Q362: `SELECT se.event_id,ue.event_name, se.date, se.start_time, se.end_time, se.lead_name, 
              se.lead_email, se.description as lead_description, 
              se.user_id, u.full_name AS creator_name, u.email_address AS creator_email,
              ue.meet_link, ue.description as creator_description, ue.duration
          FROM pro_scheduled_events AS se
          LEFT JOIN users AS u ON u.id = se.user_id
          LEFT JOIN pro_user_events AS ue ON ue.id = se.event_id
          WHERE se.event_id = '{var1}' AND se.deleted_at IS NULL`,
  Q363: `SELECT  
            su.user_id, 
            u.full_name,
            array_agg(DISTINCT su.sales_id) AS sales_ids
          FROM 
            sales_users su
          LEFT JOIN 
            users u ON su.user_id = u.id
          LEFT JOIN
            sales s ON su.sales_id = s.id
          WHERE 
            su.user_type = 'captain' AND
            su.company_id = '{var1}' AND su.deleted_at IS NULL
            AND s.closed_at IS NOT NULL
          GROUP BY 
            su.user_id,
            u.full_name;`,
  Q364: `SELECT
              DISTINCT(s.id),
              c.customer_name,
              s.created_at,
              s.closed_at,
              (DATE_PART('epoch', s.closed_at) - DATE_PART('epoch', s.created_at)) / 86400.0 AS duration_in_days
            FROM
              sales s
              LEFT JOIN sales_users su ON s.id = su.sales_id 
              LEFT JOIN users u ON su.user_id = u.id
              LEFT JOIN customer_companies c ON s.customer_id = c.id
            WHERE
              su.user_id = '{var1}' 
              AND s.id IN ({var2})
              AND s.closed_at IS NOT NULL
            GROUP BY
              s.id,
              c.customer_name,
              s.created_at,
              s.closed_at
            ORDER BY
              s.id ASC`,
  Q365: `select sales_id,COUNT(id) AS notes_count from customer_company_employees_activities where sales_id IN ({var2}) AND user_id = '{var1}' GROUP BY sales_id`,
  Q366: `SELECT  
            su.user_id, 
            u.full_name,
            array_agg(DISTINCT su.sales_id) AS sales_ids  
          FROM 
            sales_users su
          LEFT JOIN 
            users u ON su.user_id = u.id
          LEFT JOIN
            sales s ON su.sales_id = s.id
          WHERE 
            su.user_type = 'captain' AND
            su.user_id = '{var1}' AND su.deleted_at IS NULL
            AND s.closed_at IS NOT NULL
          GROUP BY 
            su.user_id,
            u.full_name;`,
  Q367: `SELECT recognized_amount FROM recognized_revenue WHERE sales_id IN ({var1}) AND deleted_at IS NULL`,
  Q368: `SELECT * FROM customer_company_employees WHERE customer_company_id = '{var1}' AND deleted_at IS NULL`,
  Q369: `SELECT id FROM pro_scheduled_events WHERE event_id = '{var1}' AND deleted_at IS NULL LIMIT 1`,
  Q370: `SELECT id FROM pro_user_events WHERE availability_id = '{var1}' AND deleted_at IS NULL LIMIT 1`,
  Q371: `SELECT * FROM email_templates WHERE is_master = true AND deleted_at IS NULL`,
  Q372: `UPDATE sales SET target_amount = '{var1}', booking_commission = '{var2}' WHERE id = '{var3}' AND deleted_At IS NULL RETURNING *`,
  Q373: `SELECT rc.id, rc.recognized_date, rc.commission_amount, rc.user_type, u.full_name AS sales_rep_name,
            c.company_name, c.company_logo, cc.customer_name, s.closed_at, s.sales_type
          FROM recognized_commission AS rc 
          LEFT JOIN users as u ON u.id = rc.user_id
          LEFT JOIN companies as c ON c.id = u.company_id
          LEFT JOIN sales as s ON s.id = rc.sales_id
          LEFT JOIN customer_companies as cc ON cc.id = s.customer_id
          WHERE rc.user_id = '{var1}' 
          AND TO_DATE(rc.recognized_date, 'MM-DD-YYYY') BETWEEN TO_DATE('{var2}', 'MM-DD-YYYY') AND TO_DATE('{var3}', 'MM-DD-YYYY')
            AND rc.deleted_at IS NULL AND u.deleted_at IS NULL`,
  Q374: `INSERT INTO recognized_commission(user_id, sales_id, company_id, commission_amount,user_type, recognized_date, recognized_amount)
          VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}','{var7}') RETURNING *`,
  Q375: `UPDATE notifications SET is_read = true WHERE user_id = '{var1}' RETURNING *`,
  Q376: `SELECT SUM(commission_amount::DECIMAL) as commission FROM recognized_commission
            WHERE 
              sales_id = '{var1}' 
            AND 
              deleted_at IS NULL`,
  Q390: `UPDATE companies SET quarter = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
  Q393: `SELECT start_date FROM pro_quarter_config WHERE company_id = '{var1}' AND quarter = '{var2}' AND deleted_at IS NULL`,
  Q394: `UPDATE companies SET company_address = '{var1}', updated_at = '{var2}', quarter = '{var4}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`,
  Q395: `SELECT
            count(*) as total_lead_count,
            sum(CASE WHEN su1.user_id = '{var3}' AND s1.closed_at IS NOT NULL THEN 1 ELSE 0 END) as converted_lead_count
          FROM
            sales s
          INNER JOIN sales_users su ON su.sales_id = s.id AND su.user_type = 'captain'
          LEFT JOIN sales s1 ON su.sales_id = s1.id
          LEFT JOIN sales_users su1 ON su1.sales_id = s1.id AND su1.user_type = 'captain'
          WHERE
            su.user_id = '{var3}'
            AND s.created_at >= '{var1}'
            AND s.created_at <= '{var2}'
            AND s.deleted_at IS NULL`,
  Q396: `SELECT
            count(*) as total_lead_count,
            sum(CASE WHEN su1.user_id IN ({var3}) AND s1.closed_at IS NOT NULL THEN 1 ELSE 0 END) as converted_lead_count
          FROM
            sales s
          INNER JOIN sales_users su ON su.sales_id = s.id AND su.user_type = 'captain'
          LEFT JOIN sales s1 ON su.sales_id = s1.id
          LEFT JOIN sales_users su1 ON su1.sales_id = s1.id AND su1.user_type = 'captain'
          WHERE
            su.user_id IN ({var3})
            AND s.created_at >= '{var1}'
            AND s.created_at <= '{var2}'
            AND s.deleted_at IS NULL`,
  Q397: `SELECT
              COUNT(*) AS total_sales_count,
              COALESCE(SUM(CASE WHEN closed_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS closed_sales_count
            FROM
              sales
            WHERE
              created_at BETWEEN '{var1}' AND '{var2}'
              AND id IN ({var3})
              AND deleted_at IS NULL;`,
  Q398: `SELECT COALESCE(SUM(rr.recognized_amount::numeric), 0) AS total_amount
              FROM recognized_revenue AS rr
              WHERE rr.sales_id IN ({var3})
              AND TO_DATE(rr.recognized_date, 'MM-DD-YYYY') >= '{var1}'
              AND TO_DATE(rr.recognized_date, 'MM-DD-YYYY') <= '{var2}'
              AND rr.deleted_at IS NULL;
              `,
  // "Q399": `WITH months AS (
  //             SELECT
  //               1 AS month_number,
  //               TO_TIMESTAMP('{var1}', 'YYYY-MM-DD') AS start_date,
  //               TO_TIMESTAMP('{var2}', 'YYYY-MM-DD') AS end_date
  //             UNION
  //             SELECT
  //               2 AS month_number,
  //               TO_TIMESTAMP('{var3}', 'YYYY-MM-DD') AS start_date,
  //               TO_TIMESTAMP('{var4}', 'YYYY-MM-DD') AS end_date
  //             UNION
  //             SELECT
  //               3 AS month_number,
  //               TO_TIMESTAMP('{var5}', 'YYYY-MM-DD') AS start_date,
  //               TO_TIMESTAMP('{var6}', 'YYYY-MM-DD') AS end_date
  //           )
  //           SELECT
  //             COALESCE(SUM(r.recognized_amount::numeric), 0) AS total_amount,
  //             m.month_number,
  //             to_char(m.start_date, 'Month') AS start_month,
  //             to_char(m.end_date, 'Month') AS end_month
  //           FROM
  //             months m
  //           LEFT JOIN
  //             recognized_revenue r ON r.sales_id IN ({var7})
  //             AND TO_DATE(r.recognized_date, 'MM-DD-YYYY') BETWEEN m.start_date AND m.end_date
  //             AND r.deleted_at IS NULL
  //           GROUP BY
  //             m.month_number, start_month, end_month
  //           ORDER BY
  //             m.month_number;
  //           `,
  Q398: `SELECT s.id,
            CASE WHEN s.subscription_plan = 'Monthly' THEN s.target_amount::numeric * 12
                WHEN s.subscription_plan = 'Annually' THEN s.target_amount::numeric
                ELSE 0
            END AS target_amount,s.subscription_plan, s.recurring_date, cc.customer_name
            FROM sales AS s
            LEFT JOIN customer_companies AS cc ON s.customer_id = cc.id
            WHERE s.id IN ({var3})
                AND s.sales_type = 'Subscription'
                AND s.deleted_at IS NULL
                AND s.archived_at IS NULL
                AND cc.deleted_at IS NULL
                AND cc.archived_at IS NULL
                AND s.closed_at >= '{var1}'
                AND s.closed_at <= '{var2}'`,
  Q399: `SELECT s.id,
              CASE WHEN s.subscription_plan = 'Monthly' THEN s.target_amount::numeric
                  WHEN s.subscription_plan = 'Annually' THEN s.target_amount::numeric / 12
                  ELSE 0
              END AS target_amount,
              s.subscription_plan,
              s.recurring_date,
              s.closed_at,
              cc.customer_name
            FROM sales AS s
            LEFT JOIN customer_companies AS cc ON s.customer_id = cc.id
            WHERE s.id IN ({var3})
            AND (s.subscription_plan = 'Monthly' OR s.subscription_plan = 'Annually')
            AND s.sales_type = 'Subscription'
            AND s.deleted_at IS NULL
            AND s.archived_at IS NULL
            AND cc.deleted_at IS NULL
            AND cc.archived_at IS NULL
            AND s.closed_at >= '{var1}'
            AND s.closed_at  <= '{var2}'`,

  Q400: `SELECT sales_ids
          FROM (
            SELECT array_agg(DISTINCT su.sales_id) AS sales_ids
            FROM sales_users su
            LEFT JOIN users u ON su.user_id = u.id
            LEFT JOIN sales s ON su.sales_id = s.id
            WHERE su.user_type = 'captain'
              AND su.user_id IN ({var1})
              AND su.deleted_at IS NULL
              AND s.closed_at IS NOT NULL
              AND s.deleted_at IS NULL
              AND u.deleted_at IS NULL
          ) subquery
          WHERE sales_ids IS NOT NULL AND array_length(sales_ids, 1) > 0 `,
  Q401: `SELECT
            count(*) as total_deals_created,
            (
              SELECT
                count(*)
              from
                customer_company_employees_activities f
                JOIN sales s1 on s1.id = f.sales_id
                JOIN sales_users su1 ON s1.id = su1.sales_id
              WHERE
                su1.user_type = 'captain'
                AND su1.user_id = '{var3}'
                AND s1.created_at >= '{var1}'
                AND s1.created_at <= '{var2}'
                AND s1.deleted_at IS NULL
            ) AS total_sales_activities
          from
            sales s
            JOIN sales_users su ON s.id = su.sales_id
          WHERE
            su.user_type = 'captain'
            AND su.user_id = '{var3}'
            AND s.created_at >= '{var1}'
            AND s.created_at <= '{var2}'
            AND s.deleted_at IS NULL;`,
  Q402: `SELECT
            count(*) as total_deals_created,
            (
              SELECT
                count(*)
              from
                customer_company_employees_activities f
                JOIN sales s1 on s1.id = f.sales_id
                JOIN sales_users su1 ON s1.id = su1.sales_id
              WHERE
                su1.user_type = 'captain'
                AND su1.user_id IN ({var3})
                AND s1.created_at >= '{var1}'
                AND s1.created_at <= '{var2}'
                AND s1.deleted_at IS NULL
            ) AS total_sales_activities
          from
            sales s
            JOIN sales_users su ON s.id = su.sales_id
          WHERE
            su.user_type = 'captain'
            AND su.user_id IN ({var3})
            AND s.created_at >= '{var1}'
            AND s.created_at <= '{var2}'
            AND s.deleted_at IS NULL;`,
  Q403: `SELECT su.sales_id, ARRAY_AGG(su.id) AS ids, cc.customer_name
          FROM sales_users su
          LEFT JOIN sales s ON su.sales_id = s.id
          LEFT JOIN customer_companies cc ON s.customer_id = cc.id
          WHERE su.sales_id IN ({var3})
            AND su.user_type = 'support'
            AND s.created_at BETWEEN '{var1}' AND '{var2}'
            AND s.deleted_at IS NULL
            AND su.deleted_at IS NULL
            AND cc.deleted_at IS NULL
          GROUP BY su.sales_id, su.user_type, cc.customer_name
          ORDER BY su.sales_id`,
  Q404: `SELECT
            su.user_id,
            u.full_name,
            array_agg(DISTINCT su.sales_id) AS sales_ids
          FROM
            sales_users su
          LEFT JOIN
            users u ON su.user_id = u.id
          LEFT JOIN
            sales s ON su.sales_id = s.id
          WHERE
            su.user_type = 'captain' AND
            su.user_id = '{var1}' AND su.deleted_at IS NULL
          GROUP BY
            su.user_id,
            u.full_name;`,
  Q405: `SELECT
              su.sales_id,
              array_remove(ARRAY_AGG(CASE WHEN su.user_type = 'support' THEN su.user_id ELSE NULL END), NULL) AS ids,
              s.target_amount,
              cc.customer_name,
              ARRAY_LENGTH(COALESCE(fn.notes, '{}'::TEXT[]), 1) AS notes
            FROM
              sales_users su
              LEFT JOIN sales s ON su.sales_id = s.id
              LEFT JOIN customer_companies cc ON s.customer_id = cc.id
              LEFT JOIN (
                  SELECT sales_id, ARRAY_AGG(notes) AS notes
                  FROM customer_company_employees_activities
                  WHERE deleted_at IS NULL -- Add the condition here
                  GROUP BY sales_id
              ) AS fn ON s.id = fn.sales_id
            WHERE
              su.sales_id IN ({var3})
              AND s.created_at BETWEEN '{var1}' AND '{var2}'
              AND s.archived_at IS NULL
              AND su.deleted_at IS NULL
              AND s.deleted_at IS NULL
              AND cc.deleted_at IS NULL
              AND s.closed_at IS NULL
            GROUP BY
              su.sales_id,
              cc.customer_name,
              fn.notes,
              target_amount
            ORDER BY
              su.sales_id;`,
  // "Q405": `SELECT
  //           su.sales_id,
  //           ARRAY_AGG(su.id) AS ids,
  //           s.target_amount,
  //           cc.customer_name,
  //           COALESCE(fn.notes, '{}'::TEXT[]) AS notes
  //         FROM
  //           sales_users su
  //           LEFT JOIN sales s ON su.sales_id = s.id
  //           LEFT JOIN customer_companies cc ON s.customer_id = cc.id
  //           LEFT JOIN (
  //             SELECT sales_id, ARRAY_AGG(notes) AS notes
  //             FROM customer_company_employees_activities
  //             GROUP BY sales_id
  //           ) AS fn ON s.id = fn.sales_id
  //         WHERE
  //           su.sales_id IN ({var3})
  //           AND su.user_type = 'captain'
  //           AND s.created_at BETWEEN '{var1}' AND '{var2}'
  //           AND s.archived_at IS NULL
  //           AND su.deleted_at IS NULL
  //           AND s.deleted_at IS NULL
  //           AND cc.deleted_at IS NULL
  //           AND s.closed_at IS NULL
  //         GROUP BY
  //           su.sales_id,
  //           su.user_type,
  //           cc.customer_name,
  //           fn.notes,
  //           target_amount
  //         ORDER BY
  //           su.sales_id;`,
  Q406: `SELECT
            rr.sales_id,
            CAST(rr.recognized_amount AS VARCHAR) AS recognized_amount,
            cc.customer_name,
            s.target_amount
          FROM
            recognized_revenue AS rr
            LEFT JOIN sales AS s ON s.id = rr.sales_id
            LEFT JOIN customer_companies AS cc ON s.customer_id = cc.id
          WHERE
            rr.sales_id IN ({var3})
            AND s.created_at BETWEEN '{var1}' AND '{var2}'
            AND s.closed_at IS NOT NULL
            AND s.deleted_at IS NULL
            AND s.archived_at IS NULL
            AND cc.deleted_at IS NULL

          UNION ALL

          SELECT
            s.id AS sales_id,
            CAST('0' AS VARCHAR) AS recognized_amount,
            cc.customer_name,
            s.target_amount
          FROM
            sales AS s
            LEFT JOIN customer_companies AS cc ON s.customer_id = cc.id
          WHERE
            s.id IN ({var3})
            AND s.created_at BETWEEN '{var1}' AND '{var2}'
            AND s.id NOT IN (SELECT sales_id FROM recognized_revenue)
            AND s.closed_at IS NOT NULL
            AND s.deleted_at IS NULL
            AND s.archived_at IS NULL
            AND cc.deleted_at IS NULL`,
  Q407: `SELECT amount FROM forecast WHERE assigned_to = '{var1}' AND timeline = 'Annual' AND deleted_at IS NULL AND pid != '0' `,
  Q408: `SELECT
            sl.id,
            sl.target_amount,
            sl.sales_id,
            sl.target_closing_date,
            cc.customer_name
          FROM
            sales_logs sl
            LEFT JOIN customer_companies cc ON sl.customer_id = cc.id
            LEFT JOIN sales s ON s.id = sl.sales_id
          WHERE
            sl.sales_id IN ({var3})
            AND sl.created_at BETWEEN '{var1}' AND '{var2}'
            AND s.archived_at IS NULL
            AND sl.deleted_at IS NULL
            AND s.deleted_at IS NULL
            AND sl.closed_at IS NULL
            AND s.closed_at IS NULL
            AND cc.deleted_at IS NULL `,
  Q409: `SELECT  
            su.user_id, 
            u.full_name,
            array_agg(DISTINCT su.sales_id) AS sales_ids
          FROM 
            sales_users su
          LEFT JOIN 
            users u ON su.user_id = u.id
          LEFT JOIN
            sales s ON su.sales_id = s.id
          WHERE 
            su.user_type = 'captain' AND
            su.user_id IN ({var1}) AND su.deleted_at IS NULL
          GROUP BY 
            su.user_id,
            u.full_name;`,
  Q410: `SELECT amount FROM forecast WHERE assigned_to IN ({var1}) AND timeline = 'Annual' AND deleted_at IS NULL AND pid != '0'`,
  Q411: `SELECT
            s.customer_id,
            s.target_amount,
            cc.customer_name,
            pis.product_id,
            pis.sales_id,
            array_agg(p.product_name) AS product_names,
            p.end_of_life
          FROM
            sales s
          LEFT JOIN
            product_in_sales pis ON s.id = pis.sales_id
          LEFT JOIN
            products p ON pis.product_id = p.id
          LEFT JOIN
            customer_companies cc ON s.customer_id = cc.id
          WHERE
            s.id IN ({var1})
            AND p.end_of_life <> ''
            AND TO_CHAR(p.end_of_life::date, 'YYYY-MM-DD') >= '{var2}' AND TO_CHAR(p.end_of_life::date, 'YYYY-MM-DD') <= '{var3}'
            AND s.closed_at IS NULL
            AND s.archived_at IS NULL
            AND s.deleted_at IS NULL
            AND pis.deleted_at IS NULL
            AND p.deleted_at IS NULL
          GROUP BY
            s.customer_id,
            s.target_amount,
            cc.customer_name,
            pis.product_id,
            pis.sales_id,
          p.end_of_life;`,
  //this was query number 302 now it's 412 that is being used in listForProUser
  Q412: `SELECT
        sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
        sc.is_overwrite,sc.qualification, sc.is_qualified, sc.target_amount,sc.booking_commission,sc.revenue_commission,
          sc.currency, sc.target_closing_date,sc.archived_at, sc.archived_by,sc.archived_reason,
        sc.sales_type, sc.subscription_plan,sc.recurring_date,sc.contract,sc.transfer_reason, 
        sc.created_at,sc.user_id as creator_id, sc.closed_at, sc.slab_id,sc.lead_id,
        sc.is_service_performed, sc.committed_at,sc.service_performed_at, sc.service_perform_note,
        cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by,u1.email_address as creator_email,
        sc.transfered_back_by as transfered_back_by_id ,
        slab.slab_name,sc.approval_status,
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
        sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.revenue_commission::decimal > 0 
      ORDER BY
        sc.created_at DESC`,
  Q413: `SELECT  
  su.user_id,
  u.full_name,
  array_agg(DISTINCT su.sales_id) AS sales_ids
FROM 
  sales_users su
LEFT JOIN 
  users u ON su.user_id = u.id
LEFT JOIN
  sales s ON su.sales_id = s.id
WHERE 
  su.user_type = 'captain' 
  AND su.company_id = '{var1}' 
  AND su.deleted_at IS NULL
  AND u.deleted_at IS NULL
GROUP BY 
  su.user_id,
  u.full_name;`,
  Q414: `SELECT 
              DISTINCT(uc.id), uc.user_id,u.full_name,uc.user_type, uc.total_commission_amount, 
              uc.bonus_amount, uc.notes,
              uc.sales_id,cus.customer_name AS sales_name       
            FROM user_commissions AS uc
            LEFT JOIN users AS u ON u.id = uc.user_id
            LEFT JOIN sales AS sc ON sc.id = uc.sales_id
            LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
            WHERE uc.company_id = '{var1}' AND uc.deleted_at IS NULL
            AND sc.deleted_at IS NULL`,
  //after changes lead list in pro for view own
  Q415: `SELECT 
            l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
            l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
            l.website,l.targeted_value,l.marketing_qualified_lead,
            l.assigned_sales_lead_to,l.additional_marketing_notes,
            l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.reason,l.emp_type,
            u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name ,
            ( 
              SELECT  json_agg(customer_company_employees.*)
                  FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                ) customer_company_employees 
              ) as child_lead
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
            (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND l.emp_type= '{var2}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
            AND l.sync_id IS NOT NULL AND l.sync_source IS NOT NULL
          ORDER BY 
            l.created_at DESC`,
  Q416: `SELECT 
            l.id, l.full_name,l.title AS title_id,t.title AS title_name,l.email_address,l.phone_number,
            l.address,l.customer_company_id,l.source AS source_id,s.source AS source_name,l.linkedin_url,
            l.website,l.targeted_value,l.marketing_qualified_lead,
            l.assigned_sales_lead_to,l.additional_marketing_notes,
            l.creator_id,l.company_id,l.created_at,l.is_converted,l.is_rejected,l.reason,l.emp_type,
            u1.full_name AS creator_name,  c.customer_name , u2.full_name as assigned_sales_lead_name ,
            ( 
              SELECT  json_agg(customer_company_employees.*)
                  FROM (
                  SELECT 
                    customer_company_employees.id,customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                    customer_company_employees.phone_number,customer_company_employees.address, customer_company_employees.source as source_id,
                    customer_company_employees.linkedin_url,customer_company_employees.website, customer_company_employees.targeted_value,
                    customer_company_employees.assigned_sales_lead_to,customer_company_employees.additional_marketing_notes,customer_company_employees.creator_id,
                    customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at,customer_company_employees.emp_type,
                    customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                    u1.full_name as created_by,s.source,t.title,c.customer_name,u2.full_name as assigned_sales_lead_name, customer_company_employees.sync_source
                  FROM customer_company_employees 
                  LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                  LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                  LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                  LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                  LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                  WHERE l.id = customer_company_employees.pid AND emp_type = 'lead' AND l.deleted_at IS NULL AND u1.deleted_at IS NULL
                ) customer_company_employees 
              ) as child_lead
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
            (l.creator_id IN ({var1}) OR l.assigned_sales_lead_to IN ({var1})) AND l.emp_type= '{var2}' AND l.sync_source = '{var3}' AND l.pid IS NULL AND l.deleted_at IS NULL AND u1.deleted_at IS NULL 
            AND l.sync_id IS NOT NULL AND l.sync_source IS NOT NULL
          ORDER BY 
            l.created_at DESC`,
  Q417: `SELECT 
            u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
            u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
            u1.is_main_admin,u1.is_deactivated,u1.created_by, u2.full_name AS creator_name , r.role_name AS roleName,
            u1.assigned_to,u3.full_name as assigned_user_name, u1.updated_at, u1.is_pro_user
          FROM 
            users AS u1 
          LEFT JOIN 
            users AS u2 ON u2.id = u1.created_by
          LEFT JOIN 
            users AS u3 ON u3.id = u1.assigned_to
          LEFT JOIN 
            roles as r on r.id = u1.role_id
          WHERE 
            u1.id IN ({var1}) 
            AND u1.deleted_at IS NULL
            AND u1.is_deactivated = '{var2}' 
          ORDER BY 
            created_at DESC`,
  Q418: `SELECT  
            su.user_id, 
            u.full_name,
            array_agg(DISTINCT su.sales_id) AS sales_ids
          FROM 
            sales_users su
          LEFT JOIN 
            users u ON su.user_id = u.id
          LEFT JOIN
            sales s ON su.sales_id = s.id
          WHERE 
            su.user_type = 'captain' AND
            su.user_id IN ({var1}) AND su.deleted_at IS NULL
            AND s.closed_at IS NOT NULL
          GROUP BY 
            su.user_id,
            u.full_name;`,
  Q419: `SELECT  
  su.user_id,
  u.full_name,
  array_agg(DISTINCT su.sales_id) AS sales_ids
FROM 
  sales_users su
LEFT JOIN 
  users u ON su.user_id = u.id AND u.deleted_at IS NULL
LEFT JOIN
  sales s ON su.sales_id = s.id
WHERE 
  su.user_type = 'captain' 
  AND su.user_id IN ({var1}) 
  AND su.deleted_at IS NULL
GROUP BY 
  su.user_id,
  u.full_name`,

  Q420: `SELECT id, company_id 
            FROM 
            users 
            WHERE 
            company_id = '{var1}' AND is_main_admin = true`,
  //query for merge the support if occur more than once
  Q421: `SELECT
            sc.id,
            sc.customer_id,
            sc.customer_commission_split_id AS commission_split_id,
            sc.is_overwrite,
            sc.qualification,
            sc.is_qualified,
            sc.target_amount,
            sc.booking_commission,
            sc.revenue_commission,
            sc.currency,
            sc.target_closing_date,
            sc.archived_at,
            sc.archived_by,
            sc.archived_reason,
            sc.sales_type,
            sc.subscription_plan,
            sc.recurring_date,
            sc.contract,
            sc.transfer_reason,
            sc.created_at,
            sc.user_id AS creator_id,
            sc.closed_at,
            sc.slab_id,
            sc.lead_id,
            sc.is_service_performed,
            sc.committed_at,
            sc.service_performed_at,
            sc.service_perform_note,
            cus.customer_name,
            cus.user_id AS customer_creator,
            u1.full_name AS created_by,
            u1.email_address AS creator_email,
            sc.transfered_back_by AS transfered_back_by_id,
            sc.approval_status,
            slab.slab_name,
            u2.full_name AS tranfer_back_by_name,
            (
              SELECT json_agg(customer_company_employees.*)
              FROM (
                SELECT
                  customer_company_employees.id,
                  customer_company_employees.full_name,
                  customer_company_employees.title AS title_id,
                  customer_company_employees.email_address,
                  customer_company_employees.phone_number,
                  customer_company_employees.address,
                  customer_company_employees.source AS source_id,
                  customer_company_employees.linkedin_url,
                  customer_company_employees.website,
                  customer_company_employees.targeted_value,
                  customer_company_employees.assigned_sales_lead_to,
                  customer_company_employees.additional_marketing_notes,
                  customer_company_employees.creator_id,
                  customer_company_employees.reason,
                  customer_company_employees.created_at,
                  customer_company_employees.updated_at,
                  customer_company_employees.emp_type,
                  customer_company_employees.marketing_qualified_lead,
                  customer_company_employees.is_rejected,
                  customer_company_employees.customer_company_id,
                  u1.full_name AS created_by,
                  s.source,
                  t.title,
                  c.customer_name,
                  u2.full_name AS lead_assigned_to
                FROM customer_company_employees
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN users AS u2 ON u2.id = customer_company_employees.assigned_sales_lead_to
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                WHERE (customer_company_employees.id = sc.lead_id OR
                  customer_company_employees.id = sc.business_contact_id OR
                  customer_company_employees.id = sc.revenue_contact_id) AND
                  customer_company_employees.is_rejected = false AND
                  u1.deleted_at IS NULL AND
                  customer_company_employees.deleted_at IS NULL
              ) customer_company_employees
            ) AS lead_data,
            (
              SELECT json_agg(sales_users.*)
              FROM (
                SELECT
                  ss.user_id AS id,
                  SUM(ss.user_percentage) AS percentage,
                  ss.user_type,
                  u1.full_name AS name,
                  u1.email_address AS email
                FROM sales_users AS ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id = sc.id AND
                  ss.deleted_at IS NULL AND
                  u1.deleted_at IS NULL
                GROUP BY ss.user_id, ss.user_type, u1.full_name, u1.email_address
              ) sales_users
            ) AS sales_users,
            (
              SELECT json_agg(product_in_sales.*)
              FROM (
                SELECT DISTINCT(p.id), p.product_name AS name
                FROM product_in_sales AS pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id = pis.sales_id AND
                  sc.deleted_at IS NULL AND
                  p.deleted_at IS NULL
              ) product_in_sales
            ) AS products,
            (
              SELECT json_agg(sales_approval.*)
              FROM (
                SELECT
                  sap.id,
                  sap.percentage,
                  sap.description,
                  sap.sales_id,
                  sap.company_id,
                  sap.approver_user_id,
                  sap.requested_user_id,
                  sap.created_at,
                  sap.updated_at,
                  sap.deleted_at,
                  sap.status,
                  sap.reason,
                  u1.full_name AS approver_user_name,
                  u2.full_name AS requested_user_name
                FROM sales_approval AS sap
                LEFT JOIN users AS u1 ON u1.id = sap.approver_user_id
                LEFT JOIN users AS u2 ON u2.id = sap.requested_user_id
                WHERE sap.sales_id = sc.id AND
                  sap.deleted_at IS NULL AND
                  sap.status = 'Pending'
              ) sales_approval
            ) AS sales_approval
          FROM sales AS sc
          LEFT JOIN users AS u1 ON u1.id = sc.user_id
          LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
          LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
          LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
          WHERE
            sc.company_id = '{var1}' AND
            sc.id = '{var2}' AND
            sc.deleted_at IS NULL
          ORDER BY sc.created_at DESC`,
  Q422: `UPDATE users SET is_pro_user = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL`,
  Q423: `SELECT
              sc.id,
              su.user_id,
              su.user_percentage,
              su.user_type,
              sc.customer_id,
              sc.target_amount,
              sc.slab_id,
              u.full_name,
              u.created_by
            FROM sales AS sc
            LEFT JOIN (
              SELECT
                sales_id,
                user_id,
                user_type,
                SUM(user_percentage) AS user_percentage
              FROM sales_users
              WHERE deleted_at IS NULL
              GROUP BY sales_id, user_id, user_type
            ) AS su ON sc.id = su.sales_id
            LEFT JOIN users AS u ON su.user_id = u.id
            WHERE
              sc.id = '{var1}'
              AND sc.deleted_at IS NULL
              AND u.deleted_at IS NULL;`,
  Q424: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',resources = '{var3}',background = '{var4}',vision_mission = '{var5}', vision_mission_image = '{var6}', product_image = '{var7}', customer_profiling = '{var8}', lead_processes = '{var9}', sales_strategies = '{var10}', scenario_data = '{var11}', sales_best_practices = '{var12}',sales_best_practices_image = '{var15}', updated_at = '{var13}' WHERE id = '{var14}' RETURNING *`,
  Q425: `INSERT INTO sales_playbook (company_id, user_id, background, vision_mission, vision_mission_image, product_image, customer_profiling, lead_processes, sales_strategies, scenario_data, sales_best_practices, sales_best_practices_image, resources_title,documentation,documentation_title,sales_stack,sales_stack_title,company_overview_title,background_title,vision_mission_title,product_pricing_title,customer_profiling_title,sales_processes_title,lead_processes_title,sales_strategies_title,qualified_lead_title,top_customer_title,top_product_title,sales_analysis_title,sales_scenarios_title,team_role_title,sales_best_practice_title,sales_presentation_title)
           VALUES ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}', '{var13}','{var14}','{var15}','{var16}','{var17}','{var18}','{var19}','{var20}','{var21}','{var22}','{var23}','{var24}','{var25}','{var26}','{var27}','{var28}','{var29}','{var30}','{var31}','{var32}','{var33}') RETURNING *`,
  Q426: `SELECT
            sp.id,
            sp.resources,
            sp.resources_title,
            sp.documentation,
            sp.documentation_title,
            sp.sales_stack,
            sp.sales_stack_title,
            sp.company_overview_title, 
            sp.background,
            sp.background_title,
            sp.vision_mission,
            sp.vision_mission_title,
            sp.vision_mission_image,
            sp.product_pricing_title, 
            sp.product_image,
            sp.customer_profiling,
            sp.customer_profiling_title,
            sp.sales_processes_title, 
            sp.lead_processes,
            sp.lead_processes_title,
            sp.sales_strategies,
            sp.sales_strategies_title,
            sp.qualified_lead_title,
            sp.top_customer_title,
            sp.top_product_title,
            sp.sales_analysis_title,
            sp.sales_scenarios_title, 
            sp.team_role_title,
            sp.sales_best_practices,
            sp.sales_best_practice_title,
            sp.scenario_data,
            sp.sales_best_practices_image,
            sp.sales_presentation_title
          FROM
            sales_playbook sp
          WHERE
            sp.company_id = '{var1}' AND sp.deleted_at IS NULL`,
  Q427: `SELECT 
            cus.id, cus.customer_name,
            COALESCE((SELECT COUNT(*) FROM sales s WHERE s.customer_id = cus.id), 0) AS sales_count,
            COALESCE((SELECT SUM(s.target_amount::numeric) FROM sales s WHERE s.customer_id = cus.id), 0) AS total_target_amount
          FROM 
            customer_companies AS cus 	    
          WHERE 
            cus.company_id = '{var1}' AND cus.deleted_at IS NULL

          ORDER BY
            total_target_amount DESC
            LIMIT 10`,
  Q428: `SELECT 
            u1.id, u1.email_address, u1.full_name, u1.company_id, u1.avatar, u1.mobile_number, 
            u1.phone_number, u1.address, u1.role_id, u1.is_admin, u1.expiry_date, u1.created_at,u1.is_verified, 
            u1.is_main_admin,u1.is_deactivated,u1.created_by, u2.full_name AS creator_name , r.role_name AS roleName,
            u1.assigned_to,u3.full_name as assigned_user_name, u1.updated_at, u1.is_pro_user
          FROM 
            users AS u1 
          LEFT JOIN 
            users AS u2 ON u2.id = u1.created_by
          LEFT JOIN 
            users AS u3 ON u3.id = u1.assigned_to
          LEFT JOIN 
            roles as r on r.id = u1.role_id
          WHERE 
            u1.company_id = '{var1}' 
            AND u1.deleted_at IS NULL
            AND u1.is_deactivated = '{var2}' 
          ORDER BY 
            created_at ASC `,
  Q429: `SELECT cce.id,cce.source as source_id,cce.marketing_qualified_lead, ls.source as source_name
            FROM customer_company_employees AS cce
            LEFT JOIN lead_sources AS ls ON cce.source = ls.id
            WHERE cce.company_id = '{var1}' AND cce.emp_type = 'lead'
            AND cce.deleted_at IS NULL
            ORDER BY source_name ASC`,
  Q430: `SELECT
            p.id AS product_id,
            p.product_name,
            p.product_image,
            -- Sum of target_amount for Q1 (January to March)
            SUM(CASE WHEN s.created_at >= '{var1}' AND s.created_at < '{var2}' THEN s.target_amount::numeric ELSE 0 END) AS total_target_amount
          FROM
            products AS p
          LEFT JOIN
            product_in_sales AS pis ON p.id = pis.product_id
          LEFT JOIN
            sales AS s ON pis.sales_id = s.id
          WHERE
            p.company_id = '{var3}' AND p.deleted_at IS NULL
          GROUP BY
            p.id, p.product_name
          ORDER BY
            total_target_amount DESC
          LIMIT 10   `,
  Q431: `SELECT  
            su.user_id, 
            u.full_name,
            array_agg(DISTINCT su.sales_id) AS sales_ids  
          FROM 
            sales_users su
          LEFT JOIN 
            users u ON su.user_id = u.id
          LEFT JOIN
            sales s ON su.sales_id = s.id
          WHERE 
            su.user_type = 'captain' AND
            su.company_id = '{var1}' AND su.deleted_at IS NULL
            AND s.closed_at IS NOT NULL
          GROUP BY 
            su.user_id,
            u.full_name;`,
  Q432: `SELECT
            DISTINCT(s.id),
            c.customer_name,
            s.created_at,
            s.closed_at,
            (DATE_PART('epoch', s.closed_at) - DATE_PART('epoch', s.created_at)) / 86400.0 AS duration_in_days
          FROM
            sales s
            LEFT JOIN sales_users su ON s.id = su.sales_id 
            LEFT JOIN users u ON su.user_id = u.id
            LEFT JOIN customer_companies c ON s.customer_id = c.id
          WHERE
          s.id IN ({var2})
            AND s.closed_at IS NOT NULL
          GROUP BY
            s.id,
            c.customer_name,
            s.created_at,
            s.closed_at
          ORDER BY
            s.id ASC`,
  Q433: `select sales_id,COUNT(id) AS notes_count from customer_company_employees_activities where sales_id IN ({var2}) GROUP BY sales_id`,
  Q434: `UPDATE sales_playbook SET company_id = '{var1}', user_id = '{var2}', background = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q435: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',vision_mission = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q436: `UPDATE sales_playbook SET company_id = '{var1}', user_id = '{var2}', documentation_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q437: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',vision_mission_image = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q438: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',product_image = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q439: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',customer_profiling = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q440: `UPDATE sales_playbook SET company_id = '{var1}', user_id = '{var2}', lead_processes = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q441: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_strategies = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q442: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',scenario_data = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q443: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_best_practices = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q444: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_best_practices_image = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q445: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',id = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q446: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',documentation = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q447: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_stack = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q448: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_stack_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q449: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',resources_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q450: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',vision_mission_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q451: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',background_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q452: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',company_overview_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q453: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',product_pricing_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q454: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',customer_profiling_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q455: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_processes_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q456: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',qualified_lead_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q457: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',lead_processes_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q458: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_strategies_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q459: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',top_customer_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q460: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',top_product_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q461: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_analysis_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q462: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_scenarios_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q463: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',team_role_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q464: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_best_practice_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q465: `UPDATE sales_playbook SET company_id = '{var1}',user_id = '{var2}',sales_presentation_title = '{var3}' WHERE id = '{var4}' RETURNING *`,
  Q466: `INSERT INTO event_sender_list( user_id, event_id, lead_email, template_name, template, description) VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
  Q467: `SELECT * FROM event_sender_list WHERE user_id = '{var1}' AND event_id = '{var2}'`,
  Q468: `SELECT company_id, TO_CHAR(SUM(replace(recognized_amount, ',', '')::NUMERIC), 'FM9,999,999') AS amount
    FROM recognized_revenue
    WHERE sales_id IN (
        SELECT id
        FROM sales
        WHERE archived_at IS NOT NULL AND closed_at IS NOT NULL
            AND company_id = '{var1}'
    )
    AND deleted_at IS NULL
    GROUP BY company_id`,
  Q469: `SELECT * FROM sales WHERE user_id = '{var1}' AND deleted_at IS NULL`,
  Q470: `SELECT * FROM customer_company_employees WHERE assigned_sales_lead_to = '{var1}' AND deleted_at IS NULL`,
  Q471: `SELECT * FROM forecast WHERE assigned_to = '{var1}' AND deleted_at IS NULL`,
  Q472: `SELECT
            u.id, u.email_address, u.full_name, u.company_id, u.avatar, u.mobile_number,
            u.phone_number, u.address, u.role_id, u.is_admin, u.expiry_date, u.created_at, u.deleted_at,u.is_verified, u.is_deactivated,
            u.is_main_admin, u.created_by,u.is_pro_user,
            r.role_name
          FROM
            users as u
          LEFT JOIN
            roles as r ON r.id = u.role_id
          WHERE
            u.company_id = '{var1}' AND u.id = '{var2}'
          ORDER BY
            u.created_at DESC`,
  Q473: `SELECT
            sc.id, sc.customer_id, sc.customer_commission_split_id as commission_split_id, 
            sc.is_overwrite, sc.qualification, sc.is_qualified, sc.target_amount, sc.booking_commission, sc.revenue_commission,
            sc.currency, sc.target_closing_date, sc.archived_at, sc.archived_by, sc.archived_reason,
            sc.sales_type, sc.subscription_plan, sc.recurring_date, sc.contract, sc.transfer_reason, 
            sc.created_at, sc.user_id as creator_id, sc.closed_at, sc.slab_id, sc.lead_id,
            sc.is_service_performed, sc.committed_at, sc.service_performed_at, sc.service_perform_note,
            cus.customer_name, cus.user_id as customer_creator, u1.full_name as created_by, u1.email_address as creator_email,
            sc.transfered_back_by as transfered_back_by_id,
            slab.slab_name, sc.approval_status,
            u2.full_name as transfer_back_by_name,
            (
                SELECT json_agg(customer_company_employees.*)
                FROM (
                    SELECT 
                        customer_company_employees.id, customer_company_employees.full_name, customer_company_employees.title as title_id, customer_company_employees.email_address,
                        customer_company_employees.phone_number, customer_company_employees.address, customer_company_employees.source as source_id,
                        customer_company_employees.linkedin_url, customer_company_employees.website, customer_company_employees.targeted_value,
                        customer_company_employees.assigned_sales_lead_to, customer_company_employees.additional_marketing_notes, customer_company_employees.creator_id,
                        customer_company_employees.reason, customer_company_employees.created_at, customer_company_employees.updated_at, customer_company_employees.emp_type,
                        customer_company_employees.marketing_qualified_lead, customer_company_employees.is_rejected, customer_company_employees.customer_company_id,
                        u1.full_name as created_by, s.source, t.title, c.customer_name
                    FROM customer_company_employees 
                    LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                    LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                    LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                    LEFT JOIN customer_companies as c ON c.id = customer_company_employees.customer_company_id
                    WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                    AND customer_company_employees.is_rejected = false AND u1.deleted_at IS NULL  
                    AND customer_company_employees.deleted_at IS NULL
                ) customer_company_employees
            ) as lead_data,
            (
                SELECT json_agg(sales_users.*)
                FROM (
                    SELECT 
                        ss.user_id AS id, 
                        SUM(ss.user_percentage) AS percentage, 
                        ss.user_type, 
                        u1.full_name AS name, 
                        u1.email_address AS email
                    FROM sales_users AS ss
                    LEFT JOIN users AS u1 ON u1.id = ss.user_id
                    WHERE ss.sales_id = sc.id
                    AND ss.deleted_at IS NULL
                    AND u1.deleted_at IS NULL
                    GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
                ) sales_users
            ) as sales_users,
            (
                SELECT json_agg(product_in_sales.*)
                FROM (
                    SELECT 
                        DISTINCT(p.id), p.product_name as name
                    FROM product_in_sales as pis
                    LEFT JOIN products AS p ON p.id = pis.product_id
                    WHERE sc.id = pis.sales_id AND sc.deleted_at IS NULL AND p.deleted_at IS NULL
                ) product_in_sales
            ) as products,
            COALESCE(rr.recognized_amount, 0) as recognized_amount,
            CASE
                WHEN COALESCE(rr.recognized_amount, 0) < CAST(sc.target_amount AS NUMERIC) THEN true
                ELSE false
            END AS is_partial_recognized
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
        LEFT JOIN
            (
                SELECT sales_id, SUM(recognized_amount::numeric) as recognized_amount
                FROM recognized_revenue
                WHERE deleted_at IS NULL
                GROUP BY sales_id
            ) rr ON rr.sales_id = sc.id
        WHERE
            sc.company_id = '{var1}' AND sc.deleted_at IS NULL AND sc.revenue_commission::decimal > 0
            AND COALESCE(rr.recognized_amount, 0) < CAST(sc.target_amount AS NUMERIC)
        ORDER BY
            sc.created_at DESC
        `,
  Q474: `SELECT 
        sc.id, 
        sc.customer_id, 
        sc.customer_commission_split_id AS commission_split_id, 
        sc.is_overwrite, 
        sc.qualification, 
        sc.is_qualified, 
        sc.target_amount, 
        sc.booking_commission, 
        sc.revenue_commission, 
        sc.currency, 
        sc.target_closing_date, 
        sc.archived_at, 
        sc.archived_by, 
        sc.archived_reason, 
        sc.sales_type, 
        sc.subscription_plan, 
        sc.recurring_date, 
        sc.contract, 
        sc.transfer_reason,  -- Added transfer_reason column
        sc.created_at, 
        sc.user_id AS creator_id, 
        sc.closed_at, 
        sc.slab_id, 
        sc.is_service_performed, 
        sc.committed_at, 
        sc.service_performed_at, 
        sc.service_perform_note, 
        cus.customer_name, 
        cus.user_id AS customer_creator, 
        u1.full_name AS created_by, 
        u1.email_address AS creator_email, 
        sc.transfered_back_by AS transfered_back_by_id, 
        slab.slab_name, 
        sc.approval_status, 
        u2.full_name AS tranfer_back_by_name,
        (
            SELECT json_agg(customer_company_employees.*)
            FROM (
                SELECT 
                    customer_company_employees.id, 
                    customer_company_employees.full_name, 
                    customer_company_employees.title AS title_id, 
                    customer_company_employees.email_address, 
                    customer_company_employees.phone_number, 
                    customer_company_employees.address, 
                    customer_company_employees.source AS source_id, 
                    customer_company_employees.linkedin_url, 
                    customer_company_employees.website, 
                    customer_company_employees.targeted_value, 
                    customer_company_employees.assigned_sales_lead_to, 
                    customer_company_employees.additional_marketing_notes, 
                    customer_company_employees.creator_id, 
                    customer_company_employees.reason, 
                    customer_company_employees.created_at, 
                    customer_company_employees.updated_at, 
                    customer_company_employees.emp_type, 
                    customer_company_employees.marketing_qualified_lead, 
                    customer_company_employees.is_rejected, 
                    customer_company_employees.customer_company_id, 
                    u1.full_name AS created_by, 
                    s.source, 
                    t.title, 
                    c.customer_name
                FROM customer_company_employees
                LEFT JOIN users AS u1 ON u1.id = customer_company_employees.creator_id
                LEFT JOIN lead_sources AS s ON s.id = customer_company_employees.source
                LEFT JOIN lead_titles AS t ON t.id = customer_company_employees.title
                LEFT JOIN customer_companies AS c ON c.id = customer_company_employees.customer_company_id
                WHERE (customer_company_employees.id = sc.lead_id OR customer_company_employees.id = sc.business_contact_id OR customer_company_employees.id = sc.revenue_contact_id)
                AND customer_company_employees.is_rejected = false
                AND u1.deleted_at IS NULL
                AND customer_company_employees.deleted_at IS NULL
            ) customer_company_employees
        ) AS lead_data,
        (
            SELECT json_agg(sales_users.*)
            FROM (
                SELECT 
                    ss.user_id AS id, 
                    SUM(ss.user_percentage) AS percentage, 
                    ss.user_type, 
                    u1.full_name AS name, 
                    u1.email_address AS email
                FROM sales_users AS ss
                LEFT JOIN users AS u1 ON u1.id = ss.user_id
                WHERE ss.sales_id = sc.id
                AND ss.deleted_at IS NULL
                AND u1.deleted_at IS NULL
                GROUP BY ss.user_id, u1.full_name, u1.email_address, ss.user_type
            ) sales_users
        ) AS sales_users,
        (
            SELECT json_agg(product_in_sales.*)
            FROM (
                SELECT DISTINCT(p.id), p.product_name AS name
                FROM product_in_sales AS pis
                LEFT JOIN products AS p ON p.id = pis.product_id
                WHERE sc.id = pis.sales_id
                AND sc.deleted_at IS NULL
                AND p.deleted_at IS NULL
            ) product_in_sales
        ) AS products,
        CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) AS recognized_amount,
        CASE
            WHEN sc.closed_at IS NOT NULL THEN 
                CASE
                    WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) < CAST(sc.target_amount AS NUMERIC) THEN true
                    WHEN CAST(SUM(rr.recognized_amount::numeric) AS NUMERIC) = CAST(sc.target_amount AS NUMERIC) THEN false
                    ELSE false
                END
            ELSE null
        END AS is_partial_recognized
    FROM sales AS sc
    LEFT JOIN users AS u1 ON u1.id = sc.user_id
    LEFT JOIN customer_companies AS cus ON cus.id = sc.customer_id
    LEFT JOIN slabs AS slab ON slab.id = sc.slab_id
    LEFT JOIN users AS u2 ON u2.id = sc.transfered_back_by
    LEFT JOIN recognized_revenue AS rr ON rr.sales_id = sc.id
    WHERE sc.company_id = '{var1}'
    AND sc.deleted_at IS NULL
    AND sc.transfer_reason IS NOT NULL  -- Add this condition to filter records with non-null transfer_reason
    GROUP BY sc.id, cus.customer_name, u1.full_name, u1.email_address, slab.slab_name, u2.full_name, cus.user_id
    ORDER BY sc.created_at DESC;
    `,
  // "Q475": `SELECT DISTINCT s.id, ce.full_name, c.customer_name, ce.title, fn.notes, fn.created_at
  //           FROM product_in_sales ps
  //           JOIN customer_company_employees_activities fn ON ps.sales_id = fn.sales_id
  //           JOIN sales s ON s.id = ps.sales_id
  //           JOIN customer_company_employees ce ON ce.id = s.lead_id
  //           JOIN customer_companies c ON ce.customer_company_id=c.id
  //           WHERE fn.notes_type LIKE '%2%' and ps.product_id='{var1}';`
  Q475: `WITH relevant_sales AS (
              SELECT DISTINCT ps.sales_id
              FROM product_in_sales ps
              WHERE ps.product_id = '{var1}'
          )
          SELECT s.id, ce.full_name, c.customer_name, ce.title, fn.notes, fn.created_at
          FROM sales s
          JOIN customer_company_employees ce ON ce.id = s.lead_id
          JOIN customer_companies c ON c.id = ce.customer_company_id
          JOIN relevant_sales rs ON rs.sales_id = s.id
          JOIN customer_company_employees_activities fn ON fn.sales_id = rs.sales_id AND fn.notes_type LIKE '%2';`,

  Q476: `SELECT md.id, md.title, md.amount
  FROM marketing_budget m
  JOIN marketing_budget_description md ON m.id = md.budget_id
  WHERE md.company_id=  '{var1}' and m.is_finalize=true and m.deleted_at IS NULL;`,
  Q477: `select * from customer_company_employees where email_address = '{var1}' and company_id='{var2}'`,
  Q478: `INSERT INTO customer_company_employees (full_name,title,email_address,phone_number,
    address,source,linkedin_url,website,targeted_value,marketing_qualified_lead,
    assigned_sales_lead_to,additional_marketing_notes,creator_id,company_id, customer_company_id,emp_type, sync_id, sync_source,pid,marketing_activities)
    VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}',
    '{var9}','{var10}','{var11}', '{var12}', '{var13}', '{var14}', '{var15}','{var16}', '{var17}', '{var18}','{var19}' , '{var20}') RETURNING *`,
  Q479: `SELECT id, title FROM marketing_budget_description WHERE title LIKE '%{var1}%' AND company_id = {var2} and deleted_at IS NULL`,
  Q480: `UPDATE customer_company_employees SET marketing_activities = '{var1}' WHERE email_address = '{var2}' and company_id='{var3}' returning *`,
  Q481: `SELECT cce.full_name, cce.title, cce.email_address, cce.source, cce.created_at, lt.title, c.company_name, ls.source
            FROM  customer_company_employees AS cce JOIN 
          lead_titles AS lt ON lt.id = cce.title
            JOIN
            companies AS c ON c.id = cce.company_id
          JOIN
            lead_sources AS ls ON ls.id = cce.source
            WHERE
            cce.marketing_activities LIKE '%{var1}%'`,
  Q482: `UPDATE customer_company_employees_activities SET sales_id = '{var1}' WHERE lead_id = '{var2}' and sales_id IS NULL returning *`,
  Q483: `SELECT id , timeline , start_date , end_date , amount FROM marketing_budget WHERE company_id = '{var1}' AND deleted_at IS NULL`,
  Q484: `SELECT id , title , amount  FROM marketing_budget_description WHERE budget_id = '{var1}' AND deleted_at IS NULL`,
  Q485: `SELECT
          a.*,
          jsonb_agg(b) AS roi_data
        FROM
          customer_company_employees a
        LEFT JOIN
          marketing_activities b ON a.id = b.id
        WHERE
          a.created_at BETWEEN '{var1}' AND '{var2}'
        GROUP BY
          a.id`,
  Q486: `SELECT SUM(CAST(s.target_amount AS numeric)) FROM customer_company_employees AS l
          JOIN sales as s on s.lead_id = l.id
          WHERE l.marketing_activities LIKE '%{var1}%'
          AND s.closed_at BETWEEN '{var2}' AND '{var3}';`,
};
function dbScript(template, variables) {
  if (variables != null && Object.keys(variables).length > 0) {
    template = template.replace(
      new RegExp("{([^{]+)}", "g"),
      (_unused, varName) => {
        return variables[varName];
      }
    );
  }
  template = template.replace(/'null'/g, null);
  return template;
}

module.exports = { db_sql, dbScript };
