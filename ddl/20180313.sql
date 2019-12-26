SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_common_user modify direct_leadership varchar(30) DEFAULT NULL;

/*end ty */