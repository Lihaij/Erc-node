SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/* cici */
call Pro_AddMenu('运营数据管理', '商城案例维护', '/erc/baseconfig/ERCSiteConfigCaseControl', 'ERCSITECONFIGCASECONTROL');
/* end cici */

/* ty */
DROP TABLE IF EXISTS `tbl_erc_otherstockorder`;
CREATE TABLE `tbl_erc_otherstockorder` (
  `otherstock_id` varchar(30) NOT NULL,
  `stockapply_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `otherstock_state` varchar(30) DEFAULT NULL,
  `otherstock_approver` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`otherstock_id`)
)

/*end ty */