const common = require('../util/CommonUtil');
const model = require('../model');
const sequelize = model.sequelize;
const logger = require('../util/Logger').createLogger('runLendMoney');
const TaskListControlSRV = require('../services/erc/baseconfig/ERCTaskListControlSRV');
const tb_common_user = model.common_user;

// 对需要支付利息及本金差1天到期时，系统自动会向操作借款事务的人员发提醒信息。
let lendMoneyRepayTips = async () => {
    try {
        let sql = 'select l.*' +
            ' from tbl_erc_lendmoneyrepayset s' +
            ' inner join tbl_erc_lendmoney l on l.lendmoney_id = s.lendmoney_id' +
            ' where s.state = 1 and l.state = 1 and l.lendmoney_state = 2 and date_format(date_add(CURDATE(), interval 1 day), "%Y-%m-%d") = date_format(s.repay_date, "%Y-%m-%d")'
        let result = await common.simpleSelect(sequelize, sql, []);

        for (let item of result) {
            let operator = await tb_common_user.findOne({
                where: {
                    user_id: item.operator_id
                }
            });

            let groupID = common.getUUIDByTime(30);
            await TaskListControlSRV.createTask(operator, '借款支付利息提醒', '215', item.operator_id, item.lendmoney_id, '借款支付利息提醒', '', groupID)
        }

    } catch (error) {
        logger.info('lendMoneyRepayTips error:' + error);
        logger.error('lendMoneyRepayTips error:' + error);
        return;
    }
}

exports.runLendMoney = () => {
    lendMoneyRepayTips();
}