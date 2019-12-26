SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
INSERT INTO `seqmysql` VALUES ('applyIDSeq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('otherIDSeq', '0', '1', '99999999');
INSERT INTO `tbl_erc_taskallot` VALUES ('10', '入库申请', '分配入库申请审核人员', '1', '0', '2017-12-06 09:40:21', '2017-12-06 09:40:24');

/*end ty */


/* cici */
DROP TABLE IF EXISTS `tbl_erc_sitecase`;
CREATE TABLE `tbl_erc_sitecase` (
  `case_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `case_title` varchar(200) DEFAULT NULL,
  `case_subtitle` varchar(200) DEFAULT NULL,
  `case_content` text,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`case_id`)
) ;
/*end cici */