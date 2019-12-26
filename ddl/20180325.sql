SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* bb */
CREATE TABLE `tbl_erc_decorateinfo` (
  `decorate_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `decorate_img_id` bigint(20) DEFAULT NULL,
  `decorate_title` varchar(50) DEFAULT NULL,
  `decorate_url` varchar(100) DEFAULT NULL,
  `decorate_create_id` varchar(30) DEFAULT NULL,
  `decorate_create_name` varchar(50) DEFAULT NULL,
  `decorate_type` varchar(5) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `is_sale` varchar(5) DEFAULT NULL,
  `mark` varchar(100) DEFAULT NULL,
  `decorate_description` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`decorate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

CREATE TABLE `tbl_erc_usercollection` (
  `collection_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(30) DEFAULT NULL,
  `open_id` varchar(30) DEFAULT NULL,
  `decorate_id` bigint(20) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`collection_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*end bb */