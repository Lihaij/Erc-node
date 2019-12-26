const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('OrderControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const sequelize = model.sequelize;

const tb_user = model.common_user;
const tb_orderrequire = model.erc_orderrequire;

// 订单管理配置接口
exports.OrderRequireControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method==='add_require'){
        addRequireAct(req,res)
    } else if (method==='modify_require'){
        modifyRequireAct(req,res)
    } else if (method==='delete_require'){
        deleteRequireAct(req,res)
    } else if (method==='search_require'){
        searchRequireAct(req,res)
    } else if (method==='get_require'){
        getRequireAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
async function initAct(req, res) {
    const user = req.user;

    try {
        let returnData = {
            order_require_type: GLBConfig.ORDERREQUIRETYPE,
        };

        returnData.userInfo = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                user_type: GLBConfig.TYPE_OPERATOR
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 增加管理配置
async function addRequireAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        //3d效果图只允许有一条
        if (doc.typeId === '2') {
            let result = await tb_orderrequire.findAll({
                where: {
                    type_id: doc.typeId,
                    state: '1',
                    domain_id: doc.domainId,
                }
            });
            if (result.length > 0) {
                common.sendError(res, 'require_01');
                return;
            }
        }
        let addRequire = await tb_orderrequire.create({
            type_id: doc.typeId,
            domain_id: doc.domainId,
            require_name: doc.requireName,
            require_description: doc.requireDescription,
            require_hidden: doc.requireHidden
        })
        common.sendData(res, addRequire);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

// 修改管理配置
async function modifyRequireAct(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        let modifyResult = await tb_orderrequire.findOne({
            where: {
                require_id: body.old.require_id,
                domain_id: user.domain_id
            }
        });

        if (modifyResult) {
            modifyResult.require_user_id = body.new.require_user_id;
            await modifyResult.save();
            common.sendData(res, modifyResult);
        } else {
            common.sendError(res, 'require_41');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 删除管理配置
async function deleteRequireAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let result = await tb_orderrequire.findOne({
            where: {
                require_id: doc.requireId
            }
        })
        if (result) {
            result.state = 0;
            await  result.save();
        }
        common.sendData(res, result);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询管理配置
async function searchRequireAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select * from tbl_erc_orderrequire  where state = ? AND  type_id = ? AND domain_id = ?`;
        let replacements = [GLBConfig.ENABLE,doc.typeId,doc.domainId];

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        let returnDate = {};
        returnDate.rows = result.data;
        returnDate.total = result.count;

        common.sendData(res, returnDate);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function getRequireAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let result = await tb_orderrequire.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: doc.domainId
            }
        })
        let returnData = [];
        for(let r of result){
            let isExist = false;
            for(let arr of returnData){
                for(let a of arr){
                    if (a.type_id == r.type_id) {
                        isExist = true;
                        arr.push(r);
                        break;
                    }
                }
            }
            if (!isExist) {
                returnData.push([r]);
            }
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
