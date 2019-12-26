SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* cici */
   DROP TABLE IF EXISTS `tbl_erc_trafficreceptionexpense`;
   CREATE TABLE `tbl_erc_trafficreceptionexpense` (
     `tr_expense_id` bigint(20) NOT NULL AUTO_INCREMENT,
     `domain_id` bigint(20) DEFAULT NULL,
     `tr_expense_code` varchar(100) DEFAULT NULL,
     `tr_expense_creator_id` varchar(100) DEFAULT NULL,
     `tr_expense_creator_name` varchar(100) DEFAULT NULL,
     `tr_expense_confirm_time` datetime DEFAULT NULL,
     `tr_expense_confirm_id` varchar(100) DEFAULT NULL,
     `tr_expense_rejected_description` varchar(100) DEFAULT NULL,
     `tr_expense_state` varchar(10) DEFAULT NULL,
     `tr_expense_start_time` datetime DEFAULT NULL,
     `tr_expense_end_time` datetime DEFAULT NULL,
     `tr_expense_pre_fee` double DEFAULT '0',
     `state` varchar(5) DEFAULT '1',
     `version` bigint(20) NOT NULL DEFAULT '0',
     `created_at` datetime NOT NULL,
     `updated_at` datetime NOT NULL,
     PRIMARY KEY (`tr_expense_id`)
   );

   DROP TABLE IF EXISTS `tbl_erc_trafficreceptionexpensedetail`;
   CREATE TABLE `tbl_erc_trafficreceptionexpensedetail` (
     `tr_detail_id` bigint(20) NOT NULL AUTO_INCREMENT,
     `domain_id` bigint(20) DEFAULT NULL,
     `tr_expense_list_code` varchar(100) DEFAULT NULL,
     `tr_detail_fee_id` varchar(100) DEFAULT '0',
     `tr_detail_expected_fee` double DEFAULT '0',
     `tr_detail_no_invoice_fee` double DEFAULT '0',
     `tr_detail_have_invoice_fee` double DEFAULT '0',
     `state` varchar(5) DEFAULT '1',
     `version` bigint(20) NOT NULL DEFAULT '0',
     `created_at` datetime NOT NULL,
     `updated_at` datetime NOT NULL,
     PRIMARY KEY (`tr_detail_id`)
   );

    call Pro_AddMenu('行政办公管理', '交通接待报销申请', '/erc/baseconfig/ERCTransReceptionListExpenseControl', 'ERCTRANSRECEPTIONLISTEXPENSECONTROL');

    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
            	VALUES(24 , '交通接待报销申请' , '分配交通接待报销审核人员', now(), now());
/*end cici */
