SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

call Pro_AddMenu('生产管理', '自制生产任务单','/erc/productionmanage/ERCProductiveTaskControl','ERCPRODUCTIVETASKCONTROL');
call Pro_AddMenu('生产管理', '委外生产任务单','/erc/productionmanage/ERCProductiveTaskOSControl','ERCPRODUCTIVETASKOSCONTROL');

ALTER TABLE `tbl_erc_productivetask_transfer` ADD COLUMN `appoint_user_id` varchar(30) AFTER `qualified_number`;
ALTER TABLE `tbl_erc_productivetask_transfer` ADD COLUMN `procedure_id` INTEGER AFTER `appoint_user_id`;

alter table tbl_erc_notice_org modify column department_id varchar(30);

ALTER TABLE `tbl_erc_docusergroup` ADD COLUMN `department_id` varchar(30) AFTER `usergroup_id`;
ALTER TABLE `tbl_erc_docusergroup` ADD COLUMN `position_id` varchar(30) AFTER `department_id`;

ALTER TABLE `tbl_erc_department` ADD COLUMN `vacation_type` INTEGER DEFAULT 0 AFTER `department_type`;

ALTER TABLE `tbl_erc_corporateclients` ADD COLUMN `corporateclients_category` INTEGER DEFAULT 0 AFTER `corporateclients_class`;

ALTER TABLE `tbl_erc_department` ADD COLUMN `work_time` INTEGER DEFAULT 0 AFTER `vacation_type`;

ALTER TABLE `tbl_erc_suppliermateriel` ADD COLUMN `guarantee_quality_time` varchar(20) AFTER `suppliermateriel_shortest_days`;
ALTER TABLE `tbl_erc_company` ADD COLUMN `sale_goods_tax_rate` INTEGER AFTER `company_dayoff_type`;
ALTER TABLE `tbl_erc_company` ADD COLUMN `provide_labor_tax_rate` INTEGER AFTER `sale_goods_tax_rate`;

ALTER TABLE `tbl_erc_productproceduredevice` ADD COLUMN `hour_capacity` INTEGER DEFAULT 0 AFTER `domain_id`;
ALTER TABLE `tbl_erc_productproceduredevice` ADD COLUMN `day_capacity` INTEGER DEFAULT 0 AFTER `hour_capacity`;

ALTER TABLE `tbl_erc_task` ADD COLUMN `task_classify` INTEGER DEFAULT 1 AFTER `require_complate_time`;
ALTER TABLE `tbl_erc_taskallot` ADD COLUMN `task_classify` INTEGER DEFAULT 1 AFTER `taskallot_describe`;
ALTER TABLE `tbl_erc_taskallot` MODIFY COLUMN `taskallot_id` bigint;
ALTER TABLE `tbl_erc_productionprocedure` ADD COLUMN `department_id` varchar(30) DEFAULT NULL AFTER `procedure_coefficient`;

ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `procedure_level` varchar(5) DEFAULT NULL AFTER `outsource_sign`;

ALTER TABLE `tbl_erc_qualitycheck` ADD COLUMN `qualitycheck_code` varchar(30) NOT NULL AFTER `qualitycheck_id`;

call Pro_AddMenu('生产管理', '车间维护', '/erc/productionmanage/ERCWorkshopControl', 'ERCWORKSHOPCONTROL');

DROP TABLE IF EXISTS `tbl_erc_productdevice_capacity`;
CREATE TABLE `tbl_erc_productdevice_capacity` (
  `productdevice_capacity_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productdevice_id` bigint(20) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `work_time` int(11) NOT NULL DEFAULT '0',
  `hour_capacity` int(11) NOT NULL DEFAULT '0',
  `day_capacity` int(11) NOT NULL DEFAULT '0',
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productdevice_capacity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

ALTER TABLE `tbl_erc_productionprocedure` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `department_id`;
ALTER TABLE `tbl_erc_profit` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_assetsliability` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_taxstatement` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;

ALTER TABLE `tbl_erc_invalidateorder` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `invalidate_remark`;
ALTER TABLE `tbl_erc_invalidateapplyorder` ADD COLUMN `scrap_warehouse_id` INTEGER DEFAULT NULL;
ALTER TABLE `tbl_erc_invalidateapplyorder` ADD COLUMN `scrap_warehouse_zone_id` INTEGER DEFAULT NULL;

ALTER TABLE `tbl_erc_order` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `order_delivery_date`;
ALTER TABLE `tbl_erc_qualitycheck` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `supplier_id`;
ALTER TABLE `tbl_erc_productivetask_procedure` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_amortize_payment` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_outsource` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `task_description`;
ALTER TABLE `tbl_erc_supplierpayment` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_taxpayment` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_receipt` ADD COLUMN `biz_code` varchar(30) DEFAULT NULL AFTER `check_state`;

call Pro_AddMenu('存货收发管理', '报废物料列表', '/erc/inventorymanage/ERCScrapMaterielControl', 'ERCSCRAPMATERIELCONTROL');
call Pro_AddMenu('存货收发管理', '拆解派工单列表', '/erc/inventorymanage/ERCDismantleMaterielControl', 'ERCDISMANTLEMATERIELCONTROL');
call Pro_AddMenu('生产管理', '生产物料列表', '/erc/productionmanage/ERCProductMaterielControl', 'ERCPRODUCTMATERIELCONTROL');

call Pro_AddMenu('存货收发管理', '产品入库自动领料', '/erc/inventorymanage/ERCAutoProductOutHistoryControl', 'ERCAUTOPRODUCTOUTHISTORYCONTROL');

ALTER TABLE `tbl_erc_stockmap` ADD COLUMN `storage_type` INTEGER DEFAULT 0 AFTER `safe_amount_temp`;
ALTER TABLE `tbl_erc_inventoryaccount` ADD COLUMN `inventory_price` DOUBLE DEFAULT 0 AFTER `account_operate_amount`;
