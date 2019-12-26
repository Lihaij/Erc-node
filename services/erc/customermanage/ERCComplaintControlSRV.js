//投诉管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCComplaintControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');


const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_complaint = model.erc_complaint;
const tb_userGroup = model.common_usergroup;
const tb_customer = model.erc_customer;
const tb_order = model.erc_order;
const tb_ownerfeedback = model.erc_ownerfeedback;

exports.ERCComplaintControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'handle_complaint') {//处理投诉
        handleComplaintAct(req, res);
    } else if (method === 'initUserFeedback') {
        await exports.initUserFeedback(req, res);
    } else if (method === 'createUserFeedback') {
        await exports.createUserFeedback(req, res);
    } else if (method === 'updateUserFeedback') {
        await exports.updateUserFeedback(req, res);
    } else if (method === 'getUserFeedback') {
        await exports.getUserFeedback(req, res);
    }  else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
let initAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let returnData = {
            complaintStateInfo: GLBConfig.ISTATEINFO,
            staffInfo: [],//团队人员
            domainOrderInfo: []
        };

        await FDomain.getDomainListInit(req, returnData);

        //获取当前机构下的人员
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

        //获取当前机构下的所有订单号
        let orders = await tb_order.findAll({
            where :{
                state:GLBConfig.ENABLE,
                domain_id:user.domain_id
            }
        });
        for(let o of orders){
            returnData.domainOrderInfo.push({
                id:o.order_id,
                text:o.order_id,
                value:o.order_id
            })
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//查询投诉列表
let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = `select * from tbl_erc_complaint where state = 1 and domain_id` + await FDomain.getDomainListStr(req);

        let replacements = [];

        if (doc.complaint_state > 0) {// 1: 未受理, 2: 已受理, 0: 全部
            queryStr += ` and complaint_state = ? `;
            replacements.push(doc.complaint_state);
        }
        if (doc.search_complaint) {
            queryStr += ' and (order_id like ? or complaint_customer_name like ?)';
            let search_complaint = '%' + doc.search_complaint + '%';
            replacements.push(search_complaint);
            replacements.push(search_complaint);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.created_at = r.created_at ? r.created_at.Format("yyyy-MM-dd"): null;
            returnData.rows.push(rj);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//增加投诉信息
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let complaintUser = await tb_user.findOne({
            where: {
                username: doc.complaint_phone,
                user_type: GLBConfig.TYPE_CUSTOMER
            }
        });

        if (!complaintUser) {
            let userGroup = await tb_userGroup.findOne({
                where: {
                    usergroup_type: GLBConfig.TYPE_CUSTOMER
                }
            });
            if (!userGroup) {
                common.sendError(res, 'customer_01');
                return
            }
            complaintUser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: user.domain_id,
                usergroup_id: userGroup.usergroup_id,
                username: doc.complaint_phone,
                phone: doc.complaint_phone,
                password: common.generateRandomAlphaNum(6),
                name: doc.complaint_customer_name,
                user_type: userGroup.usergroup_type
            });
            let customer = await tb_customer.create({
                user_id: complaintUser.user_id
            });
        }

        let addC = await tb_complaint.create({
            domain_id: user.domain_id,
            order_id: doc.order_id,
            complaint_customer_name: doc.complaint_customer_name,
            complaint_phone: doc.complaint_phone,
            complaint_content: doc.complaint_content,
            complaint_state: '1',
            complaint_responser: doc.complaint_responser,
            complaint_user_id: complaintUser.user_id
        });
        let retData = JSON.parse(JSON.stringify(addC));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//受理投诉
let handleComplaintAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let find = await tb_complaint.findOne({
            where: {
                complaint_id: doc.complaint_id,
                domain_id: user.domain_id,
            }
        });

        if (find) {
            find.complaint_handle_record = doc.complaint_handle_record;
            find.complaint_state = '2';
            find.complaint_responser = user.user_id;
            await find.save()
        } else {
            return common.sendError(res, 'complaint_01');
        }

        common.sendData(res, find);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//获得受理人
exports.initUserFeedback = async(req, res)=> {
    const user = req.user;
    try {
        let returnData = {
            feedbackState: GLBConfig.FEEDBACKSTATUS,
            feedbackInfo: GLBConfig.FEEDBACKTYPE,
            repairInfo: GLBConfig.REPAIRTYPE,
            staffInfo: [],//团队人员
        };

        await FDomain.getDomainListInit(req, returnData);

        //获取当前机构下的人员
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

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//设置手机端客户类型
exports.initMobileUser = async (req, res) => {
    const returnData = {
        repairInfo: GLBConfig.REPAIRTYPE
    };
    common.sendData(res, returnData);
};

//创建投诉
exports.createUserFeedback = async (req, res) => {
    const {user_id, type, content, email, qq_no, repair_type, images, operator_id, domain_id} = req.body;
    const user = req.user;
    const domainId = user ? user.domain_id : domain_id;

    let newImage = images;
    if (images) {
        newImage = await common.fileMove(images, 'upload');
    }

    try {
        const result = await tb_ownerfeedback.create({
            domain_id: domainId,
            user_id,
            type,
            content,
            email,
            qq_no,
            repair_type,
            images: newImage,
            operator_id
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//修改投诉信息
exports.updateUserFeedback = async (req, res) => {
    const {feedback_id, operator_id, record_content, status, resp_person, resp_phone, domain_id} = req.body;
    const user = req.user;
    const domainId = user ? user.domain_id : domain_id;

    try {
        const results = await tb_ownerfeedback.update(
            {
                operator_id,
                record_content,
                status,
                resp_person,
                resp_phone
            },
            {
                where: {
                    domain_id: domainId,
                    feedback_id
                }
            });

        const result = results.some(item => (item > 0));
        if (result) {
            common.sendData(res, result);
        } else {
            common.sendError(res, 'complaint_02');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};

//查询客户投诉列表
exports.getUserFeedback = async (req, res) => {
    const {type, status, user_id, domain_id} = req.body;
    const user = req.user;
    const domainId = user ? user.domain_id : domain_id;

    try {
        let queryStr =
            `select cu.name, cu.phone, nof.* 
             from tbl_erc_ownerfeedback nof 
             left join tbl_common_user as cu
             on nof.user_id = cu.user_id
             where true
             and nof.domain_id = ? and nof.type = ?`;
        const replacements = [domainId, type];

        if (status > 0) {
            queryStr += ` and nof.status = ?`;
            replacements.push(status);
        }
        if (user_id) {
            queryStr += ` and nof.user_id = ?`;
            replacements.push(user_id);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const returnData = {
            rows: result.data,
            total: result.count
        };

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

exports.initAct = initAct;
exports.searchAct = searchAct;
exports.addAct = addAct;
exports.handleComplaintAct = handleComplaintAct;
