//预约管理
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAppointmentControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const point = require('../baseconfig/ERCPointControlSRV');

const sequelize = model.sequelize
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_appointment = model.erc_appointment;
const tb_userGroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom
const tb_orderdesign = model.erc_orderdesign;
const tb_orderrequire = model.erc_orderrequire;

exports.ERCAppointmentControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'searchPhone') {
        searchPhoneAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'acceptAppointment') {
        acceptAppointmentAct(req, res)
    } else if (method === 'order') {
        orderAct(req, res)
    } else if (method === 'getEstate') {
        getEstate(req, res)
    } else if (method === 'getBuild') {
        getBuild(req, res)
    } else if (method === 'getUnit') {
        getUnit(req, res)
    } else if (method === 'getRoomNo') {
        getRoomNo(req, res)
    } else if (method === 'getRoomType') {
        getRoomType(req, res)
    } else if (method === 'createOrder') {
        createOrderAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

//预约列表初始化数据
async function initAct(req, res) {
    let returnData = {
        htypeInfo: GLBConfig.HTYPEINFO,
        apStateInfo: GLBConfig.APSTATEINFO,
        OTypeInfo: GLBConfig.OTYPEINFO,
        ctypeInfo: GLBConfig.CTYPEINFO,
        genderInfo: GLBConfig.GENDERTYPE,
        flowSourceInfo: GLBConfig.FLOWSOURCE,
        ageInfo: GLBConfig.AGEFORM,
        projectType: GLBConfig.PROJECTTYPE
    }
    common.sendData(res, returnData)
}

//查询预约列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {}

        let queryStr = 'select * from tbl_erc_appointment , tbl_erc_customer where tbl_erc_customer.user_id = tbl_erc_appointment.user_id and domain_id = ?'
        let replacements = [user.domain_id]

        if (doc.search_text) {
            queryStr += ' and (ap_name like ? or ap_phone like ? or ap_address like ? )'
            let search_text = '%' + doc.search_text + '%'
            replacements.push(search_text)
            replacements.push(search_text)
            replacements.push(search_text)
        }

        if (doc.ap_state > 0) { //0为全部，1未受理，2已受理
            queryStr += ' and ap_state = ?'
            replacements.push(doc.ap_state)
        }

        if (doc.user_id) {
            queryStr += ' and user_id = ?'
            replacements.push(doc.user_id)
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []

        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            d.ap_date = ap.created_at.Format("yyyy-MM-dd")
            returnData.rows.push(d)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//按电话查询预约列表
async function searchPhoneAct(req, res) {
    try {
        let doc = common.docTrim(req.body)

        let queryStr = 'select * from tbl_common_user a, tbl_erc_customer b where a.user_id = b.user_id and a.phone like ? limit 0,6'

        let queryRst = await sequelize.query(queryStr, {
            replacements: ['%' + doc.ap_phone + '%'],
            type: sequelize.QueryTypes.SELECT
        })

        let retData = []
        for (let row of queryRst) {
            let r = JSON.parse(JSON.stringify(row))
            delete r.password
            retData.push(r)
        }
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//增加客户
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let apuser = await tb_user.findOne({
            where: {
                username: doc.ap_phone,
                user_type: GLBConfig.TYPE_CUSTOMER
            }
        });

        if (!apuser) {
            let userGroup = await tb_userGroup.findOne({
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
                domain_id: user.domain_id,
                usergroup_id: userGroup.usergroup_id,
                username: doc.ap_phone,
                phone: doc.ap_phone,
                password: common.generateRandomAlphaNum(6),
                name: doc.ap_name,
                user_type: userGroup.usergroup_type
            });
            let customer = await tb_customer.create({
                user_id: apuser.user_id,
                customer_level: doc.customer_level,
                customer_type: doc.customer_type,
                decorate_address: doc.decorate_address,
                customer_remarks: doc.customer_remarks,
                customer_source: "3"
            });
        } else {
            if (!apuser.domain_id) {
                apuser.domain_id = doc.domain_id
                if (!apuser.name) {
                    apuser.name = doc.ap_name
                }
                await apuser.save()
            }
        }

        let appointment = await tb_appointment.create({
            domain_id: user.domain_id,
            user_id: apuser.user_id,
            ap_type: doc.ap_type,
            ap_name: doc.ap_name,
            ap_phone: doc.ap_phone,
            ap_address: doc.ap_address,
            // ap_house_type: doc.ap_house_type,
            ap_house_area: doc.ap_house_area,
            ap_operator: user.id,
            ap_state: '1', // APSTATEINFO
            ap_remarks: doc.ap_remarks,
            ap_recommender_phone: doc.ap_recommender_phone
        });

        let retData = JSON.parse(JSON.stringify(appointment))
        retData.ap_date = appointment.created_at.Format("yyyy-MM-dd");

        //注册用户增加积分
        let pointResult = await point.updateUserPoint(apuser.user_id, 1, 1, '','');
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

//修改预约信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let appointment = await tb_appointment.findOne({
            where: {
                appoint_id: doc.old.appoint_id,
                state: GLBConfig.ENABLE
            }
        });

        let apuser = await tb_user.findOne({
            where: {
                phone: doc.new.ap_phone
            }
        });

        let user_id = ''
        if (apuser) {
            user_id = apuser.user_id
        }

        if (appointment) {
            appointment.user_id = user_id
            appointment.ap_type = doc.new.ap_type
            appointment.ap_name = doc.new.ap_name
            appointment.ap_phone = doc.new.ap_phone
            appointment.ap_address = doc.new.ap_address
            // appointment.ap_house_type = doc.new.ap_house_type
            appointment.ap_house_area = doc.new.ap_house_area
            appointment.ap_remarks = doc.new.ap_remarks
            appointment.ap_state = doc.new.ap_state

            await appointment.save()
            return common.sendData(res, appointment)
        } else {
            return common.sendError(res, 'appointment_01')
        }
    } catch (error) {
        return common.sendFault(res, error)
    }
}

