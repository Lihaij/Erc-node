SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_erc_fixedassetscheckdetail MODIFY COLUMN deprecition_month varchar(4) NUll DEFAULT '0';
ALTER TABLE tbl_erc_fixedassetscheckdetail MODIFY COLUMN residual_deprecition_month varchar(4) NUll DEFAULT '0';
/*end ty */

/* ls */
DROP TABLE IF EXISTS `tbl_erc_longassetsscrapdetail`;
CREATE TABLE `tbl_erc_longassetsscrapdetail` (
    `longassetsscrapdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `longassetsscrap_id` bigint(20) NOT NULL,
    `fixedasset_id` bigint(20) NOT NULL,
    `return_price` bigint(20) NOT NULL DEFAULT '0',
    `expend_price` bigint(20) NOT NULL DEFAULT '0',
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`longassetsscrapdetail_id`)
);

ALTER TABLE tbl_erc_consumablesdetail ADD COLUMN scrap_flag varchar(4) DEFAULT '1';

/*end ls */