SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* jjs */

DROP TABLE IF EXISTS `tbl_erc_receipt`;
CREATE TABLE `tbl_erc_receipt` (
  `receipt_id` varchar(30) NOT NULL,
  `purchaseorder_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `supplier_id` bigint(20) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`receipt_id`)
);

DROP TABLE IF EXISTS `tbl_erc_receiptitem`;
CREATE TABLE `tbl_erc_receiptitem` (
  `receiptitem_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `receipt_id` bigint(20) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `purchasedetail_id` bigint(20) NOT NULL,
  `receipt_item_number` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`receiptitem_id`)
);

call Pro_AddMenu('WMS系统管理', '收货单列表','/erc/inventorymanage/ERCReceiptListControl','ERCRECEIPTLISTCONTROL');

insert into seqmysql values ('receiptIDSeq',1,1,99999999);

/*end jjs */
