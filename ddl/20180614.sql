SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* wj */
call Pro_AddMenu('长期资产管理', '资产盘点管理', '/erc/longtermassets/ERCAssetInventoryControl', 'ERCASSETINVENTORYCONTROL');
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(43 , '盘点审批任务' , '盘点审批任务', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
            	values(44 , '盘点完成消息通知' , '盘点完成消息通知', now(), now());
/*end wj */


/* njc */
update tbl_common_systemmenu set systemmenu_name='资金支出管理' where systemmenu_name like '%特殊费用报销%';
update tbl_common_api set api_name='资金支出管理' where  api_name like '%特殊费用报销%';
update tbl_erc_taskallot set taskallot_name ='资金支出管理批任务',taskallot_describe = '分配处理资金支出管理审核人员' where taskallot_name like '%特殊费用报销审批任务%';
update tbl_common_domainmenu set domainmenu_name='资金支出管理' where domainmenu_name like '%特殊费用报销%';

ALTER TABLE `tbl_erc_specialexpense` ADD COLUMN `s_capital_cost_type` INTEGER AFTER `s_expense_description`;
ALTER TABLE `tbl_erc_corporateclients` ADD COLUMN `creditline_money` DOUBLE DEFAULT 0 AFTER `settlement_way`;
ALTER TABLE `tbl_erc_corporateclients` ADD COLUMN `creditline_use` DOUBLE DEFAULT 0 AFTER `creditline_money`;
ALTER TABLE `tbl_erc_corporateclients` ADD COLUMN `creditline_advance` DOUBLE DEFAULT 0 AFTER `creditline_use`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `purchaser_corporateclients_id` INTEGER AFTER `sap_order_state`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `send_creditline_state` INTEGER DEFAULT 0 AFTER `purchaser_corporateclients_id`;

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('出纳管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('出纳管理', '收款申报', '/erc/cashiermanage/ERCGatheringControl','ERCGATHERINGCONTROL');
call Pro_AddMenu('出纳管理', '付款确认', '/erc/cashiermanage/ERCPaymentConfirmControl','ERCPAYMENTCONFIRMCONTROL');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        values(45 , '出纳管理新增收款申报任务' , '出纳管理新增收款申报', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        values(46 , '出纳管理新增付款确认任务' , '出纳管理付款确认', now(), now());


DROP TABLE IF EXISTS `tbl_erc_cashiergathering`;
CREATE TABLE `tbl_erc_cashiergathering` (
  `cashiergathering_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `cashiergathering_code` varchar(30) NOT NULL,
  `cashiergathering_name` varchar(100) DEFAULT NULL,
  `cashiergathering_type` int(11) DEFAULT NULL,
  `cashiergathering_customer_code` varchar(100) DEFAULT NULL,
  `cashiergathering_source_name` varchar(100) DEFAULT NULL,
  `cashiergathering_gathering_money` double DEFAULT '0',
  `cashiergathering_phone` varchar(100) DEFAULT NULL,
  `cashiergathering_cashier` varchar(100) DEFAULT NULL,
  `cashiergathering_cashier_time` datetime DEFAULT NULL,
  `cashiergathering_remark` varchar(100) DEFAULT NULL,
  `cashiergathering_declarant` varchar(100) DEFAULT NULL,
  `cashiergathering_state` int(11) DEFAULT NULL,
  `cashiergathering_examine` varchar(100) DEFAULT NULL,
  `cashiergathering_examine_time` datetime DEFAULT NULL,
  `cashiergathering_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`cashiergathering_id`)
);


DROP TABLE IF EXISTS `tbl_erc_paymentconfirm`;
CREATE TABLE `tbl_erc_paymentconfirm` (
  `paymentconfirm_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `paymentconfirm_name` varchar(100) DEFAULT NULL,
  `paymentconfirm_source_code` varchar(100) DEFAULT NULL,
  `paymentconfirm_money` double DEFAULT '0',
  `paymentconfirm_expend_user` varchar(50) DEFAULT NULL,
  `paymentconfirm_declarant` varchar(50) DEFAULT NULL,
  `paymentconfirm_declarant_time` datetime DEFAULT NULL,
  `paymentconfirm_state` int(11) DEFAULT NULL,
  `paymentconfirm_examine` varchar(100) DEFAULT NULL,
  `paymentconfirm_examine_time` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`paymentconfirm_id`)
);

DROP TABLE IF EXISTS `tbl_erc_creditlinedetail`;
CREATE TABLE `tbl_erc_creditlinedetail` (
  `creditlinedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `corporateclients_id` bigint(20) NOT NULL,
  `creditlinedetail_type` int(11) DEFAULT NULL,
  `creditlinedetail_businessid` varchar(100) DEFAULT NULL,
  `creditlinedetail_money` double DEFAULT '0',
  `creditlinedetail_surplus_creditline` double DEFAULT '0',
  `creditlinedetail_surplus_advance` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`creditlinedetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_salaryapply`;
CREATE TABLE `tbl_erc_salaryapply` (
  `salaryapply_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `superior_user_id` varchar(20) DEFAULT NULL,
  `salaryapply_money` double(11,2) DEFAULT '0.00',
  `salaryapply_productivetask_code` varchar(50) DEFAULT NULL,
  `salaryapply_remark` varchar(200) DEFAULT NULL,
  `salaryapply_date` varchar(70) DEFAULT NULL,
  `salaryapply_state` varchar(5) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`salaryapply_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8

DROP TABLE IF EXISTS `tbl_erc_salaryother`;
CREATE TABLE `tbl_erc_salaryother` (
  `salaryother_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `salaryother_code` varchar(50) DEFAULT NULL,
  `salaryother_type` varchar(20) DEFAULT NULL,
  `salaryother_remark` varchar(200) DEFAULT NULL,
  `salaryother_confirm_user` varchar(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`salaryother_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8

DROP TABLE IF EXISTS `tbl_erc_salaryotherdetail`;
CREATE TABLE `tbl_erc_salaryotherdetail` (
  `salaryotherdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `salaryother_id` bigint(20) NOT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `salaryotherdetail_money` double(11,2) DEFAULT '0.00',
  `salaryotherdetail_productivetask_code` varchar(50) DEFAULT NULL,
  `salaryotherdetail_remark` varchar(200) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`salaryotherdetail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8
/*end njc */