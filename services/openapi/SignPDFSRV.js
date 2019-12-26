const path = require('path');
const fs = require('fs');
const rp = require('request-promise');
const moment = require('moment');

const config = require('../../config');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const Sequence = require('../../util/Sequence');
const logger = require('../../util/Logger').createLogger('ZoweeInterfaceSRV');
const model = require('../../model');

const tb_domain = model.common_domain;
const tb_order = model.erc_order;
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom;
const tb_roomtype = model.erc_roomtype;

const tb_uploadfile = model.erc_uploadfile;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_history = model.erc_history;
const tb_orderrequire = model.erc_orderrequire;
const tb_erc_orderreview = model.erc_orderreview;



exports.SignPDFControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'signConstructionContract') {
        signConstructionContractAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let signConstructionContractAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)
        let account = require('../../signPDF/account.json')
        let seal = require('../../signPDF/seal.json')

        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });

        if (!order) {
            return common.sendError(res, 'signpdf_01')
        }

        let domain = await tb_domain.findOne({
            where: {
                domain_id: order.domain_id
            }
        });

        let user = await tb_user.findOne({
            where: {
                user_id: order.user_id
            }
        });

        if (!user) {
            return common.sendError(res, 'signpdf_03')
        }

        let estate = await tb_estate.findOne({
            where: {
                estate_id: order.estate_id
            }
        });

        if (!estate) {
            return common.sendError(res, 'signpdf_04')
        }

        let estateroom = await tb_estateroom.findOne({
            where: {
                room_id: order.estate_room_id
            }
        });

        if (!estateroom) {
            return common.sendError(res, 'signpdf_05')
        }

        let roomtype  = await tb_roomtype.findOne({
            where: {
                roomtype_id: estateroom.roomtype_id
            }
        });

        if (!roomtype) {
            return common.sendError(res, 'signpdf_06')
        }


        let fileUrl = await common.ejs2File('erc/signpdf/ERCConstructionContract.ejs', {
            ejsData: {
                seal: seal.sealData,
                write: doc.write,
                aname: user.name,
                aphone: user.phone,
                bname: domain.domain_name,
                srcage: roomtype.roomtype_srcage,
                final_offer: order.final_offer,
                byear: order.break_date.getFullYear(),
                bmon: order.break_date.getMonth(),
                bday: order.break_date.getDate(),
                order_deposit: order.order_deposit,
                progress_payment: order.progress_payment,
                final_payment: order.final_payment,
                oaddress: order.order_address,
                daddress: domain.domain_province + domain.domain_city + domain.domain_district + domain.domain_address,
                dphone: domain.domain_phone,
                sign_date: moment().format('YYYY 年 MM 月 DD 日')
            }
        }, {
            zoom: 1.1,
            htmlFlag: true
        }, 'pdf')

        if (doc.type === '1') {
            //预览合同
            common.sendData(res, {tempUrl: fileUrl});
        } else {
            //最终合同
            let srcFile = path.join(__dirname, '../../' + config.tempDir + '/' + path.basename(fileUrl))
            let dstSFile = path.join(__dirname, '../../' + config.tempDir + '/' + path.basename(fileUrl, '.pdf') + '_s.pdf')

            let requestData = {
                signType: "Single",
                accountId: account.accountId,
                sealData: "",
                signPos: {
                    posType: 0,
                    posPage: "1",
                    posX: 100,
                    posY: 100,
                    key: "",
                    addSignTime: "false",
                    width: "100"
                },
                file: {
                    srcPdfFile: srcFile,
                    dstPdfFile: dstSFile,
                    fileName: "",
                    ownerPassword: ""
                }
            }

            let options = {
                method: 'POST',
                uri: config.signPDF.server + '/timevale/sign/userFileSign',
                headers: {
                    "Content-type": "application/json",
                },
                json: true,
                body: requestData
            };
            let body = await rp(options)
            if (body.errCode != 0) {
                return common.sendError(res, 'signpdf_01')
            }

            let file_url = '/temp/' + path.basename(fileUrl, '.pdf') + '_s.pdf'

            let fixUrl = await common.fileMove(file_url, 'upload')
            let addFile = await tb_uploadfile.create({
                api_name: 'ERCORDERDETAILCONTROL',
                order_id: doc.order_id,
                file_name: '乐宜嘉美学整装施工合同电子版.pdf',
                file_url: fixUrl,
                file_type: 'application/pdf',
                file_visible: 1,
                srv_type: '2',
                file_content: body.signDetailUrl,
                file_creator: req.user.name
            });
            let retData = JSON.parse(JSON.stringify(addFile));

            //修改订单流程
            await tb_orderworkflow.create({
                order_id: order.order_id,
                orderworkflow_state: 'REVIEWING',
                orderworkflow_desc: '订单审核'
            })

            await tb_history.create({
                order_id: order.order_id,
                order_state: 'REVIEWING',
                history_event: '订单详情',
                history_content: '订单审核',
                operator_name: user.name
            })

            order.order_state = 'REVIEWING';


            let requires = await tb_orderrequire.findAll({
                where: {
                    type_id: '4',
                    domain_id: user.domain_id,
                    state: GLBConfig.ENABLE
                }
            });

            if (requires.length > 0) {
                for (let r of requires) {
                    let result = await tb_erc_orderreview.create({
                        order_id: order.order_id,
                        require_id: r.require_id,
                        review_status: '1'
                    });
                }
            }

            await order.save();


            common.sendData(res, retData);
        }


    } catch (error) {
        return common.sendFault(res, error);
    }
};
