const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const ERCRecord = require('./ERCRecordingVoucherCustomControlSRV');
const GLBConfig = require('../../../util/GLBConfig');
const ERCTaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV')
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const ERCAccountingControlSRV = require('./ERCAccountingControlSRV');

const moment = require('moment');
const sequelize = model.sequelize;
const tb_accountdetail = model.erc_accountingdetail;
const tb_accounting = model.erc_accounting;
const tb_basetypedetail = model.erc_basetypedetail;
const tb_othermain = model.erc_othermain;

exports.ERCOtherRelevantMainControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'add'){
        await addAct(req, res);
    } else if (method === 'get_om'){
        await getOtherMainAct(req, res);
    } else if (method === 'modifyOtherMain'){
        await modifyOtherMain(req, res);
    } else if (method === 'deleteOtherMain'){
        await deleteOtherMain(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function addAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let othermain = await tb_othermain.findOne({
            where: {
                domain_id: user.domain_id,
                other_main_code: doc.other_main_code
            }
        });
        if (othermain) {
            return common.sendError(res, 'othermain_01')
        }

        let other_main_id = await Sequence.genOtherMainID();
        const addothermain = await tb_othermain.create({
            other_main_id: other_main_id,
            domain_id: user.domain_id,
            creater_id: user.user_id,
            other_main_code: doc.other_main_code,
            other_main_name: doc.other_main_name,
            bank_no: doc.bank_no,
            other_main_remark: doc.other_main_remark,
        });

        //创建会计科目明细
        await ERCAccountingControlSRV.addAccountingDetail(1231,other_main_id,user.domain_id, '4');
        await ERCAccountingControlSRV.addAccountingDetail(2241,other_main_id,user.domain_id, '4');
        await ERCAccountingControlSRV.addAccountingDetail(4001,other_main_id,user.domain_id, '4');

        common.sendData(res, addothermain);
    }catch (error){
        common.sendFault(res, error);
    }
}

async function getOtherMainAct(req, res){
    try {
        const { user } = req;
        const { domain_id } = user;

        const othermains = await tb_othermain.findAll({
            where: {
                domain_id,
                state: GLBConfig.ENABLE
            }
        });
        common.sendData(res, othermains);
    } catch (error){
        common.sendFault(res, error);
    }
}

async function modifyOtherMain(req, res) {
    try {
        const { body } = req;
        const { other_main_id, other_main_code, other_main_name, bank_no, other_main_remark } = body.new;

        const othermains = await tb_othermain.findOne({
            where: {
                other_main_id,
            }
        });

        if (othermains) {
            othermains.other_main_code = other_main_code;
            othermains.other_main_name = other_main_name;
            othermains.bank_no = bank_no;
            othermains.other_main_remark = other_main_remark;
            await othermains.save();
        }

        common.sendData(res, othermains);
    } catch (error){
        common.sendFault(res, error);
    }
}

async function deleteOtherMain(req, res) {
    try {
        const { body } = req;
        const { other_main_id } = body;

        const othermains = await tb_othermain.findOne({
            where: {
                other_main_id,
            }
        });

        if (othermains) {
            othermains.state = GLBConfig.DISABLE;
            await othermains.save();
        }

        common.sendData(res, othermains);
    } catch (error){
        common.sendFault(res, error);
    }
}
