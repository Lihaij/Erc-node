const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTaskAllotControl');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');

// tables
const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_customtaskallot = model.erc_customtaskallot;
const tb_domain = model.common_domain;
const tb_usergroup = model.common_usergroup;

exports.ERCTaskAllotControlResource = (req, res) => {
  let method = req.query.method
  if (method === 'init') {
    initAct(req, res);
  } else if (method === 'search_allot') {
    searchAllot(req, res)
  } else if (method === 'search_custome_allot') {
    searchCustomAllot(req, res)
  } else if (method === 'add_custome_allot') {
    addCustomAllot(req, res)
  } else if (method === 'delete_custome_allot') {
    deleteCustomAllot(req, res)
  } else if (method === 'search_t') {
    searchT(req, res)
  } else if (method === 'add') {
    addT(req, res)
  } else if (method === 'delete') {
    deleteAct(req, res)
  } else if (method === 'deleteLevel') {
    deleteLevelAct(req, res)
  } else {
    common.sendError(res, 'common_01');
  }
};

async function initAct(req, res) {
  try {
    let returnData = {};
    common.sendData(res, returnData);
  } catch (error) {
    common.sendError(res, error)
  }
}
//获取任务列表
async function searchAllot(req, res) {
  try {
    const { body } = req;
    const { taskallot_classify } = body;
    const returnData = {};

    /*let queryStr = `select * from tbl_erc_taskallot
        where taskallot_id in (2,4,7,9,10,11,14,16,17,22,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,
        43,45,46,50,51,52,53,54,55,56,57,58,60,61,62,63,64,65,66,67,68,80,81,82,83,84,85,86, 87,88,90,91,92,93)`;*/

    const queryStr = `select * from tbl_erc_taskallot where state = ? and taskallot_classify = ?`;
    const replacements = [ GLBConfig.ENABLE, taskallot_classify ];

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;

    common.sendData(res, returnData);
  } catch (error) {
    common.sendFault(res, error);
  }
};
//查询任务列表
async function searchCustomAllot(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user,
      returnData = {};

    let replacements = [user.domain_id];

    let queryStr = 'select * from tbl_erc_customtaskallot where taskallot_id="1" and domain_id=? and state="1"';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;

    common.sendData(res, returnData);
  } catch (error) {
    common.sendFault(res, error);
  }
};
//新增用户任务
async function addCustomAllot(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user

    let customtaskallot = await tb_customtaskallot.create({
      taskallot_id: '1',
      domain_id: user.domain_id,
      customtaskallot_name: doc.customtaskallot_name,
      customtaskallot_describe: doc.customtaskallot_describe
    });

    common.sendData(res, customtaskallot);
  } catch (error) {
    common.sendFault(res, error);
  }
};
//删除用户任务
async function deleteCustomAllot(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user,
      returnData = {};

    let deltask = await tb_customtaskallot.findOne({
      where: {
        customtaskallot_id: doc.customtaskallot_id
      }
    });

    if (deltask) {
      deltask.state = GLBConfig.DISABLE
      await deltask.save()
    }

    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
};

//查询任务审核人员
async function searchT(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user,
      returnData = {
        maxlevel: 0,
        data: []
      };

    let maxLev;
    if (doc.customtaskallot_id) {
      maxLev = await tb_taskallotuser.max('taskallotuser_level', {
        where: {
          taskallot_id: doc.taskallot_id,
          customtaskallot_id: doc.customtaskallot_id,
          domain_id: user.domain_id
        }
      })
    } else {
      maxLev = await tb_taskallotuser.max('taskallotuser_level', {
        where: {
          taskallot_id: doc.taskallot_id,
          domain_id: user.domain_id
        }
      })
    }

    if (maxLev || maxLev === 0) {
      returnData.maxlevel = maxLev
      let queryStr = 'select * from tbl_erc_taskallotuser t ' +
          'left join tbl_common_user u on (t.user_id = u.user_id and u.state=1) ' +
          'where t.domain_id = ? and t.taskallot_id = ? and t.taskallotuser_level = ?';
      if (doc.customtaskallot_id) {
        queryStr += ' and t.customtaskallot_id=?'
      }
      for (let i = 0; i < maxLev + 1; i++) {
        let replacements = []
        replacements.push(user.domain_id);
        replacements.push(doc.taskallot_id);
        replacements.push(i);
        if (doc.customtaskallot_id) {
          replacements.push(doc.customtaskallot_id);
        }
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        for(let r of result){
          if(r.islastpost == 1){
            r.name = '上级岗位'
            r.phone = ''
            r.position = ''
          }
        }
        returnData.data.push(result)
      }
    }

    if (returnData.data.length === 0) {
      returnData.data.push([])
    }

    common.sendData(res, returnData);
  } catch (error) {
    common.sendFault(res, error);
  }
};
//增加工作量审核人员
async function addT(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    if(doc.islastpost == 1){
        await tb_taskallotuser.create({
            taskallot_id: doc.taskallot_id,
            domain_id: user.domain_id,
            taskallotuser_level: doc.taskallotuser_level,
            islastpost: doc.islastpost
        });
    }else{
        for (let u of doc.users) {
            if (doc.customtaskallot_id) {
                await tb_taskallotuser.create({
                    user_id: u.user_id,
                    taskallot_id: doc.taskallot_id,
                    customtaskallot_id: doc.customtaskallot_id,
                    domain_id: user.domain_id,
                    taskallotuser_level: doc.taskallotuser_level
                });
            } else {
                await tb_taskallotuser.create({
                    user_id: u.user_id,
                    taskallot_id: doc.taskallot_id,
                    domain_id: user.domain_id,
                    taskallotuser_level: doc.taskallotuser_level
                });
            }
        }
    }
    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
};
//删除工作量审核人员
let deleteAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    let delTemp = await tb_taskallotuser.findOne({
      where: {
        taskallotuser_id: doc.taskallotuser_id
      }
    });

    if (delTemp) {
      await delTemp.destroy();

      return common.sendData(res);
    } else {
      return common.sendError(res, 'templateConstruction_01');

    }
  } catch (error) {
    return common.sendFault(res, error);
  }
};
//删除工作量层级
let deleteLevelAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    if(doc.customtaskallot_id){
      await tb_taskallotuser.destroy({
        where: {
          domain_id: user.domain_id,
          taskallot_id: doc.taskallot_id,
          customtaskallot_id: doc.customtaskallot_id,
          taskallotuser_level: doc.taskallotuser_level
        }
      })
    } else {
      await tb_taskallotuser.destroy({
        where: {
          domain_id: user.domain_id,
          taskallot_id: doc.taskallot_id,
          taskallotuser_level: doc.taskallotuser_level
        }
      })
    }


    let replacements = []
    replacements.push(user.domain_id);
    replacements.push(doc.taskallot_id);
    replacements.push(doc.taskallotuser_level);
    let queryStr = 'update tbl_erc_taskallotuser set taskallotuser_level = taskallotuser_level-1 where domain_id = ? and taskallot_id = ? and taskallotuser_level > ?';
    if(doc.customtaskallot_id){
      queryStr += ' and customtaskallot_id = ?'
      replacements.push(doc.customtaskallot_id);
    }
    await sequelize.query(queryStr, {
      replacements: replacements,
    })
    return common.sendData(res);
  } catch (error) {
    return common.sendFault(res, error);
  }
};
