SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
update tbl_common_systemmenu set systemmenu_name = '角色设置' where api_function = 'DOMAINGROUPCONTROL';
update tbl_common_domainmenu set domainmenu_name = '角色设置' where api_function = 'USERSETTING';
update tbl_common_domainmenu set domainmenu_name = '角色设置' where api_function = 'DOMAINGROUPCONTROL';
update tbl_common_api set api_name = '角色设置' where api_function = 'DOMAINGROUPCONTROL';
update tbl_common_templatemenu set templatemenu_name = '角色设置' where api_function = 'DOMAINGROUPCONTROL';
/*update tbl_common_systemmenu set systemmenu_name = '入库流水' where api_function = 'ERCBUYINHISTORYCONTROL';*/
/*update tbl_common_templatemenu set templatemenu_name = '入库流水' where api_function = 'ERCBUYINHISTORYCONTROL';*/
/*end ty */

