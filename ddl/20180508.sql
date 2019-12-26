SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ls */

INSERT INTO tbl_erc_pointtype(pointtype_id,customerpoint_name,base_point,pointtype_remarks,created_at,updated_at)
VALUES(2,'手动修改积分',1,'用户手动增加或减少积分',now(),now());

INSERT INTO tbl_erc_pointtype(pointtype_id,customerpoint_name,base_point,pointtype_remarks,created_at,updated_at)
VALUES(3,'订单完成',1,'订单完成时增加用户积分',now(),now());

/*end ls */
