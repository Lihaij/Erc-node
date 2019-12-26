SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
    update tbl_common_systemmenu set systemmenu_name='客户维护' where api_function='ERCCUSTOMERCONTROL';

	DROP TABLE IF EXISTS `tbl_erc_loan`;
    CREATE TABLE `tbl_erc_loan` (
      `loan_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `order_id` varchar(30) NOT NULL,
      `domain_id` bigint(20) NOT NULL,
      `user_id` varchar(30) NOT NULL,
      `loan_amount` double DEFAULT 0,
      `loan_remark` varchar(300) DEFAULT '',
      `loan_state` varchar(1) DEFAULT '0',
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`loan_id`)
    );

    call Pro_AddMenu('客户管理', '贷款管理', '/erc/customermanage/ERCLoanControl', 'ERCLOANCONTROL');

/*end ls */
