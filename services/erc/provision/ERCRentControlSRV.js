/**
 * Created by BaiBin on 2019/7/8.
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

exports.ERCRentControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'get_rent_provision') {
        getRentProvisionAct(req, res);
    } else if (method === 'modify_rent_provision') {
        modifyRentProvisionAct(req, res);
    } else if (method === 'calculate_rent') {
        calculateRentAct(req, res);
    } else if (method === 'calculate_rent_day') {
        calculateRentDayAct(req, res);
    } else if (method === 'calculate_food') {
        calculateFoodAct(req, res);
    } else if (method === 'calculate_food_day') {
        calculateFoodDayAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
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
async function getRentProvisionAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr = `select d.*, f.file_name, f.file_url from tbl_erc_department d
        left join tbl_erc_uploadfile f on d.rent_file_id = f.file_id
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
            result.data[i].rent_house_area = result.data[i].rent_house_area / 100;
            result.data[i].rent_month = result.data[i].rent_month / 100;
        }
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//修改房屋计提
async function modifyRentProvisionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let department = await tb_department.findOne({
            where: {
                department_id: doc.old.department_id
            }
        });
        if (department) {
            department.rent_house_area = doc.new.rent_house_area * 100;
            department.rent_month = doc.new.rent_month * 100; //装修地址
            department.rent_file_id = doc.new.rent_file_id;
            department.rent_need_invoice = doc.new.rent_need_invoice;
            department.rent_other_main_id = doc.new.rent_other_main_id;
            await department.save();
        }
        //数据*100，返回给用户需要/100
        department.rent_house_area = department.rent_house_area /100;
        department.rent_month = department.rent_month /100;
        common.sendData(res, department);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//计算房租，多退少补
async function calculateRentAct(req, res) {
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
            if (department.rent_house_area === 0 || department.rent_month === 0 || !department.rent_file_id || !department.rent_other_main_id) {
                continue;
            }
            //获取当月天数
            const days = moment().daysInMonth();
            if (days === 30) continue;
            //获取平均每天的房租
            const avg_rent = (department.rent_month / (30 * 100)).toFixed(2);
            //计算计提金额，多退少补
            const money = (days - 30) * avg_rent;
            //生成记账凭证
            await RecordingVouchersc.createRecordingVoucherSCJT('FZJT', user, {department_id: department.department_id, other_main_id: department.rent_other_main_id,amount: money});
        }
        common.sendData(res, {})
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//房租按天计提
async function calculateRentDayAct(req, res) {
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
            if (department.rent_house_area === 0 || department.rent_month === 0 || !department.rent_file_id || !department.rent_other_main_id) {
                continue;
            }
            //获取平均每天的房租
            const avg_rent = (department.rent_month / (30 * 100)).toFixed(2);
            //生成记账凭证
            await RecordingVouchersc.createRecordingVoucherSCJT('FZJT', user, {department_id: department.department_id, other_main_id: department.rent_other_main_id,amount: avg_rent});
        }
        common.sendData(res, {})
    } catch (error) {
        return common.sendFault(res, error);
    }
}


let uploadAct = async (req, res) => {
    try {
        let user = req.user;
        let f = await common.fileSave(req)
        let fileUrl = await common.fileMove(f.url, 'upload');
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            user_id: user.user_id,
            file_creator: user.user_name,
            file_name: f.name,
            file_url: fileUrl,
            file_type: f.type,
            file_visible: 1
        });
        common.sendData(res, addFile)
    } catch (error) {
        common.sendFault(res, error)
    }
};

//伙食计提，多退少补
async function calculateFoodAct(req, res) {
    try {
        let user = req.user;
        let departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        for (let department of departments) {
            //获取当月天数
            const days = moment().daysInMonth();
            //获取部门下所有员工的伙食标准
            let sql = `select r.* from tbl_common_user u
            left join tbl_erc_customer c on u.user_id = c.user_id
            left join tbl_erc_reimburserank r on c.customer_reimburserank_id = r.reimburserank_id 
            left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id
            where u.state = 1 and c.state = 1 and r.state = 1 and u.domain_id = ? and ot.department_id = ?`;
            let replacements = [user.domain_id, department.department_id];
            let result = await common.queryPure(sequelize, req, sql, replacements);
            let moth_mony_total = 0;
            for (let r of result.data) {
                moth_mony_total += (r.reimburserank_meal_level * days);
            }
            if (moth_mony_total === 0) continue;
            //生成记账凭证
            await RecordingVouchersc.createRecordingVoucherSCJT('STJT', user, {department_id: department.department_id, amount: moth_mony_total});
        }
        common.sendData(res, {})
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//伙食计提，多退少补
async function calculateFoodDayAct(req, res) {
    try {
        let user = req.user;
        let departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        for (let department of departments) {
            //获取当月天数
            const days = moment().daysInMonth();
            //获取部门下所有员工的伙食标准
            let sql = `select r.* from tbl_common_user u
            left join tbl_erc_customer c on u.user_id = c.user_id
            left join tbl_erc_reimburserank r on c.customer_reimburserank_id = r.reimburserank_id 
            left join tbl_erc_custorgstructure ot on u.user_id = ot.user_id
            where u.state = 1 and c.state = 1 and r.state = 1 and u.domain_id = ? and ot.department_id = ?`;
            let replacements = [user.domain_id, department.department_id];
            let result = await common.queryPure(sequelize, req, sql, replacements);
            let moth_mony_total = 0;
            for (let r of result.data) {
                moth_mony_total += r.reimburserank_meal_level;
            }
            if (moth_mony_total === 0) continue;
            //生成记账凭证
            await RecordingVouchersc.createRecordingVoucherSCJT('STJT', user, {department_id: department.department_id, amount: moth_mony_total});
        }
        common.sendData(res, {})
    } catch (error) {
        return common.sendFault(res, error);
    }
}
