SET NAMES utf8;

SET FOREIGN_KEY_CHECKS = 0;

/* tiny */
DROP TABLE IF EXISTS `tbl_erc_stockitem`;
CREATE TABLE `tbl_erc_stockitem` (
  `stockitem_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stockmap_id` bigint(20) NOT NULL,
  `item_amount` int(11) DEFAULT '0',
  `warehouse_id` bigint(20) NOT NULL,
  `warehouse_zone_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`stockitem_id`)
)
/* end tiny */

