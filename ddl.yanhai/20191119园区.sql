/*园区大数据模块*/
insert into tbl_common_systemmenu
  (systemmenu_name,node_type,parent_id,version,created_at,updated_at)
VALUES
  ('园区大数据', '00', '0', 1, NOW(), NOW());
call Pro_AddMenu
('园区大数据', '园区信息设置','/erc/managebackstage/ERCParkInformation','ERCPARKCOMPANYCONTROL');
call Pro_AddMenu
('园区大数据', '二十四项录入','/erc/managebackstage/ERCInputInformationList','ERCPARKDATACONTROL');
call Pro_AddMenu
('园区大数据', '供应商管理','/erc/parkmanage/ERCParkSupplierControl','ERCPARKSUPPLIERCONTROL');
call Pro_AddMenu
('园区大数据', '园区地图','/erc/parkmanage/ERCParkMapControl','ERCPARKMAPCONTROL');
call Pro_AddMenu
('园区大数据', '我的采购','/supplierbackstage/ERCSupplierMyPurchase','ERCPARKPURCHASECONTROL');
call Pro_AddMenu
('园区大数据', '非ERC采购','/erc/parkmanage/ParkPurchaseControl','PARKPURCHASECONTROL');
call Pro_AddMenu
('园区大数据', '报价管理','/erc/parkmanage/ERCParkQuotateActControl','ERCPARKQUOTATEACTCONTROL');

UPDATE tbl_common_api SET auth_flag='0' where api_function in ('ERCPARKCOMPANYCONTROL','ERCPARKDATACONTROL','ERCPARKSUPPLIERCONTROL','ERCPARKMAPCONTROL','ERCPARKPURCHASECONTROL','PARKPURCHASECONTROL','ERCPARKQUOTATEACTCONTROL');



/*无需登录即可*/

-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '园区企业' , '429' , 'ERCPARKCOMPANY' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '二十四项录入' , '430' , 'ERCPARKDATACONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '供应商管理' , '431' , 'ERCPARKSUPPLIERCONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '供应商登录' , '432' , 'ERCSUPPLIERLOGINCONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '园区信息设置' , '433' , 'ERCPARKMAPCONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( 'ERC采购' , '434' , 'ERCPARKPURCHASECONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '非ERC采购' , '435' , 'PARKPURCHASECONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '报价管理' , '436' , 'ERCPARKQUotateACTCONTROL' , '01' , 445 , now() , now());
-- INSERT INTO tbl_common_systemmenu( systemmenu_name , api_id , api_function , node_type , parent_id , created_at , updated_at) VALUES( '采购分类管理' , '437' , 'ERCPURCHASETYPECONTROL', '01' , 445 , now() , now());

