/**
 * 收款规则设置
 */
const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCReceivablesRuleControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_receivablesrule = model.erc_receivablesrule;


exports.ERCReceivablesRuleControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'search_rule') { //获取规则列表
        searchRuleAct(req, res)
    } else if (method === 'distribute_rule') { //发布规则
        distributeRuleAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 查询收款规则列表
let searchRuleAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let result = await tb_receivablesrule.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//删除原有规则，发布新规则
let distributeRuleAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let rules = doc.rules;
        //删除原有规则，每次发布都是覆盖原有规则
        await tb_receivablesrule.destroy({
            where: {
                domain_id: user.domain_id
            }
        });
        for (let r of rules) {
            await tb_receivablesrule.create({
                receivables_rule_name: r.receivables_rule_name,
                receivables_rule_rate: r.receivables_rule_rate,
                domain_id: user.domain_id
            })
        }
        let reuslt = await tb_receivablesrule.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });
        common.sendData(res, reuslt);
    } catch (error) {
        common.sendFault(res, error);
    }
};