//受理预约
async function acceptAppointmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let estateId, roomId, estateNo;

        // //判断楼盘
        // let estate = await tb_estate.findOne({
        //     where: {
        //         province: doc.province,
        //         city: doc.city,
        //         district: doc.district,
        //         estate_name: doc.estate_name
        //     }
        // });
        // if (estate) {
        //     estateId = estate.estate_id;
        //     estateNo = estate.estate_no;
        // } else {
        //     //保存楼盘
        //     let addEstate = await tb_estate.create({
        //         estate_no: "",
        //         province: doc.province,
        //         city: doc.city,
        //         district: doc.district,
        //         estate_name: doc.estate_name,
        //         source: user.domain_type
        //     });
        //
        //     let complete = (Array(4).join(0) + addEstate.estate_id).slice(-4);
        //     if (addEstate) {
        //         addEstate.estate_no = complete;
        //         await addEstate.save()
        //     }
        //     estateId = addEstate.estate_id;
        //     estateNo = addEstate.estate_no;
        //
        // }
        //
        // //判断房间
        // let estateroom = await tb_estateroom.findOne({
        //     where: {
        //         estate_id: estateId,
        //         build: doc.build,
        //         unit: doc.unit,
        //         room_no: doc.room_no
        //     }
        // });
        // if (estateroom) {
        //     roomId = estateroom.room_id;
        // } else {
        //     // 保存房间
        //     let roomCode = estateNo + doc.build + doc.unit + doc.room_no;
        //     let addEstateRoom = await tb_estateroom.create({
        //         estate_id: estateId,
        //         room_code: roomCode,
        //         build: doc.build,
        //         unit: doc.unit,
        //         room_no: doc.room_no,
        //         roomtype_id: 0
        //     });
        //     roomId = addEstateRoom.room_id
        // }

        //创建一个customer
        let apuser = await tb_user.findOne({
            where: {
                username: doc.ap_phone,
                user_type: GLBConfig.TYPE_CUSTOMER
            }
        });

        if (!apuser) {
            let userGroup = await tb_userGroup.findOne({
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
                domain_id: user.domain_id,
                usergroup_id: userGroup.usergroup_id,
                username: doc.ap_phone,
                phone: doc.ap_phone,
                password: common.generateRandomAlphaNum(6),
                name: doc.ap_name,
                user_type: userGroup.usergroup_type
            });
            let customer = await tb_customer.create({
                user_id: apuser.user_id,
                customer_level: doc.customer_level,
                customer_type: doc.customer_type,
                decorate_address: doc.decorate_address,
                customer_remarks: doc.customer_remarks,
                education: doc.education,//学历
                age: doc.age,//年龄
                career: doc.career,//职业
                income: doc.income,//收入
                gender: doc.gender,//性别
                flow_source: doc.flow_source,//流量来源
                customer_source: "3"
            });
        } else {
            if (!apuser.domain_id) {
                apuser.domain_id = doc.domain_id
                if (!apuser.name) {
                    apuser.name = doc.ap_name
                }
                await apuser.save()
            }

            //修改 customer
            let customer = await tb_customer.findOne({
                where: {
                    user_id: apuser.user_id
                }
            });

            if (customer) {
                customer.age = doc.age;
                customer.education = doc.education;
                customer.career = doc.career;
                customer.income = doc.income;
                customer.gender = doc.gender;
                customer.flow_source = doc.flow_source;
                customer.customer_type = doc.customer_type;
                customer.province = doc.province;
                customer.city = doc.city;
                customer.district = doc.district;
                await customer.save();
                common.sendData(res, customer)
            }
        }

        //处理预约单
        let appointment = await tb_appointment.findOne({
            where: {
                appoint_id: doc.appoint_id,
                state: GLBConfig.ENABLE
            }
        });
        appointment.ap_name = doc.ap_name;
        appointment.ap_phone = doc.ap_phone;
        appointment.ap_house_area = doc.ap_house_area;
        appointment.ap_address = doc.ap_address;
        appointment.roomtype_id = doc.roomtype_id;
        appointment.ap_estate_room_id = roomId;
        appointment.ap_state = '2'; // APSTATEINFO
        appointment.ap_recommender_phone = doc.ap_recommender_phone;
        appointment.ap_remarks = doc.ap_remarks;
        await appointment.save();
        common.sendData(res, appointment)
    } catch (error) {
        return common.sendFault(res, error)
    }
}

