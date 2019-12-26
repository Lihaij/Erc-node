SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/*
  qm start
*/

DROP TABLE IF EXISTS `tbl_erc_financerecorditem`;
CREATE TABLE `tbl_erc_financerecorditem` (
  `financerecorditem_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `wms_type` int(11) DEFAULT '0',
  `manage_type` int(11) DEFAULT '0',
  `organization` varchar(64) DEFAULT NULL,
  `content` varchar(64) DEFAULT NULL,
  `store_amount` int(11) DEFAULT '0',
  `store_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`financerecorditem_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

/*
  add your ddl
*/
