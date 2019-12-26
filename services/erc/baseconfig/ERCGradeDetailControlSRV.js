const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_grade = model.erc_grade;
const tb_gradedetail = model.erc_gradedetail;
const tb_uploadfile = model.erc_uploadfile;
const tb_department = model.erc_department;

exports.ERCGradeDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    } else if (method === 'stat') {
        statAct(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
};

async function initAct(req, res) {
    try {
        let returnData = {};

        let user = req.user;

        let gradeSetSql = 'select tbl_erc_grade.*, tbl_erc_department.department_name' +
            ' from tbl_erc_grade' +
            ' inner join tbl_erc_department on tbl_erc_department.department_id = tbl_erc_grade.department_id' +
            ' where tbl_erc_grade.state = 1 and tbl_erc_grade.domain_id = ' + user.domain_id;
        let gradeSet = await common.simpleSelect(sequelize, gradeSetSql);

        let departmentSql = 'select t.department_id as id,t.department_name as text from tbl_erc_department t ' +
            'where state=1 and t.domain_id = ' + user.domain_id ;

        let department = await sequelize.query(departmentSql, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        returnData.gradeSet = gradeSet;
        returnData.department = department;

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [];

        let queryStr = 'select g.grade_number, g.grade_name, g.info, g.score, d.department_name, gd.gradedetail_id, gd.point, gd.advice, u.name as user_name, gd.created_at' +
            ' from tbl_erc_gradedetail gd' +
            ' inner join tbl_erc_grade g on g.grade_id = gd.grade_id' +
            ' inner join tbl_erc_department d on d.department_id = g.department_id' +
            ' inner join tbl_common_user u on u.user_id = gd.user_id' +
            ' where gd.state = 1 and gd.domain_id = ?';
        replacements.push(user.domain_id);

        if (doc.department_id) {
            queryStr += ' and g.department_id = ?';
            replacements.push(doc.department_id);
        }
        if (doc.start_date) {
            queryStr += ' and date_format(gd.created_at,"%Y-%m-%d") >= ?';
            replacements.push(doc.start_date);
        }
        if (doc.end_date) {
            queryStr += ' and date_format(gd.created_at, "%Y-%m-%d") <= ?';
            replacements.push(doc.end_date);
        }
        if (doc.search_type) {
            queryStr += ' and gd.user_id = ?';
            replacements.push(user.user_id);
        }
        queryStr += ' order by gd.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        for (let r of result.data) {
            r.created_at = r.created_at.Format('yyyy-MM-dd');

            r.files = await tb_uploadfile.findAll({
                where: {
                    srv_id: r.gradedetail_id,
                    state: GLBConfig.ENABLE,
                    srv_type: '204'
                }
            })
        }

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

        if (!doc.grade_id) {
            return common.sendError(res, 'grade_01');
        }
        if (!doc.point) {
            return common.sendError(res, 'grade_02');
        }

        let gradeDetail = await tb_gradedetail.create({
            domain_id: user.domain_id,
            user_id: user.user_id,
            grade_id: doc.grade_id,
            point: doc.point,
            advice: doc.advice
        });

        if (doc.file_ids) {
            let arr = doc.file_ids.split(',');
            tb_uploadfile.update({
                srv_id: gradeDetail.gradedetail_id,
                api_name: common.getApiName(req.path),
                user_id: user.user_id
            },{
                where: {
                    file_id: {
                        [sequelize.Op.in]: arr
                    }
                }
            })
        }

        return common.sendData(res, gradeDetail);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function uploadAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');

        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            file_name: fileInfo.name,
            file_url: fileUrl,
            file_type: fileInfo.type,
            file_visible: '1',
            state: GLBConfig.ENABLE,
            user_id: user.user_id,
            file_creator: user.name,
            srv_type: '204'
        });

        return common.sendData(res, {file_id: addFile.file_id});

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function statAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [];

        if (!doc.department_id) {
            return common.sendError(res, 'gradedetail_01');
        }
        if (!doc.year) {
            return common.sendError(res, 'gradedetail_02');
        }

        let department = await getDepartmentGroup(user, doc.department_id);

        let department_arr = [];
        for (let d of department) {
            department_arr.push('"'+d.department_id+'"');
        }

        let list = {};
        let result = {};
        if (department_arr) {
            let sql = 'select g.department_id, sum(gd.point) as point, date_format(gd.created_at,"%m") as `month` from tbl_erc_gradedetail gd inner join tbl_erc_grade g on g.grade_id = gd.grade_id where g.department_id in ('+department_arr.join()+') and date_format(gd.created_at, "%Y") = "'+doc.year+'" group by g.department_id, date_format(gd.created_at,"%m")'
            result = await common.simpleSelect(sequelize, sql, []);

            for (let r of result) {
                list[r.department_id + '_' + r.month] = r.point;
            }
        }

        for (let p of department) {
            let total = 0;
            for (let i = 1; i < 13; i++) {
                let k = i < 10 ? '0' + i : i;
                let str = 'p.dataValues.point_' + i + '=0';
                eval(str);

                if (list[p.department_id + '_' +k]) {
                    let str = 'p.dataValues.point_' + i + '=' + list[p.department_id + '_' +k];
                    eval(str);
                    total += list[p.department_id + '_' +k];
                }

            }

            p.dataValues.point = total;
            p.dataValues.average = total > 0 ? parseFloat(total / 12).toFixed(2) : 0;
        }

        returnData.total = department.length;
        returnData.rows = department;

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getDepartmentGroup(user, department_id) {
    try {
        let returnData = [];

        let p_department = await tb_department.findOne({
            attributes: ['department_id', 'department_name'],
            where: {
                department_id: department_id,
            },
            order: [['p_department_id']]
        });

        returnData = returnData.concat(p_department);

        let groups = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                p_department_id: department_id,
                department_state: 1
            }
        });

        for (let g of groups) {
            let sub_group = await getDepartmentGroup(user, g.department_id);
            returnData = returnData.concat(sub_group);
        }

        return returnData;

    } catch (error) {
        console.log(error);
    }
}