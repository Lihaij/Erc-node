SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* qm */
DROP TABLE IF EXISTS `tbl_erc_productplan`;
CREATE TABLE `tbl_erc_productplan` (
  `product_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `materiel_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `design_number` bigint(20) DEFAULT '0',
  `valid_state` bigint(20) NOT NULL DEFAULT '0',
  `order_id` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`product_id`) USING BTREE
);

DROP TABLE IF EXISTS `tbl_erc_productplandetail`;
CREATE TABLE `tbl_erc_productplandetail` (
  `product_dtl_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `materiel_id` bigint(20) DEFAULT NULL,
  `src_materiel_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `prd_level` bigint(20) DEFAULT NULL,
  `design_number` bigint(20) DEFAULT '0',
  `loss_rate` bigint(20) DEFAULT '0',
  `workshop_id` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`product_dtl_id`) USING BTREE
);

DROP TABLE IF EXISTS `tbl_erc_productplanrelated`;
CREATE TABLE `tbl_erc_productplanrelated` (
  `product_rlt_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `materiel_id` bigint(20) DEFAULT NULL,
  `src_materiel_id` bigint(20) DEFAULT NULL,
  `rlt_materiel_code` varchar(30) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `prd_type` bigint(20) DEFAULT NULL,
  `prd_number` bigint(20) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`product_rlt_id`)
);

DROP TABLE IF EXISTS `tbl_erc_productplanprocedure`;
CREATE TABLE `tbl_erc_productplanprocedure` (
  `product_procedure_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `materiel_id` bigint(20) NOT NULL,
  `procedure_id` bigint(20) NOT NULL,
  `rlt_materiel_code` varchar(30) DEFAULT NULL,
  `priority` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`product_procedure_id`) USING BTREE
);

DROP TABLE IF EXISTS `tbl_erc_productionprocedure`;
CREATE TABLE `tbl_erc_productionprocedure` (
  `procedure_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `procedure_code` varchar(30) NOT NULL,
  `procedure_name` varchar(30) DEFAULT NULL,
  `procedure_type` bigint(20) DEFAULT NULL,
  `procedure_cost` double DEFAULT '0',
  `procedure_pay` double DEFAULT '0',
  `procedure_calc` bigint(20) DEFAULT NULL,
  `procedure_master_device` bigint(20) DEFAULT NULL,
  `procedure_slave_device` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`procedure_id`)
);

call Pro_AddMenu('生产计划管理', '生产工序管理', '/erc/productionmanage/ERCProductProcedureControl', 'ERCPRODUCTPROCEDURECONTROL');
call Pro_AddMenu('生产计划管理', '产品规划', '/erc/productionmanage/ERCProductPlanControl', 'ERCPRODUCTPLANCONTROL');

/*end qm */