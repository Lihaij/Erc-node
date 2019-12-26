SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* add qm */
call Pro_AddMenu('投诉管理', '客户投诉管理','/erc/customermanage/ERCUserComplaintControl','ERCUSERCOMPLAINTCONTROL');
/* end qm */
