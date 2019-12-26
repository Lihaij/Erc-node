//客户管理->C端客户管理
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCCustomerControlSRV');
const model = require('../../../model');
const point = require('../baseconfig/ERCPointControlSRV');

const sequelize = model.sequelize
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_appointment = model.erc_appointment;
const tb_customercontact = model.erc_customercontact;
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_userGroup = model.common_usergroup;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom;

exports.ERCCustomerControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_c') {
        searchCustomerAct(req, res)
    } else if (method === 'search_w') {
        searchOrderAct(req, res)
    } else if (method === 'search_a') {
        searchAppointmentAct(req, res)
    } else if (method === 'add_c') {
        addCustomerAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'add_a') {
        addAppointmentAct(req, res)
    } else if (method === 'modify_a') {
        modifyAppointmentAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'modify_pad') {
        modifyPadAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify_point') {
        modifyPoint(req, res)
    } else if (method === 'search_p') {
        searchPointhAct(req, res)
    } else if (method === 'modify_detail') {
        modifyDetailAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

//初始化基础数据
async function initAct(req, res) {
    let doc = common.docTrim(req.body)
    let returnData = {},queryStr,queryRst;

    queryStr = 'select a.*,b.customer_level,b.customer_remarks,b.customer_state,b.customer_type,b.decorate_address ' +
        'from tbl_common_user a,tbl_erc_customer b where a.user_id = b.user_id and a.user_id=?';

    let replacements =[doc.user_id];
    queryRst = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    })
    returnData.customerInfo = queryRst;
    returnData.contactType = GLBConfig.CONTACTTYPE;
    returnData.contactWay = GLBConfig.CONTACTWAY;
    returnData.hTypeInfo = GLBConfig.HTYPEINFO;
    returnData.apStateInfo = GLBConfig.APSTATEINFO;
    returnData.orderStateInfo = GLBConfig.ORDERSTATEINFO;

    returnData.clevelInfo = GLBConfig.CLEVELINFO
    returnData.ctypeInfo = GLBConfig.CTYPEINFO
    returnData.cstateInfo = GLBConfig.CSTATEINFO
    returnData.customersourceInfo = GLBConfig.CUSTOMERSOURCE
    returnData.userInfo = req.user;
    returnData.genderInfo = GLBConfig.GENDERTYPE;
    returnData.flowSourceInfo = GLBConfig.FLOWSOURCE;
    returnData.ageInfo = GLBConfig.AGEFORM;

    queryStr = 'SELECT a.domain_id as id,a.domain_id as `value`,a.`domain_name` as text FROM tbl_common_domain AS a WHERE a.domain != "admin"';
    queryRst = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.SELECT
    })
    returnData.domainInfo = queryRst;

    let replacements2 = [doc.user_id];
    let queryStr2 = 'select o.* from tbl_common_user t ' +
        'left join tbl_erc_order o on t.user_id = o.user_id ' +
        'where t.state=1 and t.user_id=? ';

    queryStr2 += ' order by t.created_at desc';
    let result2 = await common.queryWithCount(sequelize, req, queryStr2, replacements2);

    returnData.total = result2.count;
    returnData.detailList = [];
    for (let r of result2.data) {
        let result2 = JSON.parse(JSON.stringify(r));
        result2.order_state = r.order_state;
        if (r.order_state == 'DESIGNING'){
            result2.order_state = '设计中'
        } else if (r.order_state == 'CHECKING') {
            result2.order_state = '审核中'
        } else if (r.order_state == 'SIGNED') {
            result2.order_state = '签约中'
        } else if (r.order_state == 'REVIEWING') {
            result2.order_state = '评审中'
        } else if (r.order_state == 'WORKING') {
            result2.order_state = '施工中'
        } else if (r.order_state == 'FINISHI') {
            result2.order_state = '已完成'
        } else if (r.order_state == 'CANCELLED') {
            result2.order_state = '取消'
        } else if (r.order_state == 'PAYED') {
            result2.order_state = '已付款'
        } else if (r.order_state == 'SHIPPED') {
            result2.order_state = '发货中'
        } else {
            result2.order_state = '无'
        }
        returnData.detailList.push(result2)
    }

    common.sendData(res, returnData)
}

