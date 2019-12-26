SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* wj */
DROP TABLE IF EXISTS `tbl_erc_longassettakestock`;
CREATE TABLE `tbl_erc_longassettakestock` (
  `take_stock_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `take_stock_no` varchar(100) DEFAULT NULL,
  `domain_id` varchar(30) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `release_time` datetime DEFAULT NULL,
  `take_stock_status` varchar(10) DEFAULT NULL,
  `take_stock_confirm_id` varchar(30) DEFAULT NULL,
  `take_stock_confirm_time` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`take_stock_id`)
) ;

DROP TABLE IF EXISTS `tbl_erc_longassettakestockdetail`;
CREATE TABLE `tbl_erc_longassettakestockdetail` (
  `take_stock_detail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `take_stock_parent_no` varchar(100) DEFAULT NULL,
  `domain_id` varchar(30) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `take_stock_people_id` varchar(30) DEFAULT NULL,
  `take_stock_detail_status` varchar(10) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`take_stock_detail_id`)
) ;

INSERT INTO `seqmysql` VALUES ('getTakeStockNoSeq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('consumablesDetailIDSeq', '0', '1', '99999999');

ALTER TABLE tbl_erc_consumablesdetail ADD COLUMN take_stock_flag varchar(4) NUll DEFAULT '1' ;
ALTER TABLE tbl_erc_consumablesdetail ADD COLUMN take_stock_description varchar(100) null;

ALTER TABLE tbl_erc_fixedassetscheckdetail ADD COLUMN take_stock_flag varchar(4) NUll DEFAULT '1';
ALTER TABLE tbl_erc_fixedassetscheckdetail ADD COLUMN take_stock_description varchar(100) NUll;

ALTER TABLE tbl_erc_amortize ADD COLUMN take_stock_flag varchar(4)  NUll DEFAULT '1';
ALTER TABLE tbl_erc_amortize ADD COLUMN take_stock_description varchar(100) null;

/*end wj */

/* njc */
alter table tbl_erc_task modify column task_name varchar(130);
/*end wj */





/* add hlq */
call Pro_AddMenu('订单管理', '设计查询', '/erc/ERCOrderSearchControl', 'ERCORDERSEARCHCONTROL');
update tbl_common_api set show_flag = '0' where api_function = 'ERCORDERSEARCHCONTROL';
/* end hlq */
