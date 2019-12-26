SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `tbl_erc_consumablesdetail`
ADD COLUMN `consumables_flag` varchar(4) DEFAULT '0' AFTER `take_stock_description`;
ALTER TABLE `tbl_erc_consumablesdetail`
ADD COLUMN `consumables_purch_detail_id` BIGINT AFTER `consumables_flag`;

/*end ls */

/* njc */

call Pro_AddMenu('长期资产管理', '研发项目管理','/erc/longtermassets/ERCDevelopControl','ERCDEVELOPCONTROL');
call Pro_AddMenu('长期资产管理', '研发项目管理明细','/erc/longtermassets/ERCDevelopDetailControl','ERCDEVELOPDETAILCONTROL');


update tbl_common_api set show_flag = 0 where api_name like '%研发项目管理明细%';


insert into seqmysql values ('developIDSeq',1,1,99999999);
insert into seqmysql values ('devReceiveIDSeq',1,1,99999999);
insert into seqmysql values ('devConsumeIDSeq',1,1,99999999);
insert into seqmysql values ('devCashierIDSeq',1,1,99999999);
insert into seqmysql values ('devSubcribeOrderIDSeq',1,1,99999999);
insert into seqmysql values ('devPurOrderIDSeq',1,1,99999999);

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(50 , '研发项目新增审核任务' , '研发项目新增请求', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(51 , '研发构建预算审核任务' , '研发新增构建预算', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(52 , '研发材料申购审核任务' , '研发新增材料申购', now(), now());
/* insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        values(53 , '研发材料收料审核任务' , '研发新增材料收料', now(), now()); */
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(54 , '研发人工结算审核任务' , '研发新增人工结算', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(55 , '研发材料耗用审核任务' , '研发新增材料耗用', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(56 , '研发构建费用审核任务' , '研发新增构建费用', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(57 , '研发提交验收审核任务' , '研发新增提交验收', now(), now());

DROP TABLE IF EXISTS `tbl_erc_develop`;
CREATE TABLE `tbl_erc_develop` (
  `develop_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_code` varchar(30) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `develop_name` varchar(100) DEFAULT NULL,
  `develop_format` varchar(100) DEFAULT NULL,
  `develop_unit` varchar(100) DEFAULT NULL,
  `develop_budget` double DEFAULT '0',
  `develop_departmant_id` varchar(20) DEFAULT NULL,
  `develop_manager` varchar(100) DEFAULT NULL,
  `develop_agelimit` int(11) DEFAULT NULL,
  `develop_way` int(11) DEFAULT NULL,
  `develop_creator` varchar(50) DEFAULT NULL,
  `develop_project_state` int(11) DEFAULT NULL,
  `develop_check_state` int(11) DEFAULT NULL,
  `develop_examine` varchar(100) DEFAULT NULL,
  `develop_acceptor` varchar(100) DEFAULT NULL,
  `develop_examine_time` datetime DEFAULT NULL,
  `develop_acceptor_time` datetime DEFAULT NULL,
  `develop_remark` varchar(200) DEFAULT NULL,
  `develop_refuse_remark` varchar(300) DEFAULT NULL,
  `develop_check_refuse_remark` varchar(300) DEFAULT NULL,
  `scrap_flag` varchar(4) DEFAULT '1',
  `develop_already_mos` int(11) DEFAULT '0',
  `develop_already_money` double DEFAULT '0',
  `develop_surplus_mos` int(11) DEFAULT '0',
  `take_stock_flag` varchar(4) DEFAULT '1',
  `take_stock_description` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`develop_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developbudget`;
CREATE TABLE `tbl_erc_developbudget` (
  `developbudget_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `budget_work_name` varchar(100) DEFAULT NULL,
  `budget_measurement` varchar(20) DEFAULT NULL,
  `budget_number` double DEFAULT '0',
  `budget_manual_price` double DEFAULT '0',
  `budget_materiel_price` double DEFAULT '0',
  `budget_state` int(11) DEFAULT NULL,
  `budget_examine` varchar(100) DEFAULT NULL,
  `budget_examine_time` datetime DEFAULT NULL,
  `budget_refuse_remark` varchar(300) DEFAULT NULL,
  `clearing_last_finishlimit` int(11) DEFAULT '0',
  `clearing_last_reality_money` double DEFAULT '0',
  `clearing_now_finishlimit` int(11) DEFAULT '0',
  `clearing_estimate_money` double DEFAULT '0',
  `clearing_reality_money` double DEFAULT '0',
  `clearing_state` int(11) DEFAULT NULL,
  `clearing_examine` varchar(100) DEFAULT NULL,
  `clearing_examine_time` datetime DEFAULT NULL,
  `clearing_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developbudget_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developconsume`;
CREATE TABLE `tbl_erc_developconsume` (
  `developconsume_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `consume_code` varchar(100) DEFAULT NULL,
  `consume_creator` varchar(100) DEFAULT NULL,
  `consume_examine` varchar(100) DEFAULT NULL,
  `consume_examine_time` datetime DEFAULT NULL,
  `consume_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developconsume_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developconsumedetail`;
CREATE TABLE `tbl_erc_developconsumedetail` (
  `developconsumedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `developconsume_id` bigint(20) NOT NULL,
  `developsubscribe_id` bigint(20) NOT NULL,
  `consumedetail_number` double DEFAULT '0',
  `consumedetail_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developconsumedetail_id`,`developsubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developcost`;
CREATE TABLE `tbl_erc_developcost` (
  `developcost_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `developcost_name` varchar(100) DEFAULT NULL,
  `developcost_money` varchar(20) DEFAULT NULL,
  `developcost_invoice_money` double DEFAULT '0',
  `developcost_noinvoice_money` double DEFAULT '0',
  `developcost_state` int(11) DEFAULT NULL,
  `developcost_examine` varchar(100) DEFAULT NULL,
  `developcost_examine_time` datetime DEFAULT NULL,
  `developcost_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developcost_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developpurchaseorder`;
CREATE TABLE `tbl_erc_developpurchaseorder` (
  `developpurchaseorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `purchaseorder_code` varchar(30) DEFAULT NULL,
  `purchaseorder_creator` varchar(50) DEFAULT NULL,
  `supplier_id` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developpurchaseorder_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developpurchaseorderdetail`;
CREATE TABLE `tbl_erc_developpurchaseorderdetail` (
  `developpurchaseorderdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `developpurchaseorder_id` varchar(30) NOT NULL,
  `purchaseorderdetail_name` varchar(100) DEFAULT NULL,
  `purchaseorderdetail_format` varchar(100) DEFAULT NULL,
  `purchaseorderdetail_unit` varchar(30) DEFAULT NULL,
  `purchaseorderdetail_number` double DEFAULT '0',
  `purchaseorderdetail_price` double DEFAULT '0',
  `purchaseorderdetail_remark` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developpurchaseorderdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developreceive`;
CREATE TABLE `tbl_erc_developreceive` (
  `developreceive_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `receive_code` varchar(100) DEFAULT NULL,
  `receive_creator` varchar(100) DEFAULT NULL,
  `receive_examine` varchar(100) DEFAULT NULL,
  `receive_examine_time` datetime DEFAULT NULL,
  `receive_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developreceive_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developreceivedetail`;
CREATE TABLE `tbl_erc_developreceivedetail` (
  `developreceivedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `developreceive_id` bigint(20) NOT NULL,
  `developsubscribe_id` bigint(20) NOT NULL,
  `receivesupplier_name` varchar(100) DEFAULT NULL,
  `receivedetail_number` double DEFAULT '0',
  `receivedetail_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developreceivedetail_id`,`developsubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developsubscribe`;
CREATE TABLE `tbl_erc_developsubscribe` (
  `developsubscribe_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `subscribe_name` varchar(100) DEFAULT NULL,
  `subscribe_format` varchar(100) DEFAULT NULL,
  `subscribe_unit` varchar(30) DEFAULT NULL,
  `subscribe_number` double DEFAULT '0',
  `subscribe_price` double DEFAULT '0',
  `supplier_id` varchar(30) DEFAULT NULL,
  `receive_done_number` double DEFAULT '0',
  `consume_done_number` double DEFAULT '0',
  `subscribe_remark` varchar(100) DEFAULT NULL,
  `subscribe_state` int(11) DEFAULT NULL,
  `subscribe_examine` varchar(100) DEFAULT NULL,
  `subscribe_examine_time` datetime DEFAULT NULL,
  `subscribe_refuse_remark` varchar(300) DEFAULT NULL,
  `consume_now_number` double DEFAULT '0',
  `consume_creator` varchar(50) DEFAULT NULL,
  `consume_now_price` double DEFAULT '0',
  `consume_state` int(11) DEFAULT NULL,
  `consume_examine` varchar(100) DEFAULT NULL,
  `consume_examine_time` datetime DEFAULT NULL,
  `consume_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developsubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developsubscribeorder`;
CREATE TABLE `tbl_erc_developsubscribeorder` (
  `developsubscribeorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `developbudget_id` varchar(30) NOT NULL,
  `subscribeorder_code` varchar(30) DEFAULT NULL,
  `subscribeorder_creator` varchar(50) DEFAULT NULL,
  `subscribeorder_state` int(11) DEFAULT NULL,
  `subscribeorder_examine` varchar(100) DEFAULT NULL,
  `subscribeorder_examine_time` datetime DEFAULT NULL,
  `subscribeorder_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developsubscribeorder_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developsubscribeorderdetail`;
CREATE TABLE `tbl_erc_developsubscribeorderdetail` (
  `developsubscribeorderdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `developsubscribeorder_id` varchar(30) NOT NULL,
  `subscribeorderdetail_name` varchar(100) DEFAULT NULL,
  `subscribeorderdetail_format` varchar(100) DEFAULT NULL,
  `subscribeorderdetail_unit` varchar(30) DEFAULT NULL,
  `subscribeorderdetail_number` double DEFAULT '0',
  `subscribeorderdetail_remark` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developsubscribeorderdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_developsubscribeorderdetailend`;
CREATE TABLE `tbl_erc_developsubscribeorderdetailend` (
  `developsubscribeorderdetailend_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `develop_id` varchar(30) NOT NULL,
  `subscribeorderdetailend_name` varchar(100) DEFAULT NULL,
  `subscribeorderdetailend_format` varchar(100) DEFAULT NULL,
  `subscribeorderdetailend_unit` varchar(30) DEFAULT NULL,
  `subscribeorderdetailend_number` double DEFAULT '0',
  `purchase_done_number` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`developsubscribeorderdetailend_id`)
);
/*end njc */
