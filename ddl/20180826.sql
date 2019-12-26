SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/


/* njc */

insert into seqmysql values ('proReceiveIDSeq',1,1,99999999);
insert into seqmysql values ('proConsumeIDSeq',1,1,99999999);
insert into seqmysql values ('proCashierIDSeq',1,1,99999999);
insert into seqmysql values ('proSubcribeOrderIDSeq',1,1,99999999);
insert into seqmysql values ('proPurOrderIDSeq',1,1,99999999);

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(60 , '工程项目材料申购审核任务' , '工程项目新增材料申购', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(61 , '工程项目人工结算审核任务' , '工程项目新增人工结算', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(62 , '工程项目材料耗用审核任务' , '工程项目新增材料耗用', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(63 , '工程项目构建费用审核任务' , '工程项目新增构建费用', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(64 , '工程项目提交验收审核任务' , '工程项目新增提交验收', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        values(65 , '工程项目新建审核任务' , '工程项目新建审核任务', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        values(66 , '工程项目提交预算审核任务' , '工程项目提交预算审核任务', now(), now());


ALTER TABLE tbl_erc_projectdetail ADD COLUMN space_state INTEGER NUll DEFAULT '0';
ALTER TABLE tbl_erc_projectdetail ADD COLUMN space_examine varchar(100) NUll DEFAULT '';
ALTER TABLE tbl_erc_projectdetail ADD COLUMN space_examine_time datetime(4) NUll ;
ALTER TABLE tbl_erc_projectdetail ADD COLUMN space_refuse_remark varchar(300) NUll DEFAULT '';
ALTER TABLE tbl_erc_project ADD COLUMN project_check_state INTEGER NUll;

DROP TABLE IF EXISTS `tbl_erc_project`;
CREATE TABLE `tbl_erc_project` (
  `projectconsume_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `consume_code` varchar(100) DEFAULT NULL,
  `consume_creator` varchar(100) DEFAULT NULL,
  `consume_examine` varchar(100) DEFAULT NULL,
  `consume_examine_time` datetime DEFAULT NULL,
  `consume_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectconsume_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectconsumedetail`;
CREATE TABLE `tbl_erc_projectconsumedetail` (
  `projectconsumedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `projectconsume_id` bigint(20) NOT NULL,
  `projectsubscribe_id` bigint(20) NOT NULL,
  `consumedetail_number` double DEFAULT '0',
  `consumedetail_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectconsumedetail_id`,`projectsubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectcost`;
CREATE TABLE `tbl_erc_projectcost` (
  `projectcost_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `projectcost_name` varchar(100) DEFAULT NULL,
  `projectcost_money` varchar(20) DEFAULT NULL,
  `projectcost_invoice_money` double DEFAULT '0',
  `projectcost_noinvoice_money` double DEFAULT '0',
  `projectcost_state` int(11) DEFAULT NULL,
  `projectcost_examine` varchar(100) DEFAULT NULL,
  `projectcost_examine_time` datetime DEFAULT NULL,
  `projectcost_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectcost_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectpurchaseorder`;
CREATE TABLE `tbl_erc_projectpurchaseorder` (
  `projectpurchaseorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `purchaseorder_code` varchar(30) DEFAULT NULL,
  `purchaseorder_creator` varchar(50) DEFAULT NULL,
  `supplier_id` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectpurchaseorder_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectpurchaseorderdetail`;
CREATE TABLE `tbl_erc_projectpurchaseorderdetail` (
  `projectpurchaseorderdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `projectpurchaseorder_id` varchar(30) NOT NULL,
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
  PRIMARY KEY (`projectpurchaseorderdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectreceive`;
CREATE TABLE `tbl_erc_projectreceive` (
  `projectreceive_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `receive_code` varchar(100) DEFAULT NULL,
  `receive_creator` varchar(100) DEFAULT NULL,
  `receive_examine` varchar(100) DEFAULT NULL,
  `receive_examine_time` datetime DEFAULT NULL,
  `receive_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectreceive_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectreceivedetail`;
CREATE TABLE `tbl_erc_projectreceivedetail` (
  `projectreceivedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `projectreceive_id` bigint(20) NOT NULL,
  `projectsubscribe_id` bigint(20) NOT NULL,
  `receivesupplier_name` varchar(100) DEFAULT NULL,
  `receivedetail_number` double DEFAULT '0',
  `receivedetail_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectreceivedetail_id`,`projectsubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectsubscribe`;
CREATE TABLE `tbl_erc_projectsubscribe` (
  `projectsubscribe_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
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
  PRIMARY KEY (`projectsubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectsubscribeorder`;
CREATE TABLE `tbl_erc_projectsubscribeorder` (
  `projectsubscribeorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `projectbudget_id` varchar(30) NOT NULL,
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
  PRIMARY KEY (`projectsubscribeorder_id`)
);


DROP TABLE IF EXISTS `tbl_erc_projectsubscribeorderdetail`;
CREATE TABLE `tbl_erc_projectsubscribeorderdetail` (
  `projectsubscribeorderdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `projectsubscribeorder_id` varchar(30) NOT NULL,
  `subscribeorderdetail_name` varchar(100) DEFAULT NULL,
  `subscribeorderdetail_format` varchar(100) DEFAULT NULL,
  `subscribeorderdetail_unit` varchar(30) DEFAULT NULL,
  `subscribeorderdetail_number` double DEFAULT '0',
  `subscribeorderdetail_remark` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectsubscribeorderdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectsubscribeorderdetailend`;
CREATE TABLE `tbl_erc_projectsubscribeorderdetailend` (
  `projectsubscribeorderdetailend_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `subscribeorderdetailend_name` varchar(100) DEFAULT NULL,
  `subscribeorderdetailend_format` varchar(100) DEFAULT NULL,
  `subscribeorderdetailend_unit` varchar(30) DEFAULT NULL,
  `subscribeorderdetailend_number` double DEFAULT '0',
  `purchase_done_number` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectsubscribeorderdetailend_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectbudget`;
CREATE TABLE `tbl_erc_projectbudget` (
  `projectbudget_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
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
  PRIMARY KEY (`projectbudget_id`)
);
/*end njc */
