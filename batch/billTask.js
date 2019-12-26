const common = require('../util/CommonUtil');
const model = require('../model');
const sequelize = model.sequelize;
const logger = require('../util/Logger').createLogger('runLendMoney');
const TaskListControlSRV = require('../services/erc/baseconfig/ERCTaskListControlSRV');
const tb_common_user = model.common_user;

// 对差五天过期的票据，系统自动会向出纳人员发提醒信息。
let lendMoneyRepayTips = async () => {
    try {
        let sql = 'select l.*' +
            ' from tbl_erc_bill_receipt l' +
            ' where l.state = 1 and l.bill_state = 1 and l.bill_receipt_style=5 and date_format(date_add(CURDATE(), interval 5 day), "%Y-%m-%d") = date_format(l.bill_deadline, "%Y-%m-%d")'
        let result = await common.simpleSelect(sequelize, sql, []);
        for (let item of result) {
            let operator = await tb_common_user.findOne({
                where: {
                    user_id: item.operator_id
                }
            });
            let str='票据编号为：'+item.bill_number+'的票据即将到期，请尽快进行票据兑收操作，操作后此任务自动核销。';
            let groupID = common.getUUIDByTime(30);
            await TaskListControlSRV.createTask(operator, '收到票据兑付任务确认', '221', item.cashier, item.bill_receipt_id, str, '', groupID)
        }
        let sql2 = 'select l.*' +
            ' from tbl_erc_bill_out l' +
            ' where l.state = 1 and l.bill_state=2 and l.bill_out_style=3  and date_format(date_add(CURDATE(), interval 5 day), "%Y-%m-%d") = date_format(l.bill_deadline, "%Y-%m-%d")'
        let result2 = await common.simpleSelect(sequelize, sql2, []);

        for (let item of result2) {
            let operator = await tb_common_user.findOne({
                where: {
                    user_id: item.operator_id
                }
            });
            let str='票据编号为：'+item.bill_number+'的票据即将到期，请尽快进行票据兑付操作，操作后此任务自动核销。';
            let groupID = common.getUUIDByTime(30);
            await TaskListControlSRV.createTask(operator, '开出票据兑付任务确认', '223', item.cashier, item.bill_out_id, str, '', groupID)
        }

    } catch (error) {
        logger.info('billTask error:' + error);
        logger.error('billTask error:' + error);
        return;
    }
}

exports.billTask = () => {
    lendMoneyRepayTips();
}