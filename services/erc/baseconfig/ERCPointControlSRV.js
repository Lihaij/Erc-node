/**
 * Created by shuang.liu on 18/5/3.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCPointControlSRV');
const model = require('../../../model');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_pointtype = model.erc_pointtype;
const tb_point = model.erc_customerpoint;
const tb_customer = model.erc_customer;

exports.ERCPointControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'getPoint') {
        getCustomerPointAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};


        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获取用户积分信息
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[];
        let queryStr='select t.* from tbl_erc_customerpoint t where t.state=1';
        if (doc.search_text){
            queryStr += ' and t.customerpoint_name like ? ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
        }
        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.updated_at = r.updated_at ? moment(r.updated_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//新增积分
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let addPointType = await tb_pointtype.create({
            customerpoint_name:doc.customerpoint_name,
            base_point: doc.base_point,
            pointtype_remarks:doc.pointtype_remarks
        });
        common.sendData(res, addPointType)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改积分
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modPointType = await tb_pointtype.findOne({
            where: {
                pointtype_id: doc.old.pointtype_id
            }
        });
        if (modPointType) {
            modPointType.customerpoint_name = doc.new.customerpoint_name;
            modPointType.base_point = doc.new.base_point;
            modPointType.pointtype_remarks = doc.new.pointtype_remarks;

            await modPointType.save();

        } else {
            common.sendError(res, 'point_01');
            return
        }


    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//删除积分
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modPointType = await tb_pointtype.findOne({
            where: {
                pointtype_id: doc.old.pointtype_id
            }
        });
        if (modPointType) {
            modPointType.state = GLBConfig.DISABLE;

            await modPointType.save();

        } else {
            common.sendError(res, 'point_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//获取用户积分
async function getCustomerPointAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let point=0;
        let customerInfo = await tb_customer.findOne({
            where: {
                user_id: doc.user_id
            }
        });
        if (customerInfo) {
            point=customerInfo.customer_point;
        }
        returnData.point = point;
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

//更新客户积分
// user_id:客户id;
// pointtype_id：积分分类，对应tbl_erc_pointtype表中pointtype_id;
// coefficient：积分系数，本次增加积分值customer_point=coefficient*base_point;
// order_id:销售单号（选填）;
// customerpoint_remarks：备注（选填）
exports.updateUserPoint = async(user_id, pointtype_id, coefficient, order_id,customerpoint_remarks) => {
    let isSuccess = false;

    let modPointType = await tb_pointtype.findOne({
        where: {
            pointtype_id: pointtype_id
        }
    });
    if(modPointType){
        let customer_point=0;
        if(coefficient){
            customer_point=coefficient*modPointType.base_point;
            //新增积分记录
            let addPoint = await tb_point.create({
                user_id:user_id,
                pointtype_id: pointtype_id,
                customer_point: customer_point,
                order_id: order_id,
                customerpoint_remarks: customerpoint_remarks
            });

            //更新用户表当前用户积分
            let customer = await tb_customer.findOne({
                where: {
                    user_id: user_id
                }
            });
            if(customer){
                customer.customer_point = customer.customer_point+customer_point;
                await customer.save();

                isSuccess = customer;
            }else{
                logger.error("当前客户不存在")
            }
        }else {
            logger.error("请传入参数'coefficient'")
        }
    }else{
        logger.error("积分基础类别不存在")
    }
    return isSuccess;

};

//查询当前客户可用积分
exports.getCustomerPoint = async(user_id) => {
    let returnData = {};
    let point = 0;

    let customerInfo = await tb_customer.findOne({
        where: {
            user_id: user_id
        }
    });
    if(customerInfo){
        point=customerInfo.customer_point;

    }
    returnData.point = point;

    return returnData;

};