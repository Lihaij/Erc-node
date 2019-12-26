SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ls */

    DROP TABLE IF EXISTS `tbl_erc_docusergroup`;
    CREATE TABLE `tbl_erc_docusergroup` (
      `docusergroup_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `document_id` varchar(30),
      `docdetail_id` bigint(20),
      `p_usergroup_id` bigint(20),
      `usergroup_id` bigint(20),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docusergroup_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_docuser`;
    CREATE TABLE `tbl_erc_docuser` (
      `docuser_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `document_id` varchar(30),
      `docdetail_id` bigint(20),
      `user_id` varchar(30),
      `usergroup_id` bigint(20),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docuser_id`)
    );

    ALTER TABLE `tbl_erc_document` ADD COLUMN `document_checker_id` varchar(30) NUll AFTER `document_state`;
    ALTER TABLE `tbl_erc_document` ADD COLUMN `document_check_date` datetime NUll AFTER `document_checker_id`;
    ALTER TABLE `tbl_erc_document` ADD COLUMN `document_refuse_remark` varchar(300) NUll AFTER `document_check_date`;
    ALTER TABLE `tbl_erc_docdetailuser` ADD COLUMN `document_id` varchar(300) NUll AFTER `docdetail_id`;

    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(25 , '文控审批任务' , '处理文件发布请求', now(), now());
    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        VALUES(26 , '文件发布通知' , '通知文件发布事项', now(), now());

    ALTER TABLE `tbl_erc_docuser` ADD COLUMN `read_state` varchar(4) DEFAULT '0' AFTER `usergroup_id`;

    DROP TABLE IF EXISTS `tbl_erc_docuserstate`;
    CREATE TABLE `tbl_erc_docuserstate` (
      `docuserstate_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `document_id` varchar(30),
      `user_id` varchar(30),
      `read_state` varchar(4) DEFAULT '0',
      `usergroup_id` bigint(20),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docuserstate_id`)
    );

/*end ls */

/* hlq */
DROP TABLE IF EXISTS `tbl_erc_orderkujiale`;
CREATE TABLE `tbl_erc_orderkujiale` (
  `orderkujiale_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(30) NOT NULL,
  `appuid` varchar(100) NOT NULL,
  `desid` varchar(50) NOT NULL DEFAULT '',
  `fpid` varchar(50) NOT NULL DEFAULT '',
  `listingid` varchar(50) NOT NULL DEFAULT '',
  `sync_state` varchar(10) NOT NULL DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`orderkujiale_id`)
);

ALTER TABLE `tbl_erc_orderroom` ADD COLUMN `kjl_room_id` varchar(50) NOT NUll DEFAULT '' AFTER `room_area`;
ALTER TABLE `tbl_erc_orderroom` ADD COLUMN `wall_area` double NOT NUll DEFAULT '0' AFTER `room_area`;
ALTER TABLE `tbl_erc_orderroom` ADD COLUMN `ground_perimeter` double NOT NUll DEFAULT '0' AFTER `wall_area`;

ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_type` varchar(20) NUll AFTER `sale_price`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_imageurl` varchar(200) NUll AFTER `kjl_type`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_name` varchar(50) NUll AFTER `kjl_imageurl`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_brand` varchar(50) NUll AFTER `kjl_name`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_specification` varchar(100) NUll AFTER `kjl_brand`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_unit` varchar(10) NUll AFTER `kjl_specification`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_number` double NUll AFTER `kjl_unit`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_unitprice` double NUll AFTER `kjl_number`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_realprice` double NUll AFTER `kjl_unitprice`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `kjl_group` varchar(10) NUll AFTER `kjl_realprice`;
/*end hlq */
