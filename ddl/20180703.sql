SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE `tbl_erc_meetingroomequipment`
ADD COLUMN `assets_id` varchar(30) DEFAULT NULL AFTER `equipment_num`;

ALTER TABLE `tbl_erc_meetingroomequipment`
ADD COLUMN `domain_id` bigint(20) NOT NULL AFTER `assets_id`;


update tbl_common_api set api_name = '出差、用车接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';
update tbl_common_domainmenu set domainmenu_name = '出差、用车接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';
update tbl_common_systemmenu set systemmenu_name = '出差、用车接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';
update tbl_common_templatemenu set templatemenu_name = '出差、用车接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';

/*end ty */
