SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/


/* ty */

update tbl_common_api set api_name = '物料数据维护' where api_function = 'ERCMATERIELCONTROL';
update tbl_common_domainmenu set domainmenu_name = '物料数据维护' where api_function = 'ERCMATERIELCONTROL';
update tbl_common_systemmenu set systemmenu_name = '物料数据维护' where api_function = 'ERCMATERIELCONTROL';
update tbl_common_templatemenu set templatemenu_name = '物料数据维护' where api_function = 'ERCMATERIELCONTROL';

update tbl_common_api set api_name = '收款申请管理' where api_function = 'ERCGATHERINGCONTROL';
update tbl_common_domainmenu set domainmenu_name = '收款申请管理' where api_function = 'ERCGATHERINGCONTROL';
update tbl_common_systemmenu set systemmenu_name = '收款申请管理' where api_function = 'ERCGATHERINGCONTROL';
update tbl_common_templatemenu set templatemenu_name = '收款申请管理' where api_function = 'ERCGATHERINGCONTROL';

update tbl_common_api set api_name = '部门管理' where api_function = 'ERCDEPARTMENTCONTROL';
update tbl_common_domainmenu set domainmenu_name = '部门管理' where api_function = 'ERCDEPARTMENTCONTROL';
update tbl_common_systemmenu set systemmenu_name = '部门管理' where api_function = 'ERCDEPARTMENTCONTROL';
update tbl_common_templatemenu set templatemenu_name = '部门管理' where api_function = 'ERCDEPARTMENTCONTROL';

update tbl_common_api set api_name = '岗位管理' where api_function = 'ERCUSERGROUPCONTROL';
update tbl_common_domainmenu set domainmenu_name = '岗位管理' where api_function = 'ERCUSERGROUPCONTROL';
update tbl_common_systemmenu set systemmenu_name = '岗位管理' where api_function = 'ERCUSERGROUPCONTROL';
update tbl_common_templatemenu set templatemenu_name = '岗位管理' where api_function = 'ERCUSERGROUPCONTROL';

update tbl_common_api set api_name = '品质检验单列表' where api_function = 'ERCQUALITYCHECKCONTROL';
update tbl_common_domainmenu set domainmenu_name = '品质检验单列表' where api_function = 'ERCQUALITYCHECKCONTROL';
update tbl_common_systemmenu set systemmenu_name = '品质检验单列表' where api_function = 'ERCQUALITYCHECKCONTROL';
update tbl_common_templatemenu set templatemenu_name = '品质检验单列表' where api_function = 'ERCQUALITYCHECKCONTROL';

update tbl_common_api set api_name = '品质数据录入管理' where api_function = 'ERCQUALITYADDCONTROL';
update tbl_common_domainmenu set domainmenu_name = '品质数据录入管理' where api_function = 'ERCQUALITYADDCONTROL';
update tbl_common_systemmenu set systemmenu_name = '品质数据录入管理' where api_function = 'ERCQUALITYADDCONTROL';
update tbl_common_templatemenu set templatemenu_name = '品质数据录入管理' where api_function = 'ERCQUALITYADDCONTROL';

update tbl_common_api set api_name = '退货单列表' where api_function = 'ERCRETURNNOTECONTROL';
update tbl_common_domainmenu set domainmenu_name = '退货单列表' where api_function = 'ERCRETURNNOTECONTROL';
update tbl_common_systemmenu set systemmenu_name = '退货单列表' where api_function = 'ERCRETURNNOTECONTROL';
update tbl_common_templatemenu set templatemenu_name = '退货单列表' where api_function = 'ERCRETURNNOTECONTROL';

update tbl_common_api set api_name = '出差交通接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';
update tbl_common_domainmenu set domainmenu_name = '出差交通接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';
update tbl_common_systemmenu set systemmenu_name = '出差交通接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';
update tbl_common_templatemenu set templatemenu_name = '出差交通接待申请' where api_function = 'ERCTRANSRECEPTIONLISTCONTROL';

