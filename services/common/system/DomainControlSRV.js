const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('GroupControlSRV');
const model = require('../../../model');
const mapUtil = require('../../../util/MapUtil.js');
const supplierSrv = require('../../erc/baseconfig/ERCSupplierControlSRV');
const ERCAccountingControlSRV = require('../../erc/cashiermanage/ERCAccountingControlSRV')

// tables
const sequelize = model.sequelize
const tb_common_domain = model.common_domain
const tb_common_domaintemplate = model.common_domaintemplate
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_common_templatemenu = model.common_templatemenu;
const tb_common_domainmenu = model.common_domainmenu;
const tb_common_systemmenu = model.common_systemmenu;
const tb_common_apidomain = model.common_apidomain;
const tb_businessdomain = model.erc_businessdomain;
const tb_usergroupmenu = model.common_usergroupmenu;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_basetypedetail = model.erc_basetypedetail;
const tb_taskallot = model.erc_taskallot
exports.DomainControlResource = (req, res) => {
  let method = req.query.method
  if (method === 'init') {
    initAct(req, res);
  } else if (method === 'search') {
    searchAct(req, res)
  } else if (method === 'add') {
    addAct(req, res)
  } else if (method === 'modify') {
    modifyAct(req, res)
  } else if (method === 'searchDomainMenu') {
    searchDomainMenuAct(req, res)
  } else if (method === 'addFolder') {
    addFolderAct(req, res)
  } else if (method === 'modifyFolder') {
    modifyFolderAct(req, res)
  } else if (method === 'deleteSelect') {
    deleteSelectAct(req, res)
  } else if (method === 'addMenus') {
    addMenusAct(req, res)
  } else if (method === 'changeOrder') {
    changeOrderAct(req, res)
  } else {
    common.sendError(res, 'common_01');
  }
};

