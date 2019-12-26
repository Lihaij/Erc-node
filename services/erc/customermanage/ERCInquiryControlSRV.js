const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCInquiryControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const sequelize = model.sequelize;
const tb_inquiry = model.erc_inquiry;
const tb_template = model.erc_template;
const tb_user = model.common_user;
const tb_userGroup = model.common_usergroup;;
const tb_customer = model.erc_customer;
const tb_domain = model.common_domain;


exports.ERCInquiryControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'accept') {//已存在用户受理询价
        acceptAct(req, res);
    } else if (method === 'add') {//测试用
        addAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

//初始化数据
let initAct = async(req, res)=> {
    let returnData = {
        hTypeInfo: GLBConfig.HTYPEINFO,//房屋类型
        cTypeInfo: GLBConfig.CTYPEINFO,//用户类型
        iStateInfo: GLBConfig.ISTATEINFO//询价状态
    };
    let templates = await tb_template.findAll({
        where: {
            state: GLBConfig.ENABLE
        }
    });
    returnData.templateInfo = [];
    for (let t of templates) {
        returnData.templateInfo.push({
            id: t.template_id,
            value: t.template_id,
            text: t.template_name
        })
    }
    common.sendData(res, returnData);
};

//查询询价列表
let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body) , returnData = {} , replacements = [];

        let queryStr = 'select i.*,materiel_name from tbl_erc_inquiry i ' +
            'left join tbl_erc_produce p on (i.template_id = p.produce_id and p.state=1) ' +
            'left join tbl_erc_materiel m on (p.materiel_id=m.materiel_id and m.state=1)' +
            ' where 1=1';
        if (doc.inquiry_state) {
            queryStr += ' and inquiry_state = ?';
            replacements.push(doc.inquiry_state);
        }

        if (doc.search_text) {
            queryStr += ' and (i.customer_name like ? or i.phone like ? or i.address like ?)'
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by i.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        returnData.rows = [];
        for (let inquiry of result.data) {
            let inquiryJ = JSON.parse(JSON.stringify(inquiry));
            inquiryJ.create_date = inquiry.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(inquiryJ)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//修改询价信息
let modifyAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let inquiry = await tb_inquiry.findOne({
            where: {
                inquiry_id: doc.old.inquiry_id,
            }
        });

        if (!inquiry) {
            common.sendError(res, 'inquiry_01');
            return
        }

        let addUser = await tb_user.findOne({
            where: {
                username: inquiry.phone,
                user_type: GLBConfig.TYPE_CUSTOMER
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
            let hqDomain = await tb_domain.findOne({
                where: {
                    domain_type: '0'
                }
            });

            addUser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: hqDomain.domain_id,//仅总部可见的客户
                usergroup_id: userGroup.usergroup_id,
                username: inquiry.phone,
                phone: inquiry.phone,
                password: common.generateRandomAlphaNum(6),
                name: doc.new.customer_name,
                user_type: userGroup.usergroup_type
            });
            let customer = await tb_customer.create({
                user_id: addUser.user_id,
                customer_level: '3',//潜在客户
                customer_type: doc.new.customer_type,
                decorate_address: doc.new.address,
                customer_remarks: doc.new.remark,
                customer_source: '1'
            });
        } else {
            let customer = await tb_customer.findOne({
                where: {
                    user_id: addUser.user_id
                }
            });

            if (!customer) {
                await tb_customer.create({
                    user_id: addUser.user_id,
                    customer_level: '3',//潜在客户
                    customer_type: doc.new.customer_type,
                    decorate_address: doc.new.address,
                    customer_remarks: doc.new.remark,
                    customer_source: '1'
                });
            }
        }

        inquiry.customer_name = doc.new.customer_name;
        inquiry.address = doc.new.address;
        inquiry.house_type = doc.new.house_type;
        inquiry.remark = doc.new.remark;
        inquiry.inquiry_state = '2';
        await inquiry.save();

        let retData = JSON.parse(JSON.stringify(inquiry));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//已存在用户受理询价
let acceptAct = async(req, res)=> {
    try{
        let doc = common.docTrim(req.body);
        let inquiry = await tb_inquiry.findOne({
            where: {
                inquiry_id: doc.inquiry_id
            }
        });
        inquiry.inquiry_state = '2';
        await inquiry.save();
        let retData = JSON.parse(JSON.stringify(inquiry));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//测试用增加询价
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let addInquiry = await tb_inquiry.create({
            phone: doc.phone,
            template_id: doc.template_id,
            house_area: doc.house_area,
            domain_id: 0,
            customer_name: doc.customer_name,
            area_code: doc.area_code
        });
        let template = await tb_template.findOne({
            where: {template_id: doc.template_id}
        });

        addInquiry.pre_offer = parseFloat(doc.house_area) * parseFloat(template.average_price);
        await addInquiry.save()

        let retData = JSON.parse(JSON.stringify(addInquiry));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
