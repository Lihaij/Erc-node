const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const TaskListControlSRV = require('./ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_certificate = model.erc_certificate;
const tb_certificateuse = model.erc_certificateuse;
const tb_common_user = model.common_user;

exports.ERCCertificateUseControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'revert') {
        revertAct(req, res);
    } else if (method === 'test') {
        test(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
    try {
        let returnData = {};

        returnData.certificateUseState = GLBConfig.CERTIFICATEUSESTATE;
        returnData.certificateUseRevertState = GLBConfig.CERTIFICATEUSEREVERTSTATE;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

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
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let certificateuse_id = await save(user, doc, false);
        let returnData = await getData(req, res, true, {certificateuse_id: certificateuse_id});

        let groupID = common.getUUIDByTime(30);
        let description = user.name + '申请外借证照' + returnData.certificate_name;
        await TaskListControlSRV.createTask(user, '证照外借审核', '205','', returnData.certificateuse_id, description, '', groupID);

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function save(user, doc, is_update) {
    let certificateUse = {};
    let data = {};

    data.domain_id = user.domain_id;
    data.user_id = user.user_id;
    data.certificate_id = doc.certificate_id;
    data.use_reason = doc.use_reason;
    data.revert_date = doc.revert_date;
    data.certificateuse_state = 1;

    if (is_update == false) {
        certificateUse = await tb_certificateuse.create(data);
        return certificateUse.certificateuse_id;
    } else {
        await tb_certificateuse.update(data,{
            where: {
                certificateuse_id: doc.certificateuse_id
            }});

        return doc.certificateuse_id;
    }

}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let certificateUse = await tb_certificateuse.findOne({
            where: {
                domain_id: user.domain_id,
                certificateuse_id: doc.certificateuse_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!certificateUse) {
            return common.sendError(res, 'certificateuse_01');
        }

        certificateUse.state = GLBConfig.DISABLE;
        await certificateUse.save();

        return common.sendData(res, certificateUse);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

//归位
async function revertAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let certificateUse = await tb_certificateuse.findOne({
            where: {
                certificateuse_id: doc.certificateuse_id,
                state: GLBConfig.ENABLE
            }
        });

        let certificate = await tb_certificate.findOne({
            where: {
                certificate_id: certificateUse.certificate_id,
                state: GLBConfig.ENABLE
            }
        });

        if (certificateUse.revert_state != 1) {
            return common.sendError(res, 'certificateuse_02');
        }
        if (certificate.certificate_state != 2) {
            return common.sendError(res, 'certificateuse_03');
        }
        certificateUse.revert_state = 2;
        await certificateUse.save();

        let groupdID = common.getUUIDByTime(30);
        let description = user.name + '申请归还证照' + certificate.certificate_name;
        await TaskListControlSRV.createTask(user, '证照归还审核', '206', certificate.keeper, certificateUse.certificateuse_id, description, '', groupdID);

        return common.sendData(res, certificateUse);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyUseState(applyState, description, certificateuse_id, applyApprover) {
    try {
        let certificateUse = await tb_certificateuse.findOne({
            where: {
                certificateuse_id: certificateuse_id
            }
        });
        if (certificateUse) {
            await tb_certificateuse.update({
                certificateuse_state: applyState,
                checker_id: applyApprover,
                check_date: new Date(),
                refuse_remark: description
            }, {
                where: {
                    certificateuse_id: certificateuse_id
                }
            })

            if (applyState == 2) {
                await tb_certificate.update({
                    certificate_state: 2
                }, {
                    where: {
                        certificate_id: certificateUse.certificate_id
                    }
                })
                await tb_certificateuse.update({
                    revert_state: 1
                }, {
                    where: {
                        certificateuse_id: certificateuse_id
                    }
                })
            }
        }


    } catch (error) {
        throw error;
    }
}

async function revertComplete(req, res, certificateuse_id) {
    try {
        let certificateUse = await tb_certificateuse.findOne({
            where: {
                certificateuse_id: certificateuse_id
            }
        });
        if (certificateUse.revert_state == 2) {
            certificateUse.revert_state = 3;
            certificateUse.revert_date_actual = new Date();
            certificateUse.save();

            await tb_certificate.update({
                certificate_state: 1
            },{
                where: {
                    certificate_id: certificateUse.certificate_id
                }
            })

        }
    } catch (error) {
        throw error;
    }
}

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select cu.*, c.certificate_number, c.certificate_name, u.name as user_name, checker.name as checker_name' +
        ' from tbl_erc_certificateuse cu' +
        ' inner join tbl_erc_certificate c on c.certificate_id = cu.certificate_id' +
        ' inner join tbl_common_user u on u.user_id = cu.user_id' +
        ' left join tbl_common_user checker on checker.user_id = cu.checker_id' +
        ' where cu.state = 1 and cu.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.certificateuse_id) {
        queryStr += ' and cu.certificateuse_id = ?';
        replacements.push(doc.certificateuse_id);
    }
    if (doc.search_type == 1) {
        queryStr += ' and cu.user_id = ?';
        replacements.push(user.user_id);
    }
    if (doc.search_text) {
        queryStr += ' and (c.certificate_number like ? or c.certificate_name like ?)';
        replacements.push('%' + doc.search_text + '%');
        replacements.push('%' + doc.search_text + '%');
    }
    queryStr += ' order by cu.created_at desc';
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

    for (let r of result.data) {
        r.revert_date = r.revert_date ? r.revert_date.Format('yyyy-MM-dd') : null;
        r.revert_date_actual = r.revert_date_actual ? r.revert_date_actual.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }

}

exports.modifyUseState = modifyUseState;
exports.revertComplete = revertComplete;
