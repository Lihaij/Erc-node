
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `tbl_erc_materiel`
DROP INDEX `tbl_nca_materiel_materiel_code_unique` ,
DROP INDEX `materiel_code` ;