SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* LJZ */
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_formula` VARCHAR(50) NULL AFTER `review_materiel_format`;
ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_formula` VARCHAR(50) NULL AFTER `materiel_format`;
/*end LJZ */