SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* cici */
INSERT INTO `seqmysql` VALUES ('specialExpenseIDSeq', '0', '1', '99999999');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
      VALUES(28 , '特殊费用报销审批任务' , '分配处理特殊费用报销审核人员', now(), now());

DROP TABLE IF EXISTS `tbl_erc_specialexpense`;
CREATE TABLE `tbl_erc_specialexpense` (
  `s_expense_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `s_expense_code` varchar(100) DEFAULT NULL,
  `s_expense_creator_id` varchar(100) DEFAULT NULL,
  `s_expense_creator_name` varchar(100) DEFAULT NULL,
  `s_expense_confirm_time` datetime DEFAULT NULL,
  `s_expense_confirm_id` varchar(100) DEFAULT NULL,
  `s_expense_rejected_description` varchar(100) DEFAULT NULL,
  `s_expense_state` varchar(10) DEFAULT NULL,
  `s_expense_type_id` varchar(10) DEFAULT NULL,
  `s_sum_fee` double DEFAULT '0',
  `s_no_invoice_fee` double DEFAULT '0',
  `s_have_invoice_fee` double DEFAULT '0',
  `s_expense_description` varchar(1000) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`s_expense_id`)
);

call Pro_AddMenu('行政办公管理', '特殊费用报销', '/erc/baseconfig/ERCSpecialExpenseControl', 'ERCSPECIALEXPENSECONTROL');

/*end cici */

/* ty */
ALTER TABLE tbl_erc_docdetail MODIFY COLUMN clause_no varchar(50);
/*end ty */