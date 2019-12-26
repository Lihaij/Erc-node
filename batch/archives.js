const common = require('../util/CommonUtil');
const model = require('../model');
const logger = require('../util/Logger').createLogger('runArchives');
const sequelize = model.sequelize;
const tb_common_user = model.common_user;
const TaskListControlSRV = require('../services/erc/baseconfig/ERCTaskListControlSRV');

let remindArchivesHand = async () => {
    try {
        let queryStr = 'select *' +
            ' from tbl_erc_archiveshand' +
            ' where state = 1 and archiveshand_state = 1 and CURDATE() > place_date';

        let result =  await common.simpleSelect(sequelize, queryStr, []);

        for (let item of result) {
            if (item.department_keeper) {
                let department_keeper = await tb_common_user.findOne({
                    where: {
                        user_id: item.department_keeper
                    }
                });

                let groupID = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(department_keeper, '应交档案已超过归档时间提醒', '209', item.department_keeper, item.archiveshand_id, '应交档案已超过归档时间提醒', '', groupID);
            }

            if (item.domain_keeper) {
                let domain_keeper = await tb_common_user.findOne({
                    where: {
                        user_id: item.domain_keeper
                    }
                });

                let groupID = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(domain_keeper, '应交档案已超过归档时间提醒', '209', item.domain_keeper, item.archiveshand_id, '应交档案已超过归档时间提醒', '', groupID);
            }
        }

    } catch (error) {
        logger.info('remindArchivesHand error:' + error);
        logger.error('remindArchivesHand error:' + error);
        return;
    }
}

exports.runArchives = () => {
    remindArchivesHand()
}