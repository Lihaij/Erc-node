SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* jjs */

    DROP TABLE IF EXISTS `tbl_erc_salereceivables`;
    CREATE TABLE `tbl_erc_salereceivables` (
      `sale_receivables_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `order_id` varchar(30) NOT NULL,
      `sale_receivables_amount` double DEFAULT '0',
      `sale_receivables_operator_id` varchar(30) DEFAULT NULL,
      `sale_receivables_pay_type` varchar(4) DEFAULT NULL,
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`sale_receivables_id`)
    );

    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(17 , '闲置库存申请' , '分配闲置库存申请审核人员', now(), now());

/*end jjs */

/* ty */

ALTER TABLE `tbl_erc_customer` ADD COLUMN `customer_reimburserank_id` bigint(20) NUll AFTER `goupload_format`;
/*end ty */

/* hlq */
/* ALTER TABLE `tbl_common_domain` ADD COLUMN `updomain_id` bigint(20) NUll AFTER `domain_description`; */
/*end hlq */
