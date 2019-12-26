SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* hlq */
ALTER TABLE `tbl_erc_zoweeprocess`
ADD COLUMN `zoweeprocess_type` VARCHAR(10) NULL DEFAULT '1' AFTER `ordermateriel_id`;
/*end hlq */


/* tiny */
ALTER TABLE `tbl_erc_stockapply` ADD COLUMN `apply_type` varchar(5) AFTER `updated_at`;
/*end tiny */
