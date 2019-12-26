SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('品质管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('品质管理', '品质录入', '/erc/purchasemanage/ERCQualityAddControl', 'ERCQUALITYADDCONTROL');
call Pro_AddMenu('品质管理', '品质检验单', '/erc/purchasemanage/ERCQualityCheckControl', 'ERCQUALITYCHECKCONTROL');

/*end ty */

