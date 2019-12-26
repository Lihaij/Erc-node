const fs = require('fs');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBAppointmentSRV.js');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize
const tb_appointment = model.erc_appointment;
const tb_usergroup = model.common_usergroup;;
const tb_user = model.common_user;;
const tb_customer = model.erc_customer;
const tb_domain = model.common_domain;
const INF = 0xffffff;

const point = require('../erc/baseconfig/ERCPointControlSRV');


exports.MBAppointmentResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {
            OTypeInfo: GLBConfig.PROJECTTYPE
        };

        let domains = await tb_domain.findAll({
            where: {
                domain_type: {
                    $in: ['1','2','3','4']
                },
                state: GLBConfig.ENABLE
            }
        });
        domains = JSON.parse(JSON.stringify(domains));
        for (let d of domains) {
            d.value = await getDistance(doc.now_coordinate, d.domain_coordinate);
        }
        domains = quickSort(domains);
        returnData.domainInfo = domains;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}
let searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let queryStr = ` select a.*,d.domain_name,u.avatar from tbl_erc_appointment a
        left join tbl_common_domain d on a.domain_id = d.domain_id
        left join tbl_common_user u on u.user_id = a.user_id
        where a.state = ? `;
        let replacements = [GLBConfig.ENABLE];
        if (doc.ap_state != null) {
            queryStr += ` and  a.ap_state = ? `;
            replacements.push(doc.ap_state);
        }
        if (doc.user_id != null) {
            queryStr += ` and a.user_id = ? `;
            replacements.push(doc.user_id);
        }
        queryStr += ` order by a.created_at desc `;
        let resData = await common.simpleSelect(sequelize, queryStr, replacements);
        common.sendData(res, resData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        // if (!('domain_id' in doc)) {
        //     return common.sendError(res, 'mbap_01');
        // }

        let ap = await tb_appointment.findOne({
            where: {
                ap_phone: doc.ap_phone,
                state: GLBConfig.ENABLE,
                created_at: { //24小时内同一手机只能预约一次
                    $lt: new Date(),
                    $gt: new Date(new Date() - 24 * 60 * 60 * 1000)
                }
            }
        });
        if (ap) {
            return common.sendError(res, 'appointment_02');
        }

        await common.transaction(async function(t) {
            let apuser = await tb_user.findOne({
                where: {
                    username: doc.ap_phone,
                }
            });
            if (!apuser) {
                let userGroup = await tb_usergroup.findOne({
                    where: {
                        usergroup_type: GLBConfig.TYPE_CUSTOMER
                    }
                });
                if (!userGroup) {
                    common.sendError(res, 'customer_01');
                    return
                }

                apuser = await tb_user.create({
                    user_id: await Sequence.genUserID(),
                    // domain_id: doc.domain_id,
                    usergroup_id: userGroup.usergroup_id,
                    username: doc.ap_phone,
                    phone: doc.ap_phone,
                    name: doc.ap_name,
                    password: common.generateRandomAlphaNum(6),
                    user_type: userGroup.usergroup_type
                }, {
                    transaction: t
                });
                await tb_customer.create({
                    user_id: apuser.user_id,
                    customer_source: GLBConfig.CUSTOMERSOURCE[3].value,
                    province:doc.province ? doc.province : null,
                    city:doc.city ? doc.city : null
                }, {
                    transaction: t
                });

                //注册用户增加积分
                await point.updateUserPoint(apuser.user_id, 1, 1, '','');
            } else {
                //以后需要重构，用户跟门店是多对多的关系
                // if (!apuser.domain_id) {
                //     apuser.domain_id = doc.domain_id
                    if (!apuser.name) {
                        apuser.name = doc.ap_name
                    }
                    await apuser.save({
                        transaction: t
                    })
                // }
            }

            let appointment = await tb_appointment.create({
                domain_id: doc.domain_id,
                user_id: apuser.user_id,
                ap_type: doc.ap_type, // OTYPEINFO
                project_type:doc.ap_type,
                ap_phone: doc.ap_phone,
                ap_name: doc.ap_name,
                ap_recommender_phone: doc.ap_recommender_phone,
                ap_state: '1' // APSTATEINFO
            }, {
                transaction: t
            });



            let retData = JSON.parse(JSON.stringify(appointment));
            retData.ap_date = appointment.created_at.Format("yyyy-MM-dd");
            common.sendData(res, retData);
        })
    } catch (error) {
        return common.sendFault(res, error);
    }
}
let getDistance = async(start, end) => {
    if (!start || !end || end == `` || start == ``)
        return INF;
    let startCd = start.split(`,`);
    let endCd = end.split(`,`);
    if (startCd.length != 2 || endCd.length != 2)
        return INF;
    let xDiff = parseFloat(startCd[0]) - parseFloat(endCd[0]);
    let yDiff = parseFloat(startCd[1]) - parseFloat(endCd[1]);
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};
let quickSort = function(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    let pivotIndex = Math.floor(arr.length / 2);
    let pivot = arr.splice(pivotIndex, 1)[0];
    let left = [];
    let right = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].value <= pivot.value) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    if (pivot)
        return quickSort(left).concat([pivot], quickSort(right));
    else
        return quickSort(left).concat(quickSort(right));
};
