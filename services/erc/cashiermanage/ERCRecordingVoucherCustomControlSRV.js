/**
 * Created by Cici on 2018/4/26.
 */
/**
 * 资金费用记账凭证
 */
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');


// tables
const sequelize = model.sequelize;
const tb_recordingvouchersc = model.erc_recordingvouchersc;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const task = require('../baseconfig/ERCTaskListControlSRV');
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_accounting_subject = model.erc_accounting_subject;
// const AccountConst = require('../../../util/AccountConst');


exports.ERCRecordingVoucherCustomControlResource = (req, res) => {
    let method = req.query.method;
    if(method==='init') {
        initAct(req, res)
    }else if (method==='getRecordingVoucherCustom'){
        getRecordingVoucherCustom(req,res)
    }else if (method==='addRecordingVoucherCustom'){
        addRecordingVoucherCustom(req,res)
    }else if (method==='addRecordingVoucherDetailCustom'){
        addRecordingVoucherDetailCustom(req,res)
    }else if (method==='getRecordingVoucherDetailCustom'){
        getRecordingVoucherDetailCustom(req,res)
    }else if (method==='modifyRecordingVoucherDetailCustom'){
        modifyRecordingVoucherDetailCustom(req,res)
    }else if (method==='deleteRecordingvouchersc'){
        deleteRecordingvouchersc(req,res)
    }else if (method==='sendTask'){
        sendTask(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
}

async function getBankNo(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select b.* from tbl_erc_companybankno b,tbl_erc_company c " +
            "where b.state=1 and c.state=1 and b.company_id=c.company_id " +
            "and c.domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.companybankno_id,
                value: i.companybankno_id,
                text: i.companybankno_bank_no
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getBaseType(){
    try {
        let queryStr = "select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t" +
            " where d.basetype_id=t.basetype_id";
        let result = await sequelize.query(queryStr, {replacements: [], type: sequelize.QueryTypes.SELECT});
        return result
    } catch (error) {
        throw error
    }
}
async function getCorporateclients(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select * from tbl_erc_corporateclients where state=1 and domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.corporateclients_id,
                value: i.corporateclients_id,
                text: i.corporateclients_name
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getMateriel(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select * from tbl_erc_materiel where state=1 and domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.materiel_id,
                value: i.materiel_id,
                text: `${i.materiel_name}(${i.materiel_format})`
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getFixedassetscheckdetail(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select fd.* from tbl_erc_fixedassetscheckdetail fd,tbl_erc_fixedassetscheck f " +
            " where fd.fixedassetscheck_id = f.fixedassetscheck_id and f.domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.materiel_id,
                value: i.materiel_id,
                text: `${i.fixedassets_name}(${i.fixedassets_model})`
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getAmortize(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select * from tbl_erc_amortize where state=1 and domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.amortize_id,
                value: i.amortize_id,
                text: i.amortize_name
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getSupplier(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select * from tbl_erc_supplier where state=1 and domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.supplier_id,
                value: i.supplier_id,
                text: i.supplier_name
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getOrder(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select * from tbl_erc_order where state=1 and domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.order_id,
                value: i.order_id,
                text: i.order_id
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function getUser(user){
    try{
        let replacements = [],returnData = []
        let queryStr = "select * from tbl_common_user where state=1 and domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.user_id,
                value: i.user_id,
                text: i.name
            })
        }
        return returnData
    }catch (error){
        throw error
    }
}
async function initAct(req,res){
    try {
        let user = req.user;
        let bankNo = await getBankNo(user);
        let baseType = await getBaseType();
        let corporateclients = await getCorporateclients(user);
        let materiel = await getMateriel(user);
        let fixedassets = await getFixedassetscheckdetail(user);
        let amortize = await getAmortize(user);
        let supplier = await getSupplier(user);
        let order = await getOrder(user);
        let userInfo = await getUser(user)
        let returnData = {
            recordingvoucherscState:GLBConfig.RECORDINGVOUCHERSCSTATE,//项目状态
            accountingList:[],//总账科目
            bankNo:bankNo,//银行账号
            baseType:baseType,//基础字典
            corporateclients:corporateclients,//客户
            materiel:materiel,//客户
            fixedassets:fixedassets,//固定资产
            amortize:amortize,//待摊资产
            supplier:supplier,//供应商
            order:order,
            qtysk:[...corporateclients,...supplier,...userInfo],
            qtyfk:[...corporateclients,...supplier,...userInfo]
        };

        /*AccountConst.codeArray.forEach((item, index) => {
            returnData.accountingList.push({
                id:item,
                value:item,
                text:AccountConst.nameArray[index]
            })
        });*/

        returnData.accountingList = await tb_accounting_subject.findAll({
            attributes: [['accounting_subject_code', 'id'], ['accounting_subject_code', 'value'], ['accounting_subject_name', 'text']]
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getRecordingVoucherCustom(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],returnData = {}

        let queryStr = `select s.recordingvouchersc_id,s.recordingvouchersc_code,s.domain_id,s.recordingvouchersc_depart_id,
            s.recordingvouchersc_time,s.recordingvouchersc_count,s.recordingvouchersc_type,s.s_recordingvouchersc_type,
            s.recordingvouchersc_user_id,s.recordingvouchersc_state,s.recordingvouchersc_examine_time,
            s.recordingvouchersc_examine,
            u.username,count(d.recordingvoucherdetailsc_id) as detailCount  
            from tbl_erc_recordingvouchersc s 
            left join tbl_common_user u on (u.user_id = s.recordingvouchersc_user_id and u.state=1) 
            left join tbl_erc_recordingvoucherdetailsc d on (s.recordingvouchersc_id = d.recordingvouchersc_id and d.state=1)
            where s.state=1 and s.domain_id=? 
            `;
        replacements.push(user.domain_id);
        if(doc.recordingvouchersc_type){
            queryStr += ` and recordingvouchersc_type in ( ${ doc.recordingvouchersc_type.join(",")} )`
        }else {
            queryStr += ` and recordingvouchersc_type=99`
        }
        queryStr += ` group by s.recordingvouchersc_id,s.recordingvouchersc_code,s.domain_id,s.recordingvouchersc_depart_id,
            s.recordingvouchersc_time,s.recordingvouchersc_count,s.recordingvouchersc_type,s.s_recordingvouchersc_type,
            s.recordingvouchersc_user_id,s.recordingvouchersc_state,s.recordingvouchersc_examine_time,
            s.recordingvouchersc_examine,s.recordingvouchersc_examine,u.username 
            order by recordingvouchersc_code desc`

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let resultTemp = JSON.parse(JSON.stringify(r));
            resultTemp.recordingvouchersc_time = moment(resultTemp.recordingvouchersc_time).format('YYYY-MM-DD');
            returnData.rows.push(resultTemp)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function addRecordingVoucherCustom(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user

        let genRecordingVoucherSGID = await Sequence.genRecordingVoucherSGID(user);
        let addRecordingvouchersc = await tb_recordingvouchersc.create({
            recordingvouchersc_code:genRecordingVoucherSGID,
            domain_id:user.domain_id,
            recordingvouchersc_time:moment().format("YYYY-MM-DD"),
            recordingvouchersc_count:0,
            recordingvouchersc_user_id:user.user_id,
            recordingvouchersc_type:99  //0资金支出，1客户收款    99手工记账凭证
        })

        common.sendData(res, addRecordingvouchersc);
//校验是否分配任务处理人员
//         let taskallot = await tb_taskallot.findOne({
//             where:{
//                 state:GLBConfig.ENABLE,
//                 taskallot_name:'手工记账凭证新增审核任务'
//             }
//         });
//         let taskallotuser = await tb_taskallotuser.findOne({
//             where:{
//                 state:GLBConfig.ENABLE,
//                 domain_id: user.domain_id,
//                 taskallot_id:taskallot.taskallot_id
//             }
//         });
//
//         if (!taskallotuser) {
//             return common.sendError(res, 'recordingvouchersc_01');
//         }else{
//
//             let taskName = '手工记账凭证新增审核任务';
//             let taskDescription = addRecordingvouchersc.recordingvouchersc_code + '  手工记账凭证新增审核任务';
//             let groupId = common.getUUIDByTime(30);
//             let taskResult = await task.createTask(user,taskName,67,taskallotuser.user_id,addRecordingvouchersc.recordingvouchersc_id,taskDescription,'',groupId);
//             if(!taskResult){
//                 return common.sendError(res, 'task_01');
//             }else {
//                 common.sendData(res, addRecordingvouchersc);
//             }
//         }
    }catch (error){
        common.sendFault(res, error);
    }
}

async function addRecordingVoucherDetailCustom(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user
        let addRecordingvoucherdetailsc = await tb_recordingvoucherdetailsc.create({
            domain_id:user.domain_id,
            recordingvouchersc_id:doc.recordingvouchersc_id,
            recordingvoucherdetailsc_digest:'',//  摘要
            recordingvoucherdetailsc_accsum:'',//   总账科目
            recordingvoucherdetailsc_activeAccount:'',//  科目明细
            recordingvoucherdetailsc_debite:'',//借方金额
            recordingvoucherdetailsc_credit:'',//贷方金额
            recordingvoucherdetailsc_type:'',//0贷，1借
            recordingvoucherdetailsc_GLtype:'',   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            recordingvoucherdetailsc_depart_id:''//部门
        })
        common.sendData(res, addRecordingvoucherdetailsc);
    }catch (error){
        common.sendFault(res, error);
    }
}
async function getRecordingVoucherDetailCustom(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user,replacements = [],returnData = {}

        let queryStr = `select s.* from tbl_erc_recordingvoucherdetailsc s where s.state=1 and s.recordingvouchersc_id=? order by recordingvoucherdetailsc_id`;
        replacements.push(doc.recordingvouchersc_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        queryStr = `select recordingvouchersc_state from tbl_erc_recordingvouchersc where state=1 and recordingvouchersc_id=?`;
        result = await sequelize.query(queryStr , {replacements: replacements, type: sequelize.QueryTypes.SELECT})
        returnData.state = result[0].recordingvouchersc_state;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function sendTask(req,res){
    try{
        let doc=common.docTrim(req.body),user=req.user
// 校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'手工记账凭证新增审核任务'
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
            return common.sendError(res, 'recordingvouchersc_01');
        }else{
            let recordingvouchersc = await tb_recordingvouchersc.findOne({
                where:{
                    state:1,
                    recordingvouchersc_id:doc.recordingvouchersc_id
                }
            })
            if(recordingvouchersc){
                recordingvouchersc.recordingvouchersc_state = 1
                await recordingvouchersc.save()
            }

            let taskName = '手工记账凭证新增审核任务';
            let taskDescription = doc.recordingvouchersc_code + '  手工记账凭证新增审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,67,taskallotuser.user_id,doc.recordingvouchersc_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                common.sendData(res, {});
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
async function modifyRecordingVoucherDetailCustom(req,res){
    try{
        let doc = common.docTrim(req.body),replacements=[]

        let queryStr = `update tbl_erc_recordingvoucherdetailsc set recordingvouchersc_id = recordingvouchersc_id`;
        if(doc.recordingvoucherdetailsc_digest){
            queryStr+=`,recordingvoucherdetailsc_digest=?`;
            replacements.push(doc.recordingvoucherdetailsc_digest)//摘要
        }
        if(doc.recordingvoucherdetailsc_accsum){
            queryStr+=`,recordingvoucherdetailsc_accsum=?`;
            replacements.push(doc.recordingvoucherdetailsc_accsum)//总账科目text
        }
        if(doc.recordingvoucherdetailsc_activeAccount){
            queryStr+=`,recordingvoucherdetailsc_activeAccount=?`;
            replacements.push(doc.recordingvoucherdetailsc_activeAccount)//明细科目text
        }
        if(doc.recordingvoucherdetailsc_accsum_code){
            queryStr+=`,recordingvoucherdetailsc_accsum_code=?`;
            replacements.push(doc.recordingvoucherdetailsc_accsum_code)//总账科目code

            // let index = AccountConst.codeArray.indexOf(doc.recordingvoucherdetailsc_accsum_code)
            queryStr+=`,recordingvoucherdetailsc_GLtype=?`;
            const { accounting_subject_type_code } = await getAccountingSubject({ code: doc.recordingvoucherdetailsc_accsum_code });
            replacements.push(accounting_subject_type_code); // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        }
        if(doc.recordingvoucherdetailsc_activeAccount_code){
            queryStr+=`,recordingvoucherdetailsc_activeAccount_code=?`;
            replacements.push(doc.recordingvoucherdetailsc_activeAccount_code)//明细科目code
        }
        if(doc.recordingvoucherdetailsc_debite){
            queryStr+=`,recordingvoucherdetailsc_debite=?,recordingvoucherdetailsc_credit=0,recordingvoucherdetailsc_type=1`;
            replacements.push(doc.recordingvoucherdetailsc_debite)//借方金额
        }
        if(doc.recordingvoucherdetailsc_credit){
            queryStr+=`,recordingvoucherdetailsc_credit=?,recordingvoucherdetailsc_debite=0,recordingvoucherdetailsc_type=0`;
            replacements.push(doc.recordingvoucherdetailsc_credit)//贷方金额
        }
        if(doc.recordingvoucherdetailsc_GLtype){
            queryStr+=`,recordingvoucherdetailsc_GLtype=?`;
            replacements.push(doc.recordingvoucherdetailsc_GLtype)//0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        }

        queryStr+=` where recordingvoucherdetailsc_id = ?`
        replacements.push(doc.recordingvoucherdetailsc_id)

        let queryRst = await sequelize.query(queryStr , {replacements: replacements, type: sequelize.QueryTypes.UPDATE})

        common.sendData(res, queryRst);
    }catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function deleteRecordingvouchersc(req,res){
    try{
        let doc=common.docTrim(req.body),replacements = []

        let queryStr = `delete from tbl_erc_recordingvoucherdetailsc where recordingvoucherdetailsc_id=?`;
        replacements.push(doc.recordingvoucherdetailsc_id);
        let queryRst = await sequelize.query(queryStr , {replacements: replacements, type: sequelize.QueryTypes.DELETE})
        common.sendData(res, queryRst);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function modifyRecordingvoucherscState(applyState,description,recordingvouchersc_id,applyApprover){
    await tb_recordingvouchersc.update({
        recordingvouchersc_state:applyState,
        recordingvouchersc_examine_time:new Date(),
        recordingvouchersc_examine:applyApprover,
        recordingvouchersc_refuse_remark:description
    }, {
        where: {
            recordingvouchersc_id:recordingvouchersc_id
        }
    });
}
exports.modifyRecordingvoucherscState = modifyRecordingvoucherscState;
