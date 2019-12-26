const common = require('../util/CommonUtil.js');
const model = require('../model');
const GLBConfig = require('../util/GLBConfig');
const moment = require('moment');
const logger = require('../util/Logger').createLogger('runVehicle');

const sequelize = model.sequelize;
const tb_vehicle = model.nca_vehicle;
const tb_trafficreceptionapply = model.nca_trafficreceptionapply;

/*根据交通接待申请时间，修改车辆状态*/
let changeVehicleState = async () => {
    try {
        logger.debug('------------------changeVehicleState scheduleJob start--------------');
        let nowDate = moment().format("YYYY-MM-DD"); /*现在时间*/
        let startDate, endDate = '' ,isChange=false;

        let vehicleArr =  await tb_vehicle.findAll({
            where: {
                state: GLBConfig.ENABLE,
                vehicle_status_flag: GLBConfig.VEHICLESTATUSFLAG[1].value
            }
        })

        for(let v of vehicleArr){
            isChange=false;//判断车辆状态是否改变
            let afterNowCount=0;//当前时间之后的Count
            /*查询车辆审核过、审核中的交通接待申请*/
            let trapplyArr = await tb_trafficreceptionapply.findAll({
                where: {
                    state: GLBConfig.ENABLE,
                    trapply_vehicle_apply:v.vehicle_id,
                    trapply_state: [GLBConfig.CHANGESTATE[2].value, GLBConfig.CHANGESTATE[1].value]
                }
            })

            for(var t of trapplyArr){
                let temy = JSON.parse(JSON.stringify(t));
                startDate = temy.trapply_start_time ? moment(temy.trapply_start_time).format("YYYY-MM-DD") : null;
                endDate = temy.trapply_end_time ? moment(temy.trapply_end_time).format("YYYY-MM-DD") : null;

                /*开始时间、结束日期 与现在比较*/
                if (moment(nowDate).isSame(startDate) || (moment(nowDate).isAfter(startDate) && moment(nowDate).isBefore(endDate)) || moment(nowDate).isSame(endDate)) {
                    isChange = true;
                    v.vehicle_status = GLBConfig.VEHICLESTATUS[1].value;
                    logger.info('trapplyCode:' + temy.trapply_code);
                    logger.info('等于/中间');
                } else if (moment(nowDate).isBefore(startDate)) {
                    afterNowCount = afterNowCount + 1;
                }

            }
            if( v.vehicle_status==GLBConfig.VEHICLESTATUS[1].value && isChange==false){
                v.vehicle_status = GLBConfig.VEHICLESTATUS[0].value;
            }
            if(afterNowCount==0){
                v.vehicle_status_flag = GLBConfig.VEHICLESTATUSFLAG[0].value;
            }
            await v.save();
        }
        logger.debug('------------------changeVehicleState scheduleJob end--------------');
        return
    } catch (error) {
        logger.info('changeVehicleState error:' + error);
        logger.error('changeVehicleState error:' + error);
        return
    }
};

exports.runVehicle = () => {
    changeVehicleState()
}