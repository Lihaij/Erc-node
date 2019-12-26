/**
 * Created by Cici on 2018/5/29.
 */
/*低值易耗品列表管理*/
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

const tb_consumables = model.erc_consumables;//低值易耗品列表
const tb_consumablesdetail = model.erc_consumablesdetail;//低值易耗品详情
const tb_department = model.erc_department;//部门
const tb_uploadfile = model.erc_uploadfile;
const tb_common_user = model.common_user;
const tb_othermain = model.erc_othermain;

// 低值易耗品接口
exports.ERCConsumablesControlResource = (req, res) => {
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
    } else if (method === 'search_detail') {
        searchDetailAct(req, res)
    } else if (method === 'modify_detail') {
        modifyDetailAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    } else if (method === 'changeDepartment') {
        changeDepartmentAct(req, res);
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res);
    } else if (method === 'submit_c') {
        submitToCheckAct(req, res);
    }else {
        common.sendError(res, 'common_01')
    }

}
// 初始化基础数据
async function initData(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        returnData.LOW_VALUE_STATUS = GLBConfig.LOW_VALUE_STATUS;//审核状态
        returnData.LOW_VALUE_TYPE = GLBConfig.LOW_VALUE_TYPE;//消耗品类型
        returnData.LOW_VALUE_ACCEPTANCE_TYPE = GLBConfig.LOW_VALUE_ACCEPTANCE_TYPE; //验收类型
        returnData.SCRAPTYPE = GLBConfig.SCRAPTYPE; //报废标志
        returnData.invoiceTypeInfo = GLBConfig.INVOICETYPE;
        returnData.unitInfo = await getBaseType('JLDW', req.user.domain_id); //单位
        returnData.departments = [];
        returnData.userData = [];
        //获得部门
        var departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        })
        if (departments) {
            for (var d of departments) {
                var temy = {
                    id: d.department_id,
                    text: d.department_name,
                    value: d.department_id,
                }
                returnData.departments.push(temy);
            }

        }

        //获得责任人
        let userData = await tb_common_user.findAll({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                user_type: GLBConfig.TYPE_OPERATOR
            }
        })
        if (userData) {
            for (let i of userData) {
                let temy = {
                    id: i.user_id,
                    text: i.name,
                    value: i.name
                }
                returnData.userData.push(temy);
            }
        }

        //取得其他相关主体
        returnData.subjectInfo = await tb_othermain.findAll({
            where: {
                domain_id: user.domain_id,
                state: 1
            },
            attributes: [['other_main_id', 'id'], ['other_main_code', 'value'], ['other_main_name', 'text']]
        });

        common.sendData(res, returnData)
    } catch (error) {
        logger.error('ERCConsumablesControlResource-initData:' + err);
        common.sendFault(res, err);
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
// 查询低值易耗品列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = 'select b.*,c.department_name,e.name from tbl_common_domain a ' +
            'left join tbl_erc_consumables b on a.domain_id = b.domain_id ' +
            'left join tbl_erc_department c on b.consumables_department_id = c.department_id ' +
            'left join tbl_common_user e on b.consumables_confirm_id = e.user_id ' +
            'where b.domain_id = ? and b.state = ?';
        let replacements = [user.domain_id, GLBConfig.ENABLE];

        if (doc.search_text) {
            queryStr += 'and (b.consumables_code like ? or c.department_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        if (doc.consumables_type_id) {
            if(doc.consumables_type_id==2){
                queryStr += 'and b.consumables_type_id in (2,3) ';
            }else{
                queryStr += 'and b.consumables_type_id = ? ';
                replacements.push(doc.consumables_type_id);
            }
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (var i of result.data) {
            let temy = JSON.parse(JSON.stringify(i));
            temy.created_at = i.created_at ? moment(i.created_at).format("YYYY-MM-DD HH:mm") : null;
            temy.consumables_confirm_time = i.consumables_confirm_time ? moment(i.consumables_confirm_time).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(temy);
        }

        common.sendData(res, returnData);

    } catch (err) {
        logger.error('ERCConsumablesControlResource-searchAct:' + err);
        common.sendFault(res, err);
    }
}
// 增加低值易耗品
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user ,consumables_code = '';

        if (doc.consumables_type_id === '1' && (doc.consumables_department_id === '' || doc.consumables_department_id === null)) {
            common.sendError(res, 'consumables_01');
            return
        }

        if(doc.consumables_type_id === '1'){
            consumables_code = await Sequence.getConsumablesPurchaseID()
        }else if(doc.consumables_type_id === '2'){
            consumables_code = await Sequence.getConsumablesAcceptanceID()
        }
        let addData = await tb_consumables.create({
            consumables_code: consumables_code,
            domain_id: user.domain_id,
            consumables_creator_id:user.user_id,
            consumables_creator_name: user.name,
            consumables_type_id: doc.consumables_type_id,
            consumables_department_id: doc.consumables_department_id,
            consumables_status: GLBConfig.LOW_VALUE_STATUS[0].value
        })

        common.sendData(res, consumables_code);
        return

    } catch (err) {
        logger.error('ERCConsumablesControlResource-addAct:' + err);
        common.sendFault(res, err);
    }
}
// 修改低值易耗品
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        let consumable = await tb_consumables.findOne({
            where: {
                consumables_id: doc.consumables_id
            }
        })

        if (consumable) {
            consumable.consumables_department_id = doc.consumables_department_id;
            await consumable.save();
            common.sendData(res, consumable);
            return
        } else {
            common.sendError(res, 'consumables_02');
            return
        }

    } catch (error) {
        logger.error('ERCConsumablesControlResource-modifyAct' + error);
        common.sendFault(res, error)
    }
}
// 删除低值易耗品
async function removeAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        let consumables = await tb_consumables.findOne({
            where: {
                consumables_id: doc.consumables_id
            }
        })

        if (consumables) {
            consumables.state = GLBConfig.DISABLE;
            await consumables.save();
            common.sendData(res, consumables);
            return
        } else {
            common.sendError(res, 'consumables_02');
            return
        }
    } catch (err) {
        logger.error('ERCConsumablesControlResource-removeAct' + error);
        common.sendFault(res, err);
    }
}
// 查询低值易耗品明细
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = 'select a.*,b.name,d.department_name from tbl_erc_consumablesdetail a left join ' +
            'tbl_common_user b on a.consumables_administrator_id=b.user_id ' +
            'left join tbl_erc_department d on a.department_id=d.department_id '+
            'where a.domain_id = ? and a.state = ? and consumables_detail_type_id = ? and consumables_detail_status = ? ';
        let replacements = [user.domain_id, GLBConfig.ENABLE, GLBConfig.LOW_VALUE_TYPE[1].value, GLBConfig.LOW_VALUE_STATUS[3].value];

        if (doc.search_text) {
            queryStr += 'and (a.consumables_detail_code like ? or  a.consumables_name like ?) ';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        queryStr += ` order by a.created_at desc`
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count;
        returnData.rows = [];

        for (var i of result.data) {
            var row = JSON.parse(JSON.stringify(i));
            row.files = [];
            let f = await tb_uploadfile.findAll({
                where: {
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

        common.sendData(res, returnData);
        return

    } catch (error) {
        logger.error('ERCConsumablesControlResource-searchDetailAct:' + error);
        common.sendFault(res, error);
    }
}
// 修改低值易耗品明细
let modifyDetailAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user;

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
            modifyData.consumables_detail_type_id = doc.consumables_detail_type_id;//类型 1资产申购单 2验收单
            modifyData.consumables_name = doc.consumables_name;//易耗品名字
            modifyData.consumables_specifications = doc.consumables_specifications;//规格型号
            modifyData.consumables_unit = doc.consumables_unit;//计量单位
            modifyData.department_id = doc.department_id;//部门
            modifyData.consumables_administrator_id = doc.consumables_administrator_id;//管理人
            modifyData.consumables_acceptance_type_id = doc.consumables_acceptance_type_id;//验收类型ID
            await modifyData.save();

            let api_name = '‌ERCCONSUMABLESDETAILCONTROLSRV';
            for (let m of doc.files) {
                if (m.file_url) {
                    let fileUrl = await common.fileMove(m.file_url, 'upload');
                    let addFile = await tb_uploadfile.create({
                        api_name: api_name,
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
        logger.error('ERCConsumablesControlResource-searchAct:' + err);
        common.sendFault(res, err);
    }
}
// 上传
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        logger.error('ERCConsumablesControlResource-uploadAct:' + error);
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
        logger.error('ERCConsumablesControlResource-removeFileAct:' + error);
        common.sendFault(res, error);
        return
    }
};
// 选择部门
async function changeDepartmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u =doc.users[0]
            let userGroup = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: u.department_id
                }
            });

            returnData.userDepartmentId=userGroup.department_id;
            returnData.userDepartmentName=userGroup.department_name;

        } else {
            returnData.userDepartmentId=null;
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
};
// 选择责任人
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let u =doc.users[0]

        let meeting = await tb_user.findOne({
            where: {
                domain_id: u.domain_id,
                user_id: u.user_id
            }
        });
        returnData.userId=meeting.user_id;
        returnData.userName=meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 弃用
async function submitToCheckAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;



        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
