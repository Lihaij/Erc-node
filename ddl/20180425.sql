SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE `tbl_erc_docdetailquestion` ADD COLUMN `submit_question_answer` varchar(4) AFTER `question_answer`;
call Pro_AddMenu('行政办公管理', '文件通知', '/erc/baseconfig/ERCDocumentNoticeControl', 'ERCDOCUMENTNOTICECONTROL');
/*end ty */
/* njc */
--    call Pro_AddMenu('运营数据管理', '内容分类管理', '/erc/baseconfig/ERCContentManageTypeControl', 'ERCCONTENTMANAGETYPECONTROL');
    call Pro_AddMenu('运营数据管理', '内容信息管理', '/erc/baseconfig/ERCContentManageControl', 'ERCCONTENTMANAGECONTROL');
/*end njc */
