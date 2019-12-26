SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* nie */
/*ALTER TABLE `tbl_erc_order`
ADD COLUMN `processcreate_state` INTEGER DEFAULT 0 AFTER `updated_at`;*/

/*DROP TABLE `tbl_erc_processmateriel`;*/
/*end nie */

/* ty */
/*ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_remark` varchar(300) AFTER `review_materiel_formatunit`;*/

/*end ty */