-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('园区企业','/erc/parkmanage/ERCParkCompanyControl','ERCPARKCOMPANY','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('二十四项录入','/erc/parkmanage/ERCParkDataControl','ERCPARKDATACONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('供应商管理','/erc/parkmanage/ERCParkSupplierControl','ERCPARKSUPPLIERCONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('供应商登录','/suppliserLogin','ERCSUPPLIERLOGINCONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('园区信息设置','/erc/parkmanage/ERCParkMapControl','ERCPARKMAPCONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('ERC采购','/erc/parkmanage/ERCParkPurchaseControl','ERCPARKPURCHASECONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('非ERC采购','/erc/parkmanage/ParkPurchaseControl','PARKPURCHASECONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('报价管理','/erc/parkmanage/ERCParkQuotateActControl','ERCPARKQUotateACTCONTROL','0','0','1',now(),now());
-- insert into tbl_common_api (api_name, api_path, api_function, auth_flag, show_flag, api_kind,created_at,updated_at) values('采购分类管理','/erc/baseconfig/ERCPurchaseTypeControl','ERCPURCHASETYPECONTROL','1','1','1',now(),now());

DROP TABLE IF EXISTS `tbl_erc_park_map`;
DROP TABLE IF EXISTS `tbl_erc_park_company`;
DROP TABLE IF EXISTS `tbl_erc_park_supplier`;
DROP TABLE IF EXISTS `tbl_erc_park_data`;
DROP TABLE IF EXISTS `tbl_park_purchase`;
DROP TABLE IF EXISTS `tbl_park_quotation`;
/*园区地图表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_park_map` (`park_map_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `user_id` VARCHAR(50) NOT
NULL, `file_creator` VARCHAR(100), `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`park_map_id`)) ENGINE=InnoDB;
/*园区企业信息表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_park_company` (`park_company_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `company_name` VARCHAR(100), `company_address` VARCHAR(200), `floor_area` DOUBLE PRECISION, `construction_area` DOUBLE PRECISION, `registered_capital` DOUBLE PRECISION, `paid_up_capital` DOUBLE PRECISION, `plan_investment` DOUBLE PRECISION, `actual_investmen` DOUBLE PRECISION, `equipment_investment` DOUBLE PRECISION, `employees_count` INTEGER, `patent_number` INTEGER, `map_loaction` VARCHAR(100), `high_tech` VARCHAR(4) DEFAULT '0', `map_type` VARCHAR(4) DEFAULT '1', `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`park_company_id`)) ENGINE=InnoDB;
/*园区供应商表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_park_supplier` (`park_supplier_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `supplier_phone` VARCHAR(50), `supplier_mail` VARCHAR(100), `supplier_name` VARCHAR(100), `supplier_pwd` VARCHAR(100) NOT NULL, `legal_person` VARCHAR(50), `legal_IDCard_number` VARCHAR(100), `legal_IDCard_photo` VARCHAR(200), `business_license_no` VARCHAR(200), `business_license_photo` VARCHAR(200), `audit_status` VARCHAR(4) DEFAULT '1', `main_business` VARCHAR(200), `industry_classification` VARCHAR(5) DEFAULT '1', `industry_name` VARCHAR(5) DEFAULT '1', `company_size` VARCHAR(5) DEFAULT '1', `company_address` VARCHAR(200), `floor_area` VARCHAR(100), `construction_area` VARCHAR(200), `registered_capital` DOUBLE PRECISION, `paid_up_capital` DOUBLE PRECISION, `plan_investment` DOUBLE PRECISION, `actual_investmen` DOUBLE PRECISION, `equipment_investment` DOUBLE PRECISION, `employees_count` INTEGER, `patent_number` INTEGER, `map_loaction` VARCHAR(100), `high_tech` VARCHAR(4) DEFAULT '0', `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`park_supplier_id`)) ENGINE=InnoDB;
/*园区二十四项录入表*/
 CREATE TABLE IF NOT EXISTS `tbl_erc_park_data` (`park_data_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `park_company_id` BIGINT,
`record_date` DATETIME, `gdp` DOUBLE PRECISION, `sales` DOUBLE PRECISION, `tax_payment` DOUBLE PRECISION, `deductible_input_tax` DOUBLE PRECISION, `profit_tax` DOUBLE PRECISION, `safeproduction_days` INTEGER, `patents_num` INTEGER DEFAULT 0, `project_RD_num` INTEGER, `land_use` DOUBLE PRECISION, `construct_area` DOUBLE PRECISION, `planned_investment` DOUBLE PRECISION, `actual_investment` DOUBLE PRECISION, `fixed_assets` DOUBLE PRECISION, `production_equipment_investment` DOUBLE PRECISION, `academicians_num` INTEGER, `doctors_num` INTEGER, `masters_num` INTEGER, `undergraduates_num` INTEGER, `RD_investment` DOUBLE PRECISION, `energy_consumption` DOUBLE PRECISION, `electricity_consumption` DOUBLE PRECISION, `water_consumption` DOUBLE PRECISION, `gas_consumption` DOUBLE PRECISION, `gov_subsidies` DOUBLE PRECISION, `gov_support_project` INTEGER, `gov_support_amount` DOUBLE PRECISION, `environment_protection` INTEGER, `coal_consumption` DOUBLE PRECISION, `subscription_capital` DOUBLE PRECISION, `paidin_capital` DOUBLE PRECISION, `floor_area` DOUBLE PRECISION, `production_area` DOUBLE PRECISION, `office_space` DOUBLE PRECISION, `death_toll` INTEGER, `injured_num` INTEGER, `envir_punished` VARCHAR(4) DEFAULT '1', `self_test` VARCHAR(4) DEFAULT '1', `utility` INTEGER DEFAULT 0, `outward` INTEGER DEFAULT 0, `dormitory_area` DOUBLE PRECISION, `high_tech` VARCHAR(4) DEFAULT '0', `registered_capital` DOUBLE PRECISION, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`park_data_id`)) ENGINE=InnoDB;
/*园区采购表*/
CREATE TABLE IF NOT EXISTS `tbl_park_purchase` (`purchase_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `purchase_approver` VARCHAR(50), `type_id` VARCHAR(50), `purchase_type` VARCHAR(4) DEFAULT '1', `purchase_projectname` VARCHAR(100), `company_name` VARCHAR(100), `purchaser` VARCHAR(50), `purchaser_phone` VARCHAR(50), `quotation_deadline` DATETIME, `purchase_details` TEXT, `purchase_rules` TEXT, `quotation_details` TEXT, `is_passed` VARCHAR(4) NOT NULL DEFAULT '1', `purchase_state` VARCHAR(4) NOT NULL DEFAULT '1', `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`purchase_id`)) ENGINE=InnoDB;
/*园区报价表*/
 CREATE TABLE IF NOT EXISTS `tbl_park_quotation` (`park_quotation_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `purchase_id` BIGINT NOT NULL, `qutation_date` DATETIME, `quoted_price` VARCHAR(100), `quoted_detail` TEXT, `quoted_contact` VARCHAR(100), `quoted_phone` VARCHAR(100), `park_supplier_id` VARCHAR(200) NOT NULL, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`park_quotation_id`)) ENGINE=InnoDB;
/*采购分类表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_purchasetype`
(`purchase_type_id` BIGINT NOT NULL auto_increment , `purchase_type_no` VARCHAR
(30) NOT NULL , `purchase_type_name` VARCHAR
(100) NOT NULL, `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`purchase_type_id`, `purchase_type_no`)) ENGINE=InnoDB;
INSERT INTO seqMysql
  (seqname,currentValue,increment,MAX)
VALUE('purchaseTypeSeq',0,1,99999999
)
ALTER TABLE `erc`.`tbl_erc_company`
ADD COLUMN `receiver_id` VARCHAR
(50) DEFAULT ''  NULL AFTER `updated_at`;
CREATE TABLE `tbl_erc_purchasetype`
(
  `purchase_type_id` bigint
(20) NOT NULL AUTO_INCREMENT,
  `purchase_type_no` varchar
(30) NOT NULL,
  `purchase_type_name` varchar
(100) NOT NULL,
  `state` varchar
(5) DEFAULT '1',
  `version` bigint
(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY
(`purchase_type_id`)
)
