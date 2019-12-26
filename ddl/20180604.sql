SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* wj */
DROP TABLE IF EXISTS `tbl_erc_consumables`;
CREATE TABLE `tbl_erc_consumables` (
  `consumables_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `consumables_code` varchar(100) DEFAULT NULL,
  `domain_id` varchar(100) DEFAULT NULL,
  `consumables_creator_id` varchar(100) DEFAULT NULL,
  `consumables_creator_name` varchar(100) DEFAULT NULL,
  `consumables_confirm_time` datetime DEFAULT NULL,
  `consumables_confirm_id` varchar(100) DEFAULT NULL,
  `consumables_rejected_description` varchar(100) DEFAULT NULL,
  `consumables_status` varchar(10) DEFAULT NULL,
  `consumables_department_id` varchar(100) DEFAULT NULL,
  `consumables_type_id` varchar(10) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`consumables_id`)
);

DROP TABLE IF EXISTS `tbl_erc_consumablesdetail`;
CREATE TABLE `tbl_erc_consumablesdetail` (
  `consumables_detail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` varchar(100) DEFAULT NULL,
  `consumables_parent_code` varchar(100) DEFAULT NULL,
  `consumables_detail_code` varchar(100) DEFAULT NULL,
  `consumables_detail_creator_id` varchar(100) DEFAULT NULL,
  `consumables_detail_creator_name` varchar(100) DEFAULT NULL,
  `consumables_detail_status` varchar(10) DEFAULT NULL,
  `consumables_detail_type_id` varchar(10) DEFAULT NULL,
  `consumables_name` varchar(100) DEFAULT NULL,
  `consumables_specifications` varchar(100) DEFAULT NULL,
  `consumables_unit` varchar(100) DEFAULT NULL,
  `consumables_administrator_id` varchar(100) DEFAULT NULL,
  `consumables_acceptance_type_id` varchar(10) DEFAULT NULL,
  `consumables_number` double DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`consumables_detail_id`)
);

INSERT INTO `seqmysql` VALUES ('consumablessPurchaseIDSeq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('consumablesAcceptanceIDSeq', '0', '1', '99999999');
call Pro_AddMenu('长期资产管理', '低值易耗品管理', '/erc/longtermassets/ERCConsumablesControl', 'ERCCONSUMABLESCONTROL');
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(40 , '低值易耗品申购审核任务' , '低值易耗品申购', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
            	values(41 , '低值易耗品验收审核任务' , '低值易耗品验收申请', now(), now());
/*end wj */

/* ty */
ALTER TABLE tbl_erc_fixedassetscheckdetail MODIFY COLUMN residual_value_rate double NUll DEFAULT '0';
/*end ty */

/* ls */
DROP TABLE IF EXISTS `tbl_erc_longassetsscrap`;
CREATE TABLE `tbl_erc_longassetsscrap` (
    `longassetsscrap_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `longassetsscrap_no` varchar(30),
    `domain_id` bigint(20) NOT NULL,
    `user_id` varchar(30),
    `scrap_type` varchar(4) NOT NULL,
    `scrap_state` varchar(4) DEFAULT 0,
    `scrap_checker_id` varchar(30),
    `scrap_check_date` datetime,
    `scrap_refuse_remark` varchar(500) DEFAULT '',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`longassetsscrap_id`)
);

INSERT INTO `seqmysql` VALUES ('longAssetsScrapNoSeq', '0', '1', '99999999');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(39 , '资产报废审批任务' , '处理资产报废审批请求', now(), now());

call Pro_AddMenu('长期资产管理', '资产报废管理', '/erc/longtermassets/ERCAssetRetirementControl', 'ERCASSETRETIREMENTCONTROL');

/*end ls */