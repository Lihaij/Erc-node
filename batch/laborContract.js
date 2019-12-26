const common = require('../util/CommonUtil');
const model = require('../model');
const sequelize = model.sequelize;
const tb_common_user = model.common_user;
const logger = require('../util/Logger').createLogger('runLaborContract');
const TaskListControlSRV = require('../services/erc/baseconfig/ERCTaskListControlSRV');

//对昨日没有上传照片或扫描件的人员向本部门及公司最高级别人员进行提示
let laborContractNoAttachment = async () => {
    try {
        let sql = 'select domain_id, count(*) as count' +
            ' from tbl_erc_laborcontract' +
            ' where state = 1 and date_format(date_add(CURDATE(), interval 1 day), "%Y-%m-%d") = date_format(created_at, "%Y-%m-%d") and not exists (select * from tbl_erc_uploadfile where state = 1 and srv_type = 205 and srv_id = tbl_erc_laborcontract.laborcontract_id)' +
            ' group by domain_id';
        let result = await common.simpleSelect(sequelize, sql, []);

        for (let item of result) {
            let groupID = common.getUUIDByTime(30);
            let description = '昨日有' + item['count'] + '位人员的劳动合同没有向系统提供照片或扫描件';
            await TaskListControlSRV.createTask({domain_id: item.domain_id, user_id: ''}, '劳动合同没有照片或扫描件提醒', '212', '', '0', description, '', groupID);
        }

    } catch (error) {
        logger.info('changeCertificateState error:' + error);
        logger.error('changeCertificateState error:' + error);
        return;
    }
}

//对在职人员劳动合同到期日前30日、25日、20日、15日向劳动合同提醒岗位发送提醒信息
let laborContractEndDate = async() => {
    try {
        let sql = 'select l.domain_id, group_concat(u.name) as name' +
            ' from tbl_erc_laborcontract l' +
            ' inner join tbl_common_user u on u.user_id = l.user_id' +
            ' where l.state = 1 and (date_format(date_sub(l.end_date, interval 30 day), "%Y-%m-%d") = date_format(CURDATE(), "%Y-%m-%d") or date_format(date_sub(l.end_date, interval 25 day), "%Y-%m-%d") = date_format(CURDATE(), "%Y-%m-%d") or date_format(date_sub(l.end_date, interval 20 day), "%Y-%m-%d") = date_format(CURDATE(), "%Y-%m-%d") or date_format(date_sub(l.end_date, interval 15 day), "%Y-%m-%d") = date_format(CURDATE(), "%Y-%m-%d"))' +
            ' group by domain_id';

        let result = await common.simpleSelect(sequelize, sql, []);

        for (let item of result) {
            let groupID = common.getUUIDByTime(30);
            let description = '下列人员的劳动合同快到期请尽快处理：' + item.name;
            await TaskListControlSRV.createTask({domain_id: item.domain_id, user_id: ''}, '劳动合同提醒', '212', '', '0', description, '', groupID);
        }
    } catch (error) {
        logger.info('laborContractEndDate error:' + error);
        logger.info('laborContractEndDate error:' + error);
        return;
    }
}

//对在职人员劳动合同到期日前10天时向最高管理者进行提醒
let laborContractEndDate_2 = async() => {
    try {
        let sql = 'select l.domain_id, group_concat(u.name) as name' +
            ' from tbl_erc_laborcontract l' +
            ' inner join tbl_common_user u on u.user_id = l.user_id' +
            ' where l.state = 1 and (date_format(date_sub(l.end_date, interval 10 day), "%Y-%m-%d") = date_format(CURDATE(), "%Y-%m-%d"))' +
            ' group by domain_id';

        let result = await common.simpleSelect(sequelize, sql, []);

        for (let item of result) {
            let taskPerformer_sql = 'select u.user_id, u.name' +
                ' from tbl_erc_department d' +
                ' inner join tbl_erc_custorgstructure c on c.department_id = d.department_id' +
                ' inner join tbl_common_user u on u.user_id = c.user_id' +
                ' where u.domain_id = ' + item.domain_id + ' and u.state = 1 and d.department_level = 1';
            let taskPerformer = await common.simpleSelect(sequelize, taskPerformer_sql, []);

            if (taskPerformer) {
                for (let tp of taskPerformer) {
                    let groupID = common.getUUIDByTime(30);
                    let description = '下列人员的劳动合同快到期请尽快处理：' + item.name;
                    await TaskListControlSRV.createTask({domain_id: item.domain_id, user_id: ''}, '劳动合同提醒', '213', tp.user_id, '0', description, '', groupID);
                }

            }

        }
    } catch (error) {
        logger.info('laborContractEndDate error:' + error);
        logger.info('laborContractEndDate error:' + error);
        return;
    }
}

exports.runLaborContract = () => {
    laborContractNoAttachment();
    laborContractEndDate();
    laborContractEndDate_2()
}