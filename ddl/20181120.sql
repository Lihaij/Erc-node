SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/*
  qm start
*/

DROP TABLE IF EXISTS `tbl_erc_financerecord`;
CREATE TABLE `tbl_erc_financerecord` (
  `financerecord_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `financerecord_code` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `bill_date` varchar(32) NOT NULL,
  `organization` varchar(64) DEFAULT NULL,
  `total_amount` int(11) DEFAULT '0',
  `total_price` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`financerecord_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

insert into seqmysql values ('financeRecordMaterielIDSeq',1,1,99999999);

/*
  add your ddl
*/
