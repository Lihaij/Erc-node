/**
 * Created by Cici on 2018/5/29.
 */
/*低值易耗品详情管理*/
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCWeeklyPlanControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const task = require('../baseconfig/ERCTaskListControlSRV');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_domain = model.common_domain;
const tb_user = model.common_user;

const tb_consumables = model.erc_consumables; //低值易耗品列表
const tb_uploadfile = model.erc_uploadfile;
const tb_consumablesdetail = model.erc_consumablesdetail; //低值易耗品详情
const tb_common_user = model.common_user;
const tb_department = model.erc_department; //部门
const tb_supplier = model.erc_supplier
// 低值易耗品明细接口
exports.ERCConsumablesDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initData(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'remove') {
        removeAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    } else if (method === 'setTask') {
        setTask(req, res);
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res);
    } else if (method === 'changeDepartment') {
        changeDepartmentAct(req, res);
    } else if (method === 'search_pdc') {
        searchPurchDetailCheckAct(req, res)
    } else if (method === 'submit_pdc') {
        submitPurchDetailCheckAct(req, res)
    } else if (method === 'modify_pdc') {
        modifyPurchDetailCheckAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }

}

// 初始化基础数据
async function initData(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        returnData.LOW_VALUE_STATUS = GLBConfig.LOW_VALUE_STATUS;
        returnData.LOW_VALUE_TYPE = GLBConfig.LOW_VALUE_TYPE;
        returnData.LOW_VALUE_ACCEPTANCE_TYPE = GLBConfig.LOW_VALUE_ACCEPTANCE_TYPE;
        returnData.unitInfo = await getBaseType('JLDW', req.user.domain_id); //单位
        if (doc.consumables_code) {
            let consumable = await tb_consumables.findOne({
                where: {
                    domain_id: user.domain_id,
                    state: GLBConfig.ENABLE,
                    consumables_code: doc.consumables_code
                }
            })
            if (consumable) {
                returnData.consumable = consumable;
            } else {
                common.sendError(res, 'consumables_02');
                return
            }
        }

        let userData = await tb_common_user.findAll({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                user_type: GLBConfig.TYPE_OPERATOR
            }
        })

        if (userData) {
            returnData.userData = [];
            for (let i of userData) {
                let temy = {
                    id: i.user_id,
                    text: i.name,
                    value: i.name
                }
                returnData.userData.push(temy);
            }
        }

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
        returnData.supplier = supplier
        common.sendData(res, returnData)
    } catch (error) {
        logger.error('ERCConsumablesDetailControlResource-initData:' + error);
        common.sendFault(res, error);
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
// 查询低值易耗品
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = 'select b.*,c.name,d.department_name from tbl_erc_consumablesdetail b ' +
            'left join tbl_common_domain a on a.domain_id=b.domain_id ' +
            'left join tbl_common_user c on b.consumables_administrator_id=c.user_id ' +
            'left join tbl_erc_department d on b.department_id = d.department_id ' +
            'where b.domain_id= ? and b.state = ?';
        let replacements = [user.domain_id, GLBConfig.ENABLE];

        if (doc.search_text) {
            queryStr += ' and ( b.consumables_name like ? or b.consumables_detail_code like ? ) ';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        if (doc.consumables_parent_code) {
            queryStr += 'and b.consumables_parent_code = ?';
            replacements.push(doc.consumables_parent_code);
        }

        if (doc.consumables_detail_type_id) {
            queryStr += 'and b.consumables_detail_type_id = ?';
            replacements.push(doc.consumables_detail_type_id);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        let api_name = common.getApiName(req.path)
        for (var i of result.data) {
            let row = JSON.parse(JSON.stringify(i));
            row.files = [];
            let f = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: row.consumables_detail_id,
                    srv_id: row.consumables_detail_id,
                    srv_type: row.consumables_detail_id,
                    state: GLBConfig.ENABLE
                }
            })
            if (f.length > 0) {
                row.files = f;
            }
            row.created_at = i.created_at ? moment(i.created_at).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(row);
        }

        //查询申请部门
        if (doc.consumables_parent_code) {
            const departmentStr = `select d.* from tbl_erc_consumables f inner join tbl_erc_department d
            on f.consumables_department_id = d.department_id where f.consumables_code = ? `;
            const department = await common.queryWithCount(sequelize, req, departmentStr, [doc.consumables_parent_code]);
            returnData.department = department.data;
        }

        common.sendData(res, returnData);

    } catch (err) {
        logger.error('ERCConsumablesDetailControlResource-searchAct:' + err);
        common.sendFault(res, err);
    }
}
// 增加低值易耗品
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            consumables_detail_code = '';

        if (!doc.consumables_parent_code) {
            common.sendError(res, 'consumables_02');
            return
        }

        consumables_detail_code = await Sequence.getConsumablesDetailID();
        let addData = await tb_consumablesdetail.create({
            domain_id: user.domain_id,
            consumables_parent_code: doc.consumables_parent_code,
            consumables_detail_code: consumables_detail_code, //code
            consumables_detail_creator_id: user.user_id, //创建人ID
            consumables_detail_creator_name: user.name, //创建人名字
            consumables_detail_type_id: doc.consumables_detail_type_id, //类型 1资产申购单 2验收单
            consumables_name: doc.consumables_name, //易耗品名字
            consumables_specifications: doc.consumables_specifications, //规格型号
            consumables_unit: doc.consumables_unit, //计量单位
            consumables_administrator_id: doc.consumables_administrator_id, //管理人
            department_id: doc.department_id, //部门
            consumables_acceptance_type_id: doc.consumables_acceptance_type_id, //验收类型ID
            consumables_number: doc.consumables_number, //数量
            consumables_detail_status: GLBConfig.LOW_VALUE_STATUS[0].value, //审核状态
            consumables_supplier_id: doc.consumables_supplier_id
        })

        //修改附件
        if (addData) {
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
                        srv_id: addData.consumables_detail_id,
                        srv_type: addData.consumables_detail_id,
                        order_id: addData.consumables_detail_id,
                        file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }

            addData.dataValues.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: addData.consumables_detail_id,
                    srv_id: addData.consumables_detail_id,
                    srv_type: addData.consumables_detail_id,
                    state: GLBConfig.ENABLE
                }
            })

            if (ufs.length > 0) {
                addData.dataValues.files = ufs;
            }

            common.sendData(res, addData);
        }

    } catch (err) {
        logger.error('ERCConsumablesDetailControlResource-addAct:' + err);
        common.sendFault(res, err);
    }
}
// 修改低值易耗品
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            consumables_detail_code = '';

        if (!doc.consumables_detail_id) {
            common.sendError(res, 'consumables_03');
            return
        }

        let modifyData = await tb_consumablesdetail.findOne({
            where: {
                consumables_detail_id: doc.consumables_detail_id,
                state: GLBConfig.ENABLE
            }
        })

        if (modifyData) {
            //修改附件
            modifyData.consumables_detail_creator_id = user.user_id; //创建人ID
            modifyData.consumables_detail_creator_name = user.name; //创建人名字
            modifyData.consumables_detail_type_id = doc.consumables_detail_type_id; //类型 1资产申购单 2验收单
            modifyData.consumables_name = doc.consumables_name; //易耗品名字
            modifyData.consumables_specifications = doc.consumables_specifications; //规格型号
            modifyData.consumables_unit = doc.consumables_unit; //计量单位
            modifyData.consumables_administrator_id = doc.consumables_administrator_id; //管理人
            modifyData.department_id = doc.department_id; //部门
            modifyData.consumables_acceptance_type_id = doc.consumables_acceptance_type_id; //验收类型ID
            modifyData.consumables_number = doc.consumables_number; //数量
            modifyData.consumables_detail_status = GLBConfig.LOW_VALUE_STATUS[0].value; //审核状态
            modifyData.consumables_supplier_id = doc.consumables_supplier_id; //供应商id
            await modifyData.save();

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
                        srv_id: doc.consumables_detail_id,
                        srv_type: doc.consumables_detail_id,
                        order_id: doc.consumables_detail_id,
                        file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }

            modifyData.dataValues.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: modifyData.consumables_detail_id,
                    srv_id: modifyData.consumables_detail_id,
                    srv_type: modifyData.consumables_detail_id,
                    state: GLBConfig.ENABLE
                }
            })

            if (ufs.length > 0) {
                modifyData.dataValues.files = ufs;
            }

            common.sendData(res, modifyData);
        }
    } catch (err) {
        logger.error('ERCConsumablesDetailControlResource-modifyAct:' + err);
        common.sendFault(res, err);
    }
}
// 删除低值易耗品
let removeAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let consumables = await tb_consumablesdetail.findOne({
            where: {
                consumables_detail_id: doc.consumables_detail_id
            }
        });
        if (consumables) {
            consumables.state = GLBConfig.DISABLE;
            await consumables.save();
            common.sendData(res, consumables);
        } else {
            common.sendData(res, 'trafficApply_01');
        }

    } catch (error) {
        logger.error('ERCConsumablesDetailControlResource-removeAct:' + error);
        common.sendFault(res, error);
    }
};
// 上传模块
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        logger.error('ERCConsumablesDetailControlResource-uploadAct:' + error);
        common.sendFault(res, error)
    }
};
// 删除文件
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
        logger.error('ERCConsumablesDetailControlResource-removeFileAct:' + error);
        common.sendFault(res, error);
        return
    }
}
// 发送任务
async function setTask(req, res) {
    try { // user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user = req.user;
        let doc = req.body;
        let taskName = '';
        let taskDescription = '';
        let taskId = '';
        let groupId = common.getUUIDByTime(30);
        // 申请状态 0待提交，1已提交，2通过,3拒绝

        let consumable = await tb_consumables.findOne({
            where: {
                state: GLBConfig.ENABLE,
                consumables_code: doc.consumables_code
            }
        });

        //1资产申购单 2验收单
        if (consumable.consumables_type_id == 1) {
            taskName = '低值易耗品申购单';
            taskDescription = '低值易耗品申购:' + doc.consumables_code;
            taskId = 40;

            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
            let taskResult = await task.createTask(user, taskName, taskId, '', doc.consumables_code, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_02');
            } else {
                //更改申请状态
                if (consumable) {
                    consumable.consumables_status = '1';
                    await consumable.save()
                }

                let consumableDetail = await tb_consumablesdetail.findAll({
                    where: {
                        state: GLBConfig.ENABLE,
                        consumables_parent_code: doc.consumables_code
                    }
                });

                if (consumableDetail.length > 0) {
                    for (var i of consumableDetail) {
                        i.consumables_detail_status = 1;
                        i.save();
                    }
                }
            }
        } else if (consumable.consumables_type_id == 2) {
            if (consumable) {
                consumable.consumables_status = 3;
                await consumable.save()
            }

            await tb_consumablesdetail.update({
                consumables_detail_status: 3
            }, {
                where: {
                    consumables_parent_code: doc.consumables_code
                }
            });
        }

        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改低值易耗品状态
async function modifyConsumableState(applyState, description, consumablesCode, applyApprover, applyDomain_id) {
    let NowDoMainId = applyDomain_id;

    await tb_consumables.update({
        consumables_status: applyState,
        consumables_confirm_time: new Date(),
        consumables_confirm_id: applyApprover,
        consumables_rejected_description: description
    }, {
        where: {
            consumables_code: consumablesCode
        }
    });

    await tb_consumablesdetail.update({
        consumables_detail_status: applyState,
    }, {
        where: {
            consumables_parent_code: consumablesCode
        }
    });

    //资产验收tab页提交，驳回后不可修改
    //修改资产验收tab页提交验收状态
    let consumables = await tb_consumables.findOne({
        where: {
            state: GLBConfig.ENABLE,
            consumables_code: consumablesCode
        }
    });
    if (consumables && consumables.consumables_type_id == 3) {
        let consumablesdetail = await tb_consumablesdetail.findAll({
            where: {
                state: GLBConfig.ENABLE,
                consumables_parent_code: consumablesCode
            }
        });
        if (consumablesdetail) {
            for (let i = 0; i < consumablesdetail.length; i++) {
                await tb_consumablesdetail.update({
                    consumables_flag: applyState
                }, {
                    where: {
                        consumables_detail_id: consumablesdetail[i].consumables_purch_detail_id
                    }
                });
            }
        }
    }
}
// 选择责任人
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
        returnData.userId = meeting.user_id;
        returnData.userName = meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 选择部门
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
};

//资产验收（查询通过资产申购审核并未提交验证的数据）
async function searchPurchDetailCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements = [user.domain_id, GLBConfig.ENABLE];
        let queryStr = 'select b.*,c.name,d.department_name from tbl_erc_consumablesdetail b ' +
            'inner join tbl_erc_consumables tt on b.consumables_parent_code = tt.consumables_code and tt.consumables_status=3 ' +
            'left join tbl_common_domain a on a.domain_id=b.domain_id ' +
            'left join tbl_common_user c on b.consumables_administrator_id=c.user_id ' +
            'left join tbl_erc_department d on b.department_id = d.department_id ' +
            'where b.domain_id= ? and b.state = ? and b.consumables_detail_type_id=1 and consumables_flag in (0,2) ';

        if (doc.search_text) {
            queryStr += ' and ( b.consumables_name like ? or b.consumables_detail_code like ? ) ';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        queryStr += ' order by b.created_at';

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
        let consumables_code = await Sequence.getConsumablesAcceptanceID();
        let consumable = await tb_consumables.create({
            consumables_code: consumables_code,
            domain_id: user.domain_id,
            consumables_creator_id: user.user_id,
            consumables_creator_name: user.name,
            consumables_type_id: 3,
            consumables_status: GLBConfig.LOW_VALUE_STATUS[0].value,
            check_flag: 1
        })

        //获取需要添加的资产验收单明细
        let purchDetailArr = doc.purchDetailIds.split(",");
        for (let i = 0; i < purchDetailArr.length; i++) {
            //创建资产验收明细单
            //获取采购记录详细
            let purchdetail = await tb_consumablesdetail.findOne({
                where: {
                    consumables_detail_id: purchDetailArr[i]
                }
            });

            let queryStr = `select d.department_name,d.department_id from tbl_erc_consumablesdetail cd 
                left join tbl_erc_consumables c on (c.consumables_code = cd.consumables_parent_code and c.state=1)
                left join tbl_erc_department d on (c.consumables_department_id = d.department_id and d.state=1)
                where consumables_detail_id=${purchDetailArr[i]} `
            let result = await sequelize.query(queryStr, {
                replacements: [],
                type: sequelize.QueryTypes.SELECT
            });

            //每个固定资产有单独编号，多个数量的资产要添加多条记录
            for (let j = 0; j < purchdetail.consumables_number; j++) {
                let consumables_detail_code = await Sequence.getConsumablesDetailID();

                let addCheck2 = await tb_consumablesdetail.create({
                    domain_id: user.domain_id,
                    consumables_parent_code: consumables_code,
                    consumables_detail_code: consumables_detail_code, //code
                    consumables_detail_creator_id: user.user_id, //创建人ID
                    consumables_detail_creator_name: user.name, //创建人名字
                    consumables_detail_type_id: 2, //类型 1资产申购单 2验收单
                    consumables_name: purchdetail.consumables_name, //易耗品名字
                    consumables_specifications: purchdetail.consumables_specifications, //规格型号
                    consumables_unit: purchdetail.consumables_unit, //计量单位
                    consumables_administrator_id: purchdetail.consumables_administrator_id, //管理人
                    department_id: result[0].department_id, //部门
                    consumables_acceptance_type_id: purchdetail.consumables_acceptance_type_id, //验收类型ID
                    consumables_number: 1, //数量
                    consumables_price: purchdetail.consumables_price, //单价
                    consumables_detail_status: GLBConfig.LOW_VALUE_STATUS[0].value, //审核状态
                    consumables_purch_detail_id: purchDetailArr[i]
                })
            }

            //修改采购详单该记录提交状态
            if (purchdetail) {
                purchdetail.consumables_flag = 1;
                await purchdetail.save()
            }
        }

        /*let taskName = '低值易耗品验收单';
        let taskDescription='低值易耗品验收申请:'+ consumables_code;
        let taskId='41';
        let groupId = common.getUUIDByTime(30);
        // 申请状态 0待提交，1已提交，2通过,3拒绝

        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user,taskName,taskId,'',consumables_code,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_02');
        }else{
            //更改申请状态
            if(consumable){
                consumable.consumables_status='3';
                await consumable.save()
            }

            let consumableDetail = await tb_consumablesdetail.findAll({
                where: {
                    state:GLBConfig.ENABLE,
                    consumables_parent_code: consumables_code
                }
            });

            if(consumableDetail.length>0){
                for(let a of consumableDetail){
                    a.consumables_detail_status=1;
                    a.save();
                }
            }
            common.sendData(res, {})

        }*/

        await tb_consumables.update({
            consumables_status: 3,
        }, {
            where: {
                consumables_code: consumables_code
            }
        });

        await tb_consumablesdetail.update({
            consumables_detail_status: 3
        }, {
            where: {
                consumables_parent_code: consumables_code
            }
        });

        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function modifyPurchDetailCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        if (!doc.new.consumables_detail_id) {
            common.sendError(res, 'consumables_03');
            return
        }

        let modifyData = await tb_consumablesdetail.findOne({
            where: {
                consumables_detail_id: doc.new.consumables_detail_id,
                state: GLBConfig.ENABLE
            }
        })

        if (modifyData) {
            //修改附件
            modifyData.consumables_detail_creator_id = user.user_id; //创建人ID
            modifyData.consumables_detail_creator_name = user.name; //创建人名字
            modifyData.consumables_detail_type_id = doc.new.consumables_detail_type_id; //类型 1资产申购单 2验收单
            modifyData.consumables_name = doc.new.consumables_name; //易耗品名字
            modifyData.consumables_specifications = doc.new.consumables_specifications; //规格型号
            modifyData.consumables_unit = doc.consumables_unit; //计量单位
            modifyData.consumables_administrator_id = doc.new.consumables_administrator_id; //管理人
            modifyData.department_id = doc.new.department_id; //部门
            modifyData.consumables_acceptance_type_id = doc.new.consumables_acceptance_type_id; //验收类型ID
            modifyData.consumables_number = doc.new.consumables_number; //数量
            modifyData.consumables_price = doc.new.consumables_price; //单价
            modifyData.consumables_invoice = doc.new.consumables_invoice; //发票
            modifyData.consumables_subject = doc.new.consumables_subject; //发票
            modifyData.consumables_detail_status = GLBConfig.LOW_VALUE_STATUS[0].value; //审核状态
            await modifyData.save();

            common.sendData(res, modifyData);
        }
    } catch (err) {
        logger.error('ERCConsumablesDetailControlResource-modifyAct:' + err);
        common.sendFault(res, err);
    }
}

exports.modifyConsumableState = modifyConsumableState;