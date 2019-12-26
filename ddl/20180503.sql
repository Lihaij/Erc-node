SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_erc_corporateclients MODIFY COLUMN month_settlement datetime;

ALTER TABLE `tbl_erc_corporateclients`
ADD COLUMN `corporateclients_mobile_phone` varchar(100) AFTER `corporateclients_address`;
/*end ty */

/* ls */

ALTER TABLE `tbl_erc_customer`
ADD COLUMN `customer_point` int(11)  DEFAULT 0 AFTER `customer_reimburserank_id`;


DROP TABLE IF EXISTS `tbl_erc_pointtype`;
CREATE TABLE `tbl_erc_pointtype` (
    `pointtype_id` bigint(20) NOT NULL,
    `customerpoint_name` varchar(100) NOT NULL,
    `base_point` int(11) DEFAULT 0,
    `pointtype_remarks` varchar(500),
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`pointtype_id`)
);

DROP TABLE IF EXISTS `tbl_erc_customerpoint`;
CREATE TABLE `tbl_erc_customerpoint` (
    `customerpoint_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id` varchar(30) NOT NULL,
    `pointtype_id` bigint(20) NOT NULL,
    `customer_point` int(11) DEFAULT 0,
    `order_id` varchar(30) NOT NULL,
    `customerpoint_remarks` varchar(500),
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`customerpoint_id`)
);

INSERT INTO tbl_erc_pointtype(pointtype_id,customerpoint_name,base_point,pointtype_remarks,created_at,updated_at)
VALUES(1,'注册积分',100,'用户首次注册送积分',now(),now());

update tbl_erc_customer set customer_point=100;

/*end ls */