//查询C端客户列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user;
        let returnData = {}

        let queryStr='select a.*,b.*,c.*,a2.`name` as salesperson_name, a2.`created_at` ' +
            'from tbl_common_user a ' +
            'left join tbl_erc_customer b on a.user_id = b.user_id ' +
            'left join tbl_common_domain c on a.domain_id = c.domain_id ' +
            'left join tbl_common_user a2 on b.salesperson_id = a2.user_id ' +
            'where a.user_type = ? ';
        let replacements = [GLBConfig.TYPE_CUSTOMER]

        if (doc.customer_level>0){//0为全部，1意向客户，2成交客户，3潜在客户
            queryStr += ' and b.customer_level = ?'
            replacements.push(doc.customer_level)
        }
        if (doc.customer_type){
            queryStr += ' and b.customer_type = ?'
            replacements.push(doc.customer_type)
        }

        if (doc.open_id){
            queryStr += ' and b.open_id = ?'
            replacements.push(doc.open_id)
        }

        if (doc.customer_state){
            queryStr += ' and b.customer_state = ?'
            replacements.push(doc.customer_state)
        }

        if (doc.domain_id){
            queryStr += ' and a.domain_id = ?'
            replacements.push(doc.domain_id)
            if(doc.search_text){
                queryStr += ' and (a.name like ? or a.phone like ? or b.decorate_address like ?)'
                let search_text = '%'+doc.search_text+'%'
                replacements.push(search_text)
                replacements.push(search_text)
                replacements.push(search_text)
            }
        }else{
            if (doc.search_text){
                queryStr += ' and (a.name like ? or a.phone like ? or b.decorate_address like ? or c.name like ?)'
                let search_text = '%'+doc.search_text+'%'
                replacements.push(search_text)
                replacements.push(search_text)
                replacements.push(search_text)
                replacements.push(search_text)
            }
        }

        queryStr += ' order by b.created_at desc'

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r))
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            // result.create_date = r.created_at.Format("yyyy-MM-dd")
            delete result.password
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询C端客户详情
async function searchCustomerAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let returnData = [];

        let queryStr = 'select a.*,b.`name` as operator_name from tbl_erc_customercontact a,tbl_common_user b where a.contact_operator = b.user_id'
        let replacements =[];
        if (doc.user_id){
            queryStr += ' and a.user_id= ?'
            replacements.push(doc.user_id)
        }

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })

        for(let r of queryRst){
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            returnData.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询订单列表
let searchOrderAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = `select o.*,u.*,u1.name as order_salesman ,u2.name as order_designer,u3.name as order_supervision from
        tbl_erc_order o left join tbl_common_user u on o.user_id = u.user_id
        left join tbl_common_user u1 on o.sales_id = u1.user_id
        left join tbl_common_user u2 on o.designer_id = u2.user_id
        left join tbl_common_user u3 on o.order_supervision = u3.user_id
        left join tbl_common_domain d on d.domain_id = o.domain_id `;
        queryStr += ` where 1=1 `;
        let replacements = [];
        if (doc.is_crm === '1') {
            queryStr += ` and o.domain_id = ? `;
            replacements.push(user.domain_id);
        }
        else if (doc.domain_id != null) {
            queryStr += ` and o.domain_id = ? `;
            replacements.push(doc.domain_id);
        }
        if (doc.user_id != null) {
            queryStr += ` and o.user_id = ? `;
            replacements.push(doc.user_id)
        }
        if (doc.order_state != null) {
            queryStr += ` and o.order_state = ? `;
            replacements.push(doc.order_state)
        }
        if (doc.order_type != null) {
            queryStr += ` and o.order_type = ? `;
            replacements.push(doc.order_type)
        }
        if (doc.created_at_start != null) {
            queryStr += ` and o.created_at >= ? `;
            replacements.push(doc.created_at_start + ` 00:00:00`);
        }
        if (doc.created_at_end != null) {
            queryStr += ` and o.created_at <= ? `;
            replacements.push(doc.created_at_end + ` 23:59:59`);
        }

        if (doc.search_text) {
            queryStr += ' and (o.order_id like ? or o.order_address like ? or u.phone like ? or u.name like ?)'
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by o.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? r.created_at.Format("yyyy-MM-dd") : null;
            result.break_date_f = r.break_date ? r.break_date.Format("yyyy-MM-dd") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//查询预约量房记录
async function searchAppointmentAct(req, res) {
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
            queryStr += ' and tbl_erc_customer.user_id = ?'
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

//增加联系记录
async function addCustomerAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let addcontact = await tb_customercontact.create({
            user_id: doc.user_id,
            contact_operator: doc.operatorId,
            contact_type: doc.contact_type,
            contact_way: doc.contact_way,
            remark: doc.remark
        });

        let retData = JSON.parse(JSON.stringify(addcontact))
        retData.create_date = addcontact.created_at.Format("yyyy-MM-dd");
        retData.operator_name = doc.operatorName;

        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//增加预约量房记录
async function addAppointmentAct(req, res) {
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
            ap_house_type: doc.ap_house_type,
            ap_house_area: doc.ap_house_area,
            ap_operator: user.id,
            ap_state: '1', // APSTATEINFO
            ap_remarks: doc.ap_remarks,
            ap_recommender_phone: doc.ap_recommender_phone
        });

        let retData = JSON.parse(JSON.stringify(appointment))
        retData.ap_date = appointment.created_at.Format("yyyy-MM-dd")
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改预约量房记录
async function modifyAppointmentAct(req, res) {
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
            appointment.ap_house_type = doc.new.ap_house_type
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
//增加客户
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let usergroup = await tb_usergroup.findOne({
            where: {
                usergroup_type: GLBConfig.TYPE_CUSTOMER
            }
        });

        if (!usergroup) {
            common.sendError(res, 'customer_01')
            return
        }

        let adduser = await tb_user.findOne({
            where: {
                username: doc.phone
            }
        });

        if (adduser) {
            common.sendError(res, 'customer_02')
            return
        }

        adduser = await tb_user.create({
            user_id: await Sequence.genUserID(),
            domain_id: user.domain_id,
            usergroup_id: usergroup.usergroup_id,
            username: doc.phone,
            phone: doc.phone,
            password: common.generateRandomAlphaNum(6),
            name: doc.name,
            user_type: usergroup.usergroup_type
        });


        let customer = await tb_customer.create({
            user_id: adduser.user_id,
            customer_level: doc.customer_level,
            customer_type: doc.customer_type,
            decorate_address: doc.decorate_address,
            customer_remarks: doc.customer_remarks,
            customer_source:"3",
            education: doc.education,
            age: doc.age,
            career: doc.career,
            income: doc.income,
            gender: doc.gender,
            province: doc.province,
            city: doc.city,
            district: doc.district,
            area_code: doc.area_code,
            flow_source: doc.flow_source,
            salesperson_id: doc.salesperson_id,
            open_id: doc.open_id,
            nickname: doc.nickname
        });

        let retData = JSON.parse(JSON.stringify(adduser))
        retData = Object.assign(retData, JSON.parse(JSON.stringify(customer)))
        retData.create_date = customer.created_at.Format("yyyy-MM-dd")
        retData.customer_source = "门店录入";
        delete retData.password;

        //注册用户增加积分
        let pointResult = await point.updateUserPoint(adduser.user_id, 1, 1, '','');

        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改客户信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        // update tbl_common_user

        let modiuser = await tb_user.findOne({
            where: {
                user_id: doc.old.user_id
            }
        });

        let ph = await tb_user.findOne({
            where: {
                phone: doc.new.phone
            }
        });

        if(ph && (ph.phone != modiuser.phone)){
            common.sendError(res, 'customer_04')
            return
        }

        if (modiuser) {
            modiuser.phone = doc.new.phone
            modiuser.name = doc.new.name
            modiuser.domain_id = doc.new.domain_id
            await modiuser.save()
        } else {
            common.sendError(res, 'operator_03')
            return
        }

        // update tbl_erc_customer
        let modicustomer = await tb_customer.findOne({
            where: {
                user_id: doc.old.user_id
            }
        });

        if (modicustomer) {
            modicustomer.customer_level = doc.new.customer_level;
            modicustomer.customer_type = doc.new.customer_type;
            modicustomer.customer_state = doc.new.customer_state;
            modicustomer.decorate_address = doc.new.decorate_address;
            modicustomer.customer_remarks = doc.new.customer_remarks;
            modicustomer.education = doc.new.education;
            modicustomer.age = doc.new.age;
            modicustomer.career = doc.new.career;
            modicustomer.income = doc.new.income;
            modicustomer.gender = doc.new.gender;
            modicustomer.province = doc.new.province;
            modicustomer.city = doc.new.city;
            modicustomer.district = doc.new.district;
            modicustomer.area_code = doc.new.area_code;
            modicustomer.flow_source = doc.new.flow_source;
            await modicustomer.save()
        } else {
            common.sendError(res, 'operator_03')
            return
        }



        let modAppoinmentPhone = await tb_appointment.update(
            {
                'ap_phone': doc.new.phone
            },
            {
                'where': {
                    'user_id': doc.old.user_id
                }
            }
        );



        let retData = JSON.parse(JSON.stringify(modiuser))
        retData = Object.assign(retData, JSON.parse(JSON.stringify(modicustomer)))
        retData.create_date = modicustomer.created_at.Format("yyyy-MM-dd")
        delete retData.password
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//pad 修改客户信息
async function modifyPadAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        // update tbl_common_user

        let modiuser = await tb_user.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        let ph = await tb_user.findOne({
            where: {
                phone: doc.phone
            }
        });

        if(ph && (ph.phone !== modiuser.phone)){
            common.sendError(res, 'customer_04')
            return
        }

        if (modiuser) {
            modiuser.phone = doc.phone
            modiuser.name = doc.name
            await modiuser.save()
        } else {
            common.sendError(res, 'operator_03')
            return
        }



        // update tbl_erc_customer
        let modicustomer = await tb_customer.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        if (modicustomer) {
            modicustomer.decorate_address = doc.decorate_address;
            modicustomer.customer_remarks = doc.customer_remarks;
            modicustomer.gender = doc.gender;
            modicustomer.province = doc.province;
            modicustomer.city = doc.city;
            modicustomer.district = doc.district;
            modicustomer.salesperson_id = doc.salesperson_id;
            modicustomer.nickname = doc.nickname;

            await modicustomer.save()
        } else {
            common.sendError(res, 'operator_03')
            return
        }

        let retData = JSON.parse(JSON.stringify(modiuser))
        retData = Object.assign(retData, JSON.parse(JSON.stringify(modicustomer)))
        retData.create_date = modicustomer.created_at.Format("yyyy-MM-dd")
        delete retData.password
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//删除客户
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let deluser = await tb_user.findOne({
            where: {
                domain_id: user.domain_id,
                id: doc.id,
                state: GLBConfig.ENABLE
            }
        });

        if (deluser) {
            deluser.state = GLBConfig.DISABLE
            await deluser.save()
            common.sendData(res)
            return
        } else {
            common.sendError(res, 'operator_03')
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

//修改积分
async function modifyPoint(req,res) {
    try{
        let doc = common.docTrim(req.body)
        let user = req.user;

        let customerUser = await tb_user.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!customerUser) {
            common.sendError(res, 'customer_02')
            return
        }

        let pointResult=await point.updateUserPoint(doc.user_id,2,doc.customer_add_point,'',doc.customerpoint_remarks);
        if(pointResult){
            common.sendData(res, pointResult)
        }else{
            logger.error('updateUserPoint error');
            common.sendError(res, 'updateUserPoint error');
            return
        }
    } catch(error){
        common.sendFault(res, error)
        return
    }
}

//查询积分数据
async function searchPointhAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user;
        let returnData = {}
        let queryStr = 'select a.user_id,a.username,a.name,a.phone,a.gender, ' +
            'b.*,c.customerpoint_remarks from tbl_common_user a ' +
            'left join tbl_erc_customer b on a.user_id = b.user_id ' +
            'left join (select * from tbl_erc_customerpoint where customerpoint_id in (select max(customerpoint_id) from tbl_erc_customerpoint group by user_id)) c on a.user_id = c.user_id ' +
            'where a.user_type = ? and a.user_id = ?'
        let replacements = [GLBConfig.TYPE_CUSTOMER,doc.user_id]

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r))
            result.create_date = r.created_at.Format("yyyy-MM-dd")
            delete result.password
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//详情页修改客户信息
async function modifyDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let modiuser = await tb_user.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        let ph = await tb_user.findOne({
            where: {
                phone: doc.phone
            }
        });

        if(ph && (ph.phone != modiuser.phone)){
            common.sendError(res, 'customer_04')
            return
        }

        if (modiuser) {
            modiuser.phone = doc.phone
            modiuser.name = doc.name
            await modiuser.save()
        } else {
            common.sendError(res, 'operator_03')
            return
        }

        let modicustomer = await tb_customer.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        if (modicustomer) {
            modicustomer.customer_type = doc.customer_type;
            modicustomer.customer_state = doc.customer_state;
            modicustomer.decorate_address = doc.decorate_address;
            modicustomer.gender = doc.gender;
            modicustomer.flow_source = doc.flow_source;
            modicustomer.customer_source = doc.customer_source;
            await modicustomer.save()
        } else {
            common.sendError(res, 'operator_03')
            return
        }



        let modAppoinmentPhone = await tb_appointment.update(
            {
                'ap_phone': doc.phone
            },
            {
                'where': {
                    'user_id': doc.user_id
                }
            }
        );



        let retData = JSON.parse(JSON.stringify(modiuser))
        retData = Object.assign(retData, JSON.parse(JSON.stringify(modicustomer)))
        retData.create_date = modicustomer.created_at.Format("yyyy-MM-dd")
        delete retData.password
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