async function initAct(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user,
      returnData = {
        tfInfo: GLBConfig.TFINFO
      };
    let templates = await tb_common_domaintemplate.findAll()
    let domain_name = await tb_common_domain.findAll()
    returnData.templateInfo = []
    returnData.updomainInfo = []
    for (let t of templates) {
      returnData.templateInfo.push({
        id: t.domaintemplate_id,
        text: t.domaintemplate_name
      });
    }
    for (let t of domain_name) {
      returnData.updomainInfo.push({
        id: t.domain_id,
        text: t.domain_name
      });
    }

    returnData.sysmenus = [{
      systemmenu_id: 0,
      name: '根目录',
      isParent: true,
      node_type: GLBConfig.MTYPE_ROOT,
      children: []
    }];
    returnData.sysmenus[0].children = JSON.parse(JSON.stringify(await genMenu('0')));

    const [admin, institution, ...otherType] = GLBConfig.DOMAINTYPE;
    returnData.domainTypeInfo = GLBConfig.DOMAINTYPE;
    returnData.companyTypeInfo = otherType;

    common.sendData(res, returnData)
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function genMenu(parentId) {
  let return_list = [];
  let menus = await tb_common_systemmenu.findAll({
    where: {
      parent_id: parentId
    },
    order: [
      ['created_at', 'DESC']
    ]
  });
  for (let m of menus) {
    let sub_menus = [];
    if (m.node_type === GLBConfig.MTYPE_ROOT) {
      sub_menus = await genMenu(m.systemmenu_id);
      return_list.push({
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        systemmenu_icon: m.systemmenu_icon,
        node_type: m.node_type,
        systemmenu_type: m.systemmenu_type,
        name: m.systemmenu_name,
        isParent: true,
        parent_id: m.parent_id,
        children: sub_menus
      });
    } else {
      return_list.push({
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        api_id: m.api_id,
        api_function: m.api_function,
        node_type: m.node_type,
        systemmenu_type: m.systemmenu_type,
        name: m.systemmenu_name + '->' + m.api_function,
        isParent: false,
        parent_id: m.parent_id,
      });
    }
  }
  return return_list;
}

async function searchAct(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user,
      returnData = {}

    let queryStr = `select * from tbl_common_domain where state = '1' `
    let replacements = []

    if (doc.search_text) {
      queryStr += ' and (domain like ? or domain_name like ? or domain_address like ?)'
      let search_text = '%' + doc.search_text + '%'
      replacements.push(search_text)
      replacements.push(search_text)
      replacements.push(search_text)
    }

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

    returnData.total = result.count
    returnData.rows = result.data

    common.sendData(res, returnData);
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function addAct(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user
    let domain_coordinate = '';
    let re = await mapUtil.getGeoByAddress(doc.domain_province + doc.domain_city + doc.domain_district + doc.domain_address);
    if (re && re.infocode === '10000' && re.geocodes && re.geocodes.length > 0)
      domain_coordinate = re.geocodes[0].location;
    else
      return common.sendError(res, 'geo_01');

    const queryData = [{
        domain: doc.domain
      },
      {
        domain_name: doc.domain_name
      }
    ];

    if (doc.domain_type === GLBConfig.DOMAINTYPE[2].id) {
      queryData.push({
        domain_type: doc.domain_type
      });
    }

    let domain = await tb_common_domain.findOne({
      where: {
        $or: queryData
      }
    });
    if (domain) {
      if (domain.domain_type === '2') {
        common.sendError(res, 'domain_03');
      } else {
        common.sendError(res, 'domain_01');
      }
    } else {
      let updomain_id = null;
      if (doc.updomain_id !== '') {
        updomain_id = doc.updomain_id
      }

      await common.transaction(async function (t) {

        domain = await tb_common_domain.create({
          domain: doc.domain,
          domain_type: doc.domain_type,
          domaintemplate_id: doc.domaintemplate_id,
          domain_name: doc.domain_name,
          domain_province: doc.domain_province,
          domain_city: doc.domain_city,
          domain_district: doc.domain_district,
          domain_address: doc.domain_address,
          domain_coordinate: domain_coordinate,
          domain_contact: doc.domain_contact,
          domain_phone: doc.domain_phone,
          domain_description: doc.domain_description,
          updomain_id: updomain_id
        }, {
          transaction: t
        });

        //创建会计科目详情
        await ERCAccountingControlSRV.addFinanceAccountingDetail(domain.domain_id, t);
        //添加会计科目对应总金额
        await ERCAccountingControlSRV.addAccounting(domain.domain_id, t);
        //添加会计科目无明细科目详情
        await ERCAccountingControlSRV.addNoDetailAccountingDetail(domain.domain_id, t);

        let businessdomain = await tb_businessdomain.create({
          domain: doc.domain,
          businesscustomer_type: doc.businesscustomer_type,
          businessregistration: doc.businessregistration,
          business_tax: 0
        }, {
          transaction: t
        });

        let usergroup = await tb_usergroup.create({
          domain_id: domain.domain_id,
          usergroup_name: 'administrator',
          usergroup_type: GLBConfig.TYPE_ADMINISTRATOR,
          node_type: GLBConfig.MTYPE_ROOT,
          parent_id: 0
        }, {
          transaction: t
        });

        let adduser = await tb_user.create({
          user_id: await Sequence.genUserID(),
          domain_id: domain.domain_id,
          usergroup_id: usergroup.usergroup_id,
          username: doc.domain + 'admin',
          name: 'admin',
          password: 'admin',
          user_type: GLBConfig.TYPE_ADMINISTRATOR
        }, {
          transaction: t
        });

        async function genDomainMenu(domaintemplate_id, parentId, cparentId) {
          let menus = await tb_common_templatemenu.findAll({
            where: {
              domaintemplate_id: domaintemplate_id,
              parent_id: parentId
            }
          });
          for (let m of menus) {
            let sub_menus = [];
            if (m.node_type === GLBConfig.MTYPE_ROOT) {
              let dm = await tb_common_domainmenu.create({
                domain_id: domain.domain_id,
                domainmenu_name: m.templatemenu_name,
                domainmenu_icon: m.templatemenu_icon,
                domainmenu_index: m.templatemenu_index,
                api_id: m.api_id,
                api_function: m.api_function,
                node_type: m.node_type,
                root_show_flag: m.root_show_flag,
                parent_id: cparentId
              }, {
                transaction: t
              })
              sub_menus = await genDomainMenu(domaintemplate_id, m.templatemenu_id, dm.domainmenu_id);
            } else {
              let dm = await tb_common_domainmenu.create({
                domain_id: domain.domain_id,
                domainmenu_name: m.templatemenu_name,
                domainmenu_icon: m.templatemenu_icon,
                domainmenu_index: m.templatemenu_index,
                api_id: m.api_id,
                api_function: m.api_function,
                node_type: m.node_type,
                parent_id: cparentId
              }, {
                transaction: t
              })
            }
          }
        }

        await genDomainMenu(doc.domaintemplate_id, '0', '0')

        if (domain.domain_type === '2') {
          await supplierSrv.addSupplier(domain.dataValues);
        }


        //增加机构，默认关注总公司的物料
        let Corporation = await tb_common_domain.findOne({
          where: {
            state: 1,
            domain_type: 2
          }
        });

        let apidomain = await tb_common_apidomain.create({
          api_name: 'ERCMATERIELCONTROL',
          domain_id: domain.domain_id,
          follow_domain_id: Corporation.domain_id,
          user_id: user.user_id,
          effect_state: 1
        }, {
          transaction: t
        })


        let taskallot = await tb_taskallot.findAll({
          where: {
            state: 1
          }
        })
        // 增加机构，默认增加两级工作流审核，均为上级岗位
        // for(let tl of taskallot){
        //     let addTaskallotuser0 = await tb_taskallotuser.create({
        //         taskallot_id:tl.taskallot_id,
        //         domain_id:domain.domain_id,
        //         taskallotuser_level:0,
        //         islastpost:1
        //     },{
        //         transaction: t
        //     })
        //     let addTaskallotuser1 = await tb_taskallotuser.create({
        //         taskallot_id:tl.taskallot_id,
        //         domain_id:domain.domain_id,
        //         taskallotuser_level:1,
        //         islastpost:1
        //     },{
        //         transaction: t
        //     })
        // }


        let insertArr = []
        //**************计量单位********************
        insertArr = ['个', '张', 'PCS', '吨', '千克', '克']
        await addBaseDetail('JLDW', insertArr, domain.domain_id)

        //**************货币类型********************
        insertArr = ['人民币', '美元', '欧元', '港币', '日元', '台币', '韩元']
        await addBaseDetail('HBLX', insertArr, domain.domain_id)

        //**************仓库分类********************
        insertArr = ['成品仓', '半成品仓', '原材料仓', '辅料仓', '废料仓']
        await addBaseDetail('CKFL', insertArr, domain.domain_id)

        //**************购入适用税率********************
        insertArr = ['16%', '13', '10%', '6%', '3%']
        await addBaseDetail('GRSYSL', insertArr, domain.domain_id)

        //**************销售适用税率********************
        insertArr = ['16%', '13', '10%', '6%', '3%']
        await addBaseDetail('XSSYSL', insertArr, domain.domain_id)

        //**************费用类科目明细项目********************
        insertArr = ['工资支出', '社保支出', '房租支出', '水费支出', '电费支出', '福利支出', '差旅费用', '接待费用', '物料消耗支出', '资产折旧', '资产摊销', '维修费']
        await addBaseDetail('FYLKMMXXM', insertArr, domain.domain_id)

      });




      common.sendData(res, domain);
    }
  } catch (error) {
    common.sendFault(res, error);
  }
}
async function addBaseDetail(code, insertArr, domain_id) {
  let result, queryStr, baseTypeId, baseTypeCode, replacements = []

  queryStr = `select * from tbl_erc_basetype where basetype_code=?`
  replacements.push(code)
  result = await sequelize.query(queryStr, {
    replacements: replacements,
    type: sequelize.QueryTypes.SELECT
  });
  baseTypeId = result[0].basetype_id
  baseTypeCode = result[0].basetype_code

  for (let i = 0; i < insertArr.length; i++) {
    let addDetail = await tb_basetypedetail.create({
      basetype_id: baseTypeId,
      domain_id: domain_id,
      typedetail_no: i,
      typedetail_code: baseTypeCode + ':' + insertArr[i],
      typedetail_name: insertArr[i]
    })
  }
}
async function modifyAct(req, res) {
  try {
    let doc = common.docTrim(req.body)
    let user = req.user
    let domain = await tb_common_domain.findOne({
      where: {
        domain_id: doc.old.domain_id
      }
    })
    if (domain) {
      domain.domain_name = doc.new.domain_name
      domain.domain_address = doc.new.domain_address
      domain.domain_contact = doc.new.domain_contact
      domain.domain_phone = doc.new.domain_phone
      domain.domain_description = doc.new.domain_description
      await domain.save()
      common.sendData(res, domain)
    } else {
      common.sendError(res, 'group_02')
      return
    }
  } catch (error) {
    common.sendFault(res, error)
  }
}

async function searchDomainMenuAct(req, res) {
  try {
    let doc = common.docTrim(req.body),
      user = req.user;

    let menus = [{
      domainmenu_id: 0,
      name: '根目录',
      isParent: true,
      node_type: GLBConfig.MTYPE_ROOT,
      children: []
    }];
    menus[0].children = JSON.parse(JSON.stringify(await genDomainMenu(doc.domain_id, '0')));

    common.sendData(res, menus);
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function genDomainMenu(domain_id, parentId) {
  let return_list = [];
  let menus = await tb_common_domainmenu.findAll({
    where: {
      domain_id: domain_id,
      parent_id: parentId
    },
    order: [
      ['domainmenu_index']
    ]
  });
  for (let m of menus) {
    let sub_menus = [];
    if (m.node_type === GLBConfig.MTYPE_ROOT) {
      sub_menus = await genDomainMenu(domain_id, m.domainmenu_id);
      return_list.push({
        domainmenu_id: m.domainmenu_id,
        domainmenu_name: m.domainmenu_name,
        domainmenu_icon: m.domainmenu_icon,
        node_type: m.node_type,
        name: m.domainmenu_name,
        isParent: true,
        parent_id: m.parent_id,
        root_show_flag: m.root_show_flag,
        children: sub_menus
      });
    } else {
      return_list.push({
        domainmenu_id: m.domainmenu_id,
        domainmenu_name: m.domainmenu_name,
        api_id: m.api_id,
        node_type: m.node_type,
        name: m.domainmenu_name,
        isParent: false,
        parent_id: m.parent_id,
      });
    }
  }
  return return_list;
}

async function addFolderAct(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    let nextIndex = await tb_common_domainmenu.max('domainmenu_index', {
      where: {
        parent_id: doc.parent_id
      }
    })
    if (!nextIndex) {
      nextIndex = 0
    } else {
      nextIndex += 1
    }

    let folder = await tb_common_domainmenu.create({
      domain_id: doc.domain_id,
      domainmenu_name: doc.domainmenu_name,
      domainmenu_icon: doc.domainmenu_icon,
      node_type: '00', //NODETYPEINFO
      parent_id: doc.parent_id,
      root_show_flag: doc.root_show_flag,
      domainmenu_index: nextIndex
    })

    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function modifyFolderAct(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    let folder = await tb_common_domainmenu.findOne({
      where: {
        domainmenu_id: doc.domainmenu_id
      }
    })

    if (folder) {
      folder.domainmenu_name = doc.domainmenu_name
      folder.domainmenu_icon = doc.domainmenu_icon
      folder.root_show_flag = doc.root_show_flag
      await folder.save()
    } else {
      return common.sendError(res, 'common_api_02');
    }

    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function deleteSelectAct(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    let tm = await tb_common_domainmenu.findOne({
      where: {
        domainmenu_id: doc.domainmenu_id
      }
    })
    if (tm) {
      if (doc.node_type === '00') {
        await folderDelete(tm.domainmenu_id)
      }
      await tm.destroy()
    }

    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function folderDelete(domainmenu_id) {
  let subM = await tb_common_domainmenu.findAll({
    where: {
      parent_id: domainmenu_id
    },
    order: [
      ['node_type'],
    ]
  })

  for (let sm of subM) {
    if (sm.node_type = '00') {
      await folderDelete(sm.domainmenu_id)
    }
    await sm.destroy()
  }
}

async function addMenusAct(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    let existM = await tb_common_domainmenu.findAll({
      where: {
        domain_id: doc.domain_id,
        parent_id: doc.parent_id
      }
    })

    let addMenus = []
    for (let m of doc.menus) {
      let addFlag = true
      for (let em of existM) {
        if (m.api_id === em.api_id) {
          addFlag = false
          break
        }
      }
      if (addFlag) {
        addMenus.push(m)
      }
    }

    let nextIndex = await tb_common_domainmenu.max('domainmenu_index', {
      where: {
        parent_id: doc.parent_id
      }
    })

    if (!nextIndex) {
      nextIndex = 0
    }

    for (let am of addMenus) {
      nextIndex += 1
      await tb_common_domainmenu.create({
        domain_id: doc.domain_id,
        domainmenu_name: am.systemmenu_name,
        api_id: am.api_id,
        api_function: am.api_function,
        node_type: '01', //NODETYPEINFO
        parent_id: doc.parent_id,
        domainmenu_index: nextIndex
      })
    }

    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
}

async function changeOrderAct(req, res) {
  try {
    let doc = common.docTrim(req.body);
    let user = req.user;

    for (let i = 0; i < doc.menus.length; i++) {
      let dmenu = await tb_common_domainmenu.findOne({
        where: {
          domainmenu_id: doc.menus[i].domainmenu_id
        }
      })
      dmenu.domainmenu_index = i
      await dmenu.save()
    }

    common.sendData(res);
  } catch (error) {
    common.sendFault(res, error);
  }
}