SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* LJZ */
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_conversion` VARCHAR(5) NULL;
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_intpart` VARCHAR(5) NULL;
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_x` INTEGER NUll DEFAULT '0';
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_y` INTEGER NUll DEFAULT '0';
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_z` INTEGER NUll DEFAULT '0';

ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_conversion` VARCHAR(5) NULL;
ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_intpart` VARCHAR(5) NULL;
ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_x` INTEGER NUll DEFAULT '0';
ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_y` INTEGER NUll DEFAULT '0';
ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_z` INTEGER NUll DEFAULT '0';
/*end LJZ */

/* hlq */
ALTER TABLE `tbl_common_user`
CHANGE COLUMN `type` `user_type` varchar(10) NOT NULL DEFAULT '' ;
/*end hlq */
