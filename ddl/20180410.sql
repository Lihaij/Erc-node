SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */

    DROP TABLE IF EXISTS `tbl_erc_meetingfollow`;
    CREATE TABLE `tbl_erc_meetingfollow` (
      `meetingfollow_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `meeting_id` bigint(20) NOT NULL,
      `follow_remark` varchar(100),
      `executor_id` varchar(30),
      `checker_id` varchar(30),
      `finish_date` datetime,
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`meetingfollow_id`)
    );

    call Pro_AddMenu('行政办公管理', '会议记录', '/erc/baseconfig/ERCMeetingMinuteControl', 'ERCMEETINGMINUTECONTROL');

    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(19 , '会议跟进事项' , '通知会议跟进事项责任人', now(), now());
/*end ls */