//创建订单
async function orderAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;

    //处理预约单
    let appointment = await tb_appointment.findOne({
        where: {
            appoint_id: doc.appoint_id,
            state: GLBConfig.ENABLE
        }
    });
    if (appointment) {
        let order = await tb_order.findOne({
            where: {
                estate_room_id: appointment.ap_estate_room_id,
                state: GLBConfig.ENABLE,
                order_state: {
                    '$notIn': ['FINISHI', 'CANCELLED']
                }
            }
        });

        if (order) {
            return common.sendError(res, 'appointment_03');
        }

        let room = await tb_estateroom.findOne({
            where: {
                room_id: appointment.ap_estate_room_id,
            }
        });

        let addOrder = await tb_order.create({
            order_id: await Sequence.genOrderID(user),
            domain_id: user.domain_id,
            user_id: appointment.user_id,
            order_type: appointment.ap_type, // OTYPEINFO
            order_address: appointment.ap_address,
            order_house_area: appointment.ap_house_area,
            recommender_phone: appointment.ap_recommender_phone,
            roomtype_id: appointment.roomtype_id,
            order_state: 'NEW', //ORDERSTATEINFO
            sales_id: user.user_id,
            estate_id: room.estate_id,
            estate_room_id: room.room_id
        });

        let addFlow = await tb_orderworkflow.create({
            order_id: addOrder.order_id,
            orderworkflow_state: 'NEW',
            orderworkflow_desc: '新建'
        })

        let appUser = await tb_user.findOne({
            where: {
                user_id: appointment.user_id
            }
        });

        if (appUser.domain_id != user.domain_id) {
            appUser.domain_id = user.domain_id;
            await appUser.save()
        }

        appointment.order_id = addOrder.order_id
        await appointment.save();
        common.sendData(res, appointment)
    } else {
        common.sendError(res, 'appointment_01')
        return
    }
}

