const schedule = require('node-schedule');
const logger = require('./util/Logger').createLogger('schedule');
const exchange = require('./batch/exchange');
const vehicle = require('./batch/vehicle');
const certificate = require('./batch/certificate');
const archives = require('./batch/archives');
const laborContract = require('./batch/laborContract');
const lendMoney = require('./batch/lendMoney');
const billTask = require('./batch/billTask');

let scheduler = {
    scheduleJob: function() {
        let jobs = []
        // jobs.push(schedule.scheduleJob('*/1 * * * * *', exchange.test))

        // 根据交通接待申请时间，更新车辆状态 每天00:01:00执行一次
        jobs.push(schedule.scheduleJob('0 1 0 * * *', vehicle.runVehicle))

        // 根据证照年检时间和有效期，提醒进行年检或更改有效期
        jobs.push(schedule.scheduleJob('0 2 0 * * *', certificate.runCertificate))

        // 系统每天对已经超出归档日期未归档的档案、用系统发任务单的方式进行提醒
        jobs.push(schedule.scheduleJob('0 2 0 * * *', archives.runArchives))

        // 每天凌晨1点劳动合同提醒
        jobs.push(schedule.scheduleJob('0 1 0 * * *', laborContract.runLaborContract));

        // 每天凌晨1点借款还款提醒
        jobs.push(schedule.scheduleJob('0 1 0 * * *', lendMoney.runLendMoney));

        // 每天凌晨1点票据兑收兑付
        jobs.push(schedule.scheduleJob('0 1 0 * * *', billTask.billTask));

        return jobs;
    }
}

module.exports = scheduler;
