


SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* bb */
ALTER TABLE `tbl_erc_usercollection`
CHANGE COLUMN `decorate_id` `decorate_id` VARCHAR(30) NOT NULL ;
/*end bb */

ALTER TABLE `tbl_erc_ordermateriel` CHANGE COLUMN `materiel_batch` `materiel_batch` varchar(30) DEFAULT NULL;

-- call Pro_AddMenu('系统设置', '部门维护', '/erc/baseconfig/ERCDepartmentControl', 'ERCDEPARTMENTCONTROL');
-- call Pro_AddMenu('系统设置', '岗位维护', '/erc/basieconfig/ERCUsergroupControl', 'ERCUSERGROUPCONTROL');