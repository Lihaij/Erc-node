SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/
/* ty */
ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_procurement_type` varchar(4) AFTER `materiel_state_management`;

ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_procurement_type` varchar(4) AFTER `review_materiel_state_management`;
/*end ty */