/**
 * Created by BaiBin on 2019/3/12.
 */
const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const ERCRecord = require('./ERCRecordingVoucherCustomControlSRV');
const GLBConfig = require('../../../util/GLBConfig');
const XLSX = require('xlsx-style');
const validator = require('validator');

const moment = require('moment');
const sequelize = model.sequelize;
const tb_accountdetail = model.erc_accountingdetail;
const tb_accounting = model.erc_accounting;
const tb_basetypedetail = model.erc_basetypedetail;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const tb_monthwages = model.erc_monthwages;
const tb_employeewages = model.erc_employeewages;
const tb_user = model.common_user;

exports.ERCEmployeeWagesControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'search_wages') {
        searchWagesAct(req, res);
    } else if (method === 'add_wages'){
        addWagesAct(req, res);
    } else if (method === 'upload'){
        uploadAct(req, res);
    }  else if (method === 'search_employee_wages'){
        searchEmployeeWagesAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

//查找工资月
async function searchWagesAct(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const user = req.user;
        let returnData = {};
        const sql = `select * from tbl_erc_monthwages where domain_id = ?`;
        let result = await common.queryWithCount(sequelize, req, sql, [user.domain_id]);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.monthwages_date = r.monthwages_date ? moment(r.monthwages_date).format("YYYY-MM") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//查找员工工资
async function searchEmployeeWagesAct(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const user = req.user;
        let returnData = {};
        let sql = `select ew.*, de.department_name, de.department_id, po.position_id, po.position_name, u.name from tbl_erc_employeewages ew
            left join tbl_erc_custorgstructure cs on cs.user_id = ew.user_id
            left join tbl_erc_department de on de.department_id = cs.department_id
            left join tbl_erc_position po on po.position_id = cs.position_id
            left join tbl_common_user u on u.user_id = ew.user_id
            where ew.domain_id = ?`;
        if (doc.monthwages_id) {
            sql += ` and ew.monthwages_id = ${doc.monthwages_id}`;
        }
        let result = await common.queryWithCount(sequelize, req, sql, [user.domain_id]);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.should_wages = result.should_wages / 100;
            result.tax = result.tax / 100;
            result.social_security = result.social_security / 100;
            result.other_money = result.other_money / 100;
            result.actual_wages = result.actual_wages / 100;
            result.employeewages_date = result.employeewages_date / 100;
            returnData.rows.push(result);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//添加工资月
async function addWagesAct(req, res) {
    try {
        const { user } = req;
        const doc = common.docTrim(req.body);

        //控制事物
        await common.transaction(async function (t) {
            const worksheet = await common.exceltojson(doc.uploadurl);
            const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
            for (const itemData1 of excelJsonArray) {
                const [user_id, name,department_id, position_id,should_wages, tax,social_security,other_money,actual_wages] = Object.entries(itemData1);
                if (user_id && user_id[1]) {
                    const employee = await tb_user.findOne({
                        where: {
                            user_id: user_id[1],
                            domain_id: user.domain_id
                        }
                    });
                    if (!employee)
                        return common.sendError(res, '',`员工编号'${user_id[1]}'不存在`);
                } else {
                    return common.sendError(res, '',`员工编号不允许为空！`);
                }
                if(should_wages && should_wages[1]) {
                    if(!validator.isFloat(should_wages[1]))
                        return common.sendError(res, '',`应发工资'${should_wages[1]}'必须为数字`);
                } else {
                    return common.sendError(res, '',`应发工资不允许为空！`);
                }
                if(tax && tax[1]) {
                    if(!validator.isFloat(tax[1]))
                        return common.sendError(res, '',`代扣个人所得税'${tax[1]}'必须为数字`);
                } else {
                    return common.sendError(res, '',`代扣个人所得税不允许为空！`);
                }
                if(social_security && social_security[1]) {
                    if(!validator.isFloat(social_security[1]))
                        return common.sendError(res, '',`代扣社保'${social_security[1]}'必须为数字`);
                } else {
                    return common.sendError(res, '',`代扣社保不允许为空！`);
                }
                if(other_money && other_money[1]) {
                    if(!validator.isFloat(other_money[1]))
                        return common.sendError(res, '',`代扣其他款项'${other_money[1]}'必须为数字`);
                } else {
                    return common.sendError(res, '',`代扣其他款项不允许为空！`);
                }
                if(actual_wages && actual_wages[1]) {
                    if(!validator.isFloat(actual_wages[1]))
                        return common.sendError(res, '',`实际发放工资'${actual_wages[1]}'必须为数字`);
                } else {
                    return common.sendError(res, '',`实际发放工资不允许为空！`);
                }
            }

            const monthwages = await tb_monthwages.create({
                domain_id: user.domain_id,
                monthwages_date: doc.monthwages_date
            },{
                transaction: t
            });

            for(const itemData1 of excelJsonArray){
                const [user_id, name,department_id, position_id,should_wages, tax,social_security,other_money,actual_wages] = Object.entries(itemData1);
                await tb_employeewages.create({
                    monthwages_id: monthwages.monthwages_id,
                    domain_id: user.domain_id,
                    user_id: user_id[1],
                    should_wages: should_wages[1] * 100,
                    tax: tax[1] * 100,
                    social_security: social_security[1] * 100,
                    other_money: other_money[1] * 100,
                    actual_wages: actual_wages[1] * 100,
                    employeewages_date: doc.monthwages_date
                },{
                    transaction: t
                });
            }
        });
        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendFault(res, error);
    }
}

//上传文件
async function uploadAct(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {uploadurl: uploadurl})
    } catch (error) {
        common.sendFault(res, error);
    }
}




