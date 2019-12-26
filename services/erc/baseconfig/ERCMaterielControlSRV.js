const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('MaterielControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const ERCTaskListControl = require('./ERCTaskListControlSRV')

const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_materiel = model.erc_materiel;
const tb_reviewmateriel = model.erc_reviewmateriel;
const tb_user = model.common_user;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

exports.ERCMaterielControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'modify_table') {
        modifyTable(req, res)
    } else if (method === 'search_r') {
        searchReviewAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'modify_review') {
        modifyReviewAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    }  else {
        common.sendError(res, 'common_01');
    }
};

// 初始化基础数据
async function initAct(req, res) {
    let returnData = {},
        user = req.user;

    await FDomain.getDomainListInit(req, returnData);
    returnData.unitInfo = await getBaseType('JLDW',user.domain_id); //单位
    returnData.materielSource = GLBConfig.MATERIELSOURCE; //物料来源
    returnData.materielManage = GLBConfig.MATERIELMANAGE; //管理模式
    returnData.statusInfo = GLBConfig.STATUSINFO;//生效状态
    returnData.materielType = GLBConfig.MATERIELTYPE;//物料分类
    // returnData.batchInfo = GLBConfig.BATCHINFO;//批次
    // returnData.materielProcedure = GLBConfig.MATERIELPROCEDURE;//工序
    returnData.materielAmto = GLBConfig.MATERIELAMTO;//制品分类
    returnData.reviewInfo = GLBConfig.MATERIALREVIEWSTATE;//审核状态
    returnData.formulaInfo = GLBConfig.FORMULA;//算料公式
    returnData.materielConversion = GLBConfig.MATERIELCONVERSION;//计算单位转换
    returnData.materielIntpart = GLBConfig.MATERIELINTPART;//是否取整
    returnData.stateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;//状态管理
    returnData.procurementType = GLBConfig.PROCUREMENTTYPE;//采购类型
    returnData.materielAccounting = GLBConfig.MATERIELACCOUNTING;//适用的会计科目

    returnData.staffInfo = []//团队人员

    let staff = await tb_user.findAll({
        where: {
            user_type: '01',
            state: GLBConfig.ENABLE,
            domain_id: user.domain_id
        }
    });
    for (let s of staff) {
        returnData.staffInfo.push({
            id: (s.user_id).toString(),
            value: (s.user_id).toString(),
            text: s.name
        });
    }
    common.sendData(res, returnData)
}

