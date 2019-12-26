SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* qm */

DROP TABLE IF EXISTS `tbl_erc_productmaterielverify`;
CREATE TABLE `tbl_erc_productmaterielverify` (
  `materiel_verify_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `product_ppd_id` bigint(20) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `require_id` bigint(20) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`materiel_verify_id`)
);

/*end qm */