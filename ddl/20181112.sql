SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* njc */
ALTER TABLE tbl_erc_productivetask ADD COLUMN productivetask_state varchar(4) NUll ;
/*end njc */
  qm start
*/

DROP TABLE IF EXISTS `tbl_erc_productdevice`;
CREATE TABLE `tbl_erc_productdevice` (
  `productdevice_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fixedassetsdetail_id` bigint(20) NOT NULL,
  `day_capacity` bigint(20) NOT NULL DEFAULT '0',
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productdevice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_productproceduredevice`;
CREATE TABLE `tbl_erc_productproceduredevice` (
  `ppdevice_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productprocedure_id` bigint(20) NOT NULL,
  `device_level` bigint(20) NOT NULL,
  `productdevice_id` bigint(20) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`ppdevice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

ALTER TABLE tbl_erc_stockapplyitem ADD COLUMN apply_price double NUll DEFAULT '0' AFTER `apply_amount`;
ALTER TABLE tbl_erc_stockapplyitem ADD COLUMN store_price double NUll DEFAULT '0' AFTER `remain_number`;
ALTER TABLE tbl_erc_qualitycheckdetail ADD COLUMN finishStock_price double NUll DEFAULT '0' AFTER `finishStock_number`;

/*
  add your ddl
*/
