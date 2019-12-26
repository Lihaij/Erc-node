
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStcokInApplyControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_domain = model.common_domain;
const tb_user = model.common_user;
const tb_idleapply = model.erc_idleapply;
const tb_suppliermateriel = model.erc_suppliermateriel;
const tb_stockapplyitem = model.erc_stockapplyitem;
const tb_idleapplyitem = model.erc_idleapplyitem;

exports.ERCIdleApplyControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'searchItem') {
        searchItemAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
async function initAct(req, res) {
    try {
        let returnData = {},user=req.user;
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');//单位
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.mateUseState = GLBConfig.MATEUSESTATE;//单位
        returnData.materielSource = GLBConfig.MATERIELSOURCE;//物料来源
        returnData.materielManage = GLBConfig.MATERIELMANAGE;//管理模式
        returnData.materielSourceKind = GLBConfig.MATERIELSOURCEKIND;//来源分类
        returnData.idleApplyStateType = GLBConfig.MATERIALREVIEWSTATE;//申请单状态类型

        returnData.user = await tb_user.findAll({
            where:{
                state: GLBConfig.ENABLE,
                domain_id:user.domain_id
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        common.sendData(res, returnData)
    }catch (error) {
        common.sendFault(res, error);

    }
}
//闲置申请列表
async function searchAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData={};
        let queryStr=`select ia.*, ap.name as apply_submit_name, av.name as apply_review_name 
                      from tbl_erc_idleapply ia
                      left join tbl_common_user ap on (ia.idle_apply_submit = ap.user_id and ap.state=1) 
                      left join tbl_common_user av on (ia.idle_apply_review = av.user_id and av.state=1) 
                      where ia.state = 1 and ia.domain_id = ? `;
        replacements.push(user.domain_id);
        if(doc.idle_apply_state){
            queryStr+=' and ia.idle_apply_state=?';
            replacements.push(doc.idle_apply_state)
        }
        if(doc.search_text){
            queryStr+=' and ia.idleapply_id like ?';
            replacements.push('%'+doc.search_text+'%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.idle_apply_review_date = (r.idle_apply_review_date)?r.idle_apply_review_date.Format("yyyy-MM-dd"):'';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    }catch (error) {
        common.sendFault(res, error);
    }
}
//创建闲置申请
async function addAct(req,res){
    let doc = common.docTrim(req.body),user = req.user;

    try {
        let applyID = await Sequence.genIdleApplyId(user.domain_id);
        let apply = await tb_idleapply.create({
            idleapply_id: applyID,
            domain_id: user.domain_id,
            idle_apply_state: 1,
            idle_apply_review: user.user_id,
            idle_apply_submit: user.user_id,
        });
        common.sendData(res, apply);
    }catch (error) {
        common.sendFault(res, error);
    }
}
//修改闲置申请
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let item = await tb_idleapplyitem.findOne({
            where: {
                idleapplyitem_id: doc.old.idleapplyitem_id
            }
        });
        if (item) {
            item.idle_item_amount = doc.new.idle_item_amount;
            await item.save();
        }
        common.sendData(res, item)
    } catch (error) {
        common.sendFault(res, error)
    }
}
//闲置申请明细
async function searchItemAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr=`select ipi.*, m.*, ia.order_id, w.warehouse_name, wz.zone_name from tbl_erc_idleapplyitem ipi
                      left join tbl_erc_idleapply ia on (ipi.idleapply_id = ia.idleapply_id)
                      left join tbl_erc_materiel m on (ipi.materiel_id = m.materiel_id and m.state = 1)
                      left join tbl_erc_warehouse w on (ipi.warehouse_id = w.warehouse_id and w.state = 1)
                      left join tbl_erc_warehousezone wz on (ipi.warehouse_zone_id = wz.warehouse_zone_id and wz.state = 1)
                      where ia.idleapply_id = ? and ia.domain_id = ? `;
        let replacements = [doc.idleapply_id, user.domain_id];

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }

}


