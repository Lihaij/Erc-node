SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ls */
DROP TABLE IF EXISTS `tbl_erc_fixedassetspurch`;
CREATE TABLE `tbl_erc_fixedassetspurch` (
    `fixedassetspurch_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `fixedassetspurch_no` varchar(30),
    `domain_id` bigint(20) NOT NULL,
    `department_id` varchar(30),
    `purch_state` varchar(4) DEFAULT 0,
    `purch_checker_id` varchar(30),
    `purch_check_date` datetime,
    `purch_refuse_remark` varchar(500) DEFAULT '',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`fixedassetspurch_id`)
);

DROP TABLE IF EXISTS `tbl_erc_fixedassetspurchdetail`;
CREATE TABLE `tbl_erc_fixedassetspurchdetail` (
    `fixedassetspurchdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `fixedassetspurch_id` bigint(20) NOT NULL,
    `fixedassets_name` varchar(100),
    `fixedassets_model` varchar(20),
    `fixedassets_unit` varchar(10),
    `fixedassets_num` int(11),
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`fixedassetspurchdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_fixedassetscheck`;
CREATE TABLE `tbl_erc_fixedassetscheck` (
    `fixedassetscheck_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `fixedassetscheck_no` varchar(30),
    `domain_id` bigint(20) NOT NULL,
    `user_id` varchar(30),
    `check_state` varchar(4) DEFAULT 0,
    `check_checker_id` varchar(30),
    `check_check_date` datetime,
    `check_refuse_remark` varchar(500) DEFAULT '',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`fixedassetscheck_id`)
);

DROP TABLE IF EXISTS `tbl_erc_fixedassetscheckdetail`;
CREATE TABLE `tbl_erc_fixedassetscheckdetail` (
    `fixedassetscheckdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `fixedassetscheck_id` bigint(20) NOT NULL,
    `fixedassets_no` varchar(30),
    `fixedassets_name` varchar(100),
    `fixedassets_model` varchar(20),
    `fixedassets_unit` varchar(10),
    `fixedassets_category` varchar(4),
    `use_time_limit` varchar(10),
    `residual_value_rate` varchar(10),
    `depreciation_category` varchar(4),
    `department_id` varchar(30),
    `fixedassets_property` varchar(4),
    `user_id` varchar(30),
    `deprecition_month` varchar(4),
    `deprecition_price` bigint(20) NOT NULL DEFAULT '0',
    `residual_deprecition_month` varchar(4),
    `scrap_flag` varchar(4) DEFAULT '1',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`fixedassetscheckdetail_id`)
);

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('长期资产管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('长期资产管理', '固定资产管理', '/erc/longtermassets/ERCFixedAssetsControl', 'ERCFIXEDASSETSCONTROL');

INSERT INTO `seqmysql` VALUES ('fixedAssetsPurchNoSeq', '0', '1', '99999999');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(29 , '固定资产申购审批任务' , '处理固定资产申购请求', now(), now());

INSERT INTO `seqmysql` VALUES ('fixedAssetsCheckNoSeq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('fixedAssetsNoSeq', '0', '1', '99999999');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(30 , '固定资产验收任务' , '处理固定资产申购请求', now(), now());

/*end ls */