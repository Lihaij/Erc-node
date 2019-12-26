SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* add hlq */
ALTER TABLE tbl_erc_orderkujiale ADD COLUMN kujiale_planPic varchar(300) NUll DEFAULT '' AFTER `sync_state`;
ALTER TABLE tbl_erc_orderkujiale ADD COLUMN kujiale_commName varchar(50) NUll DEFAULT '' AFTER `kujiale_planPic`;
ALTER TABLE tbl_erc_orderkujiale ADD COLUMN kujiale_city varchar(100) NUll DEFAULT '' AFTER `kujiale_commName`;
ALTER TABLE tbl_erc_orderkujiale ADD COLUMN kujiale_srcArea double NOT NULL DEFAULT '0' AFTER `kujiale_city`;
ALTER TABLE tbl_erc_orderkujiale ADD COLUMN kujiale_specName varchar(50) NUll DEFAULT '' AFTER `kujiale_srcArea`;
/* end hlq */
