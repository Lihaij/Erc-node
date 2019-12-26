SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* nie */
/*ALTER TABLE `tbl_erc_purchaseapplydetail`
ADD COLUMN `room_id` bigint AFTER `remark`;*/
/*end nie */

/* ty */
ALTER TABLE tbl_erc_materiel modify materiel_loss double NUll DEFAULT '0';
ALTER TABLE tbl_erc_reviewmateriel modify review_materiel_loss double NUll DEFAULT '0';
ALTER TABLE tbl_erc_reviewmateriel modify review_materiel_tax double NUll DEFAULT '0';
ALTER TABLE tbl_erc_materiel modify materiel_tax double NUll DEFAULT '0';
/*end ty */


/* bb */
ALTER TABLE `tbl_erc_appointment`
ADD COLUMN `project_type` VARCHAR(4) NULL AFTER `ap_house_type`;
/*end bb */