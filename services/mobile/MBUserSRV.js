/**
 * Created by Szane on 17/6/23.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBOrderSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');
const sms = require('../../util/SMSUtil.js');

const sequelize = model.sequelize;
const tb_user = model.common_user;;
const tb_crew = model.erc_crew;
const tb_usergroup = model.common_usergroup;;
const tb_erc_usercollection = model.erc_usercollection;

exports.MBUserResource = (req, res) => {
    let method = req.query.method;
    if (method === 'search') {
        searchAct(req, res);
    } else if(method === 'search_assign_worker') {
        searchAssignWorker(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    }  else {
        common.sendError(res, 'common_01')
    }
};

let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let queryStr = ` select u.* from  tbl_common_user u
          where  u.state = ? `;
        let replacements = [GLBConfig.ENABLE];
        if (doc.user_id != null) {
            queryStr += ` and u.user_id = ? `;
            replacements.push(doc.user_id);
        }
        if (doc.type != null) {
            queryStr += ` and u.user_type = ? `;
            replacements.push(doc.type);
        }
        if (doc.domain_id != null) {
            queryStr += ` and u.domain_id = ? `;
            replacements.push(doc.domain_id);
        }
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        if (doc.type == GLBConfig.TYPE_WORKER) {
            for (let r of result) {
                r.foremans = await tb_crew.findAll({
                    where: {
                        worker_id: r.user_id,
                        state: GLBConfig.ENABLE
                    }
                });
            }
        }
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let searchAssignWorker = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let queryStr = ` select u.* from  tbl_common_user u
          left join tbl_erc_domainsignworker w on(u.user_id = w.user_id)
          where  w.state = ?  and w.domain_id = ?`;
        let replacements = [GLBConfig.ENABLE,doc.domainId];

        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let modifyAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let modUser = await tb_user.findOne({
            where: {user_id: doc.user_id, state: GLBConfig.ENABLE}
        });
        if (!modUser) {
            return common.sendError(res, 'operator_03');
        }
        if (doc.name) {
            modUser.name = doc.name;
        }
        if (doc.city) {
            modUser.city = doc.city;
        }
        if (doc.zipcode) {
            modUser.zipcode = doc.zipcode;
        }
        if (doc.avatar && doc.avatar != modUser.avatar) {
            let avatarUrl = await common.fileMove(doc.avatar, 'avatar');
            if (avatarUrl) {
                logger.debug(avatarUrl);
                modUser.avatar = avatarUrl;
            }
        }
        await modUser.save();
        let retData = JSON.parse(JSON.stringify(modUser));
        common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};


async function uploadAct(req, res) {
    try {
        let uploadUrl = await common.fileSave(req);
        common.sendData(res, {
            url: uploadUrl
        });
    } catch (error) {
        return common.sendFault(res, error);
    }
}

