SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `tbl_erc_accountingdetail`
ADD COLUMN `accounting_type` VARCHAR(4) NULL DEFAULT NULL AFTER `approval_state`;