update tbl_common_api set api_name = '出差交通接待报销申请' where api_function = 'ERCTRANSRECEPTIONLISTEXPENSECONTROL';
update tbl_common_domainmenu set domainmenu_name = '出差交通接待报销申请' where api_function = 'ERCTRANSRECEPTIONLISTEXPENSECONTROL';
update tbl_common_systemmenu set systemmenu_name = '出差交通接待报销申请' where api_function = 'ERCTRANSRECEPTIONLISTEXPENSECONTROL';
update tbl_common_templatemenu set templatemenu_name = '出差交通接待报销申请' where api_function = 'ERCTRANSRECEPTIONLISTEXPENSECONTROL';

update tbl_common_api set api_name = '任务管理' where api_function = 'ERCTASKLISTCONTROL';
update tbl_common_domainmenu set domainmenu_name = '任务管理' where api_function = 'ERCTASKLISTCONTROL';
update tbl_common_systemmenu set systemmenu_name = '任务管理' where api_function = 'ERCTASKLISTCONTROL';
update tbl_common_templatemenu set templatemenu_name = '任务管理' where api_function = 'ERCTASKLISTCONTROL';

update tbl_common_api set api_name = '生产主计划' where api_function = 'ERCMASTERPLANCONTROL';
update tbl_common_domainmenu set domainmenu_name = '生产主计划' where api_function = 'ERCMASTERPLANCONTROL';
update tbl_common_systemmenu set systemmenu_name = '生产主计划' where api_function = 'ERCMASTERPLANCONTROL';
update tbl_common_templatemenu set templatemenu_name = '生产主计划' where api_function = 'ERCMASTERPLANCONTROL';

update tbl_common_api set api_name = '生产日计划' where api_function = 'ERCDAILYPLANCONTROL';
update tbl_common_domainmenu set domainmenu_name = '生产日计划' where api_function = 'ERCDAILYPLANCONTROL';
update tbl_common_systemmenu set systemmenu_name = '生产日计划' where api_function = 'ERCDAILYPLANCONTROL';
update tbl_common_templatemenu set templatemenu_name = '生产日计划' where api_function = 'ERCDAILYPLANCONTROL';

update tbl_common_api set api_name = '生产物料计划' where api_function = 'ERCWEEKLYPLANCONTROL';
update tbl_common_domainmenu set domainmenu_name = '生产物料计划' where api_function = 'ERCWEEKLYPLANCONTROL';
update tbl_common_systemmenu set systemmenu_name = '生产物料计划' where api_function = 'ERCWEEKLYPLANCONTROL';
update tbl_common_templatemenu set templatemenu_name = '生产物料计划' where api_function = 'ERCWEEKLYPLANCONTROL';

update tbl_common_api set api_name = '会议室数据维护' where api_function = 'ERCMEETINGROOMCONTROL';
update tbl_common_domainmenu set domainmenu_name = '会议室数据维护' where api_function = 'ERCMEETINGROOMCONTROL';
update tbl_common_systemmenu set systemmenu_name = '会议室数据维护' where api_function = 'ERCMEETINGROOMCONTROL';
update tbl_common_templatemenu set templatemenu_name = '会议室数据维护' where api_function = 'ERCMEETINGROOMCONTROL';

update tbl_common_api set api_name = '会议记录管理' where api_function = 'ERCMEETINGMINUTECONTROL';
update tbl_common_domainmenu set domainmenu_name = '会议记录管理' where api_function = 'ERCMEETINGMINUTECONTROL';
update tbl_common_systemmenu set systemmenu_name = '会议记录管理' where api_function = 'ERCMEETINGMINUTECONTROL';
update tbl_common_templatemenu set templatemenu_name = '会议记录管理' where api_function = 'ERCMEETINGMINUTECONTROL';

update tbl_common_api set api_name = '出库管理' where api_function = 'ERCSALEOUTCONTROL';
update tbl_common_domainmenu set domainmenu_name = '出库管理' where api_function = 'ERCSALEOUTCONTROL';
update tbl_common_systemmenu set systemmenu_name = '出库管理' where api_function = 'ERCSALEOUTCONTROL';
update tbl_common_templatemenu set templatemenu_name = '出库管理' where api_function = 'ERCSALEOUTCONTROL';

