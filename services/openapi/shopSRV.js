const fs = require('fs');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const Sequence = require('../../util/Sequence');
const logger = require('../../util/Logger').createLogger('ZoweeInterfaceSRV');
const model = require('../../model');
const rp = require('request-promise');

exports.ShopControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'login') {
        login(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let login = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let domain = doc.domain;
        let loginSrc = '';
        let bizSrc = '';
        var tenant = '';

        if (domain === '112.74.29.64' || domain === '120.24.215.85') {
            loginSrc = "http://60.205.227.44:18091/api/auth/tokens";
            bizSrc = "http://60.205.227.44:16669/api";
            tenant = 'erctest';
        } else if (domain === 'admin.erchouse.com') {
            loginSrc = "http://123.56.141.177:18091/api/auth/tokens";
            bizSrc = "http://123.56.141.177:16669/api";
            tenant = 'shop';
        }

        if(loginSrc){
            //登陆接口
            let options = {
                method: 'POST',
                uri: loginSrc + '',
                qs: {
                    "method": 'phonepassword',
                    "phone": '15898131992',
                    "password": '123456'
                },
                headers: {
                    'tenant': tenant,
                    "content-type": "application/json",
                }
            };
            let sync = await rp(options)
            sync = JSON.parse(sync)

            //获得biz信息
            let getBiz = {
                method: 'GET',
                uri: bizSrc + '/custs/' + sync.result.user.userId + '/biz',
                headers: {
                    'tenant': tenant,
                    "content-type": "application/json",
                    'auth-token': sync.result.accessToken
                }
            };
            let bizData = await rp(getBiz)
            bizData = JSON.parse(bizData)

            let params = {
                accessToken: sync.result.accessToken,
                userId: sync.result.user.userId,
                name: sync.result.user.name,
                city: sync.result.user.city,
                bizId: bizData.result.bizId,
                bizName: bizData.result.bizName
            }

            common.sendData(res, params);
            return
        }else {
            common.sendError(res, 'origin_01 : '+origin);
            return
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};
