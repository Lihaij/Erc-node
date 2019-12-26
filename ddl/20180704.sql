SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* wj */
ALTER TABLE `tbl_erc_consumablesdetail`
ADD COLUMN `department_id` varchar(30) DEFAULT NULL AFTER `consumables_administrator_id`;

/*end wj */


/* ty */
alter table tbl_erc_docdetail modify column clause_title varchar(2500);

ALTER TABLE `tbl_erc_reimburserank`
ADD COLUMN `reimburserank_traffic_tools` VARCHAR(10) DEFAULT NULL AFTER `domain_id`;
/*end ty */
