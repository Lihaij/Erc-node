//推动分析
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCParkSupplierControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
const nodemailer = require('nodemailer');
const sms = require('../../../util/SMSUtil.js');

//创建一个smtp服务器
const config = {
    host: "smtp.qq.com", //qq smtp服务器地址
    secureConnection: false, //是否使用安全连接，对https协议的
    port: 465, //qq邮件服务所占用的端口
    auth: {
        user: "931766029@qq.com",//开启SMTP的邮箱，有用发送邮件
        pass: "ckzggqycwbrebefj"//授权码
    }
};
// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);
const tb_park_supplier = model.erc_park_supplier;//园区供应商
const tb_uploadfile = model.erc_uploadfile;
const tb_park_purchase = model.park_purchase;//园区采购
const tb_park_quotate = model.park_quotation;//园区报价
const tb_purchase_type = model.erc_purchasetype


// 供应商增删改查接口
exports.ERCParkSupplierControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'add') {//注册
        addAct(req, res)
    // } else if (method === 'uploadPhoto') {//上传图片
    //     uploadPhoto(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {//修改
        modifyAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_t') {//园区供应商的审核管理
        parkSearchAct(req, res)
    } else if (method === 'info') {//供应商的我的信息
        infoAct(req, res)
    } else if (method === 'aduit') {//提交审核
        aduitAct(req, res)
    } else if (method === 'setPwd') {//修改密码
        setPwdAct(req, res)
    } else if (method === 'sendCode') {//发送验证码
        sendCodeAct(req, res)
    } else if (method === 'upload') {//上传文件的记录
        uploadAct(req, res)
    } else if (method === 'PurchasesList'){//供应商登录页获取最新采购列表
        PurchasesList(req, res);
    } else if (method === 'getPurchase'){//登录页点击查看报价详情
        getPurchase(req, res);
    } else if (method === 'checkCode'){//注册页先验证验证码
        checkCode(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化参数
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {
            // ENABLEL: GLBConfig.ENABLE,
            //审核状态
            ADUITSTATE: GLBConfig.ADUITSTATE,
            
        };

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加供应商
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),// 
        user = req.user,
            replacements = [];
        if (doc.supplier_phone && await searchSupplierByPhone(doc.supplier_phone)) {
            return common.sendError(res, 'supplier_01');
        }
        if (doc.supplier_mail && await searchSupplierByMail(doc.supplier_mail)) {
            return common.sendError(res, 'supplier_02');
        }
        if (!(doc.id_file1 || doc.id_file2 || doc.business_file)) {
            return common.sendError(res, 'supplier_03');
        }
        // if (!('type' in doc)) {//type为login，被拦截
        //     common.sendError(res, 'auth_15');
        //     return
        // }
        // if (!('code' in doc)) {
        //     common.sendError(res, 'auth_17');
        //     return
        // }
        // let checkResult = await sms.certifySMSCode(doc.phone, doc.code, 'login');
        // if (!checkResult) {
        //    return common.sendError(res, 'auth_12');
        // }
        let park_supplier = await tb_park_supplier.create({
            domain_id: user ? user.domain_id:0,//?
            supplier_phone: doc.supplier_phone,
            supplier_mail: doc.supplier_mail,//邮箱
            supplier_name: doc.supplier_name,
            supplier_pwd: doc.supplier_pwd,
            legal_person: doc.legal_person,
            legal_IDCard_number: doc.legal_IDCard_number,
            // legal_IDCard_photo: doc.supplier_photo,//身份证文件路径
            business_license_no: doc.business_license_no,
            // business_license_photo: doc.business_license_photo,
            industry_classification: doc.industry_classification,
            industry_name: doc.industry_name,
            company_size: doc.company_size,
            main_business:doc.main_business,//主营业务
            audit_status:'2',//审核状态：无需审核

            company_address: doc.company_address,//地址
            floor_area: doc.floor_area,//占地面积
            construction_area: doc.construction_area,//建筑面积
            registered_capital: doc.registered_capital,//注册资本
            paid_up_capital: doc.paid_up_capital,//实收资本
            plan_investment: doc.plan_investment,//投资总额
            actual_investmen: doc.actual_investmen,//实际投资总额
            equipment_investment: doc.equipment_investment,//生产设备投资总额
            employees_count: doc.employees_count,
            patent_number: doc.patent_number,//专利数
            map_loaction: doc.map_loaction,//地图位置(经度，维度)
            high_tech: doc.high_tech
        });

        let api_name = common.getApiName(req.path);
        let m = doc.id_file1;
        let n = doc.id_file2;
        let l = doc.business_file;
        if (m&&m.url) {
            let fileUrl = await common.fileMove(m.url, 'upload');
            let addFile = await tb_uploadfile.create({
                api_name: api_name,
                file_name: m.name,
                file_url: fileUrl,
                file_type: m.type,
                srv_id: park_supplier.park_supplier_id,
                srv_type: '421',
                file_creator: park_supplier.supplier_name
            })
        }
        if (n&&n.url) {
            let fileUrl = await common.fileMove(n.url, 'upload');
            let addFile = await tb_uploadfile.create({
                api_name: api_name,
                file_name: m.name,
                file_url: fileUrl,
                file_type: m.type,
                srv_id: park_supplier.park_supplier_id,
                srv_type: '422',
                file_creator: park_supplier.supplier_name
            })
        }

        if (l&&l.url) {
            let fileUrl = await common.fileMove(l.url, 'upload');
            let addFile = await tb_uploadfile.create({
                api_name: api_name,
                file_name: m.name,
                file_url: fileUrl,
                file_type: m.type,
                srv_id: park_supplier.park_supplier_id,
                srv_type: '423',
                file_creator: park_supplier.supplier_name
            })
        }


        let retData = JSON.parse(JSON.stringify(park_supplier));
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_id: retData.park_supplier_id,
                state: GLBConfig.ENABLE
            },
            order: [
                ['srv_type', 'ASC']
              ]
        })
        if(ufs.length!=3){
            return common.sendError(res, 'supplier_04');
        }
        retData.id_file1=ufs[0];
        retData.id_file2=ufs[1];
        retData.business_file=ufs[2];

        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
