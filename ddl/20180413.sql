SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* cici */
INSERT INTO `seqmysql` VALUES ('transApplyIDSeq', '0', '1', '99999999');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	VALUES(22 , '交通接待申请' , '分配交通接待申请审核人员', now(), now());

call Pro_AddMenu('行政办公管理', '交通接待申请', '/erc/baseconfig/ERCTransReceptionListControl', 'ERCTRANSRECEPTIONLISTCONTROL');
/*end cici */
