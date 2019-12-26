SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
    DROP TABLE IF EXISTS `tbl_erc_askforleave`;
    CREATE TABLE `tbl_erc_askforleave` (
      `askforleave_id` varchar(30) NOT NULL,
      `domain_id` bigint(20) NOT NULL,
      `askforuser_id` varchar(30) NOT NULL,
      `start_time` datetime,
      `end_time` datetime,
      `askforleave_reason` varchar(4),
      `askforleave_days` double,
      `askforleave_remark` varchar(1024),
      `askforleave_state` varchar(4) DEFAULT '0',
      `check_time` datetime,
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`askforleave_id`)
    );

    call Pro_AddMenu('行政办公管理', '请假管理', '/erc/baseconfig/ERCAskForLeaveControl', 'ERCASKFORLEAVECONTROL');

    INSERT INTO `seqmysql` VALUES ('askForLeaveIDSeq', '0', '1', '99999999');

/*end ls */
