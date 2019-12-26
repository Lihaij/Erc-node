SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ls */
DROP TABLE IF EXISTS `tbl_erc_corporateclients`;
CREATE TABLE `tbl_erc_corporateclients` (
    `corporateclients_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `corporateclients_no` varchar(30) NOT NULL,
    `domain_id` bigint(20) NOT NULL,
    `corporateclients_name` varchar(100),
    `corporateclients_type` varchar(5),
    `corporateclients_province` varchar(20) DEFAULT '',
    `corporateclients_city` varchar(20) DEFAULT '',
    `corporateclients_district` varchar(20) DEFAULT '',
    `corporateclients_address` varchar(100),
    `corporateclients_contact` varchar(100),
    `corporateclients_phone` varchar(100),
    `corporateclients_fax` varchar(100),
    `business_registration_no` varchar(100),
    `business_tax` double NOT NULL DEFAULT '0',
    `corporateclients_contact_qq` varchar(100),
    `corporateclients_contact_wechat` varchar(100),
    `legalperson_contact` varchar(100),
    `legalperson_phone` varchar(100),
    `legalperson_qq` varchar(100),
    `legalperson_wechat` varchar(100),
    `month_settlement` int(11) DEFAULT NULL,
    `settlement_way` varchar(5) DEFAULT NULL,
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`corporateclients_id`)
);

INSERT INTO `seqmysql` VALUES ('corporateClientsIDSeq', '0', '1', '99999999');

update tbl_common_systemmenu set systemmenu_name='体验店管理' where api_function='ERCBUSINESSCUSTOMERCONTROL';

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('企业客户管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('企业客户管理', '企业客户列表', '/erc/baseconfig/ERCCorporateClientsControl', 'ERCCORPORATECLIENTSCONTROL');



/*end ls */
