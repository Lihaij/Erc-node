SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* qm */

ALTER TABLE tbl_erc_productmaterielverify ADD COLUMN `product_plan_id` bigint(20) NULL AFTER `materiel_verify_id`;
ALTER TABLE tbl_erc_productplan ADD COLUMN `workshop_id` varchar(30) NULL AFTER `order_id`;

/*end qm */
