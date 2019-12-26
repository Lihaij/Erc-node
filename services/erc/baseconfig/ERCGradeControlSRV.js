const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const validator = require('validator');

const sequelize = model.sequelize;
const tb_grade = model.erc_grade;
const tb_department = model.erc_department;
const XLSX = require('xlsx-style');

exports.ERCGradeControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'import') {
        importAct(req, res);
    } else if (method === 'upload') {
        upload(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'changeUse') {
        changeUse(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.GRADEISUSE = GLBConfig.GRADEISUSE;

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

        let checkGradeNumber = await tb_grade.findOne({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                grade_number: doc.grade_number
            }
        });

        if (checkGradeNumber) {
            return common.sendError(res, 'grade_03');
        }

        let grade_id = await save(req, res, doc, false);
        let returnData = await getData(req, res, true, {grade_id: grade_id});

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function save(req, res, doc, is_update) {
    try {
        let user = req.user;
        let grade = {};
        let data = {};
        let returnData = {};
        let grade_id = '';

        data.domain_id = user.domain_id;
        data.user_id = user.user_id;
        data.grade_number = doc.grade_number;
        data.grade_name = doc.grade_name;
        data.info = doc.info;
        data.score = doc.score;
        data.department_id = doc.department_id;

        if (is_update == false) {

            data.is_use = 1;

            grade = await tb_grade.create(data);
            grade_id = grade.grade_id;
        } else {
            await tb_grade.update(data, {
                where:{
                    grade_id: doc.grade_id
                }
            });
            grade_id = doc.grade_id
        }

        return grade_id;

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getData(req, res, is_single, doc) {
    try {
        let user = req.user;
        let replacements = [];

        let queryStr = 'select g.*, d.department_name' +
            ' from tbl_erc_grade g' +
            ' inner join tbl_erc_department d on d.department_id = g.department_id' +
            ' where g.state = 1 and g.domain_id = ?'

        replacements.push(user.domain_id);

        if (doc.grade_id) {
            queryStr += ' and g.grade_id = ?';
            replacements.push(doc.grade_id);
        }

        if (doc.search_source != 'web') {
            queryStr += ' and g.is_use = 1';
        }

        queryStr += ' order by g.department_id';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        if (is_single == true) {
            return result.data[0];
        } else {
            return result;
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body).new;
        let user = req.user;

        let check = await tb_grade.findOne({
            where: {
                domain_id: user.domain_id,
                grade_id: doc.grade_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let checkGradeNumber = await tb_grade.findOne({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                grade_number: doc.grade_number
            }
        });

        if (checkGradeNumber && checkGradeNumber.grade_id != doc.grade_id) {
            return common.sendData(res, 'grade_03');
        }

        let grade_id = await save(req, res, doc, true);
        let returnData = await getData(req, res, true, {grade_id: grade_id});

        return common.sendData(res, returnData)


    } catch (error) {
        return common.sendData(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let grade = await tb_grade.findOne({
            where: {
                domain_id: user.domain_id,
                grade_id: doc.grade_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!grade) {
            return common.sendError(res, 'common_api_02');
        }

        grade.state = GLBConfig.DISABLE;
        await grade.save();

        return common.sendData(res, grade);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function changeUse(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let grade = await tb_grade.findOne({
            where: {
                domain_id: user.domain_id,
                grade_id: doc.grade_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!grade) {
            return common.sendError(res, 'common_api_02');
        }

        if (grade.is_use == 1) {
            grade.is_use = 0;
        } else {
            grade.is_use = 1;
        }

        await grade.save();

        return common.sendData(res, grade);
    } catch (error) {
        return common.sendFault(res, error);
    }
}


async function importAct(req, res) {
    try {
        const { user, body } = req;
        const { domain_id } = user;

        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        let gradeNumberArray = [];
        let gradeNameArray = [];

        for (let i = 2; i <= excelJsonArray.length + 1; i++) {
            let grade_number = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const grade_name = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const info = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const score = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const department_name = worksheet['E'+i] ? worksheet['E'+i].v : null;

            if (!grade_number) {
                return common.sendError(res, '', `第${i}行，序号不允许为空`);
            } else if (!validator.isInt(`${grade_number}`)) {
                return common.sendError(res, '', `第${i}行，序号必须为整数`);
            }
            if (!grade_name) {
                return common.sendError(res, '', `第${i}行， 计分项目名称不允许为空`);
            }
            if (!score) {
                return common.sendError(res, '', `第${i}行，分值设置不能为空`);
            }
            if (!department_name) {
                return common.sendError(res, '', `第${i}行，适用部门不能为空`);
            }

            grade_number = parseInt(grade_number);

            let check_grade_number = await tb_grade.findOne({
                where: {
                    grade_number: grade_number,
                    state: GLBConfig.ENABLE,
                    domain_id: user.domain_id
                }
            });
            if (check_grade_number) {
                return common.sendError(res, '', `第${i}行，该序号已存在`);
            }

            let check_grade_name = await tb_grade.findOne({
                where: {
                    grade_name: grade_name,
                    state: GLBConfig.ENABLE,
                    domain_id: user.domain_id
                }
            });
            if (check_grade_name) {
                return common.sendError(res, '', `第${i}行，该计分项目名称已存在`);
            }

            let check_department_name = await tb_department.findOne({
                where: {
                    department_name: department_name,
                    state: GLBConfig.ENABLE,
                    domain_id: domain_id
                }
            });
            if (!check_department_name) {
                return common.sendError(res, '', `第${i}行，该部门不存在`);
            }


            gradeNumberArray.push(grade_number);
            gradeNameArray.push(grade_name);
        }

        const gradeNumberResult = common.isRepeat(gradeNumberArray);
        if (gradeNumberResult.isRepeat) {
            return common.sendError(res, '', `上传表格中，存在2个或以上序号为"${gradeNumberResult.repeatString}"的评分项目`);
        }
        const gradeNameResult = common.isRepeat(gradeNameArray);
        if (gradeNameResult.isRepeat) {
            return common.sendError(res, '', `上传表格中，存在2个或以上评分项目名称为"${gradeNameResult.repeatString}"的评分项目`);
        }

        await common.transaction(async function (t) {
            for (let i = 2; i <= excelJsonArray.length + 1; i++) {
                const grade_number = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const grade_name = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const info = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const score = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const department_name = worksheet['E'+i] ? worksheet['E'+i].v : null;

                const department = await tb_department.findOne({
                    where: {
                        department_name: department_name,
                        state: GLBConfig.ENABLE,
                        domain_id: domain_id
                    }
                });

                await tb_grade.create({
                    domain_id: domain_id,
                    user_id: user.user_id,
                    grade_number: grade_number,
                    grade_name: grade_name,
                    info: info,
                    score: score,
                    department_id: department.department_id
                }, {
                    transaction: t
                });
            }
        })

        return common.sendData(res, '导入成功');

    } catch (error) {
        return common.sendFault(res, error);
    }
}

//上传文件
async function upload(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {uploadurl: uploadurl})
    } catch (error) {
        common.sendFault(res, error);
    }
}

//去除首位空格
function trimJson(json) {
    if (Object.keys(json) && Object.keys(json).length > 0) {
        for (const key of Object.keys(json)) {
            let value = json[key];
            if (typeof value === 'object') {
                if (Object.keys(value) && Object.keys(value).length > 0){
                    for (const subKey of Object.keys(value)) {
                        value[subKey] = `${value[subKey]}`.replace(/(^\s*)|(\s*$)/g, "");
                    }
                }
            }
        }
    }
    return json;
}