/**
 * 交通接待报销维护
 * Created by Cici.
 */

const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');

// tables
const sequelize = model.sequelize;
const tb_trafficreceptionexpense = model.erc_trafficreceptionexpense;

exports.ERCTransReceptionExpenseResource = ( req,res ) => {
    let method=req.query.method;
    if(method==='search'){
        searchAct(req,res);
    }else if(method==='remove'){
        removeAct(req,res)
    }else if (method === 'init'){
        initAct(req, res)
    } else {
        common.sendError(res,'common_01');
    }
}

let initAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        returnData.payment_confirm_state = GLBConfig.PAYMENTCONFIRMSTATE;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//查询报销信息
let searchAct = async (req,res)=>{
    try{
        let doc = common.docTrim(req.body) , user = req.user, returnData={};

        let queryStr='select b.*,p.paymentconfirm_state from  tbl_common_domain a ' +
            'left join tbl_erc_trafficreceptionexpense b on a.domain_id = b.domain_id ' +
            'left join tbl_erc_paymentconfirm p on (b.tr_expense_code = p.paymentconfirm_source_code and p.state=1)' +
            'where b.domain_id = ? and b.state = ?';
        let replacements =[user.domain_id,GLBConfig.ENABLE];

        if(doc.search_text){
            queryStr+='and (b.tr_expense_code like ? or b.tr_expense_creator_name like ?)';
            replacements.push(queryStr);
            replacements.push(queryStr);
        }
        if(doc.created_at){
            queryStr+='and b.created_at >= ? and b.created_at <= ?';
            replacements.push(doc.created_at+'00:00:00');
            replacements.push(doc.created_at+'23:59:59');
        }

        if(doc.tr_expense_creator_id){
            queryStr+='and b.tr_expense_creator_id = ?';
            replacements.push(doc.tr_expense_creator_id);
        }

        let result= await common.queryWithCount(sequelize ,req,queryStr,replacements);

        returnData.total=result.count;
        returnData.rows=[];

        for(var i of result.data){
            let temy= JSON.parse(JSON.stringify(i));
            if(!temy.paymentconfirm_state){
                temy.paymentconfirm_state = 1
            }
            temy.created_at=i.created_at?moment(i.created_at).format("YYYY-MM-DD HH:mm") :null;
            temy.tr_expense_confirm_time=i.tr_expense_confirm_time? moment(i.tr_expense_confirm_time).format("YYYY-MM-DD HH:mm") :null;
            returnData.rows.push(temy);
        }

        common.sendData(res,returnData);

    }catch(error){
        logger.error('ERCTransReceptionExpenseResource-searchAct:'+error);
        common.sendFault(res,error);
    }
};
//移除交通接待报销信息
let removeAct = async(req,res)=>{
    try{
        let doc=common.docTrim(req.body);

        if(!doc.tr_expense_id){
            common.sendError(res,'trafficApply_01');
            return
        }

        let expense=await tb_trafficreceptionexpense.findOne({
            where:{
                tr_expense_id:doc.tr_expense_id
            }
        })

        if(expense){
            expense.state=GLBConfig.DISABLE;
            await expense.save();
            common.sendData(res,expense);
        }else {
            common.sendError(res,'trafficApply_01');
        }
    }catch(error){
        logger.error('ERCTransReceptionExpenseResource-removeAct:'+error);
        common.sendFault(res,error);
    }
};