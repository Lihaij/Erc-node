const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const soap = require('soap');
const wkhtmltopdf = require('wkhtmltopdf');

const common = require('../util/CommonUtil');
const GLBConfig = require('../util/GLBConfig');
const Sequence = require('../util/Sequence');
const logger = require('../util/Logger').createLogger('TestSRV');
const WXPay = require('../util/wxpay');
const config = require('../config');
const model = require('../model');

const tb_worklog = model.erc_orderroom;

exports.TestResource = (req, res) => {
    let method = req.query.method
    if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'pay') {
        payAct(req, res)
    } else if (method === 'ws') {
        wsAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
}

async function searchAct(req, res) {
    try {
        // let url = 'http://121.12.253.157:8004/ErpService.asmx?wsdl';
        // let fdata = await common.fileGet('/files/5a2f77ddbdb291008917b6c7.vkpx')
        // let args = {
        //     joinno: '888888',
        //     shopno: '888888',
        //     orderno: '1234567890124',
        //     customername: '111',
        //     address: '111',
        //     phone: '111',
        //     brandid: 2,
        //     contracttypeid: 1,
        //     finishdate: '2017-12-13',
        //     filename: {string:['20171205000015.vkpx']},
        //     filebyte: {base64Binary:[fdata.toString('base64')]},
        //     designer: '111',
        //     designphone: '111',
        //     remark: '111',
        //     opuser: '111',
        //     extends: ''
        // };
        // let client = await soap.createClientAsync(url)
        // let result = await client.OrderUpload2Async(args)
        // if(result.OrderUpload2Result.string[0] === '0'){
        //   console.log(result.OrderUpload2Result.string[1]);
        //   logger.error(result.OrderUpload2Result.string[1])
        //   return common.sendError(res, 'orderdetail_08')
        // }

        // let fileUrl = await common.ejs2File('erc/signpdf/ERCConstructionContract.ejs', {}, {
        //     zoom: 3,
        //     htmlFlag: true
        // }, 'pdf')
        // common.sendData(res, {
        //     url: fileUrl
        // });

        let fileUrl = await common.ejs2File('Gutenberg.ejs', {}, {}, 'html', res)

        // let data = [[{"dpt_des":"开发部","doc_dt":"2013-09-09","doc":"a001"}],[{"pt":"pt1","des":"des1","due_dt":"2013-08-07","des2":"2013-12-07"},{"pt":"pt1","des":"des1","due_dt":"2013-09-14","des2":"des21"}]];
        //
        // let fileUrl = await common.ejs2xlsx('test.xlsx', data)

        // let data = [ [{"table_name":"现金报表","date": '2014-04-09'}],[ { 					"cb1":"001","cb1_":"002","bn1":"1","bn1_":"1","cn1":"1","cn1_":"1","num1":"1","num1_":"1", 					"cb5":"001","cb5_":"002","bn5":"1","bn5_":"1","cn5":"1","cn5_":"1","num1":"1","num5_":"1", 					"cb10":"001","cb10_":"002","bn10":"1","bn10_":"1","cn10":"1","cn10_":"1","num10":"1","num10_":"1", 					"cb20":"001","cb20_":"002","bn20":"1","bn20_":"1","cn20":"1","cn20_":"1","num20":"1","num20_":"1", 					"cb50":"001","cb50_":"002","bn50":"1","bn50_":"1","cn50":"1","cn50_":"1","num50":"1","num50_":"1", 					"cb100":"001","cb100_":"002","bn100":"1","bn100_":"1","cn100":"1","cn100_":"1","num100":"1","num100_":"1" 				},{ 					"cb1":"001","cb1_":"002","bn1":"1","bn1_":"1","cn1":"1","cn1_":"1","num1":"1","num1_":"1", 					"cb5":"001","cb5_":"002","bn5":"1","bn5_":"1","cn5":"1","cn5_":"1","num1":"1","num5_":"1", 					"cb10":"001","cb10_":"002","bn10":"1","bn10_":"1","cn10":"1","cn10_":"1","num10":"1","num10_":"1", 					"cb20":"001","cb20_":"002","bn20":"1","bn20_":"1","cn20":"1","cn20_":"1","num20":"1","num20_":"1", 					"cb50":"001","cb50_":"002","bn50":"1","bn50_":"1","cn50":"1","cn50_":"1","num50":"1","num50_":"1", 					"cb100":"001","cb100_":"002","bn100":"1","bn100_":"1","cn100":"1","cn100_":"1","num100":"1","num100_":"1" 				}]];
        //
        //
        // let fileUrl = await common.ejs2xlsx('report.xlsx', data)
        //
        // tb_worklog.bulkCreate([{room_id: 999,order_id:"44444",room_type:"01",room_name:"222",room_area:30},{room_id: 888,order_id:"111",room_type:"01",room_name:"222",room_area:30}])
        //
        // common.sendData(res, {
        //     url: fileUrl
        // });
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function payAct(req, res) {
    try {
        let wxpay = WXPay({
            appid: 'wxbeaa7f89d518adce',
            mch_id: '1486385692',
            partner_key: 'xxxxxxxxxxxxxxxxx', //微信商户平台API密钥
            pfx: fs.readFileSync('./wxpay_cert.p12'), //微信商户平台证书
        });
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function wsAct(req, res) {
    try {
        let clients = common.getWSClients(req)
        common.wsClientsSend(clients,'refresh')
        common.wsClientsClose(clients)

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
