/**
 * Created by shuang.liu on 18/5/29.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCFixedAssetsControlSRV');
const model = require('../../../model');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV')
const RecordingVouchersc = require('../../../util/RecordingVouchersc');


const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_department = model.erc_department;
const tb_fixedassetspurch = model.erc_fixedassetspurch;
const tb_fixedassetspurchdetail = model.erc_fixedassetspurchdetail;
const tb_fixedassetscheck = model.erc_fixedassetscheck;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;
const tb_fixedassetsrepair = model.erc_fixedassetsrepair;
const tb_fixedassetsrepairmaterials = model.erc_fixedassetsrepairmaterials;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_uploadfile = model.erc_uploadfile;
const tb_supplier = model.erc_supplier
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

exports.ERCFixedAssetsControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_p') {
        searchPurchAct(req, res)
    } else if (method === 'add_p') {
        addPurchAct(req, res)
    } else if (method === 'search_pd') {
        searchPurchDetailAct(req, res)
    } else if (method === 'add_pd') {
        addPurchDetailAct(req, res)
    } else if (method === 'modify_pd') {
        modifyPurchDetailAct(req, res)
    } else if (method === 'delete_pd') {
        deletePurchDetailAct(req, res)
    } else if (method === 'submit_p') {
        submitPurchAct(req, res)
    } else if (method === 'search_c') {
        searchCheckAct(req, res)
    } else if (method === 'add_c') {
        addCheckAct(req, res)
    } else if (method === 'search_cd') {
        searchCheckDetailAct(req, res)
    } else if (method === 'add_cd') {
        addCheckDetailAct(req, res)
    } else if (method === 'delete_cd') {
        deleteCheckDetailAct(req, res)
    } else if (method === 'submit_c') {
        submitCheckAct(req, res)
    } else if (method === 'changeDepartment') {
        changeDepartmentAct(req, res)
    } else if (method === 'search_pdt') {
        searchPurchTopDetailAct(req, res)
    } else if (method === 'search_fa') {
        serachFixedAssets(req, res)
    } else if (method === 'modify_fa') {
        modifyFixedAssets(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'search_adt') {
        searchAssetsTopDetailAct(req, res)
    } else if (method === 'add_r') {
        addRepairAct(req, res)
    } else if (method === 'search_r') {
        searchRepairAct(req, res)
    } else if (method === 'search_rm') {
        searchRepairMaterialsAct(req, res)
    } else if (method === 'add_rm') {
        addRepairMaterialsAct(req, res)
    } else if (method === 'search_rdt') {
        searchAssetsRepairDetailAct(req, res)
    } else if (method === 'delete_rm') {
        deleteRepairMaterialsAct(req, res)
    } else if (method === 'add_rr') {
        addRepairRemarkAct(req, res)
    } else if (method === 'modify_r') {
        modifyRepairAct(req, res)
    } else if (method === 'submit_r') {
        submitRepairAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    } else if (method === 'search_pdc') {
        searchPurchDetailCheckAct(req, res)
    } else if (method === 'submit_pdc') {
        submitPurchDetailCheckAct(req, res)
    } else if (method === 'delete_fd') {
        deleteFixedCheckAct(req, res)
    } else if (method === 'batchFixedAssets') {
        batchFixedAssets(req, res)
    } else if (method === 'calculate_fixed_day') {
        calculateFixedAssetsDay(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function batchFixedAssets(req, res) {
    try {
        let queryStr = '',
            replacements = [],
            result;
        // 剩余折旧月数 = 预计使用年限12-已计提折旧月数
        queryStr = `update tbl_erc_fixedassetscheckdetail
            set residual_deprecition_month = ifnull(use_time_limit,0) *12-ifnull(deprecition_month,0) 
            where state=1`;
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.UPDATE
        });

        // 固定资产月折旧=固定资产原值*（1-残值率）/（折旧年限*12个月）
        queryStr = `update tbl_erc_fixedassetscheckdetail 
            set monthly_depreciation = ifnull(original_value,0)*(1-ifnull(residual_value_rate,0))/(ifnull(use_time_limit,1)*12) 
            where state=1`;
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.UPDATE
        });

        // 已计提折旧金额=固定资产原值+固定资产月折旧*已计提折旧月数
        queryStr = `update tbl_erc_fixedassetscheckdetail 
            set deprecition_price = (ifnull(original_value,0) + ifnull(monthly_depreciation,0) * ifnull(deprecition_month,0)) * 100 
            where state=1`
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.UPDATE
        });
        common.sendData(res, result);

    } catch (error) {
        common.sendFault(res, error);
        return
    }

}
async function getBaseType(code, domain_id) {
    try {
        let returnData = [],
            replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.state=1 and t.state=1 and d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        if (domain_id) {
            queryStr += ` and d.domain_id=?`
            replacements.push(domain_id)
        }
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let r of result) {
            returnData.push({
                id: r.basetypedetail_id,
                value: r.basetypedetail_id,
                text: r.typedetail_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
//初始化申购审批状态，固定资产分类，折旧方法，验收类型，报废标志，维修状态
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        returnData.userInfo = req.user;
        returnData.purchstate = GLBConfig.STOCKORDERSTATE; //申购审批状态
        returnData.fixedassetstype = GLBConfig.FIXEDASSETS; //固定资产分类
        returnData.depreciationmethodtype = GLBConfig.DEPRECIATIONMETHOD; //折旧方法
        returnData.acceptancetype = GLBConfig.FIXEDACCEPTANCETYPE; //验收类型
        returnData.scraptype = GLBConfig.SCRAPTYPE; //报废标志
        returnData.repairstate = GLBConfig.REPAIRSTATE; //维修状态
        returnData.unitInfo = await getBaseType('JLDW', req.user.domain_id); //单位
        returnData.supplier = await getSupplier(req, res)
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getSupplier(req, res) {
    try {
        let supplier = await tb_supplier.findAll({
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.supplier_id,
                text: item.supplier_name,
                value: item.supplier_id
            }
        })
        return supplier
    } catch (error) {
        throw new Error
    }
}
//查看固定资产
async function searchPurchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements = [user.domain_id];

        let queryStr = 'select t.*,dt.department_name,ut.`name` as purch_checker_name from tbl_erc_fixedassetspurch t ' +
            'left join tbl_erc_department dt on t.department_id = dt.department_id ' +
            'left join tbl_common_user ut on t.purch_checker_id = ut.user_id ' +
            'where t.state=1 and t.domain_id=? ';
        if (doc.search_text) {
            queryStr += ' and (t.fixedassetspurch_no like ? or dt.department_name like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.purch_check_date = r.purch_check_date ? moment(r.purch_check_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增资产申购单列表
async function addPurchAct(req, res) {
    let aaa = new Date().toLocaleString()

    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fixedassetspurch_no = await Sequence.genfixedAssetsPurchNo();
        let biz_code = await genBizCode(CODE_NAME.WGGDZCSG, user.domain_id, 6);
        let addPurch = await tb_fixedassetspurch.create({
            fixedassetspurch_no: fixedassetspurch_no,
            domain_id: user.domain_id,
            department_id: doc.department_id,
            biz_code: biz_code
        });
        common.sendData(res, addPurch)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查看固定资产申购详情详情
async function searchPurchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [doc.fixedassetspurch_id];
        let queryStr = 'select t.*,p.purch_state from tbl_erc_fixedassetspurchdetail t,tbl_erc_fixedassetspurch p ' +
            'where t.fixedassetspurch_id = p.fixedassetspurch_id and t.state=1 and t.fixedassetspurch_id=? ';
        if (doc.search_text) {
            queryStr += ' and t.fixedassets_name like ? ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        //查询申请部门
        replacements = [doc.fixedassetspurch_id];
        const departmentStr = `select d.* from tbl_erc_fixedassetspurch f inner join tbl_erc_department d
            on f.department_id = d.department_id where f.fixedassetspurch_id = ? `;
        const department = await common.queryWithCount(sequelize, req, departmentStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;
        returnData.department = department.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增固定资产申购详情记录
async function addPurchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let addPurch = await tb_fixedassetspurchdetail.create({
            fixedassetspurch_id: doc.fixedassetspurch_id,
            fixedassets_name: doc.fixedassets_name,
            fixedassets_model: doc.fixedassets_model,
            fixedassets_unit: doc.fixedassets_unit,
            fixedassets_num: doc.fixedassets_num
        });
        common.sendData(res, addPurch)

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改固定资产申购详情记录
async function modifyPurchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        // let detail = await tb_fixedassetspurchdetail.findAll({
        //     where: {
        //         state: 1,
        //         fixedassetspurchdetail_id: {
        //             $ne: doc.old.fixedassetspurchdetail_id
        //         },
        //         fixedassets_no: doc.new.fixedassets_no
        //     }
        // })
        // if (detail.length > 0) {
        //     common.sendError(res, 'fixedassetspurch_06');
        //     return
        // }

        let modPurch = await tb_fixedassetspurchdetail.findOne({
            where: {
                fixedassetspurchdetail_id: doc.old.fixedassetspurchdetail_id
            }
        });

        if (modPurch) {
            modPurch.fixedassets_name = doc.new.fixedassets_name;
            modPurch.use_time_limit = doc.new.use_time_limit;
            modPurch.fixedassets_unit = doc.new.fixedassets_unit;
            modPurch.fixedassets_num = doc.new.fixedassets_num;
            modPurch.fixedassets_category = doc.new.fixedassets_category;
            modPurch.fixedassets_model = doc.new.fixedassets_model;
            modPurch.residual_value_rate = doc.new.residual_value_rate;
            modPurch.depreciation_category = doc.new.depreciation_category;
            modPurch.department_id = doc.new.department_id;
            modPurch.user_id = doc.new.user_id;
            modPurch.fixedassetscheck_acceptance = doc.new.fixedassetscheck_acceptance;
            modPurch.fixedassets_number = doc.new.fixedassets_number;
            modPurch.fixedassets_price = doc.new.fixedassets_price;
            modPurch.fixedassets_money = doc.new.fixedassets_money;
            modPurch.fixedassets_no = doc.new.fixedassets_no;

            await modPurch.save();
            common.sendData(res, modPurch);
        } else {
            common.sendError(res, 'fixedassetspurch_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除固定资产申购详情记录
async function deletePurchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modPurch = await tb_fixedassetspurchdetail.findOne({
            where: {
                fixedassetspurchdetail_id: doc.fixedassetspurchdetail_id
            }
        });
        if (modPurch) {
            modPurch.state = GLBConfig.DISABLE;

            await modPurch.save();

            common.sendData(res, modPurch);
        } else {
            common.sendError(res, 'fixedassetspurch_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//提交固定资产申购审批任务
async function submitPurchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '固定资产申购审批任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });
        let fixedassetspurchdetail = await tb_fixedassetspurchdetail.findOne({
            where: {
                fixedassetspurch_id: doc.fixedassetspurch_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!fixedassetspurchdetail) {
            return common.sendError(res, 'fixedassetspurch_04');
        } else {
            if (!taskallotuser) {
                return common.sendError(res, 'fixedassetspurch_03');
            } else {
                let taskName = '固定资产申购审批任务';
                let taskDescription = doc.fixedassetspurch_no + '  固定资产申购审批任务';
                let groupId = common.getUUIDByTime(30);
                // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                let taskResult = await task.createTask(user, taskName, 29, taskallotuser.user_id, doc.fixedassetspurch_id, taskDescription, '', groupId);
                if (!taskResult) {
                    return common.sendError(res, 'task_01');
                } else {
                    let fixedassetspurch = await tb_fixedassetspurch.findOne({
                        where: {
                            fixedassetspurch_id: doc.fixedassetspurch_id,
                            state: GLBConfig.ENABLE
                        }
                    });
                    if (fixedassetspurch) {
                        fixedassetspurch.purch_state = 1;
                        await fixedassetspurch.save()
                    }
                    common.sendData(res, fixedassetspurch);
                }
            }
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查看固定资产验收单
async function searchCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements = [user.domain_id];

        let queryStr = 'select t.*,ut.`name` as user_name,ut2.`name` as check_checker_name from tbl_erc_fixedassetscheck t ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_common_user ut2 on t.check_checker_id = ut2.user_id ' +
            'where t.state=1 and t.domain_id=? ';
        if (doc.search_text) {
            queryStr += ' and (t.fixedassetscheck_no like ? or ut.`name` like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.check_check_date = r.check_check_date ? moment(r.check_check_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增固定资产验收单
async function addCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fixedassetscheck_no = await Sequence.genfixedAssetsCheckNo();
        let addPurch = await tb_fixedassetscheck.create({
            fixedassetscheck_no: fixedassetscheck_no,
            domain_id: user.domain_id,
            user_id: user.user_id
        });
        common.sendData(res, addPurch)

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查看固定资产验收单详情
async function searchCheckDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [doc.fixedassetscheck_id];
        let queryStr = 'select t.*,dt.department_name,ut.`name` as user_name ' +
            'from tbl_erc_fixedassetscheckdetail t ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_erc_department dt on t.department_id = dt.department_id ' +
            'where t.state=1 and t.fixedassetscheck_id=? ';
        if (doc.search_text) {
            queryStr += ' and (t.fixedassets_no like ? or t.fixedassets_name like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        let api_name = common.getApiName(req.path)
        for (let i of result.data) {
            let row = JSON.parse(JSON.stringify(i));
            row.files = [];
            let f = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: row.fixedassetscheckdetail_id,
                    srv_id: row.fixedassetscheckdetail_id,
                    srv_type: row.fixedassetscheckdetail_id,
                    state: GLBConfig.ENABLE
                }
            })
            if (f.length > 0) {
                row.files = f;
            }
            row.created_at = i.created_at ? moment(i.created_at).format('YYYY-MM-DD HH:mm') : null;
            row.residual_value_rate = ((i.residual_value_rate / 100).toFixed(2)) + '%';
            returnData.rows.push(row);
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加固定资产验收单详情
async function addCheckDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let residual_value_rate = 0
        if (doc.residual_value_rate != undefined) {
            residual_value_rate = doc.residual_value_rate
        }
        let fixedassets_no = await Sequence.genfixedAssetsNo();
        let addCheck = await tb_fixedassetscheckdetail.create({
            fixedassetscheck_id: doc.fixedassetscheck_id,
            fixedassets_no: fixedassets_no,
            fixedassets_name: doc.fixedassets_name,
            fixedassets_model: doc.fixedassets_model,
            fixedassets_unit: doc.fixedassets_unit,
            fixedassets_category: doc.fixedassets_category,
            use_time_limit: doc.use_time_limit,
            residual_value_rate: residual_value_rate * 100,
            depreciation_category: doc.depreciation_category,
            department_id: doc.department_id,
            fixedassets_property: doc.fixedassets_property,
            user_id: doc.user_id,
            fixedassetscheck_acceptance: doc.fixedassetscheck_acceptance,

            fixedassets_number: doc.fixedassets_number,
            fixedassets_price: doc.fixedassets_price,
            fixedassets_money: doc.fixedassets_money,
            fixedassets_supplier_id: doc.fixedassets_supplier_id
        });

        if (addCheck) {
            let api_name = common.getApiName(req.path)
            for (let m of doc.files) {
                if (m.file_url) {
                    let fileUrl = await common.fileMove(m.file_url, 'upload');
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: m.file_name,
                        file_url: fileUrl,
                        file_type: m.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: addCheck.fixedassetscheckdetail_id,
                        srv_type: addCheck.fixedassetscheckdetail_id,
                        order_id: addCheck.fixedassetscheckdetail_id,
                        file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }

            addCheck.dataValues.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: addCheck.fixedassetscheckdetail_id,
                    srv_id: addCheck.fixedassetscheckdetail_id,
                    srv_type: addCheck.fixedassetscheckdetail_id,
                    state: GLBConfig.ENABLE
                }
            })

            if (ufs.length > 0) {
                addCheck.dataValues.files = ufs;
            }

            common.sendData(res, addCheck);
        }
        common.sendData(res, addCheck)

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除固定资产验收单详情
async function deleteCheckDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modCheck = await tb_fixedassetscheckdetail.findOne({
            where: {
                fixedassetscheckdetail_id: doc.fixedassetscheckdetail_id
            }
        });
        if (modCheck) {
            modCheck.state = GLBConfig.DISABLE;

            await modCheck.save();

            common.sendData(res, modCheck);
        } else {
            common.sendError(res, 'fixedassetscheck_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//提交固定资产验收任务
async function submitCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //校验是否分配任务处理人员
        // let taskallot = await tb_taskallot.findOne({
        //     where:{
        //         state:GLBConfig.ENABLE,
        //         taskallot_name:'固定资产验收任务'
        //     }
        // });
        // let taskallotuser = await tb_taskallotuser.findOne({
        //     where:{
        //         state:GLBConfig.ENABLE,
        //         domain_id: user.domain_id,
        //         taskallot_id:taskallot.taskallot_id
        //     }
        // });
        // let fixedassetscheckdetail = await tb_fixedassetscheckdetail.findOne({
        //     where:{
        //         fixedassetscheck_id: doc.fixedassetscheck_id,
        //         state: GLBConfig.ENABLE
        //     }
        // });
        // if (!fixedassetscheckdetail) {
        //     return common.sendError(res, 'fixedassetscheck_04');
        // } else {
        //     if (!taskallotuser) {
        //         return common.sendError(res, 'fixedassetscheck_03');
        //     }else{
        //         let taskName = '固定资产验收任务';
        //         let taskDescription = doc.fixedassetscheck_no + '  固定资产验收任务';
        //         let groupId = common.getUUIDByTime(30);
        //         // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        //         let taskResult = await task.createTask(user,taskName,30,taskallotuser.user_id,doc.fixedassetscheck_id,taskDescription,'',groupId);
        //         if(!taskResult){
        //             return common.sendError(res, 'task_01');
        //         }else{
        let fixedassetscheck = await tb_fixedassetscheck.findOne({
            where: {
                fixedassetscheck_id: doc.fixedassetscheck_id,
                state: GLBConfig.ENABLE
            }
        });
        if (fixedassetscheck) {
            fixedassetscheck.check_state = 3;
            await fixedassetscheck.save()
        }
        common.sendData(res, fixedassetscheck);
        //         }
        //     }
        // }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//选择部门
async function changeDepartmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u = doc.users[0]
            let userGroup = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: u.department_id
                }
            });

            returnData.userDepartmentId = userGroup.department_id;
            returnData.userDepartmentName = userGroup.department_name;

        } else {
            returnData.userDepartmentId = null;
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看固定资产申购状态
async function searchPurchTopDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fixedassetspurch = await tb_fixedassetspurch.findOne({
            where: {
                fixedassetspurch_id: doc.fixedassetspurch_id
            }
        });

        common.sendData(res, fixedassetspurch);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看固定资产验收详情
async function serachFixedAssets(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.domain_id];
        let queryStr = 'select t.*,dt.department_name,ut.`name` as user_name from tbl_erc_fixedassetscheckdetail t ' +
            'inner join tbl_erc_fixedassetscheck tt on (t.fixedassetscheck_id = tt.fixedassetscheck_id and tt.check_state=3 and tt.state=1)' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_erc_department dt on t.department_id = dt.department_id ' +
            'where t.state=1 and tt.domain_id = ? ';
        if (doc.search_text) {
            queryStr += ' and (t.fixedassets_no like ? or t.fixedassets_name like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        let api_name = common.getApiName(req.path)
        for (let i of result.data) {
            let row = JSON.parse(JSON.stringify(i));
            row.files = [];
            let f = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: row.fixedassetscheckdetail_id,
                    srv_id: row.fixedassetscheckdetail_id,
                    srv_type: row.fixedassetscheckdetail_id,
                    state: GLBConfig.ENABLE
                }
            })
            if (f.length > 0) {
                row.files = f;
            }
            row.created_at = i.created_at ? moment(i.created_at).format('YYYY-MM-DD') : null;
            // row.residual_value_rate = ((i.residual_value_rate / 100).toFixed(2)) + '%';
            row.deprecition_price = ((i.deprecition_price / 100).toFixed(2));
            returnData.rows.push(row);
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//固定资产按天计提
async function calculateFixedAssetsDay(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements = [user.domain_id];
        const fistDay = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
        //按部门计提固定资产
        let departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            }
        });
        for (const department of departments) {
            //本月增加的本月不计提 所以取验收时间为这个月1号之前的且不是报废的固定资产
            let queryStr = `select t.* from tbl_erc_fixedassetscheckdetail t
            inner join tbl_erc_fixedassetscheck tt on (t.fixedassetscheck_id = tt.fixedassetscheck_id)
            left join tbl_erc_department dt on t.department_id = dt.department_id
            where t.state=1 and tt.domain_id = ? and t.created_at < '${fistDay}' and tt.check_state=3 and t.scrap_flag = 1 and dt.department_id = ?`;
            const replacements = [user.domain_id, department.department_id]
            let result = await common.queryPure(sequelize, req, queryStr, replacements);
            let total_money = 0;
            for (const r of result.data) {
                //按天折旧金额：（1-预计净残值率）/预计使用年限/365*固定资产原值
                total_money += (1 - (r.residual_value_rate) / 100) / 365 * r.original_value;
            }
            //生成计提记账凭证
            if (total_money > 0) {
                await RecordingVouchersc.createRecordingVoucherSCJT('GDZCZJ', user, {
                    department_id: department.department_id,
                    amount: total_money
                });
            }
        }
        common.sendData(res, {});
    } catch (error) {
        return common.sendFault(res, error);
    }
}



//修改固定资产验收详情
async function modifyFixedAssets(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modFixedAssets = await tb_fixedassetscheckdetail.findOne({
            where: {
                fixedassetscheckdetail_id: doc.old.fixedassetscheckdetail_id
            }
        });
        let residual_value_rate = 0
        // if (doc.new.residual_value_rate != undefined) {
        //     residual_value_rate = (doc.new.residual_value_rate).replace(/%/g, "")
        // }
        if (modFixedAssets) {
            modFixedAssets.deprecition_month = Number(doc.new.deprecition_month);
            modFixedAssets.deprecition_price = Number(doc.new.deprecition_price) * 100;
            modFixedAssets.residual_deprecition_month = Number(doc.new.residual_deprecition_month);
            modFixedAssets.fixedassets_name = doc.new.fixedassets_name;
            modFixedAssets.fixedassets_model = doc.new.fixedassets_model;
            modFixedAssets.fixedassets_unit = doc.new.fixedassets_unit;
            modFixedAssets.fixedassets_category = doc.new.fixedassets_category;
            modFixedAssets.use_time_limit = doc.new.use_time_limit;
            modFixedAssets.residual_value_rate = doc.new.residual_value_rate;
            modFixedAssets.depreciation_category = doc.new.depreciation_category;
            modFixedAssets.department_id = doc.new.department_id;
            modFixedAssets.created_at = doc.new.created_at;
            modFixedAssets.fixedassets_property = doc.new.fixedassets_property;
            modFixedAssets.user_id = doc.new.user_id;
            modFixedAssets.fixedassetscheck_acceptance = doc.new.fixedassetscheck_acceptance;
            modFixedAssets.original_value = Number(doc.new.original_value);

            await modFixedAssets.save();
            // modFixedAssets.residual_value_rate = ((modFixedAssets.residual_value_rate / 100).toFixed(2)) + '%';

            let api_name = common.getApiName(req.path)
            for (let m of doc.new.files) {
                if (m.file_url) {
                    let fileUrl = await common.fileMove(m.file_url, 'upload');
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: m.file_name,
                        file_url: fileUrl,
                        file_type: m.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: modFixedAssets.fixedassetscheckdetail_id,
                        srv_type: modFixedAssets.fixedassetscheckdetail_id,
                        order_id: modFixedAssets.fixedassetscheckdetail_id,
                        file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }

            modFixedAssets.dataValues.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: modFixedAssets.fixedassetscheckdetail_id,
                    srv_id: modFixedAssets.fixedassetscheckdetail_id,
                    srv_type: modFixedAssets.fixedassetscheckdetail_id,
                    state: GLBConfig.ENABLE
                }
            })

            if (ufs.length > 0) {
                modFixedAssets.dataValues.files = ufs;
            }

            common.sendData(res, modFixedAssets);
        } else {
            common.sendError(res, 'fixedassetspurch_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//选择的人员
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let u = doc.users[0]

        let meeting = await tb_user.findOne({
            where: {
                domain_id: u.domain_id,
                user_id: u.user_id
            }
        });
        returnData.meetingId = meeting.user_id;
        returnData.meetingName = meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看固定资产验收单状态
async function searchAssetsTopDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fixedassetscheck = await tb_fixedassetscheck.findOne({
            where: {
                fixedassetscheck_id: doc.fixedassetscheck_id
            }
        });

        common.sendData(res, fixedassetscheck);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看固定资产维修单状态
async function searchAssetsRepairDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let fixedassetsrepair = await tb_fixedassetsrepair.findOne({
            where: {
                fixedassetsrepair_id: doc.fixedassetsrepair_id
            }
        });

        let fixedassetscheckdetail = await tb_fixedassetscheckdetail.findOne({
            where: {
                fixedassetscheckdetail_id: fixedassetsrepair.fixedassetscheckdetail_id
            }
        });

        returnData.fixedassetsrepair = fixedassetsrepair;
        returnData.fixedassetscheckdetail = fixedassetscheckdetail;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//确认生成固定资产报修单
async function addRepairAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //检查是否存在正在处理的保修单
        let repairInfo = await tb_fixedassetsrepair.findOne({
            where: {
                fixedassetscheckdetail_id: doc.fixedassetscheckdetail_id,
                repair_state: 1
            }
        });
        let fixedassetscheckdetail = await tb_fixedassetscheckdetail.findOne({
            where: {
                fixedassetscheckdetail_id: doc.fixedassetscheckdetail_id
            }
        });
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '固定资产维修任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'fixedassetsrepair_03');
        } else {
            if (repairInfo || fixedassetscheckdetail.scrap_flag == 0) {
                return common.sendError(res, 'fixedassetsrepair_05');
            } else {
                let fixedassetsrepair_no = await Sequence.genfixedAssetsRepairNo();
                let addRepair = await tb_fixedassetsrepair.create({
                    fixedassetsrepair_no: fixedassetsrepair_no,
                    domain_id: user.domain_id,
                    submit_user_id: user.user_id,
                    fixedassetscheck_id: doc.fixedassetscheck_id,
                    fixedassets_no: doc.fixedassets_no,
                    fixedassetscheckdetail_id: doc.fixedassetscheckdetail_id,
                    repair_plan_time: doc.repair_plan_time
                });

                let taskName = '固定资产维修任务';
                let taskDescription = addRepair.fixedassetsrepair_no + '  固定资产维修任务';
                let groupId = common.getUUIDByTime(30);
                // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                let taskResult = await task.createTask(user, taskName, 31, taskallotuser.user_id, addRepair.fixedassetsrepair_id, taskDescription, '', groupId);
                if (!taskResult) {
                    return common.sendError(res, 'task_01');
                } else {
                    if (addRepair) {
                        addRepair.repair_state = 1;
                        await addRepair.save()
                    }
                }
                common.sendData(res, addRepair)
            }
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查看固定资产维修单
async function searchRepairAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.domain_id];
        let queryStr = 'select t.*,ft.fixedassets_no,ft.fixedassets_name,ft.fixedassets_model,ft.fixedassets_unit,ut.`name` as repair_checker_name from tbl_erc_fixedassetsrepair t ' +
            'left join tbl_erc_fixedassetscheckdetail ft on t.fixedassetscheckdetail_id=ft.fixedassetscheckdetail_id ' +
            'left join tbl_common_user ut on t.repair_checker_id = ut.user_id ' +
            'where t.state=1 and t.domain_id = ? ';
        if (doc.search_text) {
            queryStr += ' and (t.fixedassetsrepair_no like ? or ft.fixedassets_name like ? or ft.fixedassets_no like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.reality_time = r.repair_state == 2 ? result.created_at : ''
            result.repair_plan_time = r.repair_plan_time ? moment(r.repair_plan_time).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看资产维修单详情
async function searchRepairMaterialsAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [doc.fixedassetsrepair_id];
        let queryStr = 'select t.* from tbl_erc_fixedassetsrepairmaterials t ' +
            'inner join tbl_erc_fixedassetsrepair ft on t.fixedassetsrepair_id = ft.fixedassetsrepair_id ' +
            'where t.state=1 and t.fixedassetsrepair_id=? ';

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加维修材料
async function addRepairMaterialsAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let addMaterials = await tb_fixedassetsrepairmaterials.create({
            fixedassetsrepair_id: doc.fixedassetsrepair_id,
            repair_name: doc.repair_name,
            repair_model: doc.repair_model,
            repair_unit: doc.repair_unit,
            repair_price: doc.repair_price,
            repair_number: doc.repair_number
        });
        common.sendData(res, addMaterials)

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除维修材料
async function deleteRepairMaterialsAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMaterials = await tb_fixedassetsrepairmaterials.findOne({
            where: {
                fixedassetsrepairmaterials_id: doc.fixedassetsrepairmaterials_id
            }
        });
        if (modMaterials) {
            modMaterials.state = GLBConfig.DISABLE;

            await modMaterials.save();

            common.sendData(res, modMaterials);
        } else {
            common.sendError(res, 'fixedassetsrepair_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//增加资产故障诊断记录
async function addRepairRemarkAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMaterials = await tb_fixedassetsrepair.findOne({
            where: {
                fixedassetsrepair_id: doc.fixedassetsrepair_id
            }
        });
        if (modMaterials) {
            modMaterials.fault_remark = doc.fault_remark;

            await modMaterials.save();

            common.sendData(res, modMaterials);
        } else {
            common.sendError(res, 'fixedassetsrepair_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//修改维修材料
async function modifyRepairAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMaterials = await tb_fixedassetsrepair.findOne({
            where: {
                fixedassetsrepair_id: doc.old.fixedassetsrepair_id
            }
        });
        if (modMaterials) {
            modMaterials.repair_plan_time = doc.new.repair_plan_time;

            await modMaterials.save();

            common.sendData(res, modMaterials);
        } else {
            common.sendError(res, 'fixedassetsrepair_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//提交固定资产维修单详情
async function submitRepairAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fixedassetsrepairmaterials = await tb_fixedassetsrepairmaterials.findOne({
            where: {
                fixedassetsrepair_id: doc.fixedassetsrepair_id,
                state: 1
            }
        });
        let modRepair = await tb_fixedassetsrepair.findOne({
            where: {
                fixedassetsrepair_id: doc.fixedassetsrepair_id
            }
        });
        if (!fixedassetsrepairmaterials || modRepair.fault_remark == null) {
            common.sendError(res, 'fixedassetsrepair_06');
            return
        }
        if (modRepair) {
            modRepair.repair_state = 2;
            modRepair.repair_checker_id = user.user_id;
            modRepair.repair_check_date = new Date();

            await modRepair.save();

            common.sendData(res, modRepair);
        } else {
            common.sendError(res, 'fixedassetsrepair_01');
            return
        }

        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//上传附件
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除附件
let removeFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: doc.file_id,
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
};

//资产验收（查询通过资产申购审核并未提交验证的数据）
async function searchPurchDetailCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements = [GLBConfig.ENABLE, user.domain_id];
        let queryStr = 'select t.*,pt.fixedassetspurch_no,dt.department_name,ut.`name` as user_name from tbl_erc_fixedassetspurchdetail t ' +
            'inner join tbl_erc_fixedassetspurch pt on t.fixedassetspurch_id = pt.fixedassetspurch_id and pt.purch_state=3 ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_erc_department dt on t.department_id = dt.department_id ' +
            'where t.state=? and t.fixedassets_flag in (0,2) and pt.domain_id=?';
        if (doc.search_text) {
            queryStr += ' and (pt.fixedassetspurch_no like ? or t.fixedassets_name like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//资产验收tab页提交
async function submitPurchDetailCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        if (doc.purchDetailIds == null || doc.purchDetailIds == "") {
            common.sendData(res, 'fixedassetscheck_05');
            return
        }
        //创建资产验收总单
        let fixedassetscheck_no = await Sequence.genfixedAssetsCheckNo();
        let addCheck = await tb_fixedassetscheck.create({
            fixedassetscheck_no: fixedassetscheck_no,
            check_flag: 1,
            domain_id: user.domain_id,
            user_id: user.user_id
        });
        //获取需要添加的资产验收单明细
        let purchDetailArr = doc.purchDetailIds.split(",");
        for (let i = 0; i < purchDetailArr.length; i++) {
            //创建资产验收明细单
            //获取采购记录详细
            let purchdetail = await tb_fixedassetspurchdetail.findOne({
                where: {
                    fixedassetspurchdetail_id: purchDetailArr[i]
                }
            });

            //每个固定资产有单独编号，多个数量的资产要添加多条记录
            for (let j = 0; j < purchdetail.fixedassets_num; j++) {
                let fixedassets_no = await Sequence.genfixedAssetsNo();
                let addCheck2 = await tb_fixedassetscheckdetail.create({
                    fixedassetscheck_id: addCheck.fixedassetscheck_id,
                    // fixedassets_no: purchdetail.fixedassets_no,
                    fixedassets_no: fixedassets_no,
                    fixedassets_name: purchdetail.fixedassets_name,
                    fixedassets_model: purchdetail.fixedassets_model,
                    fixedassets_unit: purchdetail.fixedassets_unit,
                    fixedassets_price: purchdetail.fixedassets_price,
                    fixedassets_number: 1,
                    fixedassets_money: purchdetail.fixedassets_price,
                    use_time_limit: purchdetail.use_time_limit,
                    fixedassets_category: purchdetail.fixedassets_category,
                    residual_value_rate: purchdetail.residual_value_rate,
                    depreciation_category: purchdetail.depreciation_category,
                    department_id: purchdetail.department_id,
                    user_id: purchdetail.user_id,
                    fixedassetscheck_acceptance: purchdetail.fixedassetscheck_acceptance,
                    fixedassetspurchdetail_id: purchdetail.fixedassetspurchdetail_id
                });
            }

            //修改采购详单该记录提交状态
            if (purchdetail) {
                purchdetail.fixedassets_flag = 1;
                await purchdetail.save()
            }
        }
        /*//校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'固定资产验收任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'fixedassetscheck_03');
        }else{
            let taskName = '固定资产验收任务';
            let taskDescription = fixedassetscheck_no + '  固定资产验收任务';
            let groupId = common.getUUIDByTime(30);
            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
            let taskResult = await task.createTask(user,taskName,30,taskallotuser.user_id,addCheck.fixedassetscheck_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else{
                let fixedassetscheck = await tb_fixedassetscheck.findOne({
                    where: {
                        fixedassetscheck_id: addCheck.fixedassetscheck_id,
                        state: GLBConfig.ENABLE
                    }
                });
                if(fixedassetscheck){
                    fixedassetscheck.check_state=1;
                    await fixedassetscheck.save()
                }
                common.sendData(res, fixedassetscheck);
            }
        }*/

        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//删除固定资产验收单
async function deleteFixedCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let fixedassetscheck = await tb_fixedassetscheck.findOne({
            where: {
                fixedassetscheck_id: doc.fixedassetscheck_id
            }
        });
        if (fixedassetscheck) {
            fixedassetscheck.state = GLBConfig.DISABLE;

            await fixedassetscheck.save();

            common.sendData(res, fixedassetscheck);
        } else {
            common.sendError(res, 'fixedassetsrepair_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//更改固定资产申购状态
async function modifyFixedAssetsPurchState(applyState, description, fixedassetspurch_id, applyApprover) {
    // let user = req.user;
    await tb_fixedassetspurch.update({
        purch_state: applyState,
        purch_check_date: new Date(),
        purch_checker_id: applyApprover,
        purch_refuse_remark: description
    }, {
        where: {
            fixedassetspurch_id: fixedassetspurch_id
        }
    });
}
//更改固定资产验收状态
async function modifyFixedAssetsCheckState(applyState, description, fixedassetscheck_id, applyApprover, domainId) {
    // let user = req.user;
    await tb_fixedassetscheck.update({
        check_state: applyState,
        check_check_date: new Date(),
        check_checker_id: applyApprover,
        check_refuse_remark: description
    }, {
        where: {
            fixedassetscheck_id: fixedassetscheck_id
        }
    });

    let fixedassetscheck = await tb_fixedassetscheck.findOne({
        where: {
            state: GLBConfig.ENABLE,
            fixedassetscheck_id: fixedassetscheck_id
        }
    });
    if (fixedassetscheck && fixedassetscheck.check_flag == 1) {
        //资产验收tab页提交，驳回后不可修改
        //修改资产验收tab页提交验收状态
        let fixedassetscheckdetail = await tb_fixedassetscheckdetail.findAll({
            where: {
                state: GLBConfig.ENABLE,
                fixedassetscheck_id: fixedassetscheck_id
            }
        });
        if (fixedassetscheckdetail) {
            for (let i = 0; i < fixedassetscheckdetail.length; i++) {
                await tb_fixedassetspurchdetail.update({
                    fixedassets_flag: applyState
                }, {
                    where: {
                        fixedassetspurchdetail_id: fixedassetscheckdetail[i].fixedassetspurchdetail_id
                    }
                });
            }

        }

    }

    //如果验收单通过，创建会计科目明细详情
    if (applyState === '3') {
        let fixedassetscheckdetail = await tb_fixedassetscheckdetail.findAll({
            where: {
                state: GLBConfig.ENABLE,
                fixedassetscheck_id: fixedassetscheck_id
            }
        });
        // if(fixedassetscheckdetail){
        //     for(let i=0;i<fixedassetscheckdetail.length;i++){
        //         await ERCAccountingControlSRV.addAccountingDetail(1601,fixedassetscheckdetail[i].fixedassetscheckdetail_id,domainId);
        //     }
        // }
    }
}

exports.modifyFixedAssetsPurchState = modifyFixedAssetsPurchState;
exports.modifyFixedAssetsCheckState = modifyFixedAssetsCheckState;