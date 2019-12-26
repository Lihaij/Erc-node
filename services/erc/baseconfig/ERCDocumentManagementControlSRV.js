/**
 * Created by shuang.liu on 18/4/23.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDocumentManagementControlSRV');
const model = require('../../../model');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_document = model.erc_document;
const tb_docdetail = model.erc_docdetail;
const tb_docdetailuser = model.erc_docdetailuser;
const tb_docdetailquestion = model.erc_docdetailquestion;
const tb_user = model.common_user;
const tb_docusergroup = model.erc_docusergroup;
const tb_docuser = model.erc_docuser;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_docuserstate = model.erc_docuserstate;
const tb_usergroup = model.common_usergroup;
const tb_uploadfile = model.erc_uploadfile;
const tb_docdetailsubmitquestion = model.erc_docdetailsubmitquestion;

//行政办公管理->文控管理接口
exports.ERCDocumentManagementControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_doc') {
        searchDocAct(req, res)
    } else if (method === 'add_doc') {
        addDocAct(req, res)
    } else if (method === 'modify_doc') {
        modifyDocAct(req, res)
    } else if (method === 'delete_doc') {
        deleteDocAct(req, res)
    } else if (method === 'search_detail') {
        searchDetailAct(req, res)
    } else if (method === 'add_detail') {
        addDetailAct(req, res)
    } else if (method === 'modify_detail') {
        modifyDetailAct(req, res)
    } else if (method === 'delete_detail') {
        deleteDetailAct(req, res)
    } else if (method === 'search_q') {
        searchQuestionAct(req, res)
    } else if (method === 'add_q') {
        addQuestionAct(req, res)
    } else if (method === 'modify_q') {
        modifyQuestionAct(req, res)
    } else if (method === 'delete_q') {
        deleteQuestionAct(req, res)
    } else if (method === 'search_d') {
        searchDetailTopAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'search_ug') {
        searchUserGroupAct(req, res)
    } else if (method === 'add_ug') {
        addUserGroupAct(req, res)
    } else if (method === 'delete_ug') {
        deleteUserGroupAct(req, res)
    } else if (method === 'submit') {
        submitAct(req, res)
    } else if (method === 'changeUser') {
        changeUserAct(req, res)
    } else if (method==='add_fi'){
        addFileAct(req,res)
    } else if (method === 'search_files') {
        searchFilesAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method==='add_ofi'){
        addOutFileAct(req,res)
    } else if (method === 'search_ofiles') {
        searchOutFilesAct(req, res);
    } else if (method === 'search_taskdetail') {
        searchTaskDetailAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        returnData.stateType = GLBConfig.STOCKORDERSTATE;//状态类型
        returnData.userInfo = req.user;
        returnData.noticeAnswer=GLBConfig.NOTICEANSWER;//答案类型：A、B、C、D
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询文件发布列表
async function searchDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];
        //document_type：1:内部文件 2：外部文件
        replacements.push(doc.document_type);
        let queryStr='select t.*,ut2.`name` as document_checker_name from tbl_erc_document t ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_common_user ut2 on t.document_checker_id = ut2.user_id ' +
            'where t.state=1 and t.domain_id=? and t.document_type=?';
        if (doc.search_text){
            queryStr += ' and (t.document_id like ? or ut.`name` like ?) ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.created_at != null) {
            queryStr += ` and t.created_at >= ? and t.created_at <= ? `;
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
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

//新增文件
async function addDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let document_id = await Sequence.getDocumentID();
        if(doc.document_type==1){
            document_id="NB"+document_id
        }else if(doc.document_type==2){
            document_id="WB"+document_id
        }
        let addDoc = await tb_document.create({
            document_id: document_id,
            domain_id: user.domain_id,
            user_id: user.user_id,
            document_type:doc.document_type,
            document_title: doc.document_title,
            document_unit:doc.document_unit,
            document_date: doc.document_date
        });
        common.sendData(res, addDoc)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

//修改文件
async function modifyDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modDoc = await tb_document.findOne({
            where: {
                document_id: doc.old.document_id
            }
        });
        if (modDoc) {
            if(modDoc.document_state==0||modDoc.document_state==2){
                modDoc.document_title = doc.new.document_title;
                modDoc.document_unit = doc.new.document_unit;
                modDoc.document_date = doc.new.document_date;

                await modDoc.save();

                modDoc.dataValues.created_at = modDoc.dataValues.created_at ? moment(modDoc.dataValues.created_at).format("YYYY-MM-DD") : null;
                modDoc.dataValues.document_date = modDoc.dataValues.document_date ? moment(modDoc.dataValues.document_date).format("YYYY-MM-DD") : null;
                modDoc.dataValues.document_check_date = modDoc.dataValues.document_check_date ? moment(modDoc.dataValues.document_check_date).format("YYYY-MM-DD") : null;

                common.sendData(res, modDoc);
            } else {
                common.sendError(res, 'meetingroom_03');
                return
            }

        } else {
            common.sendError(res, 'document_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//删除文件
async function deleteDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modDoc = await tb_document.findOne({
            where: {
                document_id: doc.document_id
            }
        });
        if (modDoc) {
            if(modDoc.document_state==0||modDoc.document_state==2){
                modDoc.state = GLBConfig.DISABLE;
                await modDoc.save();

                common.sendData(res, modDoc);
            } else {
                common.sendError(res, 'meetingroom_03');
                return
            }

        } else {
            common.sendError(res, 'document_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

//查询文件详情
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[doc.document_id];
        let queryStr='select t.* from tbl_erc_docdetail t ' +
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
            for(let i in userIdsArr){
                // userIds='"'+userIdsArr[i]+'",'
                userIds+=userIdsArr[i]+','
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

//增加文件详情中的文件信息
async function addDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let document = await tb_document.findOne({
            where: {
                document_id: doc.document_id,
                state: 1
            }
        });
        if (document) {
            const docDetail = await tb_docdetail.findOne({
                where: {
                    document_id: doc.document_id,
                    clause_no:doc.clause_no,
                    state: 1
                }
            });

            if (docDetail) {
                return common.sendError(res, 'docdetail_02');
            } else {
                const addDocDetail = await tb_docdetail.create({
                    document_id: doc.document_id,
                    clause_no:doc.clause_no,
                    clause_title: doc.clause_title,
                    user_ids: doc.user_ids
                });

                //保存责任人
                const userIdsArr = doc.user_ids.split(',');
                for (const user_id of userIdsArr) {
                    await tb_docdetailuser.create({
                        docdetail_id: addDocDetail.docdetail_id,
                        document_id: doc.document_id,
                        user_id
                    });
                }
                common.sendData(res, addDocDetail)
            }

        } else {
            common.sendError(res, 'document_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改文件详情的文件信息
async function modifyDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modDocDetail = await tb_docdetail.findOne({
            where: {
                docdetail_id: doc.old.docdetail_id
            }
        });
        let modDoc = await tb_document.findOne({
            where: {
                document_id: modDocDetail.document_id
            }
        });
        if(modDoc.document_state==0||modDoc.document_state==2){
            if (modDocDetail) {
                let docDetail = await tb_docdetail.findOne({
                    where: {
                        document_id: doc.old.document_id,
                        clause_no:doc.new.clause_no,
                        state: 1
                    }
                });
                if(docDetail && (doc.old.clause_no != doc.new.clause_no)){
                    common.sendError(res, 'docdetail_02');
                }else{
                    modDocDetail.clause_no = doc.new.clause_no;
                    modDocDetail.clause_title = doc.new.clause_title;
                    modDocDetail.user_ids = doc.new.user_ids;
                    await modDocDetail.save();

                    if(doc.new.user_ids && doc.old.user_ids != doc.new.user_ids){
                        //修改详情责任人表责任人信息(先删除再新增)
                        let userIdsArr = doc.new.user_ids.split(",");
                        let queryStr = 'delete from tbl_erc_docdetailuser where docdetail_id=?';
                        let replacements =[doc.old.docdetail_id];
                        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});
                        for (const user_id of userIdsArr) {
                            await tb_docdetailuser.create({
                                docdetail_id: doc.old.docdetail_id,
                                user_id
                            });
                        }

                        let queryStr1 = 'select GROUP_CONCAT(t.`name`) user_ids from tbl_common_user t where state=1 and FIND_IN_SET(t.user_id,?)';
                        let queryRst1 = await sequelize.query(queryStr1, {
                            replacements: [ doc.new.user_ids ],
                            type: sequelize.QueryTypes.SELECT,
                            state: GLBConfig.ENABLE
                        });
                        if(queryRst1){
                            modDocDetail.dataValues.user_ids = modDocDetail.dataValues.user_ids ? queryRst1[0].user_ids : null;
                        }

                    }

                    common.sendData(res, modDocDetail);
                }

            } else {
                common.sendError(res, 'docdetail_01');
            }
        } else {
            common.sendError(res, 'meetingroom_03');
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
//删除文件详情
async function deleteDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modDocDetail = await tb_docdetail.findOne({
            where: {
                docdetail_id: doc.docdetail_id
            }
        });
        let modDoc = await tb_document.findOne({
            where: {
                document_id: modDocDetail.document_id
            }
        });
        if(modDoc.document_state==0||modDoc.document_state==2){
            if (modDocDetail) {
                modDocDetail.state = GLBConfig.DISABLE;
                await modDocDetail.save();

                common.sendData(res, modDocDetail);
            } else {
                common.sendError(res, 'docdetail_01');
                return
            }
        } else {
            common.sendError(res, 'meetingroom_03');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

//查询试题详情列表
async function searchQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[];

        let queryStr='select t.* from tbl_erc_docdetailquestion t ' +
            'where t.state=1 ';
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
//增加试题详情
async function addQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        if ( doc.type == 1 ){
            let docDetail = await tb_docdetailuser.findAll({
                where: {
                    docdetail_id: doc.docdetail_id,
                    document_id: doc.document_id,
                    state: 1
                }
            });

            let addDoc = await tb_docdetailquestion.create({
                document_id: doc.document_id,
                docdetail_id: doc.docdetail_id,
                question_title:doc.question_title,
                question_a: doc.question_a,
                question_b: doc.question_b,
                question_c:doc.question_c,
                question_d: doc.question_d,
                question_answer: doc.question_answer
            });

            for (let u of docDetail) {
                let docdetailsubmitquestion = await tb_docdetailsubmitquestion.create({
                    document_id: doc.document_id,
                    docdetail_id: doc.docdetail_id,
                    docdetailquestion_id:addDoc.docdetailquestion_id,
                    user_id: u.user_id
                });
            }
            common.sendData(res, addDoc)
        } else {
            let docuser = await tb_docuser.findAll({
                where: {
                    document_id: doc.document_id,
                    state: 1
                }
            });
            if (docuser.length > 0) {
                let docdetailquestion = await tb_docdetailquestion.create({
                    document_id: doc.document_id,
                    docdetail_id: doc.docdetail_id,
                    question_title:doc.question_title,
                    question_a: doc.question_a,
                    question_b: doc.question_b,
                    question_c:doc.question_c,
                    question_d: doc.question_d,
                    question_answer: doc.question_answer
                });

                for (let u of docuser) {
                    let docdetailsubmitquestion = await tb_docdetailsubmitquestion.create({
                        document_id: doc.document_id,
                        docdetail_id: docdetailquestion.docdetail_id,
                        docdetailquestion_id:docdetailquestion.docdetailquestion_id,
                        user_id: u.user_id
                    });
                }
                common.sendData(res, docdetailquestion)
            } else {
                common.sendError(res, 'documenttask_03');
                return
            }

        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改试题详情
async function modifyQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modQ= await tb_docdetailquestion.findOne({
            where: {
                docdetailquestion_id: doc.old.docdetailquestion_id
            }
        });
        let modDoc= await tb_document.findOne({
            where: {
                document_id: modQ.document_id
            }
        });
        if(modDoc.document_state==0||modDoc.document_state==2){
            if (modQ) {
                modQ.question_title = doc.new.question_title;
                modQ.question_a = doc.new.question_a;
                modQ.question_b = doc.new.question_b;
                modQ.question_c = doc.new.question_c;
                modQ.question_d = doc.new.question_d;
                modQ.question_answer = doc.new.question_answer;

                await modQ.save();

                common.sendData(res, modQ);
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
//删除试题
async function deleteQuestionAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modQ = await tb_docdetailquestion.findOne({
            where: {
                docdetailquestion_id: doc.docdetailquestion_id
            }
        });
        let modDoc = await tb_document.findOne({
            where: {
                document_id: doc.document_id
            }
        });
        if(modDoc.document_state==0||modDoc.document_state==2){
            if (modQ) {
                modQ.state = GLBConfig.DISABLE;
                await modQ.save();

                common.sendData(res, modQ);
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
        return
    }
}
//查询文件条款
async function searchDetailTopAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let document = await tb_document.findOne({
            where: {
                document_id: doc.document_id
            }
        });

        common.sendData(res, document);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//选择对应部门岗位
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let idArray = []

        for (let i = 0; i < doc.users.length; i++) {
            idArray.push(doc.users[i].user_id)
        }

        let stockapplyitems = await tb_user.findAll({
            where: {
                user_id: {
                    $in: idArray
                },
                state: GLBConfig.ENABLE
            }
        });

        returnData.taskName=''
        returnData.userId=''
        for (let r of stockapplyitems) {
            returnData.taskName+=r.name+','
            returnData.userId+=r.user_id+','
        }

        returnData.taskName=(returnData.taskName.slice(returnData.taskName.length-1)==',')?returnData.taskName.slice(0,-1):returnData.taskName;
        returnData.userId=(returnData.userId.slice(returnData.userId.length-1)==',')?returnData.userId.slice(0,-1):returnData.userId;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//选择对应责任人
async function searchUserGroupAct(req, res) {
    try {
        const { body } = req;
        const { docdetail_id, document_id } = body;
        let returnData = {};
        let replacements =[];

        /*let queryStr='select t.docusergroup_id,ug1.usergroup_name as p_usergroup_name,ug2.usergroup_name as usergroup_name from tbl_erc_docusergroup t ' +
            'left join tbl_common_usergroup ug1 on (t.p_usergroup_id = ug1.usergroup_id and ug1.state=1) ' +
            'left join tbl_common_usergroup ug2 on (t.usergroup_id = ug2.usergroup_id and ug2.state=1) ' +
            'where t.state=1 ';*/

        let queryStr =
            `select
                dug.docusergroup_id, dpt.department_name, pst.position_name
                from tbl_erc_docusergroup dug
                left join tbl_erc_department dpt
                on dpt.department_id = dug.department_id
                left join tbl_erc_position pst
                on pst.position_id = dug.position_id
                where true`;

        if(docdetail_id){
            queryStr += ' and dug.docdetail_id=?';
            replacements.push(docdetail_id)
        }
        if(document_id){
            queryStr += ' and dug.document_id=?';
            replacements.push(document_id)
        }

        queryStr += ' order by dug.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//增加对应责任人
