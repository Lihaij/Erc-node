SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/*
  qm start
*/

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('财务管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('出纳管理', '物料收发汇总表', '/erc/cashiermanage/ERCMaterielSRControl', 'ERCMATERIELSRCONTROL');

/*
  add your ddl
*/
