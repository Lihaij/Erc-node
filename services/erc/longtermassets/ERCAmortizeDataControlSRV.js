
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDataControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');
const moment = require('moment');
const sequelize = model.sequelize;

const tb_department = model.erc_department;
const tb_amortize = model.erc_amortize;
const tb_uploadfile = model.erc_uploadfile;

// 待摊资产数据管理页面接口

exports.ERCAmortizeDataControlResource = (req, res) => {
    let method = req.query.method;
    if(method === 'init'){
        initAct(req,res)
    } else if (method === 'search'){
        searchAct(req,res)
    } else if (method==='modify'){
        modifyAct(req,res)
    } else if (method==='upload'){
        uploadAct(req,res)
    } else if (method==='amortize_update'){
        amortizeUpdareAct(req,res)
    } else if (method==='delete_file'){
        deleteFileAct(req,res)
    } else if (method==='calculate_amortize_day'){
        calculateAmortizeDayAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
async function initAct(req,res){
    try {
        let user = req.user;

        let returnData = {
            amortizedInfo: GLBConfig.AMORTIZED,//摊销方法
            departmentInfo:[],//归属部门
            scraptype : GLBConfig.SCRAPTYPE
        };

        let userGroup = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
            }
        });
        for(let u of userGroup){
            returnData.departmentInfo.push({
                id:u.department_id,
                value:u.department_name,
                text:u.department_name
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询待摊资产列表
async function searchAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select a.*,d.department_name,d.department_id,
            u1.name as amortize_manager,u2.name as amortize_creator,u3.name as amortize_acceptor,u4.name as amortize_examine   
            from tbl_erc_amortize a 
            left join tbl_erc_department d on (a.amortize_departmant_id = d.department_id and d.state = 1) 
            left join tbl_common_user u1 on (a.amortize_manager = u1.user_id and u1.state=1) 
            left join tbl_common_user u2 on (a.amortize_creator = u2.user_id and u2.state=1)
            left join tbl_common_user u3 on (a.amortize_acceptor = u3.user_id and u3.state=1) 
            left join tbl_common_user u4 on (a.amortize_examine = u4.user_id and u4.state=1)
            where a.domain_id = ? and a.state = 1 and amortize_check_state = 2`;
        replacements.push(user.domain_id);
        if (doc.search_text) {
            queryStr += ` and (a.amortize_code like ? or a.amortize_name like ?) `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []
        let api_name = common.getApiName(req.path)
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            d.amortize_examine_time = ap.amortize_examine_time ? moment(ap.amortize_examine_time).format("YYYY-MM-DD") : null;
            d.amortize_acceptor_time = ap.amortize_acceptor_time ? moment(ap.amortize_acceptor_time).format("YYYY-MM-DD") : null;
            d.amortize_already_money = ap.amortize_already_money.toFixed(2)
            d.amortize_surplus_money = ap.amortize_surplus_money.toFixed(2)
            d.files = [];
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: d.amortize_code,
                    srv_id: d.amortize_id,
                    srv_type: '7',
                    state: GLBConfig.ENABLE
                }
            })

            for (let f of ufs) {
                d.files.push(f)
            }
            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 待摊资产按天计提
async function calculateAmortizeDayAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;
        //按部门计提固定资产
        let departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        for (const department of departments) {
            let queryStr = `select a.* from tbl_erc_amortize a 
            where a.domain_id = ? and a.state = 1 and a.amortize_check_state = 2 and a.scrap_flag = 1 and a.amortize_departmant_id = ?`;
            let result = await common.queryPure(sequelize, req, queryStr, [user.domain_id, department.department_id]);
            let total_money = 0;
            for (const r of result.data) {
                //剩余摊销费用/（剩余摊销月数*30）
                total_money += (r.amortize_surplus_money / r.amortize_surplus_mos /30);
            }
            if (total_money !== 0) {
                await RecordingVouchersc.createRecordingVoucherSCJT('CQDTZCTX', user, {department_id: department.department_id,amount: total_money});
            }
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 修改待摊资产信息
async function modifyAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let amortize = await tb_amortize.findOne({
            where: {
                amortize_id: doc.old.amortize_id
            }
        });

        if (amortize) {
            amortize.amortize_already_mos = doc.new.amortize_already_mos;
            amortize.scrap_flag = doc.new.scrap_flag;
            amortize.amortize_acceptor_time = doc.new.amortize_acceptor_time;
            amortize.amortize_way = doc.new.amortize_way;
            amortize.amortize_name = doc.new.amortize_name;
            amortize.amortize_agelimit = doc.new.amortize_agelimit;
            amortize.amortize_already_money = doc.new.amortize_already_money;
            amortize.amortize_surplus_mos = doc.new.amortize_surplus_mos;
            amortize.amortize_surplus_money = doc.new.amortize_surplus_money;
            await amortize.save();
            common.sendData(res, amortize);
        } else {
            common.sendError(res, 'amortize_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}

// 文件上传导入模块，该function返回文件的临时路径
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};

// 文件上传至mongoDB，并将路径等信息保存tbl_erc_uploadfile
async function amortizeUpdareAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let amortize = await tb_amortize.findOne({
            where: {
                amortize_id: doc.new.amortize_id
            }
        })

        let api_name = common.getApiName(req.path);
        for (let m of doc.new.files) {
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload');
                let addFile = await tb_uploadfile.create({
                    api_name: api_name,
                    order_id: amortize.amortize_code,
                    file_name: m.name,
                    file_url: fileUrl,
                    file_type: m.type,
                    srv_id: amortize.amortize_id,
                    srv_type: '7',
                    file_creator: user.name
                });
            }
        }

        let retData = JSON.parse(JSON.stringify(doc.new))
        retData.files = []
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                order_id: retData.amortize_code,
                srv_id: retData.amortize_id,
                srv_type: '7',
                state: GLBConfig.ENABLE
            }
        })

        for (let f of ufs) {
            retData.files.push(f)
        }

        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

// 删除上传的文件
async function deleteFileAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: {
                    $in: doc.fileIds
                },
                state: GLBConfig.ENABLE
            }
        });
        for (let file of uploadfiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}