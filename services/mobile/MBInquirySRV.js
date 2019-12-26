/**
 * Created by Szane on 17/6/21.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBInquirySRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_inquiry = model.erc_inquiry;
const tb_template = model.erc_template;

exports.MBInquiryResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let initAct = async(req, res)=> {
    let returnData = {
        hTypeInfo: GLBConfig.HTYPEINFO,
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
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let addInquiry = await tb_inquiry.create({
            phone: doc.phone,
            template_id: doc.template_id,
            house_area: doc.house_area,
            domain_id: doc.domain_id,
            customer_name: doc.customer_name
        });
        let template = await tb_template.findOne({
            where: {template_id: doc.template_id}
        });
        let retData = JSON.parse(JSON.stringify(addInquiry));
        retData.quote = parseFloat(doc.house_area) * parseFloat(template.average_price);
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
