/**
 * Created by BaiBin on 2019/7/11.
 */

const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCHomePageControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');

const sequelize = model.sequelize
const tb_user = model.common_user;
const tb_department = model.erc_department;
const tb_uploadfile = model.erc_uploadfile;
const tb_othermain = model.erc_othermain;

exports.ERCElectricControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'get_electric_provision') {
        getElectricProvisionAct(req, res);
    } else if (method === 'modify_electric_provision') {
        modifyElectricProvisionAct(req, res);
    } else if (method === 'calculate_electric') {
        calculateElectricAct(req, res);
    } else if (method === 'calculate_electric_day') {
        calculateElectricDayAct(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
}

//初始化数据
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        const otherMains = await tb_othermain.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        let other_main_info = [];
        for (const o of otherMains) {
            other_main_info.push({
                id: o.other_main_id,
                value: o.other_main_id,
                text: o.other_main_name
            })
        }
        let returnData = {
            need_invoice_info: GLBConfig.NEED_INVOICE,//需要的发票类型
            other_main_info,//其他相关主体
        }
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//房屋计提查找
async function getElectricProvisionAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr = `select d.* from tbl_erc_department d
         where d.state = 1 and d.domain_id = ?`

        replacements.push(user.domain_id);

        if (doc.search_text) {
            queryStr += ' and (d.department_id like ? or d.department_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        for (let i = 0; i < result.data.length; i++) {
            result.data[i].electric_money = result.data[i].electric_money / 100;
            result.data[i].electric_pre_money = result.data[i].electric_pre_money / 100;
        }
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//修改房屋计提
async function modifyElectricProvisionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let department = await tb_department.findOne({
            where: {
                department_id: doc.old.department_id
            }
        });
        if (department) {
            department.electric_amount = doc.new.electric_amount;
            department.electric_money = doc.new.electric_money * 100;
            department.electric_pre_money = doc.new.electric_pre_money * 100;
            department.electric_other_main_id = doc.new.electric_other_main_id;
            department.electric_need_invoice = doc.new.electric_need_invoice;
            await department.save();
        }
        //数据*100，返回给用户需要/100
        department.electric_pre_money = department.electric_pre_money /100;
        department.electric_money = department.electric_money /100;
        common.sendData(res, department);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//计算电费，按月计提
async function calculateElectricAct(req, res) {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        for (let i = 0; i < departments.length; i++) {
            const department = departments[i];

            //都有值，才会生成记账凭证
            if (department.electric_amount === 0 || department.electric_money === 0 || department.electric_pre_money === 0 || !department.electric_other_main_id) {
                continue;
            }
            //计算实际电费
            const avg_rent = (department.electric_amount * department.electric_money / 100).toFixed(2);
            //计算计提金额，多退少补
            const money = avg_rent - (department.electric_pre_money / 100);
            //生成记账凭证
            await RecordingVouchersc.createRecordingVoucherSCJT('SDFJT', user, {department_id: department.department_id, other_main_id: department.electric_other_main_id,amount: money,amount_type: 2});
        }
        common.sendData(res, {})
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//计算电费，按天计提
async function calculateElectricDayAct(req, res) {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        for (let i = 0; i < departments.length; i++) {
            const department = departments[i];

            //都有值，才会生成记账凭证
            if (department.electric_amount === 0 || department.electric_money === 0 || department.electric_pre_money === 0 || !department.electric_other_main_id) {
                continue;
            }
            //计算实际电费
            const avg_rent = (department.electric_amount * department.electric_money / 100).toFixed(2);
            //计算计提金额，多退少补
            const money = avg_rent - (department.electric_pre_money / 100);
            //生成记账凭证
            await RecordingVouchersc.createRecordingVoucherSCJT('SDFJT', user, {department_id: department.department_id, other_main_id: department.electric_other_main_id,amount: money,amount_type: 2});
        }
        common.sendData(res, {})
    } catch (error) {
        return common.sendFault(res, error);
    }
}

