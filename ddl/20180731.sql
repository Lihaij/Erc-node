SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */

DROP TABLE IF EXISTS `tbl_erc_basetype`;
CREATE TABLE `tbl_erc_basetype` (
    `basetype_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `basetype_code` varchar(30),
    `basetype_name` varchar(100),
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`basetype_id`)
);

DROP TABLE IF EXISTS `tbl_erc_basetypedetail`;
CREATE TABLE `tbl_erc_basetypedetail` (
    `basetypedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `basetype_id` bigint(20) NOT NULL,
    `domain_id` bigint(20) NOT NULL,
    `typedetail_no` int(11),
    `typedetail_code` varchar(30),
    `typedetail_name` varchar(100),
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`basetypedetail_id`)
);

insert into tbl_erc_basetype (basetype_code,basetype_name,version,created_at,updated_at) VALUES ('SCGXFL','生产工序分类',1,NOW(),NOW());


/*end ls */


/* jjs */

ALTER TABLE `tbl_erc_receipt` CHANGE COLUMN `supplier_id` `supplier_id` bigint(20);

/*end jjs */

/* ty */
call Pro_AddMenu('system', '系统数据字段初始化','/erc/baseconfig/ERCSystemDataInitializationControl','ERCSYSTEMDATAINITIALIZATIONCONTROL');
/*end ty */