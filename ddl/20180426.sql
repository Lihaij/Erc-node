SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ls */

    ALTER TABLE `tbl_erc_askforleave` ADD COLUMN `askforleave_checker_id` varchar(30) NUll AFTER `check_time`;
    ALTER TABLE `tbl_erc_askforleave` ADD COLUMN `askforleave_refuse_remark` varchar(300) NUll AFTER `askforleave_checker_id`;
    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        	VALUES(27 , '请假审批任务' , '处理请假请求', now(), now());

/*end ls */

/* hlq */
DROP TABLE IF EXISTS `tbl_erc_roomtype`;
CREATE TABLE `tbl_erc_roomtype` (
  `roomtype_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `estate_id` bigint(20) DEFAULT NULL,
  `roomtype_name` varchar(50) DEFAULT NULL,
  `roomtype_spec_name` varchar(50) DEFAULT NULL,
  `roomtype_srcage` double DEFAULT NULL,
  `roomtype_area` double DEFAULT NULL,
  `roomtype_plan_pic` varchar(200) DEFAULT NULL,
  `roomtype_room_count` varchar(200) DEFAULT NULL,
  `roomtype_kjl_planid` varchar(50) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`roomtype_id`)
);
/* end hlq */
