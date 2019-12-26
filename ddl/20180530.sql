SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `fixedassetscheck_acceptance` varchar(4) AFTER `scrap_flag`;
/*end ty */

/* ls */
DROP TABLE IF EXISTS `tbl_erc_fixedassetsrepair`;
CREATE TABLE `tbl_erc_fixedassetsrepair` (
    `fixedassetsrepair_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `fixedassetsrepair_no` varchar(30),
    `domain_id` bigint(20) NOT NULL,
    `submit_user_id` varchar(30),
    `fixedassetscheckdetail_id` bigint(20),
    `fixedassets_no` varchar(30),
    `repair_plan_time` datetime,
    `fault_remark` varchar(1024),
    `repair_state` varchar(4) DEFAULT 0,
    `repair_checker_id` varchar(30),
    `repair_check_date` datetime,
    `repair_refuse_remark` varchar(500) DEFAULT '',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`fixedassetsrepair_id`)
);

DROP TABLE IF EXISTS `tbl_erc_fixedassetsrepairmaterials`;
CREATE TABLE `tbl_erc_fixedassetsrepairmaterials` (
    `fixedassetsrepairmaterials_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `fixedassetsrepair_id` bigint(20) NOT NULL,
    `repair_name` varchar(100),
    `repair_model` varchar(20),
    `repair_unit` varchar(10),
    `repair_price` bigint(20) NOT NULL DEFAULT '0',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`fixedassetsrepairmaterials_id`)
);

INSERT INTO `seqmysql` VALUES ('fixedAssetsRepairNoSeq', '0', '1', '99999999');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(31 , '固定资产维修任务' , '处理固定资产维修请求', now(), now());

/*end ls */
