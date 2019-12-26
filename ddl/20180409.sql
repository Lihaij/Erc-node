SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */

    DROP TABLE IF EXISTS `tbl_erc_meeting`;
    CREATE TABLE `tbl_erc_meeting` (
      `meeting_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `domain_id` bigint(20) NOT NULL,
      `user_id` varchar(30) NOT NULL,
      `meeting_name` varchar(100),
      `start_time` datetime,
      `end_time` datetime,
      `meetingroom_id` varchar(30),
      `meetinguser_id` varchar(30),
      `host_id` varchar(30),
      `meetingroom_state` varchar(4) DEFAULT '0',
      `host_state` varchar(4) DEFAULT '0',
      `meetingequipment_state` varchar(4) DEFAULT '0',
      `meeting_state` varchar(4) DEFAULT '0',
      `meeting_remark` varchar(1024),
      `meeting_remark_state` varchar(4) DEFAULT '0',
      `meeting_remark_user` varchar(30),
      `meeting_decision` varchar(1024),
      `meeting_decision_user` varchar(30),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`meeting_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_meetingequipment`;
    CREATE TABLE `tbl_erc_meetingequipment` (
      `meetingequipment_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `meeting_id` bigint(20) NOT NULL,
      `meetingroomequipment_id` bigint(20),
      `equipment_num` int(11) DEFAULT 0,
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`meetingequipment_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_meetingattendee`;
    CREATE TABLE `tbl_erc_meetingattendee` (
      `meetingattendee_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `meeting_id` bigint(20) NOT NULL,
      `attendee_id` varchar(30),
      `meetingattendee_state` varchar(4) DEFAULT '0',
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`meetingattendee_id`)
    );

    call Pro_AddMenu('行政办公管理', '会议管理', '/erc/baseconfig/ERCMeetingManageControl', 'ERCMEETINGMANAGECONTROL');

    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(18 , '会议通知' , '会议通知与会人员', now(), now());

/*end ls */

-- 交通接待申请
 DROP TABLE IF EXISTS `tbl_erc_transreceptionapply`;
CREATE TABLE tbl_erc_transreceptionapply
(
  trapply_id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
  trapply_code                   VARCHAR(100)        NULL,
  trapply_creator_id             VARCHAR(100)        NULL,
  trapply_creator_name           VARCHAR(100)        NULL,
  trapply_confirm_id           VARCHAR(100)        NULL,
  trapply_rejected_description   VARCHAR(100)        NULL,
  trapply_confirm_time           DATETIME            NULL,
  trapply_state                  VARCHAR(10)         NULL,
  trapply_start_time             DATETIME            NULL,
  trapply_end_time               DATETIME            NULL,
  trapply_pre_fee                VARCHAR(1000)   NULL,
  trapply_trip_reason            VARCHAR(100)        NULL,
  trapply_trip_reason_type       VARCHAR(10)         NULL,
  trapply_trip_origin_prov       VARCHAR(100)        NULL,
  trapply_trip_origin_city       VARCHAR(100)        NULL,
  trapply_trip_origin_dist       VARCHAR(100)        NULL,
  trapply_trip_origin_detail     VARCHAR(1000)       NULL,
  trapply_trip_termini_prov      VARCHAR(100)        NULL,
  trapply_trip_termini_city      VARCHAR(100)        NULL,
  trapply_trip_termini_dist      VARCHAR(100)        NULL,
  trapply_trip_termini_detail    VARCHAR(1000)       NULL,
  trapply_trans_way              VARCHAR(10)         NULL,
  trapply_vehicle_apply          VARCHAR(10)         NULL,
  trapply_vehicle_review_type    VARCHAR(10)         NULL,
  trapply_vehicle_distance       VARCHAR(1000)         NULL,
  trapply_vehicle_remark         VARCHAR(1000)       NULL,
  trapply_reception_reason       VARCHAR(100)        NULL,
  trapply_reception_reason_type  VARCHAR(10)         NULL,
  trapply_reception_object       VARCHAR(100)        NULL,
  trapply_reception_room_num     VARCHAR(10)         NULL,
  trapply_reception_review_type  VARCHAR(10)         NULL,
  trapply_reception_review_level VARCHAR(10)         NULL,
  trapply_reception_crew_num     VARCHAR(10)        NULL,
  trapply_reception_extra        VARCHAR(100)        NULL,
  trapply_reception_extra_fee    VARCHAR(1000)   NULL,
  trapply_recetion_crew_ids      VARCHAR(1000)        NULL,
  trapply_recetion_crew_names    VARCHAR(2000)        NULL,
  domain_id                      INT                    NULL,
  state                          VARCHAR(5) DEFAULT '1' NULL,
  version                        BIGINT DEFAULT '0'     NOT NULL,
  created_at                     DATETIME               NOT NULL,
  updated_at                     DATETIME               NOT NULL
)
  ENGINE = InnoDB;


/* NJC */
ALTER TABLE tbl_common_domain MODIFY COLUMN updomain_id BIGINT(20);
/*end NJC */
