
const db_sql = {

    "Q1"   : `select id, company_name, company_address from companies where company_name = '{var1}'`,
    "Q2"   : `insert into companies(id,company_name,company_logo,company_address) 
              values('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q3"   : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,phone_number,encrypted_password,role_id,address,is_verified) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}',false) RETURNING *`,          
    "Q4"   : `select id, full_name,company_id, email_address,encrypted_password,mobile_number,role_id from users where email_address = '{var1}' and deleted_at is null` ,
    "Q5"   : `update users set is_verified = 'true', verification_code = null, updated_at = '{var1}' where email_address = '{var2}'RETURNING *` ,  
    "Q6"   : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where email_address = '{var1}' and deleted_at is null ` , 
    "Q7"   : `update users set encrypted_password='{var2}' ,is_verified = true,updated_at = '{var3}' where email_address = '{var1}' RETURNING *`, 
    "Q8"   : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where deleted_at is null` ,
    "Q9"   : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where id = '{var1}' and deleted_at is null`,  
    "Q10"  : `update modules set encrypted_password='{var2}' ,updated_at = '{var3}' where email_address = '{var1}' RETURNING *`, 
    "Q11"  : `SELECT * FROM super_admin WHERE email='{var1}' and deleted_at is null`,
    "Q12"  : `select email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where id = '{var1}' and deleted_at is null ` ,
    "Q13"  : `select * from companies where deleted_at is null`,
    "Q14"  : `select * from companies where id = '{var1}'deleted_at is null`,
    "Q15"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where deleted_at is null`,
    "Q16"  : `select id, company_name , company_logo, company_address from companies where id = '{var1}' and deleted_at is null`,
    "Q17"  : `update users set full_name='{var1}',avatar = '{var2}', email_address = '{var3}',phone_number = '{var4}',mobile_number = '{var5}',address = '{var6}' ,updated_at = '{var7}' where email_address='{var8}' RETURNING * `, 
    "Q18"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','Admin','','{var2}') RETURNING *`, 
    "Q19"  : `select id, role_name, reporter,supporter, module_ids from roles where id = '{var1}' and deleted_at is null` ,
    "Q20"  : `insert into roles(id,role_name,reporter,company_id) values('{var1}','{var2}','{var3}','{var4}') RETURNING *`, 
    "Q21"  : `select id, role_name, reporter , module_ids from roles where company_id = '{var1}' and deleted_at is null ` ,
    "Q22"  : `update users set role_id = '{var2}', percentage_distribution = '{var3}', updated_at = '{var4}' where id = '{var1}' and deleted_at is null RETURNING *`,
    "Q23"  : `SELECT id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where company_id = '{var1}' and deleted_at is null`,
    "Q24"  : `select id, role_name ,  reporter from roles where reporter = '{var1}' and deleted_at is null`,
    "Q25"  : `select id, min_amount, max_amount, percentage, is_max from slabs where company_id ='{var1}' and deleted_at is null`,
    "Q26"  : `insert into quotations(id,target_amount, target_time,company_id) values('{var1}','{var2}','{var3}','{var4}') RETURNING *`,
    "Q27"  : `insert into assigned_quotations(id,user_id, quotation_id) values ('{var1}','{var2}','{var3}') returning *`,
    "Q28"  : `insert into slabs(id,min_amount, max_amount, percentage, is_max, company_id) values('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') returning * `,
    "Q29"  : `select id, quotation_id, from_percentage, to_percentage , amount_percentage, is_mandatory from slabs where company_id = '{var1}' and deleted_at is null`,
    "Q30"  : `update quotations set target_amount = '{var1}', target_time = '{var2}' where id = '{var3}' and deleted_at is null returning *`,
    "Q31"  : `update slabs set min_amount = '{var1}', max_amount = '{var2}', percentage = '{var3}', is_max = '{var4}' , updated_at = '{var6}'  where id = '{var5}' and deleted_at is null returning *`,
    "Q32"  : `insert into permissions(id, role_id, module_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') returning *`,
    "Q33"  : `insert into permissions(id, role_id, module_id,user_id, permission_to_create, permission_to_update, permission_to_delete, permission_to_view ) values('{var1}','{var2}','{var3}','{var4}',true, true,true,true) returning *`,
    "Q34"  : `select id,email_address, full_name, company_id, avatar,mobile_number,phone_number,address,role_id from users where role_id = '{var1}' and deleted_at is null `,
    "Q35"  : `select permission_to_view, permission_to_create, permission_to_update, permission_to_delete from permissions where user_id = '{var1}' `,
    "Q36"  : `insert into sales_entries(id, user_id, client_name, client_email, client_contact, amount, description) values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') returning *`,
    "Q37"  : `select id, amount, description, client_name, client_email, client_contact where user_id = '{var1}' and deleted_at is null`,
    "Q38"  : `select id, amount, description, client_name, client_email, client_contact where company_id = '{var1}' and deleted_at is null`,
    "Q39"  : `update users set email_address = '{var1}', full_name ='{var2}', mobile_number = '{var3}', address = '{var4}', role_id = '{var5}' , updated_at = '{var7}' where id = '{var6}' and deleted_at is null RETURNING * `,
    "Q40"  : `update users set deleted_at = '{var1}' where id = '{var2}' and deleted_at is null RETURNING * `,
    "Q41"  : `select id,email_address, full_name, company_id, avatar,mobile_number,address,role_id from users where id = '{var1}' and deleted_at is null`,
    "Q42"  : `update roles set role_name = '{var1}', reporter = '{var2}',updated_at = '{var4}' where id = '{var3}' and deleted_at is null returning *`,
    "Q43"  : `update permissions set permission_to_create= '{var1}', permission_to_view = '{var2}', permission_to_update = '{var3}', permission_to_delete = '{var4}',updated_at = '{var6}' where role_id = '{var5}' and module_id = '{var7}' and deleted_at is null `,
    "Q44"  : `update roles set deleted_at = '{var2}' where id = '{var1}' and deleted_at is null returning *`,
    "Q45"  : `update permissions set deleted_at = '{var2}' where role_id = '{var1}' and deleted_at is null returning * `,
    "Q46"  : `update quotations set deleted_at = '{var1}' where id = '{var2}' and deleted_at is null`,
    "Q47"  : `update slabs set deleted_at = '{var1}' where id = '{var2}' and deleted_at is null`,
    "Q48"  : `insert into leads(id, user_id,company_id,full_name, designation,email_address, website, phone_number, lead_value,company, description, address, city_name,state_name,country_name,zip_code) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}','{var12}','{var13}','{var14}','{var15}','{var16}') returning *`  ,
    "Q49"  : `select id, user_id,full_name, designation,email_address, website, phone_number, lead_value,company, description, address, city_name,state_name,country_name,zip_code, created_at from leads where company_id ='{var1}' and deleted_at is null `,
    "Q50"  : `update leads set full_name = '{var2}', designation = '{var3}',email_address = '{var4}', website = '{var5}', phone_number = '{var6}', lead_value = '{var7}',company = '{var8}', description = '{var9}', address = '{var10}', city_name = '{var11}',state_name = '{var12}',country_name = '{var13}',zip_code = '{var14}', updated_at = '{var15}' where id = '{var1}' and deleted_at is null returning *`,
    "Q51"  : `update leads set deleted_at = '{var2}' where id = '{var1}' and deleted_at is null returning *`,
    "Q52"  : `update users set is_locked = '{var1}', updated_at = '{var3}' where id = '{var2}' and deleted_at is null and is_locked = false RETURNING * `,
    "Q53"  : `select id,full_name, designation,email_address, website, phone_number, lead_value,company, description, address, city_name,state_name,country_name,zip_code from leads where user_id ='{var1}' and deleted_at is null `,
    "Q54"  : `update leads set assigned_to = '{var1}', updated_at = '{var3}' where id = '{var2}' and deleted_at is null returning *`,
    "Q55"  : `insert into leads(id,user_id, company_id, full_name, designation,email_address, website, phone_number, lead_value,company, description, address, city_name,state_name,country_name,zip_code) values ('{var1}','{var2}','{var3}',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    "Q56"  : `select r.id, r.role_name, u.id as user_id , u.full_name, u.percentage_distribution
              from roles as r inner join users as u on r.id = u.role_id 
              where r.company_id = '{var1}' and r.deleted_at is null and u.deleted_at is null` ,
    "Q57"  : `select l.id as lead_id, u.id as user_id,u.full_name as user_name,l.full_name as client_name, l.designation,l.email_address,
              l.website, l.phone_number, l.lead_value,l.company, l.description, l.address,l.city_name,
              l.state_name,l.country_name,l.zip_code from leads as l inner join users as u on l.user_id = u.id 
              where l.company_id = '39c2af6a-3234-451f-95ff-947d8954c747' and 
              l.deleted_at is null and u.deleted_at is null`,
    "Q58"  : `select id,full_name, designation,email_address, website, phone_number, lead_value,company, description, address, city_name,state_name,country_name,zip_code from leads where id ='{var1}' and deleted_at is null `,
    "Q59"  : `insert into targets (id, lead_id, supporters, finishing_date, amount, description, company_id) values('{var0}','{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') returning *`,
    "Q60"  : `select id, supporters, lead_id, finishing_date, amount, description, created_at from targets where company_id = '{var1}' and deleted_at is null`,

    "Q61"  : `insert into follow_up_notes (id, target_id, company_id, user_id, notes) values('{var1}','{var2}','{var3}','{var4}','{var5}') returning *`,
    "Q62"  : `select notes, created_at from follow_up_notes where target_id = '{var1}' and deleted_at is null`,
    "Q63"  : `select id,full_name,email_address,phone_number, lead_value,company, description, created_at from leads where company_id ='{var1}' and deleted_at is null and ((created_at BETWEEN '{var2}' AND '{var3}') or (lead_value BETWEEN '{var4}' and '{var5}')) `,
    "Q64"  : `update permissions set user_id = '{var2}' where role_id = '{var1}' and deleted_at is null returning *`,
    "Q65"  : `update roles set module_ids = '{var1}' , updated_at = '{var2}' where id = '{var3}' returning * `,
    "Q66"  : `select permission_to_view, permission_to_create, permission_to_update, permission_to_delete from permissions where role_id = '{var1}' and module_id = '{var2}' and deleted_at is null `,
    "Q67"  : `insert into deals(id, user_id,deal_company_id,lead_name, lead_source, qualification, is_qualified, target_amount, product_match, target_closing_date, company_id) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}','{var10}','{var11}') returning *`,
    "Q68"  : `insert into deal_companies(id, deal_company_name, company_id) values('{var1}','{var2}','{var3}') returning *`,
    "Q69"  : `select id, deal_company_name from deal_companies where deal_company_name = '{var1}' and deleted_at is null`,
    "Q70"  : `select id,deal_company_id ,lead_name, lead_source, qualification, is_qualified, target_amount, product_match, target_closing_date, closed_at from deals where company_id = '{var1}' and deleted_at is null`,
    "Q71"  : `update deals set closed_at = '{var1}', updated_at = '{var2}' where id = '{var3}' returning *`,
    "Q72"  : `select id, module_name,module_type, is_read, is_create, is_update, is_delete, is_assign from modules where module_name = '{var1}' and deleted_at is null` ,
    "Q73"  : `update deals set lead_name = '{var1}', lead_source = '{var2}', qualification = '{var3}', is_qualified = '{var4}', target_amount = '{var5}', product_match = '{var6}', target_closing_date = '{var7}', updated_at = '{var8}' where id = '{var9}' and deleted_at is null returning *`,
    "Q74"  : `insert into deal_logs(id,lead_id ,lead_name, lead_source, qualification, is_qualified, target_amount, product_match, target_closing_date) values ('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}') returning *`,
    "Q75"  : `select id, lead_name, lead_source, qualification, is_qualified, target_amount, product_match, target_closing_date from deal_logs where lead_id = '{var1}' and deleted_at is null`,
    "Q76"  : `insert into users(id,full_name,company_id,avatar,email_address,mobile_number,encrypted_password,role_id,address,is_verified) 
              values('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}','{var8}','{var9}',false) RETURNING *`, 
    "Q77"  : `update roles set deleted_at = '{var2}' where reporter = '{var1}' and deleted_at is null returning *`,  
    "Q78"  : `update permissions set deleted_at = '{var2}' where role_id = '{var1}' and deleted_at is null returning * `   ,
    "Q79"  : `select id, deal_company_name from deal_companies where company_id = '{var1}' and deleted_at is null`, 
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