async function checkCode(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let checkResult = await sms.certifySMSCode(doc.supplier_phone, doc.code, 'login');
        if (doc.supplier_phone && await searchSupplierByPhone(doc.supplier_phone)) {
            return common.sendError(res, 'supplier_01');
        }
        if (!checkResult) {
           return common.sendError(res, 'auth_12');
        }
        common.sendData(res, checkResult);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改供应商
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let park_supplier = await tb_park_supplier.findOne({
            where: {
                park_supplier_id: doc.park_supplier_id
            }
        });
        if (park_supplier) {
            // if (doc.supplier_phone && await searchSupplierByPhone(doc.supplier_phone,doc.park_supplier_id)) {
            //     return common.sendError(res, 'supplier_01');
            // }
            // if (doc.supplier_mail && await searchSupplierByMail(doc.supplier_mail,doc.park_supplier_id)) {
            //     return common.sendError(res, 'supplier_02');
            // }
            if (!(doc.id_file1 || doc.id_file2 || doc.business_file)) {
                return common.sendError(res, 'supplier_03');
            }

                // park_supplier.supplier_phone = doc.supplier_phone,
                // park_supplier.supplier_mail = doc.supplier_mail,//邮箱
                park_supplier.supplier_name = doc.supplier_name,
                park_supplier.legal_person = doc.legal_person,
                park_supplier.legal_IDCard_number = doc.legal_IDCard_number,
                park_supplier.legal_IDCard_photo = doc.supplier_photo,//身份证文件路径
                park_supplier.business_license_no = doc.business_license_no,
                park_supplier.business_license_photo = doc.business_license_photo
                park_supplier.industry_classification = doc.industry_classification,
                park_supplier.industry_name = doc.industry_name,
                park_supplier.company_size = doc.company_size,
                park_supplier.main_business=doc.main_business,//主营业务

                park_supplier.company_address = doc.company_address,
                park_supplier.floor_area = doc.floor_area,
                park_supplier.construction_area = doc.construction_area,
                park_supplier.registered_capital = doc.registered_capital,//注册资本
                park_supplier.paid_up_capital = doc.paid_up_capital,//实收资本
                park_supplier.plan_investment = doc.plan_investment,//投资总额
                park_supplier.actual_investmen = doc.actual_investmen,//实际投资总额
                park_supplier.equipment_investment = doc.equipment_investment,//生产设备投资总额
                park_supplier.employees_count = doc.employees_count,
                park_supplier.patent_number = doc.patent_number,//专利数
                park_supplier.map_loaction = doc.map_loaction,//地图位置(经度，维度)
                park_supplier.high_tech = doc.high_tech,

            await park_supplier.save();
            let api_name = common.getApiName(req.path);
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: park_supplier.park_supplier_id,
                    state: GLBConfig.ENABLE
                },
                order: [
                    ['srv_type', 'ASC']
                  ]
            });
            if(ufs.length!=3){
                return common.sendError(res, 'supplier_04');
            }
            let m = doc.id_file1;
            let n = doc.id_file2;
            let l = doc.business_file;
        if (m.url) {
            let fileUrl = await common.fileMove(m.url, 'upload');
            ufs[0].file_name= m.name,
            ufs[0].file_url= fileUrl,
            ufs[0].file_type= m.type,
            ufs[0].srv_id= park_supplier.park_supplier_id,
            ufs[0].srv_type= '421',
            ufs[0].file_creator= park_supplier.supplier_name
            ufs[0].save();
        }
        if (n.url) {
            let fileUrl = await common.fileMove(n.url, 'upload');
            ufs[1].file_name= n.name,
            ufs[1].file_url= fileUrl,
            ufs[1].file_type= n.type,
            ufs[1].srv_id= park_supplier.park_supplier_id,
            ufs[1].srv_type= '422',
            ufs[1].file_creator= park_supplier.supplier_name
            ufs[1].save();
        }

        if (l.url) {
            let fileUrl = await common.fileMove(l.url, 'upload');
            ufs[2].file_name= l.name,
            ufs[2].file_url= fileUrl,
            ufs[2].file_type= l.type,
            ufs[2].srv_id= park_supplier.park_supplier_id,
            ufs[2].srv_type= '423',
            ufs[2].file_creator= park_supplier.supplier_name
            ufs[2].save();
        }

            common.sendData(res, park_supplier)
        } else {
            common.sendError(res, 'park_supplier_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除供应商
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { park_supplier_id } = body;

        const result = await tb_park_supplier.findOne({
            where: {
                park_supplier_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: retData.park_supplier_id,
                    // srv_type: '201',
                    state: GLBConfig.ENABLE
                }
            })
            for(let u of ufs){
                u.state = GLBConfig.DISABLE;
                await u.save();
            }
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
async function setPwdAct(req, res) {
    try {
        const { body } = req;
        const { park_supplier_id, new_pwd, old_pwd } = body;

        const result = await tb_park_supplier.findOne({
            where: {
                park_supplier_id
            }
        });

        if (result) {
            if (result.supplier_pwd !== old_pwd) {
                return common.sendError(res, 'supplier_pwd');
            }
            result.supplier_pwd = new_pwd
            await result.save();
            common.sendData(res, result);
        }else{
            common.sendError(res, 'auth_05');
        }

    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取供应商
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        let result = await getData(req, res, false, doc);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//获取供应商
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { park_supplier_id } = body;
    let replacements = [];

    let queryStr = 'select t.* from tbl_erc_park_supplier t ' +
        ' where t.state = 1 and t.park_supplier_id=?';
    queryStr += ' order by t.created_at desc';
    replacements.push(park_supplier_id);
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        let files = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.park_supplier_id,
                // srv_type: '301',
                state: GLBConfig.ENABLE
            },
            order: [
                ['srv_type', 'ASC']
              ]
        });
        r.id_file1=files[0];
        r.id_file2=files[1];
        r.business_file=files[2];
    }

        return result;
};
//提交审核,审核成功、审核失败
async function aduitAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        const { park_supplier_id, audit_status } = doc;

        const result = await tb_park_supplier.findOne({
            where: {
                park_supplier_id
            }
        });

        if (result) {
            result.audit_status = audit_status;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//通过手机号查找是否已存在供应商用户
async function searchSupplierByPhone(phone,park_supplier_id) {
    let r = false;
    const result = await tb_park_supplier.findOne({
        where: {
            supplier_phone: phone,
            state:GLBConfig.ENABLE
        }
    });
    if(park_supplier_id){
        r = result ? result.park_supplier_id!=park_supplier_id : false;
    }else{
        r = result ? result.park_supplier_id!=park_supplier_id : false;
    }
    return r;
};
//通过邮箱查找是否已存在供应商用户
async function searchSupplierByMail(mail,park_supplier_id) {
    let r = false;
    const result = await tb_park_supplier.findOne({
        where: {
            supplier_mail: mail,
            state:GLBConfig.ENABLE
        }
    });
    if(park_supplier_id){
        r = result ? result.park_supplier_id!=park_supplier_id : false;
    }else{
        r = result ? result.park_supplier_id!=park_supplier_id : false;
    }
    return r;
};
//查询获取供应商
async function parkSearchAct(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { project_info_id } = body;
        let replacements = [];

        let queryStr = 'select t.* from tbl_erc_park_supplier t ' +
            ' where t.state = 1';//?
        queryStr += ' order by t.audit_status,t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;

            let files = await tb_uploadfile.findAll({
                where: {
                    api_name: common.getApiName(req.path),
                    srv_id: r.park_supplier_id,
                    // srv_type: '301',
                    state: GLBConfig.ENABLE
                },
                order: [
                    ['srv_type', 'ASC']
                  ]
            });
            r.id_file1=files[0];
            r.id_file2=files[1];
            r.business_file=files[2];
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//供应商我的信息
async function infoAct(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_supplier_id } = body;
        let replacements = [];

        let queryStr = 'select t.* from tbl_erc_park_supplier t ' +
            ' where t.state = 1 and t.park_supplier_id=?';//?
        queryStr += ' order by t.audit_status,t.created_at desc';
        replacements.push(park_supplier_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;

            let files = await tb_uploadfile.findAll({
                where: {
                    api_name: common.getApiName(req.path),
                    srv_id: r.park_supplier_id,
                    // srv_type: '301',
                    state: GLBConfig.ENABLE
                },
                order: [
                    ['srv_type', 'ASC']
                  ]
            });
            r.id_file1=files[0];
            r.id_file2=files[1];
            r.business_file=files[2];
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//发送验证码  TODO
async function sendCodeAct(req, res) {
    let doc = common.docTrim(req.body);
    if (doc.code_state == 1) {//手机验证码

    } else {//邮件验证码
        var code = "";
        while (code.length < 6) {
            code += Math.floor(Math.random() * 10);
        }
        var mailOption = {
            from: "931766029@qq.com",
            to: doc.recipient,//收件人
            subject: "供应商注册校验码",//纯文本
            html: "<h1>欢迎注册供应商账号，您本次的注册验证码为：" + code + "</h1>"
        };


        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                //                 res.send("1");
                common.sendError(res, error);
            } else {
                //                 req.session.yanzhengma=code;
                //                 res.send("2");
                let returnData = {};
                returnData.code = code;
                common.sendData(res, returnData);
            }
        })

    }

};

