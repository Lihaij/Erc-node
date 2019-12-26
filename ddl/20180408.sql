SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/



/* NJC */
call Pro_AddMenu('运营数据管理', '基础数据管理', '/erc/baseconfig/ERCBaseDataControl', 'ERCBASEDATACONTROL');
/*end NJC */



/* ls */

    DROP TABLE IF EXISTS `tbl_erc_meetingroom`;
    CREATE TABLE `tbl_erc_meetingroom` (
      `meetingroom_id` varchar(30) NOT NULL,
      `domain_id` bigint(20) NOT NULL,
      `meetingroom_name` varchar(100),
      `meetinguser_id` varchar(30),
      `equipmentuser_id` varchar(30),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`meetingroom_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_meetingroomequipment`;
    CREATE TABLE `tbl_erc_meetingroomequipment` (
      `meetingroomequipment_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `meetingroom_id` varchar(30) NOT NULL,
      `equipment_name` varchar(100),
      `equipment_unit` varchar(10),
      `equipment_num` int(11) DEFAULT 0,
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`meetingroomequipment_id`)
    );

    INSERT INTO `seqmysql` VALUES ('meetingRoomIDSeq', '0', '1', '99999999');

    DROP TABLE IF EXISTS `tbl_erc_vehicle`;
    CREATE TABLE `tbl_erc_vehicle` (
      `vehicle_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `domain_id` bigint(20) NOT NULL,
      `license_plate_num` varchar(10),
      `vehicle_brand` varchar(100),
      `vehicle_type` varchar(10),
      `vehicle_status` varchar(4) DEFAULT 0,
      `admin_user_id` varchar(30),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`vehicle_id`)
    );

    insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('行政办公管理','00','16',1,NOW(),NOW());

    call Pro_AddMenu('行政办公管理', '会议室维护', '/erc/baseconfig/ERCMeetingRoomControl', 'ERCMEETINGROOMCONTROL');
    call Pro_AddMenu('行政办公管理', '车辆维护', '/erc/baseconfig/ERCVehicleControl', 'ERCVEHICLECONTROL');

/*end ls */



DROP TABLE IF EXISTS `tbl_erc_reimburserank`;
CREATE TABLE tbl_erc_reimburserank
(
  reimburserank_id   BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
  reimburserank_name  VARCHAR(100) DEFAULT  NULL,
  reimburserank_reception_putup_level VARCHAR(10) DEFAULT NULL,
  reimburserank_trip_putup_level VARCHAR(10) DEFAULT NULL,
  reimburserank_downtown_traffic_level VARCHAR(10) DEFAULT NULL,
  reimburserank_meal_level VARCHAR(10) DEFAULT NULL,
  reimburserank_reception_level VARCHAR(10) DEFAULT NULL,
  reimburserank_gas_level VARCHAR(10) DEFAULT NULL,
  reimburserank_traffic_available VARCHAR(10) DEFAULT NULL,
  domain_id         INT                    NULL,
  state          VARCHAR(5) DEFAULT '1'  NULL,
  version        BIGINT DEFAULT '0'      NOT NULL,
  created_at     DATETIME                NOT NULL,
  updated_at     DATETIME                NOT NULL
);

call Pro_AddMenu('行政办公管理', '报销职级维护', '/erc/baseconfig/ERCReimburseRankControl', 'ERCREIMBURSERANKCONTROL');

/* jjs */
INSERT INTO `seqmysql` VALUES ('idleApplyIDSeq', '0', '1', '99999999');
ALTER TABLE `tbl_erc_stockmap` ADD COLUMN `trigger_idle_scan` varchar(4) DEFAULT 0 AFTER `trigger_safe_model`;
/*end jjs */

