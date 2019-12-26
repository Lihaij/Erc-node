SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */

DROP TABLE IF EXISTS `tbl_erc_producepricetemplate`;
CREATE TABLE `tbl_erc_producepricetemplate` (
    `producepricetemplate_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `producepricetemplate_name` varchar(100),
    `domain_id` bigint(20) NOT NULL,
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`producepricetemplate_id`)
);

DROP TABLE IF EXISTS `tbl_erc_producepricetemplatedetail`;
CREATE TABLE `tbl_erc_producepricetemplatedetail` (
    `producepricetemplatedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `producepricetemplate_id` bigint(20) NOT NULL,
    `domain_id` bigint(20) NOT NULL,
    `materiel_id` bigint(20),
    `suggest_price` double ,
    `start_date` datetime,
    `end_date` datetime,
    `price_state` varchar(5) DEFAULT '1',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`producepricetemplatedetail_id`)
);

/*end ls */

/* ty */
call Pro_AddMenu('企业客户管理', '销售价格模板','/erc/baseconfig/ERCProductSalesPriceControl','ERCPRODUCTSALESPRICECONTROL');
/*end ty */