async function getBaseType(code,domain_id) {
    try {
        let returnData = [],
            replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.state=1 and t.state=1 and d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        if(domain_id){
            queryStr +=` and d.domain_id=?`
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

// 查询物料列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        // let queryStr = 'select * from tbl_erc_materiel where state = 1 and domain_id' + await FDomain.getDomainListStr(req);
        let queryStr='select m.*,d.domain_name ' +
            'from tbl_erc_materiel m ' +
            'left join tbl_common_domain d on (m.domain_id=d.domain_id) ' +
            'where m.materiel_review_state=1 and m.domain_id=?';
        // if (doc.domain_id) {
        //     queryStr += ' and m.domain_id = ?';
            replacements.push(user.domain_id);
        // }

        if (doc.search_text) {
            queryStr += ' and (materiel_name like ? or materiel_code like ? or materiel_describe like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        queryStr += ' order by m.domain_id,m.materiel_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            result.materiel_tax = ((r.materiel_tax*100).toFixed(2)) +'%';
            result.materiel_loss = ((r.materiel_loss*100).toFixed(2)) +'%';
            result.materiel_cost = '¥'+(r.materiel_cost.toFixed(2));
            result.materiel_sale = '¥'+(r.materiel_sale.toFixed(2));
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 增加物料
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        const { body, user } = req;
        const { domain_id } = user;

        let reviewmateriel = await tb_reviewmateriel.findOne({
                where: {
                    review_materiel_code: doc.review_materiel_code,
                    domain_id,
                    state:1
                }
            });
        if(reviewmateriel) {
                common.sendError(res, 'materiel_02');
                return
           }
        let materiel = await tb_materiel.findOne({
            where: {
                materiel_code: doc.review_materiel_code,
                domain_id
            }
        });
        if(materiel) {
            common.sendError(res, 'materiel_02');
            return
        }

        const replacements=[];
        let queryStr=`select * from tbl_erc_taskallotuser t,tbl_common_user u
            where t.user_id=u.user_id and t.state=1 and u.state=1 and taskallot_id= 7 and t.domain_id =?`;
        replacements.push(user.domain_id);
        let taskallotuser = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT})

        let taskName=''
        for (let r of taskallotuser) {
            taskName+=r.name+','
        }
        if (taskName == '') {
            return common.sendError(res, 'materiel_06');
        } else {
            taskName=(taskName.slice(taskName.length-1)==',')?taskName.slice(0,-1):taskName;
        }
        let addReview = await tb_reviewmateriel.create({
            domain_id: user.domain_id,
            review_materiel_code: doc.review_materiel_code,
            review_materiel_name: doc.review_materiel_name,
            review_materiel_unit: doc.review_materiel_unit,
            review_materiel_unit_bk: doc.review_materiel_unit_bk,
            review_materiel_formatunit: doc.review_materiel_formatunit,
            review_materiel_format: doc.review_materiel_format,
            review_materiel_formatcount: doc.review_materiel_formatcount,
            review_materiel_type: doc.review_materiel_type,
            review_materiel_source: doc.review_materiel_source,
            review_materiel_formula: doc.review_materiel_formula,
            review_materiel_manage: doc.review_materiel_manage,
            // review_materiel_batch:doc.review_materiel_batch,
            review_materiel_sale:doc.review_materiel_sale,
            review_materiel_award_cost:doc.review_materiel_award_cost,
            // review_materiel_tax:doc.review_materiel_tax/100,
            // review_materiel_loss:doc.review_materiel_loss/100,
            review_materiel_describe: doc.review_materiel_describe,
            // review_materiel_procedure: doc.review_materiel_procedure,
            review_materiel_amto: doc.review_materiel_amto,
            review_materiel_cost: doc.review_materiel_cost,
            review_materiel_conversion: doc.review_materiel_conversion,
            review_materiel_intpart: doc.review_materiel_intpart,
            review_materiel_x: doc.review_materiel_x,
            review_materiel_y: doc.review_materiel_y,
            review_materiel_z: doc.review_materiel_z,
            review_materiel_procurement_type: doc.review_materiel_procurement_type,
            // review_performer: doc.review_performer,
            review_performer:taskName,
            review_materiel_state_management: doc.review_materiel_state_management,
            review_materiel_iid_code: doc.review_materiel_iid_code,
            review_materiel_safe_standard: doc.review_materiel_safe_standard || 0,
            review_materiel_system_standard: doc.review_materiel_system_standard,
            review_materiel_check_ratio: doc.review_materiel_check_ratio,
            review_materiel_accounting: doc.review_materiel_accounting,
            review_materiel_cs_code: doc.review_materiel_cs_code,
            review_materiel_foreign_sale: doc.review_materiel_foreign_sale,
            review_materiel_min_purchase_num: doc.review_materiel_min_purchase_num,
            review_materiel_supply_cycle: doc.review_materiel_supply_cycle,
            review_state: 1
        });
        let groupID = common.getUUIDByTime(30);
        ERCTaskListControl.createTask(user, '物料审核', '7', '',doc.review_materiel_code, '物料审核','',groupID)
        common.sendData(res, addReview);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 修改物料
async function modifyAct(req, res) {
    try {

        let doc = common.docTrim(req.body), replacements=[], user = req.user;
        //在reviewmateriel与materiel中都存在的物料
        replacements=[];
        let queryStr=`select * from tbl_erc_taskallotuser t,tbl_common_user u
            where t.user_id=u.user_id and t.state=1 and u.state=1 and taskallot_id= 7 and t.domain_id =?`;
        replacements.push(user.domain_id);
        let taskallotuser = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT})

        let taskName=''
        for (let r of taskallotuser) {
            taskName+=r.name+','
        }
        if (taskName == '') {
            return common.sendError(res, 'materiel_06');
        } else {
            taskName=(taskName.slice(taskName.length-1)==',')?taskName.slice(0,-1):taskName;
        }
        let reviewmateriel = await tb_reviewmateriel.findOne({
            where: {
                review_materiel_code: doc.review_materiel_coden,
                state: '1',
                domain_id: user.domain_id
            }
        });

        if (reviewmateriel) {
            reviewmateriel.review_materiel_code = doc.review_materiel_coden;
            reviewmateriel.review_materiel_name = doc.review_materiel_namen;
            reviewmateriel.review_materiel_unit = doc.review_materiel_unit;
            reviewmateriel.review_materiel_unit_bk = doc.review_materiel_unit_bk;
            reviewmateriel.review_materiel_formatunit = doc.review_materiel_formatunitn;
            reviewmateriel.review_materiel_format = doc.review_materiel_formatn;
            reviewmateriel.review_materiel_formatcount = doc.review_materiel_formatcountn;
            reviewmateriel.review_materiel_type = doc.review_materiel_type;
            reviewmateriel.review_materiel_describe = doc.review_materiel_describen;
            reviewmateriel.review_materiel_source = doc.review_materiel_source;
            reviewmateriel.review_materiel_formula = doc.review_materiel_formula;
            reviewmateriel.review_materiel_manage = doc.review_materiel_manage;
            reviewmateriel.review_materiel_cost = doc.review_materiel_costn;
            reviewmateriel.review_materiel_sale = doc.review_materiel_salen;
            // reviewmateriel.review_materiel_source_kind = doc.new.materiel_source_kind;
            // reviewmateriel.review_materiel_tax = doc.review_materiel_taxn/100;
            reviewmateriel.review_materiel_amto = doc.review_materiel_amto;
            reviewmateriel.review_materiel_conversion = doc.review_materiel_conversion;
            reviewmateriel.review_materiel_intpart = doc.review_materiel_intpart;
            reviewmateriel.review_materiel_x = doc.review_materiel_xn;
            reviewmateriel.review_materiel_y = doc.review_materiel_yn;
            reviewmateriel.review_materiel_z = doc.review_materiel_zn;
            reviewmateriel.review_state = '1';//待审核
            // reviewmateriel.review_materiel_loss = doc.review_materiel_lossn/100;
            //modimate.materiel_batch = doc.new.materiel_batch;
            reviewmateriel.state = '1';//0为驳回
            reviewmateriel.review_performer = taskName;
            reviewmateriel.review_materiel_state_management = doc.review_materiel_state_management;
            reviewmateriel.review_materiel_procurement_type = doc.review_materiel_procurement_type;
            reviewmateriel.review_materiel_iid_code = doc.review_materiel_iid_code;
            reviewmateriel.review_materiel_safe_standard =  doc.review_materiel_safe_standard || 0;
            reviewmateriel.review_materiel_system_standard =  doc.review_materiel_system_standard;
            reviewmateriel.review_materiel_check_ratio = doc.review_materiel_check_ratio;
            reviewmateriel.review_materiel_accounting = doc.review_materiel_accounting;
            reviewmateriel.review_materiel_cs_code = doc.review_materiel_cs_code;
            reviewmateriel.review_materiel_foreign_sale = doc.review_materiel_foreign_sale;
            reviewmateriel.review_materiel_min_purchase_num = doc.review_materiel_min_purchase_num;
            reviewmateriel.review_materiel_supply_cycle = doc.review_materiel_supply_cycle;
            await reviewmateriel.save()

            let materiel = await tb_materiel.findOne({
                where: {
                    materiel_code: reviewmateriel.review_materiel_code,
                    domain_id: user.domain_id
                }
            });
            if (materiel){
                materiel.materiel_review_state = 0;
            } else {
               return common.sendError(res, 'materiel_07');
            }
            await materiel.save()
            let groupID = common.getUUIDByTime(30);
            ERCTaskListControl.createTask(user, '物料审核', '7', '',
                reviewmateriel.review_materiel_code, '物料审核','',groupID)
        } else {
            //在materiel中都存在的物料，在reviewmateriel不存在
            let reviewmateriel = await tb_reviewmateriel.create({
                domain_id: user.domain_id,
                review_materiel_code: doc.review_materiel_coden,
                review_materiel_name: doc.review_materiel_namen,
                review_materiel_unit: doc.review_materiel_unit,
                review_materiel_unit_bk: doc.review_materiel_unit_bk,
                review_materiel_format: doc.review_materiel_formatn,
                review_materiel_formatcount: doc.review_materiel_formatcountn,
                review_materiel_type: doc.review_materiel_type,
                review_materiel_source: doc.review_materiel_source,
                review_materiel_formula: doc.review_materiel_formula,
                review_materiel_manage: doc.review_materiel_manage,
                // review_materiel_batch:doc.review_materiel_batch,
                review_materiel_sale:doc.review_materiel_salen,
                // review_materiel_tax:doc.review_materiel_taxn/100,
                // review_materiel_loss: doc.review_materiel_lossn/100,
                review_materiel_describe: doc.review_materiel_describen,
                // review_materiel_procedure: doc.review_materiel_procedure,
                review_materiel_amto: doc.review_materiel_amto,
                review_materiel_cost: doc.review_materiel_costn,
                review_materiel_formatunit: doc.review_materiel_formatunitn,
                review_materiel_conversion: doc.review_materiel_conversion,
                review_materiel_intpart: doc.review_materiel_intpart,
                review_materiel_x: doc.review_materiel_xn,
                review_materiel_y: doc.review_materiel_yn,
                review_materiel_z: doc.review_materiel_zn,
                review_materiel_procurement_type: doc.review_materiel_procurement_type,
                // review_performer: doc.review_performer,
                review_performer: taskName,
                review_materiel_state_management: doc.review_materiel_state_management,
                review_materiel_iid_code: doc.review_materiel_iid_code,
                review_materiel_safe_standard : doc.review_materiel_safe_standard || 0,
                review_materiel_system_standard :  doc.review_materiel_system_standard,
                review_materiel_check_ratio : doc.review_materiel_check_ratio,
                review_materiel_accounting : doc.review_materiel_accounting,
                review_materiel_cs_code : doc.review_materiel_cs_code,
                review_materiel_foreign_sale : doc.review_materiel_foreign_sale,
                review_materiel_min_purchase_num : doc.review_materiel_min_purchase_num,
                review_materiel_supply_cycle : doc.review_materiel_supply_cycle,
                review_state: '1',
                state: '1'
            });
            await reviewmateriel.save()

            let materiel = await tb_materiel.findOne({
                where: {
                    materiel_code: doc.review_materiel_coden,
                    domain_id: user.domain_id
                }
            });
            if (materiel){
                materiel.materiel_review_state = 0;
            } else {
               return common.sendError(res, 'materiel_07');
            }
            await materiel.save()
            let groupID = common.getUUIDByTime(30);
            ERCTaskListControl.createTask(user, '物料审核', '7', '', reviewmateriel.review_materiel_code, '物料审核','',groupID)
        }

        common.sendData(res, reviewmateriel);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查询审核的物料
async function searchReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = 'select * from tbl_erc_reviewmateriel where state = 1 and domain_id = ?'

        replacements.push(user.domain_id);
        if (doc.review_state) {// 1: 待审核, 2: 已审核, 3:驳回
            queryStr += ` and review_state = ? `;
            replacements.push(doc.review_state);
        }

        if (doc.search_text) {
            queryStr += ' and (review_materiel_name like ? or review_materiel_code like ? or review_materiel_format like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            if(r.review_materiel_tax == null) {
                r.review_materiel_tax = 0
            }
            if(r.review_materiel_loss == null) {
                r.review_materiel_loss = 0
            }
            if(r.review_materiel_cost == null) {
                r.review_materiel_cost = 0
            }
            if(r.review_materiel_sale == null) {
                r.review_materiel_sale = 0
            }
            result.review_materiel_tax = ((r.review_materiel_tax*100).toFixed(2)) +'%';
            result.review_materiel_loss = ((r.review_materiel_loss*100).toFixed(2)) +'%';
            result.review_materiel_cost = '¥'+(r.review_materiel_cost.toFixed(2));
            result.review_materiel_sale = '¥'+(r.review_materiel_sale.toFixed(2));
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查看审批物料的详情
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr = 'select * from tbl_erc_reviewmateriel where state = 1 and domain_id = ? and review_materiel_code = ?'

        replacements.push(user.domain_id,doc.review_materiel_code);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            result.review_materiel_tax = ((r.review_materiel_tax*100).toFixed(2)) +'%';
            result.review_materiel_loss = ((r.review_materiel_loss*100).toFixed(2)) +'%';
            result.review_materiel_cost = '¥'+(r.review_materiel_cost.toFixed(2));
            result.review_materiel_sale = '¥'+(r.review_materiel_sale.toFixed(2));
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 修改审批物料
async function modifyReviewAct(req, res) {
    try {

        let doc = common.docTrim(req.body), replacements=[], user = req.user;

        replacements=[];
        let queryStr=`select * from tbl_erc_taskallotuser t,tbl_common_user u
            where t.user_id=u.user_id and t.state=1 and u.state=1 and taskallot_id= 7 and t.domain_id =?`;
        replacements.push(user.domain_id);
        let taskallotuser = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT})

        let taskName=''
        for (let r of taskallotuser) {
            taskName+=r.name+','
        }
        if (taskName == '') {
            return common.sendError(res, 'materiel_06');
        } else {
            taskName=(taskName.slice(taskName.length-1)==',')?taskName.slice(0,-1):taskName;
        }

        let reviewmateriel = await tb_reviewmateriel.findOne({
            where: {
                review_materiel_code: doc.review_materiel_code,
                review_state: '3',
                state: '1'
            }
        });

        if (reviewmateriel) {
            reviewmateriel.review_materiel_code = doc.review_materiel_code;
            reviewmateriel.review_materiel_name = doc.review_materiel_name;
            reviewmateriel.review_materiel_unit = doc.review_materiel_unit;
            reviewmateriel.review_materiel_formatunit = doc.review_materiel_formatunit;
            reviewmateriel.review_materiel_format = doc.review_materiel_format;
            reviewmateriel.review_materiel_formatcount = doc.review_materiel_formatcount;
            reviewmateriel.review_materiel_type = doc.review_materiel_type;
            reviewmateriel.review_materiel_describe = doc.review_materiel_describe;
            reviewmateriel.review_materiel_source = doc.review_materiel_source;
            reviewmateriel.review_materiel_formula = doc.review_materiel_formula;
            reviewmateriel.review_materiel_manage = doc.review_materiel_manage;
            reviewmateriel.review_materiel_cost = doc.review_materiel_cost;
            reviewmateriel.review_materiel_sale = doc.review_materiel_sale;
            // reviewmateriel.review_materiel_source_kind = doc.new.materiel_source_kind;
            // reviewmateriel.review_materiel_tax = doc.review_materiel_tax/100;
            reviewmateriel.review_materiel_amto = doc.review_materiel_amto;
            reviewmateriel.review_materiel_conversion = doc.review_materiel_conversion;
            reviewmateriel.review_materiel_intpart = doc.review_materiel_intpart;
            reviewmateriel.review_materiel_x = doc.review_materiel_x;
            reviewmateriel.review_materiel_y = doc.review_materiel_y;
            reviewmateriel.review_materiel_z = doc.review_materiel_z;
            reviewmateriel.review_materiel_procurement_type = doc.review_materiel_procurement_type;
            reviewmateriel.review_state = '1';//待审核
            // reviewmateriel.review_materiel_loss = doc.review_materiel_loss/100;
            //modimate.materiel_batch = doc.new.materiel_batch;
            reviewmateriel.state = '1';//0为驳回
            reviewmateriel.review_materiel_state_management = doc.review_materiel_state_management;
            reviewmateriel.review_materiel_supply_cycle = doc.review_materiel_supply_cycle;
            reviewmateriel.review_performer = taskName;
            await reviewmateriel.save()

            let groupID = common.getUUIDByTime(30);
            ERCTaskListControl.createTask(user, '物料审核', '7', '',
                reviewmateriel.review_materiel_code, '物料审核','',groupID)
        }
        common.sendData(res, reviewmateriel);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 删除审批物料
let deleteAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let reviewmateriel= await tb_reviewmateriel.findOne({
            where: {
                review_materiel_id: doc.review_materiel_id,
                state: GLBConfig.ENABLE
            }
        });

        if (reviewmateriel) {
            reviewmateriel.state = GLBConfig.DISABLE;
            await reviewmateriel.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'materiel_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 修改物料审批状态
let modifyTable = async (req, res) => {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let materielState = await tb_materiel.findOne({
            where: {
                materiel_id: doc.old.materiel_id,
            }
        });

        if(materielState.domain_id != user.domain_id){
            return common.sendError(res, 'materiel_07');
        }

        if (materielState.domain_id = user.domain_id) {
            materielState.state = doc.new.state
            await materielState.save()
        }else{
            return common.sendError(res, 'materiel_07');
        }
        common.sendData(res, materielState);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
