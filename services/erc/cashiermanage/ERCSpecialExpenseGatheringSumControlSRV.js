/**
 * Created by Cici on 2018/4/26.
 */
/**
 * 资金支出管理
 */
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');


// tables
const sequelize = model.sequelize;
const tb_specialexpensesum = model.erc_specialexpensesum;
const tb_cashiergatheringsum = model.erc_cashiergatheringsum;
const tb_department = model.erc_department;
const tb_recordingvouchersc = model.erc_recordingvouchersc;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;

exports.ERCSpecialExpenseGatheringSumResource = (req, res) => {
    let method = req.query.method;
    if(method==='init'){
        initAct(req,res)
    }else if (method === 'dataExtractS') {
        dataExtractS(req, res)
    }else if(method == 'dataExtractC') {
        dataExtractC(req,res)
    }else if (method==='getSpecialexpenseSum') {
        getSpecialexpenseSum(req,res)
    }else if (method==='getCashiergatheringSum'){
        getCashiergatheringSum(req,res)
    }else if (method==='getSpecialexpenseSumDetail'){
        getSpecialexpenseSumDetail(req,res)
    }else if (method==='getCashiergatheringSumDetail'){
        getCashiergatheringSumDetail(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req,res) {
    try {
        let returnData = {}
        returnData.CAPITALCOSTTYLE = GLBConfig.CAPITALCOSTTYLE;
        common.sendData(res, returnData)
    }catch (error){
        common.sendFault(res, error);
    }

}
// 客户收款
async function dataExtractC(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],queryStr='',detailCount=0,delResult,sumMoney=0

        replacements.push(user.domain_id);
        replacements.push(doc.search_date);
        queryStr = `delete from tbl_erc_cashiergatheringsum where state=1 
            and domain_id=? and cashiergatheringsum_time = ?`
        delResult = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        queryStr = `delete td.* from tbl_erc_recordingvoucherdetailsc td,tbl_erc_recordingvouchersc t 
            where td.recordingvouchersc_id=t.recordingvouchersc_id 
            and t.domain_id=? and t.recordingvouchersc_time = ? and t.recordingvouchersc_type = 1`
        delResult = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        queryStr = `delete from tbl_erc_recordingvouchersc where state=1 
            and domain_id=? and recordingvouchersc_time = ? and recordingvouchersc_type = 1`
        delResult = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        replacements=[];
        queryStr = `select d.department_id,s.domain_id,
            sum(cashiergathering_gathering_money) as cashiergathering_gathering_money_sum 
            from tbl_erc_cashiergathering s 
            left join tbl_common_user u on (s.cashiergathering_declarant = u.user_id and u.state = 1) 
            left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1 
            left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
            where s.state=1 and cashiergathering_state = 2 and s.domain_id=?
            and cashiergathering_examine_time >= ? and cashiergathering_examine_time <= ?
            group by d.department_id,s.domain_id`;
        replacements.push(user.domain_id);
        replacements.push(doc.search_date + ' 00:00:00');
        replacements.push(doc.search_date + ' 23:59:59');
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for(let r of result){
            //客户收款汇总表
            let cashiergatheringsum_code = await Sequence.genCashiergatheringSumID(user);
            let addCashiergatheringsum = await tb_cashiergatheringsum.create({
                domain_id:r.domain_id,
                cashiergatheringsum_code:cashiergatheringsum_code,
                cashiergatheringsum_depart_id:r.department_id,
                cashiergatheringsum_time:doc.search_date,
                cashiergatheringsum_content:'客户收款申报单',
                cashiergatheringsum_amount:r.cashiergathering_gathering_money_sum
            })

            //记账凭证
            replacements = [];
            let queryStrCount = `select count(*) as count from tbl_erc_cashiergathering s 
                left join tbl_common_user u on (s.cashiergathering_declarant = u.user_id and u.state = 1) 
                left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1 
                left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
                where s.state=1 and cashiergathering_state = 2 and s.domain_id=? 
                and cashiergathering_examine_time >= ? and cashiergathering_examine_time <= ? 
                and d.department_id = ?`;
            replacements.push(r.domain_id);
            replacements.push(doc.search_date + ' 00:00:00');
            replacements.push(doc.search_date + ' 23:59:59');
            replacements.push(r.department_id);
            let resultCount = await sequelize.query(queryStrCount, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
            if(resultCount && resultCount.length>0){
                detailCount = resultCount[0].count?resultCount[0].count:0
            }

            let genRecordingVoucherCID = await Sequence.genRecordingVoucherCID(user);
            let addRecordingvouchersc = await tb_recordingvouchersc.create({
                recordingvouchersc_code:genRecordingVoucherCID,
                domain_id:user.domain_id,
                recordingvouchersc_depart_id:r.department_id,
                recordingvouchersc_time:doc.search_date,
                recordingvouchersc_count:detailCount,
                recordingvouchersc_type:1,
                recordingvouchersc_user_id:user.user_id

            })

            //记账凭证明细
            replacements = [];
            queryStr = `select s.*,b.typedetail_name from tbl_erc_cashiergathering s 
                left join tbl_erc_basetypedetail b on (s.monetary_fund_type = b.basetypedetail_id and b.state=1)
                left join tbl_common_user u on (s.cashiergathering_declarant = u.user_id and u.state = 1) 
                left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1 
                left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
                where s.state=1 and cashiergathering_state = 2 and s.domain_id=? 
                and cashiergathering_examine_time >= ? and cashiergathering_examine_time <= ? 
                and d.department_id = ?`;
            replacements.push(r.domain_id);
            replacements.push(doc.search_date + ' 00:00:00');
            replacements.push(doc.search_date + ' 23:59:59');
            replacements.push(r.department_id);
            let resultDetailC = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
            for(let r of resultDetailC){

                let accsum = ''
                for(let p of GLBConfig.PAYMENTMETHOD){
                    if(r.payment_method == p.id){
                        accsum = p.text;
                    }
                }
                let activeAccount = ''
                if(r.payment_method == 0){
                    activeAccount = ''
                }else if (r.payment_method = 1){
                    activeAccount = r.bank_account
                }else{
                    activeAccount = r.typedetail_name
                }
                let recordingvoucherdetailsc = await tb_recordingvoucherdetailsc.create({
                    domain_id:user.domain_id,
                    recordingvouchersc_id:addRecordingvouchersc.recordingvouchersc_id,
                    recordingvoucherdetailsc_digest:'收款申请单',//  摘要
                    recordingvoucherdetailsc_accsum:accsum,//   总账科目
                    recordingvoucherdetailsc_activeAccount:activeAccount,//  科目明细
                    recordingvoucherdetailsc_debite:r.cashiergathering_gathering_money,//借方金额
                    recordingvoucherdetailsc_credit:'',//贷方金额
                    recordingvoucherdetailsc_type:'1',//0贷，1借
                    recordingvoucherdetailsc_GLtype:0,   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    recordingvoucherdetailsc_depart_id:r.department_id//部门
                })

                sumMoney += r.cashiergathering_gathering_money;
            }

            let recordingvoucherdetailsc = await tb_recordingvoucherdetailsc.create({
                domain_id:user.domain_id,
                recordingvouchersc_id:addRecordingvouchersc.recordingvouchersc_id,
                recordingvoucherdetailsc_digest:'收款申请单',//  摘要
                recordingvoucherdetailsc_accsum:'应收账款',//   总账科目
                recordingvoucherdetailsc_activeAccount:'',//  科目明细
                recordingvoucherdetailsc_debite:'',//借方金额
                recordingvoucherdetailsc_credit:sumMoney,//贷方金额
                recordingvoucherdetailsc_type:'0',//0贷，1借
                recordingvoucherdetailsc_GLtype:0,   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                recordingvoucherdetailsc_depart_id:r.department_id//部门

            });
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
//费用报销(资金支出)
async function dataExtractS(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],
            queryStr='',detailCount = 0,delResult,department_name,sumMoney= 0,
            accsum = '',activeAccount = '',GLtype=''

        replacements.push(user.domain_id);
        replacements.push(doc.search_date);
        //汇总表
        queryStr = `delete from tbl_erc_specialexpensesum where state=1 
            and domain_id=? and s_expense_sum_time = ?`
        delResult = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        //记账凭证明细
        queryStr = `delete td.* from tbl_erc_recordingvoucherdetailsc td,tbl_erc_recordingvouchersc t 
            where td.recordingvouchersc_id=t.recordingvouchersc_id 
            and t.domain_id=? and t.recordingvouchersc_time = ? and t.recordingvouchersc_type = 0`
        delResult = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        //记账凭证
        queryStr = `delete from tbl_erc_recordingvouchersc where state=1 
            and domain_id=? and recordingvouchersc_time = ? and recordingvouchersc_type = 0`
        delResult = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        //资金支出汇总表
        replacements=[];
        queryStr = `select d.department_id,p.domain_id,d.department_type,
            sum(paymentconfirm_no_invoice_fee) as paymentconfirm_no_invoice_fee,
            sum(paymentconfirm_have_invoice_fee) as paymentconfirm_have_invoice_fee,
            sum(paymentconfirm_money) as paymentconfirm_money 
            from tbl_erc_paymentconfirm p 
            left join tbl_common_user u on (p.paymentconfirm_declarant = u.user_id and u.state = 1) 
            left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1 
            left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
            where p.state=1 and paymentconfirm_state = 2 and p.domain_id=? 
            and p.paymentconfirm_examine_time >= ? and p.paymentconfirm_examine_time <= ?
            group by d.department_id,p.domain_id,d.department_type`
        replacements.push(user.domain_id);
        replacements.push(doc.search_date + ' 00:00:00')
        replacements.push(doc.search_date + ' 23:59:59')
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for(let r of result) {
            sumMoney = 0
            let s_expense_sum_code = await Sequence.genSpecialExpenseSumID(user);
            let addSpecialexpensesum = await tb_specialexpensesum.create({
                domain_id: r.domain_id,
                s_expense_sum_code: s_expense_sum_code,
                s_expense_sum_depart_id: r.department_id,
                s_expense_sum_time: doc.search_date,
                s_expense_sum_content: '费用报销申请单',
                s_expense_sum_amount: r.paymentconfirm_money,
                s_no_invoice_sum_fee: r.paymentconfirm_no_invoice_fee,
                s_have_invoice_sum_fee: r.paymentconfirm_have_invoice_fee
            })

            //记账凭证
            replacements = [];
            let queryStrCount = `select count(*) as count 
                from tbl_erc_paymentconfirm p
                left join tbl_common_user u on (p.paymentconfirm_declarant = u.user_id and u.state = 1)
                left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1
                left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
                where p.state=1 and paymentconfirm_state = 2 and p.domain_id=? 
                and p.paymentconfirm_examine_time >= ? and p.paymentconfirm_examine_time <= ?
                and d.department_id = ?`;
            replacements.push(r.domain_id);
            replacements.push(doc.search_date + ' 00:00:00');
            replacements.push(doc.search_date + ' 23:59:59');
            replacements.push(r.department_id);
            let resultCount = await sequelize.query(queryStrCount, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
            if(resultCount && resultCount.length>0){
                detailCount = resultCount[0].count?resultCount[0].count:0
            }

            let genRecordingVoucherSID = await Sequence.genRecordingVoucherSID(user);
            let addRecordingvouchersc = await tb_recordingvouchersc.create({
                recordingvouchersc_code:genRecordingVoucherSID,
                domain_id:user.domain_id,
                recordingvouchersc_depart_id:r.department_id,
                recordingvouchersc_time:doc.search_date,
                recordingvouchersc_count:detailCount,
                recordingvouchersc_type:0,
                recordingvouchersc_user_id:user.user_id
            })

            //记账凭证明细
            queryStr = `select p.*,d.department_name,b.typedetail_name 
                from tbl_erc_paymentconfirm p
                left join tbl_erc_basetypedetail b on (p.s_expense_type_id = b.basetypedetail_id and b.state=1)
                left join tbl_common_user u on (p.paymentconfirm_declarant = u.user_id and u.state = 1)
                left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1
                left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
                where p.state=1 and paymentconfirm_state = 2 and p.domain_id=? 
                and p.paymentconfirm_examine_time >= ? and p.paymentconfirm_examine_time <= ?
                and d.department_id = ?`;
            replacements.push(r.domain_id);
            replacements.push(doc.search_date + ' 00:00:00');
            replacements.push(doc.search_date + ' 23:59:59');
            replacements.push(r.department_id);
            let resultDetail = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
            for(let rd of resultDetail){
            // ****************（贷）****************
                accsum = '',activeAccount = ''
                for(let c of GLBConfig.PAYMENTMETHOD){//总账科目
                    if(rd.payment_method == c.id){
                        accsum = c.text
                    }
                }

                if(rd.payment_method == 0){//   总账科目
                    activeAccount = ''
                }else if (rd.payment_method == 1){
                    activeAccount = rd.bank_account
                }else if (rd.payment_method == 2){
                    activeAccount = rd.typedetail_name
                }

                let recordingvoucherdetailscL = await tb_recordingvoucherdetailsc.create({
                    domain_id:user.domain_id,
                    recordingvouchersc_id:addRecordingvouchersc.recordingvouchersc_id,
                    recordingvoucherdetailsc_digest:'费用报销申请单',//  摘要
                    recordingvoucherdetailsc_accsum:accsum,//   总账科目
                    recordingvoucherdetailsc_activeAccount:activeAccount,//  科目明细
                    recordingvoucherdetailsc_debite:'',//借方金额
                    recordingvoucherdetailsc_credit:r.paymentconfirm_money,//贷方金额
                    recordingvoucherdetailsc_type:'0',//0贷，1借
                    recordingvoucherdetailsc_GLtype:0,   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    recordingvoucherdetailsc_depart_id:r.department_id//部门
                })

                // ****************（借）****************
                accsum = '',activeAccount = ''
                if(r.department_type == 0){
                    accsum = '制造费用';
                }else if (r.department_type == 1){
                    accsum = '销售费用';
                }else {
                    accsum = '管理费用';
                }

                activeAccount = rd.typedetail_name //  科目明细

                let recordingvoucherdetailscB = await tb_recordingvoucherdetailsc.create({
                    domain_id:user.domain_id,
                    recordingvouchersc_id:addRecordingvouchersc.recordingvouchersc_id,
                    recordingvoucherdetailsc_digest:'费用报销申请单',//  摘要
                    recordingvoucherdetailsc_accsum:accsum,//   总账科目
                    recordingvoucherdetailsc_activeAccount:activeAccount,//  科目明细
                    recordingvoucherdetailsc_debite:rd.paymentconfirm_money,//贷方金额
                    recordingvoucherdetailsc_credit:'',
                    recordingvoucherdetailsc_type:'1',//0贷，1借
                    recordingvoucherdetailsc_GLtype:4,   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    recordingvoucherdetailsc_depart_id:r.department_id//部门
                });


                sumMoney += rd.paymentconfirm_money;
            }
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSpecialexpenseSumDetail(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],returnData = {}

        let queryStr = `select p.*,d.department_id,d.department_name 
            from tbl_erc_paymentconfirm p 
            left join tbl_common_user u on (p.paymentconfirm_declarant = u.user_id and u.state = 1) 
            left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1 
            left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
            where p.state=1 and paymentconfirm_state = 2 and p.domain_id=? 
            and paymentconfirm_examine_time >= ? and paymentconfirm_examine_time <= ?
            and d.department_id = ?`;
        replacements.push(user.domain_id);
        replacements.push(doc.s_expense_confirm_time + ' 00:00:00');
        replacements.push(doc.s_expense_confirm_time + ' 23:59:59');
        replacements.push(doc.department_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.paymentconfirm_examine_time = moment(result.paymentconfirm_examine_time).format('YYYY-MM-DD')
            result.s_expense_content = '费用报销申请单'
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getCashiergatheringSumDetail(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],returnData = {}

        let queryStr = `select s.cashiergathering_id,s.domain_id,s.cashiergathering_examine_time,d.department_id,s.bank_account,
            s.cashiergathering_gathering_money,d.department_name 
            from tbl_erc_cashiergathering s 
            left join tbl_common_user u on (s.cashiergathering_declarant = u.user_id and u.state = 1) 
            left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id and ot.state=1 
            left join tbl_erc_department d on ot.department_id = d.department_id and d.state=1
            where s.state=1 and cashiergathering_state = 2 and s.domain_id=? 
            and cashiergathering_examine_time >= ? and cashiergathering_examine_time <= ? 
            and d.department_id = ?`;
        replacements.push(user.domain_id);
        replacements.push(doc.cashiergatheringsum_time + ' 00:00:00');
        replacements.push(doc.cashiergatheringsum_time + ' 23:59:59');
        replacements.push(doc.department_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.cashiergathering_examine_time = moment(result.cashiergathering_examine_time).format('YYYY-MM-DD')
            result.cashiergatheringsum_content = '客户收款申报单'
            result.cashiergatheringsum_digest = '客户销售业务款'
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getSpecialexpenseSum(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],returnData = {}

        let queryStr = `select * from tbl_erc_specialexpensesum where state=1 and domain_id=?`;
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.s_expense_sum_time = moment(result.s_expense_sum_time).format('YYYY-MM-DD')
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getCashiergatheringSum(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],returnData = {}

        let queryStr = `select * from tbl_erc_cashiergatheringsum where state=1 and domain_id=?`;
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.cashiergatheringsum_time = moment(result.cashiergatheringsum_time).format('YYYY-MM-DD')
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}