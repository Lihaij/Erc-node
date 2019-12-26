SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/*
  bb start
*/

/**
    创建会计科目详情表
*/
CREATE TABLE `tbl_erc_accountingdetail` (
  `accounting_detail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `accounting_code` bigint(20) NOT NULL,
  `other_id` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `borrow_balance` bigint(20) DEFAULT NULL,
  `loan_balance` bigint(20) DEFAULT NULL,
  `init_before_borrow_money` bigint(20) DEFAULT NULL,
  `init_before_loan_money` bigint(20) DEFAULT NULL,
  `init_borrow_money` bigint(20) DEFAULT '0',
  `init_loan_money` bigint(20) DEFAULT '0',
  `approval_state` int(4) DEFAULT '0',
  `state` varchar(5) COLLATE utf8_bin DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`accounting_detail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/**
创建会计科目总金额表
*/
CREATE TABLE `tbl_erc_accounting` (
  `accounting_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `accounting_code` bigint(20) NOT NULL,
  `total_borrow_balance` bigint(20) DEFAULT '0',
  `total_loan_balance` bigint(20) DEFAULT '0',
  `total_init_before_borrow_money` bigint(20) DEFAULT '0',
  `total_init_before_loan_money` bigint(20) DEFAULT '0',
  `total_init_borrow_money` bigint(20) DEFAULT '0',
  `total_init_loan_money` bigint(20) DEFAULT '0',
  `approval_state` int(4) DEFAULT '0',
  `state` varchar(5) COLLATE utf8_bin DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`accounting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/**
    创建其他相关主体
*/
CREATE TABLE `tbl_erc_othermain` (
  `other_main_id` varchar(30) COLLATE utf8_bin NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `creater_id` varchar(30) COLLATE utf8_bin NOT NULL,
  `other_main_code` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `other_main_name` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `bank_no` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `state` varchar(5) COLLATE utf8_bin DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`other_main_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


/**
    物料表加入新字段
*/

ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_system_standard` INT(11) NULL AFTER `materiel_iid_code`,
ADD COLUMN `materiel_safe_standard` INT(11) NULL AFTER `materiel_system_standard`,
ADD COLUMN `materiel_check_ratio` DOUBLE NULL AFTER `materiel_safe_standard`,
ADD COLUMN `materiel_accounting` INT(11) NULL AFTER `materiel_check_ratio`,
ADD COLUMN `materiel_cs_code` VARCHAR(100) NULL AFTER `materiel_accounting`,
ADD COLUMN `materiel_foreign_sale` DOUBLE NULL DEFAULT 0 AFTER `materiel_cs_code`,
ADD COLUMN `materiel_min_purchase_num` INT(11) NULL DEFAULT 0 AFTER `materiel_foreign_sale`;

ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_system_standard` INT(11) NULL AFTER `review_materiel_iid_code`,
ADD COLUMN `review_materiel_safe_standard` INT(11) NULL AFTER `review_materiel_system_standard`,
ADD COLUMN `review_materiel_check_ratio` DOUBLE NULL AFTER `review_materiel_safe_standard`,
ADD COLUMN `review_materiel_accounting` INT(11) NULL AFTER `review_materiel_check_ratio`,
ADD COLUMN `review_materiel_cs_code` VARCHAR(100) NULL AFTER `review_materiel_accounting`,
ADD COLUMN `review_materiel_foreign_sale` DOUBLE NULL DEFAULT 0 AFTER `review_materiel_cs_code`,
ADD COLUMN `review_materiel_min_purchase_num` INT(11) NULL DEFAULT 0 AFTER `review_materiel_foreign_sale`;

/**
    实时库存添加字段
*/
ALTER TABLE `tbl_erc_stockmap`
ADD COLUMN `unit_price` DOUBLE NULL DEFAULT 0 AFTER `store_price`,
ADD COLUMN `money` DOUBLE NULL DEFAULT 0 AFTER `unit_price`,
ADD COLUMN `materiel_code` VARCHAR(30) DEFAULT NULL AFTER `money`;

/**
    客户添加字段
*/
ALTER TABLE `tbl_erc_corporateclients`
ADD COLUMN `invoice_type` VARCHAR(5) NULL AFTER `corporateclients_scope`;

/**
    订单表添加字段
*/
ALTER TABLE `tbl_erc_order`
ADD COLUMN `order_delivery_date` DATETIME NULL AFTER `order_review_state`;

/**
    供应商
*/
ALTER TABLE `tbl_erc_supplier`
ADD COLUMN `supplier_bank_no` VARCHAR(30) NULL AFTER `state`,
DROP INDEX `tbl_nca_supplier_supplier_unique` ,
DROP INDEX `supplier`,
CHANGE COLUMN `supplier_short` `supplier_short` VARCHAR(20) NULL DEFAULT '' ,
CHANGE COLUMN `supplier_address` `supplier_address` VARCHAR(100) NULL DEFAULT '' ,
CHANGE COLUMN `supplier_fax` `supplier_fax` VARCHAR(100) NULL DEFAULT '' ,
CHANGE COLUMN `supplier_contact` `supplier_contact` VARCHAR(100) NULL DEFAULT '' ,
CHANGE COLUMN `supplier_phone` `supplier_phone` VARCHAR(100) NULL DEFAULT '' ,
CHANGE COLUMN `supplier_description` `supplier_description` VARCHAR(200) NULL DEFAULT '' ,
CHANGE COLUMN `supplier_remarks` `supplier_remarks` VARCHAR(500) NULL DEFAULT '' ;

/**
    采购单
*/
ALTER TABLE `tbl_erc_purchaseorder`
ADD COLUMN `delivery_date` DATETIME NULL AFTER `collect_state`;

/**
    生产设备
*/
ALTER TABLE `tbl_erc_productdevice`
ADD COLUMN `work_time` INT(11) NULL AFTER `domain_id`,
ADD COLUMN `hour_capacity` INT(11) NULL AFTER `work_time`;


/**
    外购固定资产
*/
ALTER TABLE `tbl_erc_fixedassetscheckdetail`
CHANGE COLUMN `fixedassetscheck_id` `fixedassetscheck_id` BIGINT(20) NULL ;

/**
    长期带滩资产
*/
ALTER TABLE `tbl_erc_amortize`
ADD COLUMN `amortize_money` DOUBLE NULL DEFAULT 0 AFTER `take_stock_description`,
ADD COLUMN `amortize_ratio` DOUBLE NULL DEFAULT 0 AFTER `amortize_money`,
ADD COLUMN `amortize_property` VARCHAR(4) NULL AFTER `amortize_ratio`;

/**
    岗位
*/
ALTER TABLE `tbl_erc_position`
ADD COLUMN `position_require` VARCHAR(50) NULL AFTER `department_actual_num`,
ADD COLUMN `salary_type` VARCHAR(4) NULL DEFAULT '0' AFTER `position_require`;

/**
    员工
*/
ALTER TABLE `tbl_erc_customer`
ADD COLUMN `professional_qualification` VARCHAR(50) NULL AFTER `parttime_usergroup_id`;

/**
    报废
*/
ALTER TABLE `tbl_erc_longassetsscrapdetail`
ADD COLUMN `longassetsscrap_remark` VARCHAR(100) NULL AFTER `expend_price`;

/**
    出库
*/
ALTER TABLE `tbl_erc_stockoutapplydetail`
ADD COLUMN `stockoutapplydetail_remark` VARCHAR(100) NULL AFTER `stockoutapplydetail_type`;
/*

/**
    通知公告
*/
ALTER TABLE `tbl_erc_notice_org`
ADD COLUMN `department_id` VARCHAR(30) NULL AFTER `usergroup_id`;
  add your ddl
*/

/**
    评价
*/
CREATE TABLE `tbl_erc_evaluate` (
  `evaluate_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `task_id` varchar(30) COLLATE utf8_bin NOT NULL,
  `evaluate_user` varchar(30) COLLATE utf8_bin NOT NULL,
  `evaluate_performer` varchar(30) COLLATE utf8_bin NOT NULL,
  `evaluate_score` int(11) DEFAULT NULL,
  `evaluate_description` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `state` varchar(5) COLLATE utf8_bin DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`evaluate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `tbl_erc_evaluatecontent` (
  `evaluate_conent_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `evaluate_id` bigint(20) NOT NULL,
  `evaluate_type_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) COLLATE utf8_bin DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`evaluate_conent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `tbl_erc_evaluatetype` (
  `evaluate_type_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `evaluate_type_text` varchar(100) COLLATE utf8_bin NOT NULL,
  `evaluate_type_score` int(11) NOT NULL,
  `state` varchar(5) COLLATE utf8_bin DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`evaluate_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



/**
    插入评价选择内容
*/
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不错，但问题没有解决', '1', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不错，问题尚在处理中', '1', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不尽人意，问题已解决', '1', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不尽人意，问题无法解决', '1', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不错，但问题没有解决', '2', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不错，问题尚在处理中', '2', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不尽人意，问题已解决', '2', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不尽人意，问题无法解决', '2', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不错，但问题没有解决', '3', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不错，问题尚在处理中', '3', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不尽人意，问题已解决', '3', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('服务不尽人意，问题无法解决', '3', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('积极周到', '4', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('专业可靠', '4', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('如沐春风', '4', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('流畅高效', '4', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('积极周到', '5', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('专业可靠', '5', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('如沐春风', '5', '1', '0', now(), now());
INSERT INTO `tbl_erc_evaluatetype` (`evaluate_type_text`, `evaluate_type_score`, `state`, `version`, `created_at`, `updated_at`) VALUES ('流畅高效', '5', '1', '0', now(), now());

ALTER TABLE `tbl_common_user`
ADD COLUMN `evaluate_score` BIGINT(20) NULL DEFAULT 50 AFTER `user_remark`;

INSERT INTO `seqmysql` (`seqname`, `currentValue`, `increment`, `max`) VALUES ('outsourceIDSeq', '1', '1', '99999999');
INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(84 , '外包服务审核' , '外包服务请求', now(), now());
/**
    添加状态 0：候选人 1：正式员工
*/
ALTER TABLE `tbl_erc_customer`
        ADD COLUMN `user_state` VARCHAR(4) NULL DEFAULT '1' AFTER `professional_qualification`;

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(86 , '离职审核' , '离职审核请求', now(), now());
ALTER TABLE `tbl_erc_customer`
ADD COLUMN `submit_state` VARCHAR(4) NULL DEFAULT '0' AFTER `user_state`;
ALTER TABLE `tbl_erc_customer`
ADD COLUMN `task_description` VARCHAR(300) NULL AFTER `submit_state`;
INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(87 , '安全库存审核' , '安全库存审核请求', now(), now());
ALTER TABLE `tbl_erc_stockmap`
ADD COLUMN `submit_state` VARCHAR(4) NULL DEFAULT '0' AFTER `materiel_code`,
ADD COLUMN `task_description` VARCHAR(300) NULL AFTER `submit_state`;
ALTER TABLE `ercdata`.`tbl_erc_stockmap`
ADD COLUMN `min_purchase_amount_temp` INT(11) NULL DEFAULT 0 AFTER `task_description`,
ADD COLUMN `safe_amount_temp` INT(11) NULL DEFAULT 0 AFTER `min_purchase_amount_temp`;