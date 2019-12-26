/**
 * Created by BaiBin on 2018/2/13.
 */
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ProduceControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const ERCProjectControlSRV = require('./ERCProjectControlSRV');
const TaskListControlSRV = require('./ERCTaskListControlSRV');


const sequelize = model.sequelize;
const tb_project = model.erc_project;
const tb_projectdetail = model.erc_projectdetail;
const tb_projectspacedetail = model.erc_projectspacedetail;
const tb_workerprice = model.erc_workerprice;
const tb_user = model.common_user;

//工程项目管理->项目决算列表
exports.ERCFinalAccountControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        ERCProjectControlSRV.initAct(req, res)
    } else if (method === 'search'){
        ERCProjectControlSRV.searchAct(req, res)
    } else if (method === 'search_detail'){
        ERCProjectControlSRV.searchDetailAct(req, res)
    } else if (method === 'search_space_detail'){
        ERCProjectControlSRV.searchSpaceDetailAct(req, res)
    } else if (method === 'modify_space'){
        ERCProjectControlSRV.modifySpaceAct(req, res)
    } else if (method === 'save_final_space'){
        saveSpaceAct(req, res)
    } else if (method === 'submit_final_detail'){
        submitDetailAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};
//保存空间决算详情
async function saveSpaceAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let psds = await tb_projectspacedetail.findAll({
            where: {
                project_detail_id: doc.project_detail_id,
                state: GLBConfig.ENABLE
            }
        });
        let space_total_price = 0;
        for(let p of psds){
            space_total_price += (p.worker_total_final_price + p.material_total_final_price)
        }
        let pds = await tb_projectdetail.findOne({
            where: {
                project_detail_id: doc.project_detail_id
            }
        })
        if (pds) {
            pds.space_final_amount = space_total_price
            if (pds.space_count) {
                pds.space_final_total_amount = pds.space_final_amount * pds.space_count
            }
            await pds.save();
        }
        common.sendData(res, pds);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//提交空间决算详情
async function submitDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        let spaces = await tb_projectspacedetail.findAll({
            where: {
                project_id: doc.project_id,
                state: GLBConfig.ENABLE
            }
        })
        for (let s of spaces) {
            if (!s.material_total_final_price) {
                common.sendError(res, 'project_05');
                return;
            }
        }

        let proDetails = await tb_projectdetail.findAll({
            where: {
                project_id: doc.project_id,
                state: GLBConfig.ENABLE
            }
        })
        let final_total__price = 0;
        for(let d of proDetails) {
            if (d.space_final_total_amount === null) {
                common.sendError(res, 'project_02');
                return;
            }
            final_total__price += d.space_final_total_amount
        }
        let pro = await tb_project.findOne({
            where: {
                project_id: doc.project_id
            }
        })

        if (pro) {
            pro.project_final_amount = final_total__price;
            if (pro.project_state === '3' || pro.project_state === '7') {
                pro.project_state = '5'
            }
            await  pro.save();
        }

        //生成一条任务
        let taskName = '决算审核';
        let taskType = '13';
        let taskPerformer = pro.project_approver_id;
        let taskReviewCode = doc.project_id;
        let taskDescription = '决算审核申请';
        await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription);

        common.sendData(res, pro);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}



