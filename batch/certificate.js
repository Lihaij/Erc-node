const common = require('../util/CommonUtil');
const model = require('../model');
const sequelize = model.sequelize;
const tb_common_user = model.common_user;
const logger = require('../util/Logger').createLogger('runCertificate');
const TaskListControlSRV = require('../services/erc/baseconfig/ERCTaskListControlSRV');

//提醒证照年检和修改有效期
let changeCertificateState = async () => {
    try {
        //系统提前【两】个月对有【年检时间】的证照要进行年检
        let queryStr_1 = 'select * ' +
            ' from tbl_erc_certificate' +
            ' where state = 1 and date_format(inspect_date, "%Y-%m-%d") = date_format(date_add(CURDATE(), interval 2 month),"%Y-%m-%d")';

        let result_1 = await common.simpleSelect(sequelize, queryStr_1, []);

        for (let item of result_1) {
            if (item.keeper) {
                let keeper = await tb_common_user.findOne({
                    where: {
                        user_id: item.keeper
                    }
                });

                let groupID = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(keeper, '证照年检确认', '207', item.keeper, item.certificate_id, '证照年检确认', '', groupID);

            }
        }

        //系统提前【一】个月对有【年检时间】的证照要进行年检
        let queryStr_2 = 'select * ' +
            ' from tbl_erc_certificate' +
            ' where state = 1 and date_format(inspect_date, "%Y-%m-%d") = date_format(date_add(CURDATE(), interval 1 month),"%Y-%m-%d")';

        let result_2 = await common.simpleSelect(sequelize, queryStr_2, []);

        for (let item of result_2) {
            if (item.keeper) {
                let keeper = await tb_common_user.findOne({
                    where: {
                        user_id: item.keeper
                    }
                });

                let groupID = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(keeper, '证照年检确认', '207', item.keeper, item.certificate_id, '证照年检确认', '', groupID);

            }
        }

        //系统提前【两】个月对有【有效期】的证照要进行年检
        let queryStr_3 = 'select * ' +
            ' from tbl_erc_certificate' +
            ' where state = 1 and date_format(validity_end, "%Y-%m-%d") = date_format(date_add(CURDATE(), interval 2 month),"%Y-%m-%d")';

        let result_3 = await common.simpleSelect(sequelize, queryStr_3, []);

        for (let item of result_3) {
            if (item.keeper) {
                let keeper = await tb_common_user.findOne({
                    where: {
                        user_id: item.keeper
                    }
                });

                let groupID = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(keeper, '证照有效期修改确认', '208', item.keeper, item.certificate_id, '证照有效期修改确认', '', groupID);

            }
        }

        //系统提前【一】个月对有【有效期】的证照要进行年检
        let queryStr_4 = 'select * ' +
            ' from tbl_erc_certificate' +
            ' where state = 1 and date_format(validity_end, "%Y-%m-%d") = date_format(date_add(CURDATE(), interval 1 month),"%Y-%m-%d")';

        let result_4 = await common.simpleSelect(sequelize, queryStr_4, []);

        for (let item of result_4) {
            if (item.keeper) {
                let keeper = await tb_common_user.findOne({
                    where: {
                        user_id: item.keeper
                    }
                });

                let groupID = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(keeper, '证照有效期修改确认', '208', item.keeper, item.certificate_id, '证照有效期修改确认', '', groupID);

            }
        }


        //证照在有效期已经过了，自动转为作废状态
        let queryStr_5 = 'update tbl_erc_certificate set certificate_state = 3 where date_format(validity_end, "%Y-%m-%d") = CURDATE()';

        await sequelize.query(queryStr_5);

    } catch (error) {
        logger.info('changeCertificateState error:' + error);
        logger.error('changeCertificateState error:' + error);
        return;
    }
}

exports.runCertificate = () => {
    changeCertificateState()
}