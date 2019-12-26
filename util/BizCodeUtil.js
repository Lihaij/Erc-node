const {
    biz_code
} = require('../model');
const tb_biz_code = biz_code;

module.exports = {
    CODE_NAME: {
        GDZC: 'GDZC', //固定资产
        SCGX: 'SCGX', //生产工序  tbl_erc_productionprocedure
        SCRW: 'SCRW', //生产任务单  tbl_erc_productivetask
        WLCG: 'WLCG', //物料采购单  tbl_erc_purchaseorder
        CPXS: 'CPXS', //产品销售单  tbl_erc_order
        ZZSSBB: 'ZZSSBB', //增值税纳税申报表  tbl_erc_taxstatement
        JDSSBB: 'JDSSBB', //季（月）度企业所得税申报表  tbl_erc_taxstatement
        NDSSBB: 'NDSSBB', //年度企业所得税申报表  tbl_erc_taxstatement
        MDSSBB: 'MDSSBB', //免抵退申报汇总表  tbl_erc_taxstatement
        LRBB: 'LRBB', //利润报表  tbl_erc_profit
        ZCFZBB: 'ZCFZBB', //资产负债报表  tbl_erc_assetsliability
        BFDH: 'BFDH', //报废申请单号  tbl_erc_invalidateorder
        CJPG: 'CJPG', //拆解派工单号  tbl_erc_dismantle_materiel
        SO: 'SO', //销售订单  tbl_erc_order
        PZJYD: 'PZJYD', //品质检验单  tbl_erc_qualitycheck
        GXYZDH: 'GXYZDH', //工序运转单号  tbl_erc_productivetask_procedure
        CQZC: 'CQZC', //长期资产付款  tbl_erc_amortize_payment
        WBFW: 'WBFW', //外包服务  tbl_erc_outsource
        SPFY: 'SPFY', //供应商付款  tbl_erc_supplierpayment
        YJSF: 'YJSF', //税费付款  tbl_erc_taxpayment
        CGRU: 'CGRU', //采购入库  tbl_erc_inventoryorder
        XSCK: 'XSCK', //销售出库  tbl_erc_inventoryorder
        CPRK: 'CPRK', //产品入库  tbl_erc_inventoryorder
        LLCK: 'LLCK', //领料出库  tbl_erc_inventoryorder
        QTRK: 'QTRK', //其他入库  tbl_erc_inventoryorder
        QTCK: 'QTCK', //其他出库  tbl_erc_inventoryorder
        WWRK: 'WWRK', //委外入库  tbl_erc_inventoryorder
        WWCK: 'WWCK', //委外出库  tbl_erc_inventoryorder
        RT: 'RT', //收货单号  tbl_erc_receipt
        CGSQ: 'CGSQ', //采购申请  tbl_erc_purchaseapply
        JZPZ: 'JZPZ', //记账凭证  tbl_erc_recordingvouchersc
        WGGDZCSG: 'WGGDZC', //外购固定资产申购  tbl_erc_fixedassetspurch,tbl_erc_fixedassetspurchdetail
        GYSFKSQ: 'GYSFKSQ', //供应商付款申请
        ZJZHBG: 'ZJZHBG', //资金账户变更
        JKSQ: 'JKSQ', //借款申请
        SGJZ: 'SGJZ', //记账凭证 tbl_erc_recordingvouchersc
        EWGZQR: 'EWGZQR', //额外工资确认 tbl_erc_salaryapplydetail
    },

    prefixInteger: (num, length) => {
        return (Array(length).join('0') + num).slice(-length);
    },

    genBizCode: async (code_name, domain_id, numLength, transaction) => {
        const validate = transaction ? true : null;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let bizCodeResult = await tb_biz_code.findOne({
            where: {
                domain_id,
                code_name,
            }
        });

        if (bizCodeResult) {
            const {
                record_year,
                record_month
            } = bizCodeResult;
            if (currentYear !== record_year || currentMonth !== record_month) {
                bizCodeResult.record_year = currentYear;
                bizCodeResult.record_month = currentMonth;
                bizCodeResult.current_index = 1;
                await bizCodeResult.save({
                    transaction,
                    validate
                });
            } else {
                bizCodeResult.current_index++;
                await bizCodeResult.save({
                    transaction,
                    validate
                });
            }
        } else {
            bizCodeResult = await tb_biz_code.create({
                domain_id,
                code_name,
                record_year: currentYear,
                record_month: currentMonth,
                current_index: 1
            }, {
                transaction,
                validate
            });
        }

        const {
            record_year,
            record_month,
            current_index
        } = bizCodeResult;
        const yearTag = record_year.toString().substr(2, 2);
        const monthTag = module.exports.prefixInteger(record_month, 2);
        const indexTag = module.exports.prefixInteger(current_index, numLength);
        return code_name + yearTag + monthTag + indexTag;
    }
};