//获得楼盘信息
async function getEstate(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select * from tbl_erc_estate where state=1 and province=? and city=? and district=?';
        replacements.push(doc.province);
        replacements.push(doc.city);
        replacements.push(doc.district);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].estate_id;
            elem.value = queryRst[i].estate_name;
            elem.text = queryRst[i].estate_name;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//根据楼盘获得房间信息
async function getBuild(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select build from tbl_erc_estateroom where state=1 and estate_id=? group by build';
        replacements.push(doc.estate_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].build;
            elem.value = queryRst[i].build;
            elem.text = queryRst[i].build;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获得单元信息
async function getUnit(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select unit from tbl_erc_estateroom where state=1 and estate_id=? and build=? group by unit';
        replacements.push(doc.estate_id);
        replacements.push(doc.build);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].unit;
            elem.value = queryRst[i].unit;
            elem.text = queryRst[i].unit;
            returnData.push(elem)
        }

        return common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获得房间编号
async function getRoomNo(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select room_id,room_no from tbl_erc_estateroom where state=1 and estate_id=? and build=? and unit=?';
        replacements.push(doc.estate_id);
        replacements.push(doc.build);
        replacements.push(doc.unit);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].room_id;
            elem.value = queryRst[i].room_no;
            elem.text = queryRst[i].room_no;
            returnData.push(elem)
        }

        return common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获得房间类型
