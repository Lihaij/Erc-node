/**
 * Created by shuang.liu on 18/4/24.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDocumentNoticeControlSRV');
const model = require('../../../model');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_user = model.user;
const tb_docuserstate = model.erc_docuserstate;
const tb_document = model.erc_document;
const tb_docdetailquestion = model.erc_docdetailquestion;
const tb_docdetail = model.erc_docdetail;
const tb_docuser = model.erc_docuser;
const tb_uploadfile = model.erc_uploadfile;
const tb_docdetailsubmitquestion = model.erc_docdetailsubmitquestion;

//行政办公管理->文件通知接口
exports.ERCDocumentNoticeControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_doc') {
        searchDocAct(req, res)
    } else if (method === 'delete_doc') {
        deleteDocAct(req, res)
    } else if (method === 'search_detail') {
        searchDetailAct(req, res)
    } else if (method === 'submit_nb') {
        submitNBAct(req, res)
    } else if (method === 'search_q') {
        searchQuestionAct(req, res)
    } else if (method === 'submit_q') {
        submitQuestionAct(req, res)
    } else if (method === 'search_d') {
        searchDetailTopAct(req, res)
    } else if (method === 'modify_q') {
        modifyQuestionAct(req, res)
    } else if (method === 'submit_sq') {
        submitSomeQuestionAct(req, res)
    } else if (method === 'search_files') {
        searchFilesAct(req, res);
    } else if (method === 'search_ofiles') {
        searchOutFilesAct(req, res);
    } else if (method === 'submit_soq') {
        submitSomeOutQuestionAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        returnData.stateType = GLBConfig.NOTICESTATE;//通知状态
        returnData.answerType = GLBConfig.NOTICEANSWER;//答案类型：A、B、C、D
        returnData.userInfo = req.user;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询文件通知列表
async function searchDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[];
        //document_type：1:内部文件 2：外部文件
        replacements.push(doc.document_type);
        replacements.push(user.user_id);
        let queryStr='select t.*,st.read_state from tbl_erc_document t ' +
            'inner join tbl_erc_docuserstate st on t.document_id = st.document_id ' +
            'where t.state=1 and st.state=1 and t.document_type=? and st.user_id = ?';
        if (doc.search_text){
            queryStr += ' and (t.document_id like ? or t.document_title like ?) ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.read_state) {
            queryStr += ` and st.read_state = ? `;
            replacements.push(doc.read_state);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.document_date = r.document_date ? moment(r.document_date).format("YYYY-MM-DD") : null;
            result.document_check_date = r.document_check_date ? moment(r.document_check_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//删除文件通知列表
async function deleteDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modDoc = await tb_docuserstate.findOne({
            where: {
                document_id: doc.document_id,
                user_id:user.user_id
            }
        });
        if(modDoc.read_state == 1) {
            if (modDoc) {
                modDoc.state = GLBConfig.DISABLE;
                await modDoc.save();

                common.sendData(res, modDoc);
            } else {
                common.sendError(res, 'document_01');
                return
            }
        } else {
            common.sendError(res, 'docquestion_03');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查询文件通知详情
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.user_id];
        replacements.push(doc.document_id);
        let queryStr='select t.*,ut.read_state from tbl_erc_docdetail t ' +
            'inner join tbl_erc_docuser ut on (t.docdetail_id = ut.docdetail_id and ut.user_id=?)' +
            'where t.state=1 and t.document_id=?';

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            let queryStr1 = 'select GROUP_CONCAT(t.`name`) user_ids from tbl_common_user t where state=1 and FIND_IN_SET(t.user_id,?)';
            let userIdsArr = r.user_ids.split(",");
            let userIds="";
            for(let userId in userIdsArr){
                userIds+=userIdsArr[userId]+','
            }
            if(userIds!=""){
                userIds=userIds.substr(0,userIds.length-1)
            }
            let replacements1 =[userIds];

            let queryRst1 = await sequelize.query(queryStr1, {
                replacements: replacements1,
                type: sequelize.QueryTypes.SELECT,
                state: GLBConfig.ENABLE
            });
            if(queryRst1){
                result.user_ids = r.user_ids ? queryRst1[0].user_ids : null;
            }

            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function submitNBAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let queryStr1='select t.* from tbl_erc_docdetail t ' +
            'inner join tbl_erc_docuser ut on (t.docdetail_id = ut.docdetail_id and ut.user_id=?)' +
            'where t.state=1 and t.document_id=? and ut.read_state=0';
        let replacements1 =[user.user_id];
        replacements1.push(doc.document_id);

        let queryRst1 = await sequelize.query(queryStr1, {
            replacements: replacements1,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        if(queryRst1){
            common.sendError(res, 'docdetail_03');
            return
        }else {
            let modDoc = await tb_docuserstate.findOne({
                where: {
                    document_id: doc.document_id,
                    user_id:user.user_id
                }
            });
            if (modDoc) {
                modDoc.read_state = 1;
                await modDoc.save();

                common.sendData(res, modDoc);
            } else {
                common.sendError(res, 'document_01');
                return
            }
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查看试题详情
async function searchQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr='select t.docdetailquestion_id,t.document_id,t.docdetail_id,t.question_title,t.question_a,' +
            't.question_b,t.question_c,t.question_d,t.question_answer,ut.submit_question_answer from tbl_erc_docdetailquestion t ' +
            'inner join tbl_erc_docdetailsubmitquestion ut on (t.docdetailquestion_id = ut.docdetailquestion_id and ut.user_id=?)' +
            'where t.state=1 ';
        let replacements =[user.user_id];
        if(doc.docdetail_id){
            queryStr += ' and t.docdetail_id=?';
            replacements.push(doc.docdetail_id)
        }
        if(doc.document_id){
            queryStr += ' and t.document_id=?';
            replacements.push(doc.document_id)
        }

        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//提交问题答案
async function submitQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modDoc = await tb_docuserstate.findOne({
            where: {
                document_id: doc.document_id,
                user_id:user.user_id
            }
        });
        let docuser = await tb_docuser.findAll({
            where: {
                document_id: doc.document_id,
                user_id:user.user_id
            }
        });

        for (let d of docuser) {
            let dq= await tb_docuser.findOne({
                where: {
                    docuser_id: d.docuser_id
                }
            });
            if (dq.read_state != 1) {
                common.sendError(res, 'docquestion_05');
                return

            }
        }

        if (modDoc) {
            modDoc.read_state = 1;
            await modDoc.save();

            common.sendData(res, modDoc);
        } else {
            common.sendError(res, 'document_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查询文件条款
async function searchDetailTopAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let document = await tb_document.findOne({
            where: {
                document_id: doc.document_id
            }
        });

        let docuserstate = await tb_docuserstate.findOne({
            where: {
                document_id: doc.document_id,
                user_id: user.user_id
            }
        });

        let docdetail = await tb_docdetail.findOne({
            where: {
                document_id: doc.document_id
            }
        });

        let docuser= await tb_docuser.findOne({
            where: {
                document_id: doc.document_id,
                docdetail_id: doc.docdetail_id,
                user_id: doc.user_id
            }
        });

        returnData.document=document;
        returnData.docuserstate=docuserstate;
        returnData.docdetail=docdetail;
        returnData.docuser=docuser;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//修改问题答案
async function modifyQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let re= await tb_docuser.findOne({
            where: {
                document_id: doc.old.document_id,
                user_id: user.user_id
            }
        });
        let modQ= await tb_docdetailquestion.findOne({
            where: {
                docdetailquestion_id: doc.old.docdetailquestion_id
            }
        });

        let docdetailsubmitquestion= await tb_docdetailsubmitquestion.findOne({
            where: {
                docdetailquestion_id: modQ.docdetailquestion_id,
                user_id: user.user_id
            }
        });

        if(re.read_state != 1){
            if (docdetailsubmitquestion) {
                docdetailsubmitquestion.submit_question_answer = doc.new.submit_question_answer;
                await docdetailsubmitquestion.save();

                common.sendData(res);
            } else {
                common.sendError(res, 'docquestion_01');
                return
            }
        } else {
            common.sendError(res, 'meetingroom_03');
            return
        }


    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//提交试题
async function submitSomeQuestionAct(req, res) {
    try {
        const { body, user } = req;
        const { document_id, docdetail_id } = body;
        const { user_id } = user;

        const docDetailQuestion = await tb_docdetailquestion.findAll({
            where: {
                document_id,
                docdetail_id
            }
        });

        for (const questionItem of docDetailQuestion) {
            const dq = await tb_docdetailquestion.findOne({
                where: {
                    docdetailquestion_id: questionItem.docdetailquestion_id
                }
            });

            const docdetailsubmitquestion = await tb_docdetailsubmitquestion.findOne({
                where: {
                    docdetailquestion_id: dq.docdetailquestion_id,
                    user_id
                }
            });

            if (dq.question_answer !== docdetailsubmitquestion.submit_question_answer) {
                common.sendError(res, 'docquestion_02');
                return
            }
        }

        const docUser = await tb_docuser.findOne({
            where: {
                document_id,
                docdetail_id,
                user_id
            }
        });
        if (docUser){
            docUser.read_state = 1;
            await docUser.save();
        }

        common.sendData(res, docUser);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
}
//查询文件
async function searchFilesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let document = (doc.document_id).replace('NBWJ','');

        let queryStr = `select * from tbl_erc_document t where t.state=1 and t.document_id=?`;

        let replacements = [doc.document_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let resultData = {
            designs: []
        };
        // let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: 'ERCDOCUMENTMANAGEMENTCONTROL',
                    srv_id: document,
                    state: GLBConfig.ENABLE
                }
            })
            if (ufs.length !=0) {
                for (let f of ufs) {
                    row.files.push(f)
                }
                resultData.designs.push(row)
            } else {
                // resultData.designs.push(row)
            }
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询外部文件
async function searchOutFilesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let document = (doc.document_id).replace('WBWJ','');

        let queryStr = `select * from tbl_erc_document t where t.state=1 and t.document_id=?`;

        let replacements = [doc.document_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let resultData = {
            designs: []
        };
        // let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: 'ERCDOCUMENTMANAGEMENTCONTROL',
                    srv_id: document,
                    state: GLBConfig.ENABLE
                }
            })
            if (ufs.length !=0) {
                for (let f of ufs) {
                    row.files.push(f)
                }
                resultData.designs.push(row)
            } else {
                // resultData.designs.push(row)
            }
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//提交外部文件
async function submitSomeOutQuestionAct(req, res) {
    try {
        const { body, user } = req;
        const { document_id } = body;
        const { user_id } = user;

        const docDetailQuestion = await tb_docdetailquestion.findAll({
            where: {
                document_id,
                docdetail_id: 0
            }
        });

        for (const questionItem of docDetailQuestion) {
            const dq = await tb_docdetailquestion.findOne({
                where: {
                    docdetailquestion_id: questionItem.docdetailquestion_id
                }
            });

            const docdetailsubmitquestion = await tb_docdetailsubmitquestion.findOne({
                where: {
                    docdetailquestion_id: dq.docdetailquestion_id,
                    user_id
                }
            });

            if (dq.question_answer !== docdetailsubmitquestion.submit_question_answer) {
                common.sendError(res, 'docquestion_02');
                return
            }
        }

        const docUser = await tb_docuser.findOne({
            where: {
                document_id,
                user_id
            }
        });
        if (docUser) {
            docUser.read_state = 1;
            await docUser.save();
        }

        const docuserstate = await tb_docuserstate.findOne({
            where: {
                document_id,
                user_id
            }
        });
        if (docuserstate){
            docuserstate.read_state = 1;
            await docuserstate.save();
        }

        common.sendData(res, docUser);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
}
