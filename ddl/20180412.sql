SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        VALUES(20 , '会议通知' , '通知会议室管理员', now(), now());
    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
        VALUES(21 , '会议通知' , '通知会议主持人', now(), now());
/*end ls */

/* njc */
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `sale_price` DOUBLE NUll AFTER `ordermateriel_remark`;
/*end njc */