async function getRoomType(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];
        let queryStr = 'select tbr.roomtype_id,tbr.name ' +
            'from tbl_erc_roomtype tbr,tbl_erc_estateroom tbe ' +
            'where tbr.state=1 and tbe.state=1 ' +
            'and tbr.roomtype_id=tbe.roomtype_id ' +
            'and tbe.room_id=? ';
        replacements.push(doc.room_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {

            let elem = {};
            elem.id = queryRst[i].roomtype_id;
            elem.value = queryRst[i].name;
            elem.text = queryRst[i].name;
            returnData.push(elem)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//创建订单
async function createOrderAct(req, res) {

    let doc = common.docTrim(req.body);
    let user = req.user;
    let estateId, roomId, estateNo;

    //判断楼盘
    let estate = await tb_estate.findOne({
        where: {
            province: doc.province,
            city: doc.city,
            district: doc.district,
            estate_name: doc.estate_name
        }
    });
    if (estate) {
        estateId = estate.estate_id;
        estateNo = estate.estate_no;
    } else {
        //保存楼盘
        let addEstate = await tb_estate.create({
            estate_no: "",
            province: doc.province,
            city: doc.city,
            district: doc.district,
            estate_name: doc.estate_name,
            source: user.domain_type
        });

        let complete = (Array(4).join(0) + addEstate.estate_id).slice(-4);
        if (addEstate) {
            addEstate.estate_no = complete;
            await addEstate.save()
        }
        estateId = addEstate.estate_id;
        estateNo = addEstate.estate_no;

    }

    //判断房间
    let estateroom = await tb_estateroom.findOne({
        where: {
            estate_id: estateId,
            build: doc.build,
            unit: doc.unit,
            room_no: doc.room_no
        }
    });
    if (estateroom) {
        roomId = estateroom.room_id;
    } else {
        // 保存房间
        let roomCode = estateNo + doc.build + doc.unit + doc.room_no;
        let addEstateRoom = await tb_estateroom.create({
            estate_id: estateId,
            room_code: roomCode,
            build: doc.build,
            unit: doc.unit,
            room_no: doc.room_no,
            roomtype_id: 0
        });
        roomId = addEstateRoom.room_id
    }

    //处理customer
    let apuser = await tb_user.findOne({
        where: {
            username: doc.ap_phone,
            user_type: GLBConfig.TYPE_CUSTOMER
        }
    });
    let customer = await tb_customer.findOne({
        where: {
            user_id: apuser.user_id
        }
    });
    if (customer) {
        customer.age = doc.age;
        customer.education = doc.education;
        customer.career = doc.career;
        customer.income = doc.income;
        customer.gender = doc.gender;
        customer.flow_source = doc.flow_source;
        customer.customer_type = doc.customer_type;
        customer.province = doc.province;
        customer.city = doc.city;
        customer.district = doc.district;
        await customer.save();

    }


    //处理预约单
    let appointment = await tb_appointment.findOne({
        where: {
            appoint_id: doc.appoint_id,
            state: GLBConfig.ENABLE
        }
    });
    if (appointment) {

        appointment.ap_name = doc.ap_name;
        appointment.ap_phone = doc.ap_phone;
        appointment.ap_house_area = doc.ap_house_area;
        appointment.ap_address = doc.ap_address;
        appointment.roomtype_id = doc.roomtype_id;
        appointment.ap_estate_room_id = roomId;
        appointment.ap_state = '2'; // APSTATEINFO
        appointment.ap_recommender_phone = doc.ap_recommender_phone;
        await appointment.save();

        let order = await tb_order.findOne({
            where: {
                estate_room_id: appointment.ap_estate_room_id,
                state: GLBConfig.ENABLE,
                order_state: {
                    '$notIn': ['FINISHI', 'CANCELLED']
                }
            }
        });

        if (order) {
            return common.sendError(res, 'appointment_03');
        }

        let room = await tb_estateroom.findOne({
            where: {
                room_id: appointment.ap_estate_room_id,
            }
        });

        let addOrder = await tb_order.create({
            order_id: await Sequence.genOrderID(user),
            domain_id: user.domain_id,
            user_id: appointment.user_id,
            order_type: 1, // OTYPEINFO
            project_type:appointment.ap_type, // OTYPEINFO,
            order_address: appointment.ap_address,
            order_house_area: appointment.ap_house_area,
            recommender_phone: appointment.ap_recommender_phone,
            roomtype_id: appointment.roomtype_id,
            order_state: 'NEW', //ORDERSTATEINFO
            sales_id: user.user_id,
            estate_id: room.estate_id,
            estate_room_id: room.room_id
        });

        let addFlow = await tb_orderworkflow.create({
            order_id: addOrder.order_id,
            orderworkflow_state: 'NEW',
            orderworkflow_desc: '新建'
        })

        //将管理配置里的表插入的tb_orderrequire里
        if (doc.order_type != '7') {
            let requires = await tb_orderrequire.findAll({
                where: {
                    state: GLBConfig.ENABLE,
                    type_id: {in: [1,2]},
                    domain_id: user.domain_id
                }
            })
            for (let require of requires) {
                await tb_orderdesign.create({
                    order_id: addOrder.order_id,
                    require_id: require.require_id,
                    require_type: require.type_id
                });
            }
        }

        let appUser = await tb_user.findOne({
            where: {
                user_id: appointment.user_id
            }
        });

        if (appUser.domain_id != user.domain_id) {
            appUser.domain_id = user.domain_id;
            await appUser.save()
        }

        appointment.order_id = addOrder.order_id
        await appointment.save();
        common.sendData(res, appointment)
    } else {
        common.sendError(res, 'appointment_01')
        return
    }

}
