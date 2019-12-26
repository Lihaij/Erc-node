SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* qm */

ALTER TABLE tbl_erc_productplandetail ADD COLUMN `product_plan_id` bigint(20) NULL AFTER `product_dtl_id`;
ALTER TABLE tbl_erc_productplanprocedure ADD COLUMN `product_plan_id` bigint(20) NULL AFTER `product_procedure_id`;
ALTER TABLE tbl_erc_productplanrelated ADD COLUMN `product_plan_id` bigint(20) NULL AFTER `product_rlt_id`;

/*end qm */
