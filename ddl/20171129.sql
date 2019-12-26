
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/



/*
  add your ddl
*/

/*hlq*/
/*ALTER TABLE `tbl_erc_orderroom`
ADD COLUMN `room_area` double NOT NULL DEFAULT '0' AFTER `room_name`;*/
/*end hlq*/

/*bb*/
ALTER TABLE `tbl_erc_orderreview`
CHANGE COLUMN `review_date` `review_date` DATETIME NULL DEFAULT NULL ,
CHANGE COLUMN `duty_user_id` `duty_user_id` VARCHAR(50) NULL DEFAULT NULL ;

ALTER TABLE `tbl_erc_orderinternalreview`
CHANGE COLUMN `duty_user_id` `duty_user_id` VARCHAR(50) NULL DEFAULT NULL ;
/*end bb*/
