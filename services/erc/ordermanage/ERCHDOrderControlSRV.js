/**
 * 总部订单列表
 */
const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCOrderHDControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const qr = require('qr-image');
const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_order = model.erc_order;
const tb_userGroup = model.common_usergroup;;
const tb_user = model.common_user;;
const tb_customer = model.erc_customer;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_domain = model.common_domain;
const tb_appointment = model.erc_appointment;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom;
const tb_orderdesign = model.erc_orderdesign;
const tb_orderrequire = model.erc_orderrequire;
const tb_landagent = model.erc_landagent;
const tb_usergroup = model.common_usergroup;
const tb_thirdsignuser = model.erc_thirdsignuser;

exports.ERCHDOrderControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method==='search_fit') {
        search_fit(req, res)
    } else if (method==='search_group'){
        search_group(req,res)
    } else if (method==='search_sales'){
        search_sales(req,res)
    } else if(method==='getLandAgentUserInfo'){
        getLandAgentUserInfo(req,res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'searchForLandAgent') {
        searchForLandAgent(req, res)
    } else if (method === 'searchPhone') {
        searchPhoneAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method==='qrcode'){
        getQrcodeAct(req,res)
    } else if (method==='getArea'){
        getAreaAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 查询物料
let search_fit = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select o.*,u.*, o.domain_id domain_id,ds.name designer_name,
            o.created_at order_created_at,r.roomtype_name as room_type_name from
            tbl_erc_order o
            left join tbl_common_user u on o.user_id = u.user_id
            left join tbl_common_user ds on o.designer_id = ds.user_id
            left join tbl_common_domain d on d.domain_id = o.domain_id
            left join tbl_erc_roomtype r on o.roomtype_id = r.roomtype_id
            where o.state=1 and order_type=1 `;
        if (doc.search_text) {
            queryStr += ' and (o.order_id like ? or o.order_address like ? or u.phone like ? or u.name like ? or d.domain_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        if(doc.order_state){
            queryStr+=' and order_state=?';
            replacements.push(doc.order_state)
        }
        if(doc.project_type){
            queryStr+=' and project_type=?';
            replacements.push(doc.project_type)
        }
        if(doc.createdBTime){
            queryStr+= ' and o.created_at>=?';
            replacements.push(doc.createdBTime)
        }
        if(doc.createdETime){
            queryStr+= ' and o.created_at<=?';
            replacements.push(doc.createdETime)
        }
        queryStr += ' order by o.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.order_created_at ? moment(r.order_created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询物料
let search_group = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select o.*,u.*, o.domain_id domain_id,ds.name designer_name,
            o.created_at order_created_at,r.name as room_type_name,l.landagent_name
            from tbl_erc_order o
            left join tbl_common_user u on (o.user_id = u.user_id and u.state=1)
            left join tbl_common_user ds on (o.designer_id = ds.user_id and ds.state=1)
            left join tbl_common_domain d on (d.domain_id = o.domain_id and d.state=1)
            left join tbl_erc_roomtype r on (o.roomtype_id = r.roomtype_id and r.state=1)
            left join tbl_erc_estate e on (o.estate_id=e.estate_id and e.state=1)
            left join tbl_erc_landagent l on (e.land_agent=landagent_id and l.state=1)
            where o.state=1 and order_type=7 `;
        if (doc.search_text) {
            queryStr += ' and o.order_id like ? ';
            replacements.push('%' + doc.search_text + '%');
        }
        if(doc.order_state){
            queryStr+=' and order_state=?';
            replacements.push(doc.order_state)
        }
        if(doc.createdBTime){
            queryStr+= ' and o.created_at>=?';
            replacements.push(doc.createdBTime)
        }
        if(doc.createdETime){
            queryStr+= ' and o.created_at<=?';
            replacements.push(doc.createdETime)
        }
        if(doc.land_agent){
            queryStr+= ' and l.landagent_id=?';
            replacements.push(doc.land_agent)
        }
        queryStr += ' order by o.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.order_created_at ? moment(r.order_created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询物料
let search_sales = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select o.*,d.domain_name,d.domain_contact,d.domain_phone
         from tbl_erc_order o
         left join tbl_common_domain d on (o.purchase_domain_id=d.domain_id and d.state=1)
         where o.state=1 and o.order_type=8 `;
        if (doc.search_text) {
            queryStr += ' and o.order_id like ? ';
            replacements.push('%' + doc.search_text + '%');
        }
        if(doc.createdBTime){
            queryStr+= ' and o.created_at>=?';
            replacements.push(doc.createdBTime)
        }
        if(doc.createdETime){
            queryStr+= ' and o.created_at<=?';
            replacements.push(doc.createdETime)
        }
        if(doc.order_state){
            queryStr+=' and order_state=?';
            replacements.push(doc.order_state)
        }
        queryStr += ' order by o.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 初始化基础数据
let initAct = async(req, res) => {
    let returnData={};

    returnData = {
        projectTypeInfo:GLBConfig.OTYPEINFO,
        orderStateFitInfo: GLBConfig.ORDERSTATEINFO,
        orderStateGroupInfo:[],
        orderStateSalesInfo:[],
        userListInfo: [],
        storeList: [],
        landAgentList:[]
    };

    for(let o of GLBConfig.ORDERSTATEINFO){
        if(o.id=='NEW' || o.id=='WORKING' || o.id=='FINISHI'){
            returnData.orderStateGroupInfo.push({
                id: o.id,
                value: o.value,
                text: o.text
            });
        }
    }
    for(let o of GLBConfig.ORDERSTATEINFO){
        if(o.id=='NEW' || o.id=='FINISHI'){
            returnData.orderStateSalesInfo.push({
                id: o.id,
                value: o.value,
                text: o.text
            });
        }
    }
    let userList = await tb_user.findAll({
        attributes: ['user_id', 'username'],
        where: {
            domain_id: req.user.domain_id,
            state: GLBConfig.ENABLE,
            user_type: GLBConfig.TYPE_OPERATOR
        }
    });
    for (let user of userList) {
        returnData.userListInfo.push({
            id: user.user_id,
            text: user.username
        });
    }

    let domains = await tb_domain.findAll({
        where: {
            state: GLBConfig.ENABLE
        }
    });
    for (let d of domains) {
        returnData.storeList.push({
            id: d.domain_id,
            value: d.domain_id,
            text: d.domain_name
        });
    }

    let landagents = await tb_landagent.findAll({
        where:{
            domain_id: req.user.domain_id,
            state:GLBConfig.ENABLE
        }
    });
    for (let l of landagents) {
        returnData.landAgentList.push({
            id:l.landagent_id,
            value:l.landagent_id,
            text:l.landagent_name
        });
    }
    let queryStr = 'SELECT a.domain_id as id,a.domain_id as `value`,a.`domain_name` as text FROM tbl_common_domain AS a WHERE a.domain != "admin"';
    let queryRst = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.SELECT
    })
    returnData.domainInfo = queryRst;

    await FDomain.getDomainListInit(req, returnData);
    common.sendData(res, returnData);
};
// 修改订单
let modifyAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let modiOrder = await tb_order.findOne({
            where: {
                order_id: doc.old.order_id
            }
        });

        if (modiOrder) {
            modiOrder.project_type = doc.new.project_type;
            modiOrder.order_address = doc.new.order_address; //装修地址
            modiOrder.roomtype_id = doc.new.roomtype_id;
            modiOrder.order_house_area = doc.new.order_house_area;
            modiOrder.order_operator = doc.new.order_operator;
            modiOrder.order_state = doc.new.order_state;
            modiOrder.sales_id = doc.new.sales_id;
            modiOrder.order_designer = doc.new.order_designer;
            modiOrder.order_supervision = doc.new.order_supervision;
            modiOrder.order_remark = doc.new.order_remark;
            modiOrder.break_date = doc.new.break_date;
            await modiOrder.save();

            //同步预约的信息
            let appointment = await tb_appointment.findOne({
                where: {
                    order_id: doc.old.order_id
                }
            });
            if (appointment) {
                appointment.ap_address = doc.new.order_address;
                appointment.ap_house_area = doc.new.order_house_area;
                await appointment.save()
            }

        } else {
            common.sendError(res, 'order_02');
            return
        }
        let retData = JSON.parse(JSON.stringify(modiOrder));
        retData.break_date_f = modiOrder.break_date ? moment(modiOrder.break_date).format("YYYY-MM-DD") : null
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
// 查询客户
let searchPhoneAct = async(req,res)=>{
    try {
        let doc = common.docTrim(req.body)

        let queryStr = 'select * from tbl_common_user a, tbl_erc_customer b where a.user_id = b.user_id and a.phone =?'

        let queryRst = await sequelize.query(queryStr, {
            replacements: [doc.phone],
            type: sequelize.QueryTypes.SELECT
        })

        if (queryRst.length > 0) {
            let retData = JSON.parse(JSON.stringify(queryRst[0]))
            delete retData.password
            common.sendData(res, retData);
        } else {
            common.sendData(res);
        }

    } catch (error) {
        common.sendFault(res, error);
        return
    }
};
// 增加订单
let addAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;


        let addUser = await tb_user.findOne({
            where: {
                username: doc.phone,
                type: GLBConfig.TYPE_CUSTOMER
            }
        });
        if (!addUser) {
            let userGroup = await tb_userGroup.findOne({
                where: {
                    usergroup_type: GLBConfig.TYPE_CUSTOMER
                }
            });
            if (!userGroup) {
                common.sendError(res, 'customer_01');
                return
            }
            addUser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: user.domain_id,
                usergroup_id: userGroup.usergroup_id,
                username: doc.phone,
                phone: doc.phone,
                password: common.generateRandomAlphaNum(6),
                name: doc.name,
                type: userGroup.usergroup_type,
            });
            let customer = await tb_customer.create({
                user_id: addUser.user_id,
                customer_level: doc.customer_level,
                customer_type: doc.customer_type,
                decorate_address: doc.order_address,
                customer_remarks: doc.customer_remarks,
                customer_source: "3"
            });
        } else {
            if (addUser.domain_id != user.domain_id) {
                addUser.domain_id = user.domain_id
                await addUser.save()
            }
        }


        let addOrder = await tb_order.create({
            order_id: await Sequence.genOrderID(user),
            domain_id: user.domain_id,
            user_id: addUser.user_id,
            sales_id: user.user_id,
            order_type:doc.order_type,
            project_type: doc.project_type,
            recommender_phone: doc.recommender_phone,
            order_state: 'NEW', //ORDERSTATEINFO
            order_remark: doc.order_remark
        });
        let addFlow = await tb_orderworkflow.create({
            order_id: addOrder.order_id,
            orderworkflow_state: 'NEW',
            orderworkflow_desc: '新建'
        })

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

        let retData = Object.assign(JSON.parse(JSON.stringify(addOrder)), JSON.parse(JSON.stringify(addUser)));
        retData.create_date = addOrder.created_at.Format("yyyy-MM-dd")
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询物料
let searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select o.*,u.*, o.domain_id domain_id,ds.name designer_name, o.created_at order_created_at,r.name as room_type_name from
        tbl_erc_order o
        left join tbl_common_user u on o.user_id = u.user_id
        left join tbl_common_user ds on o.designer_id = ds.user_id
        left join tbl_common_domain d on d.domain_id = o.domain_id
        left join tbl_erc_roomtype r on o.roomtype_id = r.roomtype_id `;
        queryStr += ` where 1=1 `;
        let replacements = [];
        if (doc.is_crm === '1') {
            queryStr += ` and o.domain_id = ? `;
            replacements.push(user.domain_id);
        } else if (doc.domain_id != null) {
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
            result.create_date = r.order_created_at ? moment(r.order_created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询地产商
let searchForLandAgent = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select
            o.order_id, o.order_address, o.order_house_area, o.order_type, o.order_state, o.estate_id
            , ds.name as designer_name, u.name, u.phone
            , o.created_at order_created_at, r.name as room_type_name
            from tbl_erc_order o
            left join tbl_common_user u on o.user_id = u.user_id
            left join tbl_common_user ds on o.designer_id = ds.user_id
            left join tbl_common_domain d on d.domain_id = o.domain_id
            left join tbl_erc_roomtype r on o.roomtype_id = r.roomtype_id
            where true
            and o.domain_id = ?
            and o.order_type = 7`;
        let replacements = [];
        replacements.push(user.domain_id);

        queryStr += ` and o.estate_id in (select estate_id from tbl_erc_estate where domain_id = ? and land_agent = ?)`;
        replacements.push(user.domain_id);
        replacements.push(doc.landagent_id);

        if (doc.user_id) {
            queryStr += ` and o.user_id = ? `;
            replacements.push(doc.user_id)
        }
        if (doc.order_state) {
            queryStr += ` and o.order_state = ? `;
            replacements.push(doc.order_state)
        }

        if (doc.search_text) {
            queryStr += ' and (o.order_id like ? or o.order_address like ? or u.phone like ? or u.name like ?)';
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
            result.create_date = r.order_created_at ? moment(r.order_created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询户型
async function getAreaAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select * from tbl_erc_roomtype where estate_id = ? '
        replacements.push(doc.estate_id);
        //replacements.push(doc.name);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].roomtype_id;
            elem.value = queryRst[i].acreage;
            elem.text = queryRst[i].acreage;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 获得二维码
async function getQrcodeAct(req,res){
    let doc = common.docTrim(req.body);
    let svg_string = qr.imageSync(doc.order_id, { type: 'svg' });
    common.sendData(res, {qrcode: svg_string});
}
// 查询地产商登录用户
async function getLandAgentUserInfo(req, res) {
    let returnData = {};
    let user = req.user;
    let userInfo = await tb_user.findOne({where: {user_id: user.user_id}});
    returnData.userGroup = await tb_usergroup.findOne({where: {usergroup_id: userInfo.usergroup_id}});
    let thirdSignUser = await tb_thirdsignuser.findOne({where: {user_id: user.user_id}});
    returnData.landAgent = await tb_landagent.findOne({where: {landagent_id: thirdSignUser.supplier_id}});
    common.sendData(res, returnData);
}
