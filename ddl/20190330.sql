SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/
insert into seqmysql values ('movematerielIDSeq',1,1,99999999);

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(95 , '挪料任务' , '挪料任务', now(), now());

DROP TABLE IF EXISTS `tbl_erc_ppmovemateriel`;
CREATE TABLE `tbl_erc_ppmovemateriel` (
  `ppmovemateriel_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `ppmaster_id` bigint(20) DEFAULT NULL,
  `ppmasterptdetail_id` bigint(20) DEFAULT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `ppmovemateriel_code` varchar(50) DEFAULT NULL,
  `ppmovemateriel_lack_number` int(11) DEFAULT '0',
  `ppmovemateriel_number` int(11) DEFAULT '0',
  `ppmovemateriel_date` datetime DEFAULT NULL,
  `ppmovemateriel_user_id` varchar(50) DEFAULT NULL,
  `ppmovemateriel_phone` varchar(50) DEFAULT NULL,
  `ppmovemateriel_state` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`ppmovemateriel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