async function addUserGroupAct(req, res) {
    try {
        const { body } = req;
        const { document_id, docdetail_id, department_id, position_id } = body;
        let modUG = await tb_docusergroup.findOne({
            where: {
                document_id,
                department_id,
                position_id,
                state: 1
            }
        });
        if (modUG) {
            return common.sendError(res, 'documenttask_02');
        } else {
            let addDocUG = await tb_docusergroup.create({
                document_id,
                docdetail_id,
                department_id,
                position_id
            });

            // let queryStr = 'select t.* from tbl_common_user t where t.state=1 and t.usergroup_id= ?';
            const queryStr =
                `select
                    usr.user_id, usr.name
                    from tbl_common_user usr
                    left join tbl_erc_custorgstructure ctt
                    on usr.user_id = ctt.user_id
                    where true
                    and ctt.department_id = ?
                    and ctt.position_id = ?`;

            /*let queryRst = await sequelize.query(queryStr, {
                replacements: [department_id, position_id],
                type: sequelize.QueryTypes.SELECT,
                state: GLBConfig.ENABLE
            });*/
            const userResult = await common.simpleSelect(sequelize, queryStr, [department_id, position_id]);

            for (const { user_id } of userResult) {
                await tb_docuser.create({
                    document_id,
                    user_id,
                });
            }

            common.sendData(res, addDocUG)
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
//删除对应责任人
async function deleteUserGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modUG = await tb_docusergroup.findOne({
            where: {
                docusergroup_id: doc.docusergroup_id
            }
        });
        let modDoc = await tb_document.findOne({
            where: {
                document_id: modUG.document_id
            }
        });
        if(modDoc.document_state==0||modDoc.document_state==2){
            if (modUG) {
                modUG.state = GLBConfig.DISABLE;
                await modUG.save();

                let queryStr = 'delete from tbl_erc_docuser where usergroup_id=? and document_id=?';
                let replacements =[doc.docusergroup_id];
                replacements.push(modUG.document_id)
                let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

                common.sendData(res, modUG);
            } else {
                common.sendError(res, 'auth_10');
                return
            }
        } else {
            common.sendError(res, 'meetingroom_03');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//提交文控审批任务
async function submitAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'文控审批任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'documenttask_01');
        }else{
            if ( doc.type == 1){
                let alld = await tb_document.findOne({
                    where: {
                        document_id: doc.document_id,
                        state: 1
                    }
                });

                let allDetail = await tb_docdetail.findOne({
                    where: {
                        document_id: alld.document_id,
                        state: 1
                    }
                });
                let alldq = await tb_docdetailquestion.findAll({
                    where: {
                        // docdetail_id: allDetail.docdetail_id,
                        document_id: alld.document_id,
                        state: 1
                    }
                });

                if (alldq.length > 0 && allDetail != null) {
                    let taskName = '文控审批任务';
                    let taskDescription = doc.document_id + '  文控审批任务';
                    let groupId = common.getUUIDByTime(30);
                    // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                    let taskResult = await task.createTask(user,taskName,25,taskallotuser.user_id,doc.document_id,taskDescription,'',groupId);
                    if(!taskResult){
                        return common.sendError(res, 'task_01');
                    }else{
                        let document = await tb_document.findOne({
                            where: {
                                document_id: doc.document_id,
                                state: 1
                            }
                        });
                        if(document){
                            document.document_state=1;
                            await document.save()
                        }
                        common.sendData(res, document);
                    }
                } else {
                    return common.sendError(res, 'documenttask_04');
                }
            } else {
                let alld = await tb_document.findOne({
                    where: {
                        document_id: doc.document_id,
                        state: 1
                    }
                });

                let alldq = await tb_docdetailquestion.findAll({
                    where: {
                        docdetail_id: 0,
                        document_id: alld.document_id,
                        state: 1
                    }
                });

                if (alldq.length > 0) {
                    let taskName = '文控审批任务';
                    let taskDescription = doc.document_id + '  文控审批任务';
                    let groupId = common.getUUIDByTime(30);
                    // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                    let taskResult = await task.createTask(user,taskName,25,taskallotuser.user_id,doc.document_id,taskDescription,'',groupId);
                    if(!taskResult){
                        return common.sendError(res, 'task_01');
                    }else{
                        let document = await tb_document.findOne({
                            where: {
                                document_id: doc.document_id,
                                state: 1
                            }
                        });
                        if(document){
                            document.document_state=1;
                            await document.save()
                        }
                        common.sendData(res, document);
                    }
                } else {
                    return common.sendError(res, 'documenttask_04');
                }
            }
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//更换对应责任人
async function changeUserAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u =doc.users[0]
            let userGroup = await tb_usergroup.findOne({
                where: {
                    domain_id: user.domain_id,
                    usergroup_id: u.usergroup_id,
                    usergroup_type: u.usergroup_type,
                    node_type: u.node_type
                }
            });
            if(userGroup.parent_id == 0) {
                return common.sendError(res, 'user_05')
            } else {
                let group = await tb_usergroup.findOne({
                    where: {
                        domain_id: u.domain_id,
                        usergroup_id: userGroup.parent_id,
                        usergroup_type: GLBConfig.TYPE_OPERATOR,
                        node_type: GLBConfig.TYPE_ADMINISTRATOR
                    }
                });
                returnData.userGroupId=userGroup.usergroup_id;
                returnData.userGroupName=userGroup.usergroup_name;
                returnData.groupId=group.usergroup_id;
                returnData.groupName=group.usergroup_name;
            }
        } else {
            return common.sendError(res, 'user_06')
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//修改文件状态
async function modifyDocumentState(applyState,description,document_id,applyApprover){
    // let user = req.user;
    await tb_document.update({
        document_state:applyState,
        document_check_date:new Date(),
        document_checker_id:applyApprover,
        document_refuse_remark:description
    }, {
        where: {
            document_id:document_id
        }
    });

    if(applyState==3){
        //审核通过，发通知给相关人员
        let document = await tb_document.findOne({
            where: {
                document_id: document_id,
                state: 1
            }
        });
        let userArr;
        if(document.document_type==1){
            //内部文件
            //查询内部文件责任人
            let queryStr = 'select t.*,ut.usergroup_id from tbl_erc_docdetailuser t left join tbl_common_user ut on t.user_id= ut.user_id ' +
                'where t.state=1 and t.document_id= ?';
            let replacements =[document_id];
            userArr = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT,
                state: GLBConfig.ENABLE
            });
            for(let n in userArr){
                let adduser = await tb_docuser.create({
                    document_id: document_id,
                    docdetail_id: userArr[n].docdetail_id,
                    user_id: userArr[n].user_id,
                    usergroup_id: userArr[n].usergroup_id
                });
            }

        } else if(document.document_type==2){
            //外部文件
            let queryStr = 'select t.* from tbl_erc_docuser t where t.state=1 and t.document_id= ?';
            let replacements =[document_id];
            userArr = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT,
                state: GLBConfig.ENABLE
            });
        }

        //记录已添加userId，避免同一个document重复添加多个相同user
        let addUserStr="";
        for(let i in userArr){
            //保存文档总用户阅读状态表
            if(addUserStr.indexOf(userArr[i].user_id)==-1){
                addUserStr+=userArr[i].user_id+',';
                let adduserstate = await tb_docuserstate.create({
                    document_id: document_id,
                    user_id: userArr[i].user_id,
                    usergroup_id: userArr[i].usergroup_id
                });

                let taskName = '文件发布通知';
                let taskDescription = '文件发布通知：' +document.document_id+" "+ document.document_title;

                //发通知给文件相关人员
                let taskId1 = await Sequence.genTaskID(document.domain_id);
                let addT1 = await tb_task.create({
                    task_id: taskId1,
                    domain_id: document.domain_id,
                    task_name: '文件发布通知',
                    task_type: '26',
                    task_priority: '1',
                    task_publisher: document.user_id,
                    task_performer: userArr[i].user_id,
                    task_state: '1',
                    task_description: taskDescription,
                    task_review_code: document_id,
                    task_classify: 2
                });

                //给执行人发推送消息
                common.pushNotification('','您收到一条会议通知',{msgFlag: '1'},document_id);
            }
        }
    }
}
exports.modifyDocumentState = modifyDocumentState;
//增加文件
async function addFileAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let document = (doc.document_id).replace('NBWJ','');

        //附件
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            file_name: doc.file_name,
            file_url: doc.file_url,
            file_type: doc.file_type,
            file_visible: '1',
            state: GLBConfig.ENABLE,
            srv_id: document
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
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
        let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
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
//更新文件
async function uploadAct (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//上传附件
async function addOutFileAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let document = (doc.document_id).replace('WBWJ','');

        //附件
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            file_name: doc.file_name,
            file_url: doc.file_url,
            file_type: doc.file_type,
            file_visible: '1',
            state: GLBConfig.ENABLE,
            srv_id: document
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询附件
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
        let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
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
//查询任务详情
async function searchTaskDetailAct(req, res) {
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
