const fs = require('fs');
const path = require('path');
const common = require('../../util/CommonUtil.js');
const logger = require('../../util/Logger').createLogger('UserBL.js');
const config = require('../../config');
const GLBConfig = require('../../util/GLBConfig');
const model = require('../../model');

const sequelize = model.sequelize;
const tb_common_domain = model.common_domain;
const tb_common_apidomain = model.common_apidomain;

exports.getDomainList = async (req) => {
    try {
        let user = req.user
        let api_name = common.getApiName(req.path)
        let dlist = []
        dlist.push(user.domain_id)

        let result = await tb_common_apidomain.findAll({
            where: {
                api_name: api_name,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        for(let r of result) {
          dlist.push(r.follow_domain_id)
        }

        return dlist
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

exports.getDomainListStr = async (req) => {
    try {
        let user = req.user
        let api_name = common.getApiName(req.path)
        let dlist = []
        dlist.push(user.domain_id)

        let result = await tb_common_apidomain.findAll({
            where: {
                api_name: api_name,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        for(let r of result) {
          dlist.push(r.follow_domain_id)
        }

        return ' in (' + dlist.join(",") + ')'
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

exports.getDomainListInit = async (req, returnData) => {
    try {
        let user = req.user
        let api_name = common.getApiName(req.path)
        returnData.domain_list = []
        returnData.domain_list.push({
            id: user.domain_id,
            text: user.domain_name
        })

        let queryStr = `select *, b.domain_id bdomain_id from tbl_common_apidomain a, tbl_common_domain b
                        where a.follow_domain_id = b.domain_id
                        and a.state = '1'
                        and a.api_name = ?
                        and a.domain_id = ?
                        `;
        let replacements = [api_name, user.domain_id];

        let result = await common.simpleSelect(sequelize, queryStr, replacements);

        for(let r of result) {
          returnData.domain_list.push({
              id: r.bdomain_id,
              text: r.domain_name
          })
        }
        returnData.statusInfo = GLBConfig.STATUSINFO
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