update tbl_common_api set api_name = '其他入库申请' where api_function = 'ERCSTOCKINAPPLYCONTROL';
update tbl_common_domainmenu set domainmenu_name = '其他入库申请' where api_function = 'ERCSTOCKINAPPLYCONTROL';
update tbl_common_systemmenu set systemmenu_name = '其他入库申请' where api_function = 'ERCSTOCKINAPPLYCONTROL';
update tbl_common_templatemenu set templatemenu_name = '其他入库申请' where api_function = 'ERCSTOCKINAPPLYCONTROL';

update tbl_common_api set api_name = '其他出库申请' where api_function = 'ERCSTOCKOUTAPPLYCONTROL';
update tbl_common_domainmenu set domainmenu_name = '其他出库申请' where api_function = 'ERCSTOCKOUTAPPLYCONTROL';
update tbl_common_systemmenu set systemmenu_name = '其他出库申请' where api_function = 'ERCSTOCKOUTAPPLYCONTROL';
update tbl_common_templatemenu set templatemenu_name = '其他出库申请' where api_function = 'ERCSTOCKOUTAPPLYCONTROL';

update tbl_common_api set api_name = '仓库仓区管理' where api_function = 'ERCWAREHOUSECONTROL';
update tbl_common_domainmenu set domainmenu_name = '仓库仓区管理' where api_function = 'ERCWAREHOUSECONTROL';
update tbl_common_systemmenu set systemmenu_name = '仓库仓区管理' where api_function = 'ERCWAREHOUSECONTROL';
update tbl_common_templatemenu set templatemenu_name = '仓库仓区管理' where api_function = 'ERCWAREHOUSECONTROL';

update tbl_common_api set api_name = '实时库存数据管理' where api_function = 'ERCINVENTORYCONTROL';
update tbl_common_domainmenu set domainmenu_name = '实时库存数据管理' where api_function = 'ERCINVENTORYCONTROL';
update tbl_common_systemmenu set systemmenu_name = '实时库存数据管理' where api_function = 'ERCINVENTORYCONTROL';
update tbl_common_templatemenu set templatemenu_name = '实时库存数据管理' where api_function = 'ERCINVENTORYCONTROL';

update tbl_common_api set api_name = '收发存数据管理' where api_function = 'ERCINVENTORYDETAILCONTROL';
update tbl_common_domainmenu set domainmenu_name = '收发存数据管理' where api_function = 'ERCINVENTORYDETAILCONTROL';
update tbl_common_systemmenu set systemmenu_name = '收发存数据管理' where api_function = 'ERCINVENTORYDETAILCONTROL';
update tbl_common_templatemenu set templatemenu_name = '收发存数据管理' where api_function = 'ERCINVENTORYDETAILCONTROL';

update tbl_common_api set api_name = '产品规划列表' where api_function = 'ERCPRODUCTPLANCONTROL';
update tbl_common_domainmenu set domainmenu_name = '产品规划列表' where api_function = 'ERCPRODUCTPLANCONTROL';
update tbl_common_systemmenu set systemmenu_name = '产品规划列表' where api_function = 'ERCPRODUCTPLANCONTROL';
update tbl_common_templatemenu set templatemenu_name = '产品规划列表' where api_function = 'ERCPRODUCTPLANCONTROL';

update tbl_common_api set api_name = '供应商管理' where api_function = 'ERCSUPPLIERCONTROL';
update tbl_common_domainmenu set domainmenu_name = '供应商管理' where api_function = 'ERCSUPPLIERCONTROL';
update tbl_common_systemmenu set systemmenu_name = '供应商管理' where api_function = 'ERCSUPPLIERCONTROL';
update tbl_common_templatemenu set templatemenu_name = '供应商管理' where api_function = 'ERCSUPPLIERCONTROL';

update tbl_common_api set api_name = '车辆数据维护' where api_function = 'ERCVEHICLECONTROL';
update tbl_common_domainmenu set domainmenu_name = '车辆数据维护' where api_function = 'ERCVEHICLECONTROL';
update tbl_common_systemmenu set systemmenu_name = '车辆数据维护' where api_function = 'ERCVEHICLECONTROL';
update tbl_common_templatemenu set templatemenu_name = '车辆数据维护' where api_function = 'ERCVEHICLECONTROL';

/*end ty */

/* qm */

ALTER TABLE tbl_erc_productmaterielverify ADD COLUMN verify_type INTEGER NOT NULL;

/*end qm */