async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        //     let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        // fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function PurchasesList(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
        const { body, user } = req;
        const { purchase_id,purchase_type_id } = body;
        let replacements = [];

        let queryStr = 'select t.*,pt.purchase_type_name,cd.domain_name as purchase_company from tbl_park_purchase t ' +
            // ' left join tbl_erc_park_company pc on pc.domain_id=t.domain_id' +
            ' left join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' left join tbl_erc_purchasetype pt on pt.purchase_type_id=t.type_id'+
            ' where t.state = 1 and t.is_passed=2 and DATE_FORMAT(t.quotation_deadline,\'%Y%m%d\')>=DATE_FORMAT(NOW(),\'%Y%m%d\') and t.type_id=?';
            replacements.push(purchase_type_id);
        if(doc.queryparam){
            queryStr += ' and (t.purchase_projectname like ? or cd.domain_name like ? or t.purchase_details like?)';
            replacements.push('%' + doc.queryparam + '%');
            replacements.push('%' + doc.queryparam + '%');
            replacements.push('%' + doc.queryparam + '%');
        }
        queryStr += ' order by t.quotation_deadline desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.quotation_deadline = r.quotation_deadline ? r.quotation_deadline.Format('yyyy-MM-dd') : null;
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.purchaseFiles = await tb_uploadfile.findAll({
                where: {
                    api_name: {
                        $in:apiNames
                    },
                    srv_id: r.purchase_id,
                    srv_type: '401',
                    state: GLBConfig.ENABLE
                }
            });
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getPurchase(req, res) {
    try {
        let returnData = {};
        let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
        const { body, user } = req;
        const { purchase_id } = body;
        let replacements = [];

        let queryStr = 'select t.* from tbl_park_purchase t ' +
            ' where t.state = 1 and t.purchase_id=?';
        queryStr += ' order by t.created_at desc';
        replacements.push(purchase_id);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.quotation_deadline = r.quotation_deadline ? r.quotation_deadline.Format('yyyy-MM-dd') : null;
            
            r.purchaseFiles = await tb_uploadfile.findAll({
                where: {
                    api_name: {
                        $in: apiNames
                    },
                    srv_id: r.purchase_id,
                    srv_type: '401',
                    state: GLBConfig.ENABLE
                }
            });
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};