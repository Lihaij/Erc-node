//供应商登录
const common = require('../../../util/CommonUtil.js');
const logger = require('../../../util/Logger').createLogger('ERCSupplierLoginControl');
const model = require('../../../model');
const Security = require('../../../util/Security');
const Sequence = require('../../../util/Sequence');
const config = require('../../../config');
const GLBConfig = require('../../../util/GLBConfig');
const RedisClient = require('../../../util/RedisClient');
const sms = require('../../../util/SMSUtil.js');
// table
const sequelize = model.sequelize;
// const tb_common_api = model.common_api;
// const tb_common_domain = model.common_domain;
// const tb_common_user = model.common_user;
// const tb_common_domainmenu = model.common_domainmenu;
// const tb_common_usergroup = model.common_usergroup;
const tb_park_supplier = model.erc_park_supplier;

exports.SupplierLoginResource = async (req, res) => {
      let doc = common.docTrim(req.body);
      if (!('suppliername' in doc)) {
            return common.sendError(res, 'auth_02');
      }
      if (!('identifyCode' in doc)) {
            return common.sendError(res, 'auth_03');
      }
      if (!('magicNo' in doc)) {
            return common.sendError(res, 'auth_04');
      }
      if (!('loginType' in doc)) {
            return common.sendError(res, 'auth_19');
      }
      if (doc.loginType != 'WEB' && doc.loginType != 'MOBILE') {
            return common.sendError(res, 'auth_19');
      }

      try {
            let userQueryStr ='',replacement;
            let myreg=/^[1-9][0-9]{10}$/;
            if(myreg.test(doc.suppliername)){
                  userQueryStr = 'select * from tbl_erc_park_supplier t where t.supplier_phone = ? and t.state = ?';
                  replacement=doc.suppliername;
            }else{
                  userQueryStr = 'select * from tbl_erc_park_supplier t where t.supplier_phone = ? and t.state = ?';
                  replacement=doc.suppliername;
            }
            
            const [supplier] = await common.simpleSelect(sequelize, userQueryStr, [replacement, GLBConfig.ENABLE]);
            if (!supplier) {
                  return common.sendError(res, 'auth_05');
            }

            let decrypted = Security.aesDecryptModeCFB(doc.identifyCode, supplier.supplier_pwd, doc.magicNo)
            console.log('供应商',decrypted);
            if (decrypted !== supplier.supplier_phone&&decrypted !== supplier.supplier_mail) {
            // if (!supplier) {
                  return common.sendError(res, 'auth_05');
            } else {
                  let session_token = Security.supppliertoken(doc.loginType, supplier, doc.identifyCode, doc.magicNo)
                  res.append('authorization', session_token);
                  let loginData = await loginInit(supplier, session_token, doc.loginType);

                  if (loginData) {
                        loginData.authorization = session_token;
                        return common.sendData(res, loginData);
                  } else {
                        return common.sendError(res, 'auth_05');
                  }
            }
      } catch (error) {
            logger.error(error);
            common.sendFault(res, error);
            return
      }
};
async function loginInit(user, session_token, type) {
      try {
          let returnData = {};
          returnData.user=user;
          console.log('ttttttt');
          return returnData;
      } catch (error) {
            logger.error(error);
            return null
      }
};
