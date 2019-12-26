SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* jjs */

 call Pro_AddMenu('WMS系统管理', '收货管理', '/erc/inventorymanage/ERCCollectGoodsControl', 'ERCCOLLECTGOODSCONTROL');

/*end jjs */

/* hlq */
ALTER TABLE `tbl_common_templatemenu` ADD COLUMN `templatemenu_index` int(11) DEFAULT 0 AFTER `templatemenu_icon`;
ALTER TABLE `tbl_common_domainmenu` ADD COLUMN `domainmenu_index` int(11) DEFAULT 0 AFTER `domainmenu_icon`;
/* end hlq */