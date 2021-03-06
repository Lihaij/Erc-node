//报价管理-供应商报价
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
const tb_park_quotation = model.park_quotation;//园区报价
const tb_uploadfile = model.erc_uploadfile;//附件文件表

// ERC报价改查接口
exports.ERCParkQuotateControlResource = (req, res) => {
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
    } else if (method === 'getQuotationByPurchaseID') {//获取某条采购的所有报价
        getQuotationByPurchaseID(req, res)
    } else if (method === 'search_t') {//查询企业发布采购及所有报价
        parkSearchAct(req, res)
    } else if (method === 'supplier_quote') {//查询登录供应商参与的报价
        supplier_quote(req, res)
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
            ENABLEL: GLBConfig.ENABLE,
        };

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加报价
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let p_quotation =await tb_park_quotation.findOne({
            where:{
                purchase_id: doc.purchase_id,
                park_supplier_id:user.user_id
            }
        });
        if(p_quotation){
            p_quotation.qutation_date=doc.qutation_date,//报价日期
            p_quotation.quoted_price=doc.quoted_price,//报价
            p_quotation.quoted_detail=doc.quoted_detail,//报价说明
            p_quotation.quoted_contact=doc.quoted_contact,//报价联系人
            p_quotation.quoted_phone=doc.quoted_phone,//报价联系人手机
            await p_quotation.save();
            //修改的话要增加原先没有的，删除被删掉的。
            let removequotateFiles = await removeFile(req, p_quotation.park_quotation_id,res);
            let uploadquotateFiles = await saveFile(p_quotation.park_quotation_id, doc.quotateFiles,req);
            return common.sendData(res, p_quotation);
        }

        let park_quotation = await tb_park_quotation.create({
            domain_id: user.domain_id,
            park_supplier_id:user.user_id,//即供应商ID
            purchase_id:doc.purchase_id,//采购需求表ID，对应的采购需求
            qutation_date:doc.qutation_date,//报价日期
            quoted_price:doc.quoted_price,//报价
            quoted_detail:doc.quoted_detail,//报价说明
            quoted_contact:doc.quoted_contact,//报价联系人
            quoted_phone:doc.quoted_phone,//报价联系人手机
        });
        //增加扫描件
        let uploadquotateFiles = await saveFile(park_quotation.park_quotation_id, doc.quotateFiles,req);
        common.sendData(res, park_quotation);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改报价
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let park_quotation= await tb_park_quotation.findOne({
            where: {
                park_quotation_id: doc.park_quotation_id
            }
        });
        if (park_quotation) {
            // park_quotation.qutation_date=doc.qutation_date,//报价日期
            park_quotation.quoted_price=doc.quoted_price,//报价
            park_quotation.quoted_detail=doc.quoted_detail,//报价说明
            park_quotation.quoted_contact=doc.quoted_contact,//报价联系人
            park_quotation.quoted_phone=doc.quoted_phone,//报价联系人手机
            await park_quotation.save();
            //修改的话要增加原先没有的，删除被删掉的。
            let removequotateFiles = await removeFile(req, doc.park_quotation_id,res);
            let uploadquotateFiles = await saveFile(doc.park_quotation_id, doc.quotateFiles,req);
            common.sendData(res, park_quotation)
        } else {
            common.sendError(res, 'ERC_park_quotation_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除报价
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { park_quotation_id } = body;

        const result = await tb_park_quotation.findOne({
            where: {
                park_quotation_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            //删除附件
            let removequotateFiles = await removeFile(req, result.park_quotation_id,res);
            await result.save();
        }

        return common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取报价
async function getQuotationByPurchaseID(req, res) {
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
//获取某条采购的所有报价
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { park_quotation_id } = body;
    let replacements = [];
    let apiNames=[];
    apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
    apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));
    let queryStr = 'select t.qutation_date,t.quoted_price,quoted_detail,quoted_contact,quoted_phone,pp.*,pc.supplier_name,ccu.name as purchase_name from tbl_park_quotation t ' +
        ' left join tbl_park_purchase pp on pp.purchase_id=t.purchase_id'+
        ' left join tbl_common_user ccu on ccu.user_id=pp.purchase_approver'+
        ' left join tbl_erc_park_supplier pc on pc.park_supplier_id=t.park_supplier_id'+
        ' where t.state = 1 and t.purchase_id=?';
    queryStr += ' order by t.created_at desc';
    // replacements.push(user.domain_id);
    replacements.push(doc.purchase_id);

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        r.quotation_deadline=r.quotation_deadline?r.quotation_deadline.Format('yyyy-MM-dd'):null;
        r.qutation_date=r.qutation_date?r.qutation_date.Format('yyyy-MM-dd'):null;

        r.quotateFiles = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.park_quotation_id,
                srv_type: '402',
                state: GLBConfig.ENABLE
            }
        });
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

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//查询获取企业发布采购的所有报价
async function parkSearchAct(req, res) {
    try {
        let returnData = {};
        let apiNames=[];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));

        const { body, user } = req;
        const { purchase_id } = body;
        let replacements = [];

        let queryStr = 'select t.qutation_date,t.quoted_price,quoted_detail,quoted_contact,quoted_phone,pp.*,pc.supplier_name,ccu.name as purchase_name from tbl_park_quotation t ' +
        ' left join tbl_park_purchase pp on pp.purchase_id=t.purchase_id'+
        ' left join tbl_common_user ccu on ccu.user_id=pp.purchase_approver'+
        ' left join tbl_erc_park_supplier pc on pc.park_supplier_id=t.park_supplier_id'+
        ' where t.state = 1 and pp.domain_id = ?';
        queryStr += ' order by t.created_at desc';
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.quotation_deadline=r.quotation_deadline?r.quotation_deadline.Format('yyyy-MM-dd'):null;
            r.qutation_date=r.qutation_date?r.qutation_date.Format('yyyy-MM-dd'):null;

            r.quotateFiles = await tb_uploadfile.findAll({
                where: {
                    api_name: common.getApiName(req.path),
                    srv_id: r.park_quotation_id,
                    srv_type: '402',
                    state: GLBConfig.ENABLE
                }
            });
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
//供应商报价
async function supplier_quote(req, res) {
    try {
        let returnData = {};
        let apiNames=[];
        apiNames.push(common.getApiName('/api/erc/parkmanage/ERCParkPurchaseControl'));
        apiNames.push(common.getApiName('/api/erc/parkmanage/ParkPurchaseControl'));

        const { body, user } = req;
        const { purchase_id } = body;
        let replacements = [];
        let queryStr = 'select t.park_quotation_id,t.qutation_date,t.quoted_price,t.quoted_detail,t.quoted_contact,t.quoted_phone,pp.*,' +
            'pc.supplier_name,pt.purchase_type_name,cd.domain_name as purchase_company,ccu.name as purchase_name from tbl_park_purchase pp ' +
        // ' left join tbl_erc_park_company cpc on cpc.domain_id=pp.domain_id'+
        ' left join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' left join tbl_erc_purchasetype pt on pt.purchase_type_id=pp.type_id'+
        ' left join tbl_common_user ccu on ccu.user_id=pp.purchase_approver'+
        ' left join tbl_park_quotation t on pp.purchase_id=t.purchase_id'+
        ' left join tbl_erc_park_supplier pc on pc.park_supplier_id=t.park_supplier_id and pc.park_supplier_id=?'+
        ' where pp.state = 1 and pp.purchase_id=? ';

    queryStr += ' order by t.created_at desc';
        replacements.push(user.user_id);
        replacements.push(purchase_id);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.quotation_deadline=r.quotation_deadline?r.quotation_deadline.Format('yyyy-MM-dd'):null;
            r.qutation_date=r.qutation_date?r.qutation_date.Format('yyyy-MM-dd'):null;

            r.quotateFiles = await tb_uploadfile.findAll({
                where: {
                    api_name: common.getApiName(req.path),
                    srv_id: r.park_quotation_id,
                    srv_type: '402',
                    state: GLBConfig.ENABLE
                }
            });
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
async function saveFile(project_contract_id, quotateFiles,req) {//增加附件、扫描件等文件
    let user = req.user;
    let returnData = {};
    if (quotateFiles && quotateFiles.length > 0) {
        for (let file of quotateFiles) {
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: file.file_name,
                file_url: file.file_url,
                file_type: file.file_type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                srv_id: project_contract_id,
                file_creator: user.name,
                srv_type: '402'//报价附件的扫描件代码
            })
        }
    }

};
//删除附件
let removeFile = async (req,park_quotation_id,res) => {
    try {
        let doc = common.docTrim(req.body);
        let fileIds=doc.remove_fileIds;
        let uploadquotateFiles = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: park_quotation_id,
                srv_type: '402',
                state: GLBConfig.ENABLE
            }
        });
        for (let file of uploadquotateFiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        logger.error('ERCQuotateControlResource-removeFile:' + error);
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
