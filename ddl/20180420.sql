SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_common_domain MODIFY COLUMN updomain_id bigint(20) NUll;
ALTER TABLE tbl_common_domain MODIFY COLUMN domain_description varchar(200);
/*end ty */
