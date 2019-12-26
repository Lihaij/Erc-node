SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* njc */
call Pro_AddMenu('生产计划管理', '生产任务单','/erc/productionmanage/ERCProductiveTaskControl','ERCPRODUCTIVETASKCONTROL');

alter table tbl_erc_orderproductplan modify column order_id varchar(30);

DROP TABLE IF EXISTS `tbl_erc_productivetask`;
CREATE TABLE `tbl_erc_productivetask` (
  `productivetask_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `materiel_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `taskdesign_number` bigint(20) DEFAULT '0',
  `taskworkshop_id` varchar(30) DEFAULT NULL,
  `procedure_id` bigint(20) NOT NULL,
  `order_id` varchar(400) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productivetask_id`)
);
/*end njc */


/* jjs */

DROP TABLE IF EXISTS `tbl_erc_delivery`;
CREATE TABLE `tbl_erc_delivery` (
  `delivery_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(30) NOT NULL,
  `delivery_state` varchar(4) DEFAULT NULL,
  `delivery_remark` varchar(100) DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`delivery_id`)
);

DROP TABLE IF EXISTS `tbl_erc_deliveryitem`;
CREATE TABLE `tbl_erc_deliveryitem` (
  `deliveryitem_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `delivery_id` varchar(30) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `delivery_item_number` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`deliveryitem_id`)
);

call Pro_AddMenu('订单管理', '订单评审', '/erc/ordermanage/ERCOrderReviewControl', 'ERCORDERREVIEWCONTROL');

/*end jjs */



