const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const tb_purchasetype = model.erc_purchasetype;

exports.ERCPurchaseTypeControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'add'){
        await addAct(req, res);
    } else if (method === 'search'){
        await getPurchaseTypeAct(req, res);
    } else if (method === 'modifyPurchaseType'){
        await modifyPurchaseType(req, res);
    } else if (method === 'deletePurchaseType'){
        await deletePurchaseType(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function addAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let purchasetype = await tb_purchasetype.findOne({
            where: {

                purchase_type_name: doc.purchase_type_name
            }
        });
        if (purchasetype) {
            return common.sendError(res, 'purchasetype_01')
        }

        let purchase_type_id = await Sequence.genPurchaseTypeID();
        const addpurchasetype = await tb_purchasetype.create({
            purchase_type_no: purchase_type_id,
            domain_id: 0,
            creater_id: user.user_id,
            purchase_type_name: doc.purchase_type_name,
        });



        common.sendData(res, addpurchasetype);
    }catch (error){
        common.sendFault(res, error);
    }
}

async function getPurchaseTypeAct(req, res){
    try {
        const { user } = req;

        const purchasetypes = await tb_purchasetype.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        common.sendData(res, purchasetypes);
    } catch (error){
        common.sendFault(res, error);
    }
}

async function modifyPurchaseType(req, res) {
    try {
        const { body } = req;
        const { purchase_type_id,  purchase_type_name } = body.new;

        const purchasetypes = await tb_purchasetype.findOne({
            where: {
                purchase_type_id,
            }
        });

        if (purchasetypes) {

            purchasetypes.purchase_type_name = purchase_type_name;

            await purchasetypes.save();
        }

        common.sendData(res, purchasetypes);
    } catch (error){
        common.sendFault(res, error);
    }
}

async function deletePurchaseType(req, res) {
    try {
        const { body } = req;
        const { purchase_type_id } = body;

        const tb_park_purchase = model.park_purchase;//园区采购
        const data = await  tb_park_purchase.findOne({where:{ type_id:purchase_type_id}});
        if(data && data.length>0){
            return common.sendError(res,-1,'该分类已经使用，不能删除。');
        }
        const purchasetypes = await tb_purchasetype.findOne({
            where: {
                purchase_type_id,
            }
        });

        if (purchasetypes) {
            purchasetypes.state = GLBConfig.DISABLE;
            await purchasetypes.save();
        }

        common.sendData(res, purchasetypes);
    } catch (error){
        common.sendFault(res, error);
    }
}
