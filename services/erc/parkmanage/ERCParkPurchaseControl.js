//ErC采购管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCParksupplierControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_park_supplier = model.erc_park_supplier;//园区供应商
const tb_park_purchase = model.park_purchase;//园区采购
const tb_park_quotate = model.park_quotation;//园区报价
const tb_uploadfile = model.erc_uploadfile;//附件文件表
const tb_purchase_type = model.erc_purchasetype;

// ERC采购改查接口
exports.ERCParkPurchaseControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'add') {//新增
        addAct(req, res)
    } else if (method === 'upload') {//上传附件
        uploadAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {//修改
        modifyAct(req, res)
    } else if (method === 'search') {//获取当前企业发布的所有采购
        searchAct(req, res)
    } else if (method === 'setPassed') {//审核通过的采购
        setPassed(req, res)
    } else if (method === 'myPurchases') {//我的参与-获取参与的所有采购,不分ERC或非ERC
        myPurchase(req, res)
    } else if (method === 'getPurchasesByClassfly') {//通过采购分类查询采购，包括ERC和非ERC
        getPurchasesByClassfly(req, res)
    } else if (method === 'PurchasesList') {//供应商登陆页采购列表
        PurchasesList(req, res)
    } else if (method === 'quotate') {//本条采购的报价详情
        quotateAct(req, res)
    } else if (method === 'searchAllPurchase') {//供应商审核所有的采购
        searchAllPurchase(req, res)
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
            //采购类型：1.现货 2.标准品
            PURCHASE_TYPE: GLBConfig.PURCHASE_TYPE,
            ADUITSTATE: GLBConfig.ADUITSTATE,
            PURCHASE_CLASSIFY: []
        };
        let purchase_classifis = await tb_purchase_type.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let l of purchase_classifis) {
            returnData.PURCHASE_CLASSIFY.push({
                id: l.purchase_type_id,
                value: l.purchase_type_id,
                text: l.purchase_type_name
            });
        }

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加采购
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let park_purchase = await tb_park_purchase.create({
            domain_id: user.domain_id,
            purchase_approver: user.user_id,
            type_id:doc.type_id,
            purchase_type: doc.purchase_type,
            purchase_projectname: doc.purchase_projectname,
            company_name: doc.company_name,//企业名称
            purchaser: doc.purchaser,//联系人
            purchaser_phone: doc.purchaser_phone,//
            quotation_deadline: doc.quotation_deadline,//报价截止时间
            purchase_details: doc.purchase_details,
            purchase_rules: doc.purchase_rules,
            quotation_details: doc.quotation_details,
            //标记ERC或非ERC的采购？？字段
            // purchase_state:doc.purchase_state
        });
        //增加扫描件
        let uploadpurchaseFiles = await saveFile(park_purchase.purchase_id, doc.purchaseFiles, req);
        common.sendData(res, park_purchase);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//查询采购是否有报价，没有才能修改
