const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAcceptancePlanControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const UserBL = require('../../../bl/UserBL');

const sequelize = model.sequelize;
const tb_orderacceptance = model.erc_orderacceptance;
const tb_acceptance = model.erc_acceptance;
const tb_consNode = model.erc_constructionnode;
const tb_uploadfile = model.erc_uploadfile;
const tb_orderroom = model.erc_orderroom;
const tb_gantttasks = model.erc_gantttasks;
const tb_checkflow = model.erc_checkflow;
const tb_checkmessage = model.erc_checkmessage;

// 初始化基础数据
exports.initAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {
            roomTypeInfo: GLBConfig.ROOMTYPE,
            trueFalseInfo: GLBConfig.TFINFO,
            acceptanceInfo: GLBConfig.ACCEPTANCETYPE,
            stateTypeInfo: GLBConfig.ACCEPTANCESTATEINFO
        };

        let gantttasks = await tb_gantttasks.findAll({
            where: {
                order_id: doc.order_id
            }
        });

        if (gantttasks) {
            returnData.nodesInfo = [];
            for (let n of gantttasks) {
                returnData.nodesInfo.push({
                    id: n.node_id,
                    value: n.text,
                    text: n.text
                })
            }
        }

        let roomIds = await tb_orderroom.findAll({
            where: {
                state: GLBConfig.ENABLE,
                order_id: doc.order_id
            }
        });
        returnData.roomIdInfo = [];
        for (let r of roomIds) {
            returnData.roomIdInfo.push({
                id: r.room_id,
                value: r.room_name,
                text: r.room_name
            })
        }
        // employees
        let staff = await UserBL.getOrderRelaUser(doc.order_id, ['1', '2', '3', '4', '5', '6', '7', '8']);

        //workers
        let queryStr = `select w.*,c.*,u.* from tbl_erc_crew c left join tbl_erc_worker w on c.worker_id = w.user_id
        left join tbl_common_user u on w.user_id = u.user_id where u.state = ? and w.state = ? and c.state = ? `;
        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, GLBConfig.ENABLE];
        if (doc.foreman != null) {
            queryStr += ' and c.foreman_id = ?';
            replacements.push(doc.foreman);
        }
        let workers = await common.simpleSelect(sequelize, queryStr, replacements);

        returnData.employeeInfo = [];
        for (let e of staff) {
            returnData.employeeInfo.push({
                id: e.user_id,
                text: e.name
            })
        }

        for (let w of workers) {
            returnData.employeeInfo.push({
                id: w.user_id,
                text: w.name
            })
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 查询订单验收
exports.searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select a.*, b.text, u.name as acceptance_submit_name from tbl_erc_orderacceptance a
         left join tbl_erc_gantttasks b on a.gantttasks_id = b.gantttasks_id
         left join tbl_common_user u on a.acceptance_submit_id = u.user_id
         where a.state = ? and a.order_id = ?`;
        let replacements = [GLBConfig.ENABLE, doc.order_id];
        if (doc.node_id) {
            queryStr += ` and b.node_id = ? `;
            replacements.push(doc.node_id);
        }
        if (doc.room_id) {
            queryStr += ` and a.room_id = ? `;
            replacements.push(doc.room_id);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.acceptance_submit_date_format = r.acceptance_submit_date ? r.acceptance_submit_date.Format("yyyy-MM-dd") : null;
            rj.acceptance_check_date_format = r.acceptance_check_date ? r.acceptance_check_date.Format("yyyy-MM-dd") : null;
            returnData.rows.push(rj)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 删除订单验收
exports.detailAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id
            }
        });

        if (!acceptance) {
            return common.sendError(res, 'acceptance_01')
        }

        let returnData = JSON.parse(JSON.stringify(acceptance));

        returnData.check_pic = [];
        let cfs = await tb_uploadfile.findAll({
            where: {
                // api_name: common.getApiName(req.path),
                api_name: 'NODE',
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let c of cfs) {
            returnData.check_pic.push(c.file_url)
        }

        returnData.rejected_msg = [];
        let checkmessages = await tb_checkmessage.findAll({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '1', //CHECKSTATEINFO 驳回记录
                check_owner: '0',
                state: GLBConfig.ENABLE
            },
            order: [
                ['created_at', 'DESC']
            ]
        });
        for (let m of checkmessages) {
            returnData.rejected_msg.push(m.check_message)
        }

        let approveMessages = await tb_checkmessage.findOne({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '2', //CHECKSTATEINFO 通过记录
                check_owner: '0',
                state: GLBConfig.ENABLE
            }
        });

        if (approveMessages) {
            returnData.approve_msg = approveMessages.check_message;
        }
        returnData.acceptance_submit_date_format = acceptance.acceptance_submit_date ? acceptance.acceptance_submit_date.Format("yyyy-MM-dd") : null;
        returnData.acceptance_check_date_format = acceptance.acceptance_check_date ? acceptance.acceptance_check_date.Format("yyyy-MM-dd") : null;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
/**
 * 验收审核
 * @param orderacceptance_id
 * @param act 1 驳回 2 通过
 * @param check_message 驳回信息
 */
exports.checkAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });

        if (acceptance.acceptance_state != 'CHECKING') {
            return common.sendError(res, 'acceptance_02')
        }

        let staff = await UserBL.getOrderRelaUser(acceptance.order_id, '1'); //监理

        if (user.user_id != staff[0].user_id) {
            return common.sendError(res, 'acceptance_03')
        }

        let cf = await tb_checkflow.findOne({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '0',
                check_owner: '0',
                state: GLBConfig.ENABLE
            }
        });

        if (!cf) {
            return common.sendError(res, 'acceptance_05');
        }

        if (doc.act === '1') { //驳回
            acceptance.acceptance_state = 'REJECTED'; // ACCEPTANCESTATEINFO
            acceptance.acceptance_check_date = new Date();
            acceptance.acceptance_check_id = user.user_id;
            await acceptance.save();

            cf.check_state = doc.act;
            cf.operater_id = user.user_id;
            cf.operater_name = user.name;
            await cf.save()

            let addCm = await tb_checkmessage.create({
                check_id: cf.check_id,
                order_id: cf.order_id,
                srv_id: cf.srv_id,
                check_message: doc.check_message,
                check_state: cf.check_state,
                check_owner: cf.check_owner,
                check_type: cf.check_type,
                operater_id: cf.operater_id,
                operater_name: cf.operater_name
            });
        } else if (doc.act === '2') { // 通过
            acceptance.acceptance_state = 'APPROVED';
            acceptance.acceptance_check_date = new Date();
            acceptance.acceptance_check_id = user.user_id;
            await acceptance.save();

            cf.check_state = doc.act;
            cf.operater_id = user.user_id;
            cf.operater_name = user.name;
            await cf.save();

            let addCm = await tb_checkmessage.create({
                check_id: cf.check_id,
                order_id: cf.order_id,
                srv_id: cf.srv_id,
                check_message: doc.check_message,
                check_state: cf.check_state,
                check_owner: cf.check_owner,
                check_type: cf.check_type,
                operater_id: cf.operater_id,
                operater_name: cf.operater_name
            });

            let napCount = await tb_orderacceptance.count({
                where: {
                    gantttasks_id: acceptance.gantttasks_id,
                    acceptance_state: {
                        $ne: 'APPROVED',
                    },
                    state: GLBConfig.ENABLE
                }
            });
            if (napCount === 0) { //全部验收通过节点完成
                let task = await tb_gantttasks.findOne({
                    where: {
                        gantttasks_id: acceptance.gantttasks_id,
                        state: GLBConfig.ENABLE
                    }
                });
                task.task_state = '3'; //TASKSTATE
                task.progress = 1;
                await task.save()
            }
        } else {
            return common.sendError(res, 'acceptance_04')
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
