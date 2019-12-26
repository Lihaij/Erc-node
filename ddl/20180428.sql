SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* cici */
INSERT INTO `seqmysql` VALUES ('transExpenseApplyIDSeq', '0', '1', '99999999');


ALTER TABLE `tbl_erc_transreceptionapply`
ADD COLUMN `trapply_traffic_fee` VARCHAR(1000)  DEFAULT NULL AFTER `trapply_recetion_crew_names`;

/*end cici */