async function quotateAct(req, res) {
    const { body, user } = req;
    const { park_quotation_id, purchase_id } = body;
    let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
    let returnData = {};
    let replacements = [];
    let queryStr = 'select t.park_quotation_id,t.qutation_date,t.quoted_price,quoted_detail,quoted_contact,quoted_phone,pp.*,pc.supplier_name,ccu.name as purchase_name from tbl_park_quotation t ' +
        ' left join tbl_park_purchase pp on pp.purchase_id=t.purchase_id' +
        ' left join tbl_common_user ccu on ccu.user_id=pp.purchase_approver' +
        ' left join tbl_erc_park_supplier pc on pc.park_supplier_id=t.park_supplier_id' +
        ' where t.state = 1 and t.purchase_id=?';
    queryStr += ' order by t.created_at desc';
    // replacements.push(user.domain_id);
    replacements.push(purchase_id);

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        r.quotation_deadline=r.quotation_deadline?r.quotation_deadline.Format('yyyy-MM-dd'):null;
        r.qutation_date = r.qutation_date ? r.qutation_date.Format('yyyy-MM-dd') : null;
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
        r.quotateFiles = await tb_uploadfile.findAll({
            where: {
                api_name: 'ERCPARKQUOTATEACTCONTROL',
                srv_id: r.park_quotation_id,
                srv_type: '402',
                state: GLBConfig.ENABLE
            }
        });
    }
    returnData.total = result.count;
    returnData.rows = result.data;
    common.sendData(res, returnData);
};
//审核采购
async function setPassed(req, res) {
    try {
        const { body, user } = req;
        const { is_passed, purchase_id } = body;
        let park_purchase = await tb_park_purchase.findOne({
            where: {
                purchase_id: purchase_id
            }
        });
        if (park_purchase) {
            park_purchase.is_passed=is_passed;
                await park_purchase.save();
            common.sendData(res, park_purchase)
        } else {
            common.sendError(res, 'ERC_park_purchase_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let purchaseFiles = [];
        if (doc.files && doc.files.length > 0) {
            for (let d of doc.files) {
                if (!d.file_id) {
                    files.push(d);
                }
            }
        }
        let park_purchase = await tb_park_purchase.findOne({
            where: {
                purchase_id: doc.purchase_id
            }
        });
        if (park_purchase) {
            park_purchase.type_id=doc.type_id,
            park_purchase.purchase_type = doc.purchase_type,
                park_purchase.purchase_projectname = doc.purchase_projectname,
                park_purchase.company_name = doc.company_name,//企业名称
                park_purchase.purchaser = doc.purchaser,//联系人
                park_purchase.purchaser_phone = doc.purchaser_phone,//
                park_purchase.quotation_deadline = doc.quotation_deadline,//报价截止时间
                park_purchase.purchase_details = doc.purchase_details,
                park_purchase.purchase_rules = doc.purchase_rules,
                park_purchase.quotation_details = doc.quotation_details,
                await park_purchase.save();
            //修改的话要增加原先没有的，删除被删掉的。
            let removepurchaseFiles = await removeFile(req, doc.purchase_id,res);
            let uploadpurchaseFiles = await saveFile(doc.purchase_id, doc.purchaseFiles, req);
            common.sendData(res, park_purchase)
        } else {
            common.sendError(res, 'ERC_park_purchase_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除采购
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { purchase_id } = body;

        const result = await tb_park_purchase.findOne({
            where: {
                purchase_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            //删除附件文件
            let removepurchaseFiles = await removeFile(req, result.purchase_id,res);
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取采购
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
//获取采购
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { purchase_id } = body;
    let replacements = [];

    let queryStr = 'select t.*,pt.purchase_type_name,cd.domain_name as purchase_company from tbl_park_purchase t ' +
    // ' left join tbl_erc_park_company pc on pc.domain_id=t.domain_id' +
    ' left join tbl_common_domain cd on cd.domain_id=t.domain_id'+
    ' inner join tbl_erc_purchasetype pt on pt.purchase_type_id=t.type_id' +
    ' where t.state = 1 and t.domain_id=?';
        
    queryStr += ' order by t.created_at desc';
    replacements.push(user.domain_id);

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        r.quotation_deadline = r.quotation_deadline ? r.quotation_deadline.Format('yyyy-MM-dd') : null;

        r.purchaseFiles = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.purchase_id,
                srv_type: '401',
                state: GLBConfig.ENABLE
            }
        });
        r.quotations = await tb_park_quotate.findAll({
            where: {
                purchase_id: r.purchase_id,
                state: GLBConfig.ENABLE
            }
        });
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//查询登录供应商参与的采购
async function myPurchase(req, res) {
    try {
        let returnData = {};
        let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
        const { body, user } = req;
        const { purchase_id } = body;
        let replacements = [];

        let queryStr = 'select t.*,p.park_quotation_id,p.qutation_date,p.quoted_price,p.quoted_detail,p.quoted_contact,p.quoted_phone,pt.purchase_type_name,cd.domain_name as purchase_company from tbl_park_purchase t ' +
            ' right join tbl_park_quotation p on t.purchase_id=p.purchase_id' +
            // ' left join tbl_erc_park_company pc on pc.domain_id=t.domain_id' +
            ' left join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' left join tbl_erc_purchasetype pt on pt.purchase_type_id=t.type_id'+
            ' where t.state=1 and p.state = 1 and t.is_passed=2 and p.state=1 and p.park_supplier_id=?';
        queryStr += ' order by t.created_at desc';
        replacements.push(user.user_id);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.quotation_deadline = r.quotation_deadline ? r.quotation_deadline.Format('yyyy-MM-dd') : null;
            r.qutation_date=r.qutation_date?r.qutation_date.Format('yyyy-MM-dd'):null;

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
//查询获取所有采购，不分ERC或非ERC
async function searchAllPurchase(req, res) {
    try {
        let returnData = {};
        let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
        const { body, user } = req;
        const { purchase_id } = body;
        let replacements = [];

        let queryStr = 'select t.*,pt.purchase_type_name,cd.domain_name as purchase_company from tbl_park_purchase t ' +
        // ' left join tbl_erc_park_company pc on pc.domain_id=t.domain_id' +
        ' left join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' left join tbl_erc_purchasetype pt on pt.purchase_type_id=t.type_id' +
        ' where t.state = 1';
        queryStr += ' order by t.is_passed,t.created_at desc';

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
//通过分类查询采购，不分ERC或非ERC
async function getPurchasesByClassfly(req, res) {
    try {
        let returnData = {};
        let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
        const { body, user } = req;
        const { purchase_id, purchase_type_id } = body;
        let replacements = [];

        let queryStr = 'select t.* from tbl_park_purchase t ' +
            ' where t.state = 1 and t.type_id=?';
        queryStr += ' order by t.created_at desc';
        replacements.push(purchase_type_id);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.quotation_deadline = r.quotation_deadline ? r.quotation_deadline.Format('yyyy-MM-dd') : null;

            r.quotateFiles = await tb_uploadfile.findAll({
                where: {
                    api_name: 'ERCPARKQUOTATEACTCONTROL',
                    srv_id: r.park_quotation_id,
                    srv_type: '402',
                    state: GLBConfig.ENABLE
                }
            });
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
async function PurchasesList(req, res) {
    try {
        let returnData = {};
        // let apiNames = [];
        // apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        // apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
        const { body, user } = req;
        const { purchase_id, purchase_type_id } = body;
        let replacements = [];

        let queryStr = 'select t.purchase_id,pt.purchase_type_name,t.purchase_projectname,t.quotation_deadline,cd.domain_name as purchase_company from tbl_park_purchase t ' +
            // ' left join tbl_erc_park_company pc on pc.domain_id=t.domain_id' +
            ' left join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' left join tbl_erc_purchasetype pt on pt.purchase_type_id=t.type_id' +
            ' where t.state = 1 and t.is_passed=2 and type_id=?';
        queryStr += ' order by t.created_at desc';
        replacements.push(purchase_type_id);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.quotation_deadlinequotation_deadline = r.quotation_deadline ? r.quotation_deadline.Format('yyyy-MM-dd') : null;
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function saveFile(project_contract_id, purchaseFiles, req) {//增加附件、扫描件等文件
    let user = req.user;
    let returnData = {};
    if (purchaseFiles && purchaseFiles.length > 0) {
        for (let file of purchaseFiles) {
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: file.name,
                file_url: file.url,
                file_type: file.type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                srv_id: project_contract_id,
                file_creator: user.name,
                srv_type: '401'//采购附件的扫描件代码
            })
        }
    }

};
//删除附件
let removeFile = async (req, purchase_id,res) => {
    try {
        let doc = common.docTrim(req.body);
        // let fileIds = doc.remove_fileIds;
        let apiNames = [];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
            let uploadpurchaseFiles = await tb_uploadfile.findAll({
                where: {
                        api_name: {
                            $in: apiNames
                        },
                        srv_id: purchase_id,
                        srv_type: '401',
                        state: GLBConfig.ENABLE
                }
            });
            for (let file of uploadpurchaseFiles) {
                file.state = GLBConfig.DISABLE
                await file.save();
            }

            common.sendData(res);

    } catch (error) {
        logger.error('ERCParkPurchaseControlResource-removeFile:' + error);
        common.sendFault(res, error);
        return
    }
};
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
}