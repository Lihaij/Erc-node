SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
update tbl_common_domainmenu set domainmenu_name = '入库管理' where api_function = 'ERCBuyInControl';
update tbl_common_domainmenu set domainmenu_name = '入库流水' where api_function = 'ERCBuyInHistoryControl';
update tbl_common_api set api_name = '入库管理' where api_function = 'ERCBuyInControl';
update tbl_common_api set api_name = '入库流水' where api_function = 'ERCBuyInHistoryControl';
/*end ty */