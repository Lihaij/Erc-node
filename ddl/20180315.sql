SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE `tbl_common_user`
ADD COLUMN `standard_img` varchar(200) NUll DEFAULT '' AFTER `emergency_contact_qq`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `photo_title` varchar(200) NUll DEFAULT '' AFTER `standard_img`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `goupload_format` varchar(200) NUll DEFAULT '' AFTER `photo_title`;
/*end ty */