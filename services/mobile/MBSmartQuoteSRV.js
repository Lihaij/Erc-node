const fs = require('fs');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBAppointmentSRV.js');
const model = require('../../model');
const sms = require('../../util/SMSUtil.js');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize
const tb_template = model.erc_template;
const tb_appointment = model.erc_appointment;
const tb_usergroup = model.common_usergroup;;
const tb_user = model.common_user;;
const tb_customer = model.erc_customer;
const tb_inquiry = model.erc_inquiry;


exports.MBSmartQuoteResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'quote') {
        quoteAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let returnData = {}

        let templates = await sequelize.query('select a.produce_id as id, a.produce_id as value, b.materiel_name as text from tbl_erc_produce a left join tbl_erc_materiel b on (a.materiel_id=b.materiel_id) where b.state = 1 and a.state = 1 and b.materiel_type = 10', {
            replacements:[],
            type: sequelize.QueryTypes.SELECT
        });

        returnData.templateInfo = templates;

        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);

    }
}

async function quoteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let userFind = await tb_user.findOne({
            where: {
                username: doc.phone,
                user_type: GLBConfig.TYPE_CUSTOMER
            }
        });

        let isExist = 0;
        if(userFind){
            let customer = await tb_customer.findOne({
                where: {
                    user_id: userFind.user_id
                }
            });

            if (customer) {
                isExist = 1;
            }
        }

        let addInquiry = await tb_inquiry.create({
            phone: doc.phone,
            template_id: doc.template_id,
            house_area: doc.area,
            domain_id: 0,
            customer_name: doc.name,
            area_code: doc.area_code ? doc.area_code : null,
            customer_exist: isExist
        });

        let template = await sequelize.query('select b.materiel_sale from tbl_erc_produce a left join tbl_erc_materiel b on (a.materiel_id=b.materiel_id) where a.produce_id = ?', {
            replacements:[doc.template_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (template.length === 0) {
            common.sendError(res, 'produce_05');
            return;
        }

        addInquiry.pre_offer = parseFloat(doc.area) * parseFloat(template[0].materiel_sale);
        await addInquiry.save();

        let quote = parseFloat(doc.area) * parseFloat(template[0].materiel_sale);
        await sms.sedDataMsg(doc.phone, 'quote', quote.toFixed(2).toString())
        common.sendData(res, {
            quote: quote.toFixed(2)
        });

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
