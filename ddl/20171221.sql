SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/* LJZ */
ALTER TABLE tbl_erc_materiel modify materiel_sale double NUll DEFAULT '0';
ALTER TABLE tbl_erc_reviewmateriel modify review_materiel_sale double NUll DEFAULT '0';
ALTER TABLE tbl_erc_reviewmateriel modify review_materiel_cost double NUll DEFAULT '0';
ALTER TABLE tbl_erc_materiel modify materiel_cost double NUll DEFAULT '0';
/*end LJZ */


/* LJZ */
ALTER TABLE tbl_erc_suppliermateriel modify suppliermateriel_purchaseprice double NUll;
ALTER TABLE tbl_erc_suppliermateriel modify suppliermateriel_purchasepricetax double NUll;
/*end LJZ */

