SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/


/* njc */

call Pro_AddMenu('长期资产管理', '待摊资产项目管理','/erc/longtermassets/ERCAmortizeControl','ERCAMORTIZECONTROL');
call Pro_AddMenu('长期资产管理', '待摊资产项目管理明细','/erc/longtermassets/ERCAmortizeDetailControl','ERCAMORTIZEDETAILCONTROL');
call Pro_AddMenu('长期资产管理', '资产物料收料单', '/erc/longtermassets/ERCAmortizeReceiveControl','ERCAMORTIZERECEIVECONTROL');
call Pro_AddMenu('长期资产管理', '资产物料耗用单', '/erc/longtermassets/ERCAmortizeConsumeControl','ERCAMORTIZECONSUMECONTROL');
call Pro_AddMenu('长期资产管理', '待摊资产数据管理', '/erc/longtermassets/ERCAmortizeDataControl','ERCAMORTIZEDATACONTROL');

update tbl_common_api set show_flag = 0 where api_name like '%待摊资产项目管理明细%';

insert into seqmysql values ('amortizedIDSeq',1,1,99999999);
insert into seqmysql values ('receiveIDSeq',1,1,99999999);
insert into seqmysql values ('consumeIDSeq',1,1,99999999);
insert into seqmysql values ('cashierIDSeq',1,1,99999999);

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(32 , '待摊资产项目新增审核任务' , '待摊资产项目新增请求', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(33 , '待摊资产构建预算审核任务' , '待摊资产新增构建预算', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(34 , '待摊资产材料申购审核任务' , '待摊资产新增材料申购', now(), now());
/* insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        values(35 , '待摊资产材料收料审核任务' , '待摊资产新增材料收料', now(), now()); */
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(36 , '待摊资产人工结算审核任务' , '待摊资产新增人工结算', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(37 , '待摊资产材料耗用审核任务' , '待摊资产新增材料耗用', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(38 , '待摊资产构建费用审核任务' , '待摊资产新增构建费用', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(42 , '待摊资产提交验收审核任务' , '待摊资产新增提交验收', now(), now());

DROP TABLE IF EXISTS `tbl_erc_amortize`;
CREATE TABLE `tbl_erc_amortize` (
  `amortize_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_code` varchar(30) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `amortize_name` varchar(100) DEFAULT NULL,
  `amortize_budget` double DEFAULT '0',
  `amortize_departmant_id` varchar(20) DEFAULT NULL,
  `amortize_manager` varchar(100) DEFAULT NULL,
  `amortize_agelimit` int(11) DEFAULT NULL,
  `amortize_way` int(11) DEFAULT NULL,
  `amortize_creator` varchar(50) DEFAULT NULL,
  `amortize_project_state` int(11) DEFAULT NULL,
  `amortize_check_state` int(11) DEFAULT NULL,
  `amortize_examine` varchar(100) DEFAULT NULL,
  `amortize_acceptor` varchar(100) DEFAULT NULL,
  `amortize_examine_time` datetime DEFAULT NULL,
  `amortize_acceptor_time` datetime DEFAULT NULL,
  `amortize_remark` varchar(200) DEFAULT NULL,
  `amortize_refuse_remark` varchar(300) DEFAULT NULL,
  `amortize_check_refuse_remark` varchar(300) DEFAULT NULL,
  `scrap_flag` varchar(4) DEFAULT '1',
  `amortize_already_mos` int(11) DEFAULT '0',
  `amortize_already_money` double DEFAULT '0',
  `amortize_surplus_mos` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortize_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizebudget`;
CREATE TABLE `tbl_erc_amortizebudget` (
  `amortizebudget_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
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
  PRIMARY KEY (`amortizebudget_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizeconsume`;
CREATE TABLE `tbl_erc_amortizeconsume` (
  `amortizeconsume_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `consume_code` varchar(100) DEFAULT NULL,
  `consume_creator` varchar(100) DEFAULT NULL,
  `consume_examine` varchar(100) DEFAULT NULL,
  `consume_examine_time` datetime DEFAULT NULL,
  `consume_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizeconsume_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizeconsumedetail`;
CREATE TABLE `tbl_erc_amortizeconsumedetail` (
  `amortizeconsumedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortizeconsume_id` bigint(20) NOT NULL,
  `amortizesubscribe_id` bigint(20) NOT NULL,
  `consumedetail_number` double DEFAULT '0',
  `consumedetail_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizeconsumedetail_id`,`amortizesubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizecost`;
CREATE TABLE `tbl_erc_amortizecost` (
  `amortizecost_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `amortizecost_name` varchar(100) DEFAULT NULL,
  `amortizecost_money` varchar(20) DEFAULT NULL,
  `amortizecost_invoice_money` double DEFAULT '0',
  `amortizecost_noinvoice_money` double DEFAULT '0',
  `amortizecost_state` int(11) DEFAULT NULL,
  `amortizecost_examine` varchar(100) DEFAULT NULL,
  `amortizecost_examine_time` datetime DEFAULT NULL,
  `amortizecost_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizecost_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizereceive`;
CREATE TABLE `tbl_erc_amortizereceive` (
  `amortizereceive_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `receive_code` varchar(100) DEFAULT NULL,
  `receive_creator` varchar(100) DEFAULT NULL,
  `receive_examine` varchar(100) DEFAULT NULL,
  `receive_examine_time` datetime DEFAULT NULL,
  `receive_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizereceive_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizereceivedetail`;
CREATE TABLE `tbl_erc_amortizereceivedetail` (
  `amortizereceivedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortizereceive_id` bigint(20) NOT NULL,
  `amortizesubscribe_id` bigint(20) NOT NULL,
  `receivesupplier_name` varchar(100) DEFAULT NULL,
  `receivedetail_number` double DEFAULT '0',
  `receivedetail_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizereceivedetail_id`,`amortizesubscribe_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizesubscribe`;
CREATE TABLE `tbl_erc_amortizesubscribe` (
  `amortizesubscribe_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `subscribe_name` varchar(100) DEFAULT NULL,
  `subscribe_format` varchar(100) DEFAULT NULL,
  `subscribe_unit` varchar(30) DEFAULT NULL,
  `subscribe_number` double DEFAULT '0',
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
  PRIMARY KEY (`amortizesubscribe_id`)
);


/*end njc */
