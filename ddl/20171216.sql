SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* nie */
/*ALTER TABLE `tbl_erc_goconstructionnode`
ADD COLUMN `gonode_duration` int(11) DEFAULT '0'  AFTER `gonode_level`;*/
/*end nie */

/* LJZ */
ALTER TABLE tbl_erc_supplier modify supplier_proportion DOUBLE NUll DEFAULT '0';
ALTER TABLE tbl_erc_suppliermateriel modify suppliermateriel_tax DOUBLE NUll DEFAULT '0';
/*end LJZ */

/* ty */
ALTER TABLE tbl_erc_materiel modify materiel_loss double NUll DEFAULT '0';
ALTER TABLE tbl_erc_reviewmateriel modify review_materiel_loss double NUll DEFAULT '0';
ALTER TABLE tbl_erc_reviewmateriel modify review_materiel_tax double NUll DEFAULT '0';
ALTER TABLE tbl_erc_materiel modify materiel_tax double NUll DEFAULT '0';
/*end ty */