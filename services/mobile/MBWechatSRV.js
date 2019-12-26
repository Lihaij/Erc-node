/**
 * Created by BaiBin on 2018/3/20.
 */

const https = require('https');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBWechatSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');
const ERCCmsSRV = require('../erc/cms/ERCCmsSRV');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const point = require('../erc/baseconfig/ERCPointControlSRV');





const tb_decorateinfo = model.erc_decorateinfo;
const tb_uploadfile = model.erc_uploadfile;
const tb_usercollection = model.erc_usercollection;
const tb_inquiry = model.erc_inquiry;
const tb_user = model.common_user;
const tb_userGroup = model.common_usergroup;
const tb_customer = model.erc_customer;

const rp = require('request-promise');



const sequelize = model.sequelize;

//微信小程序
const appid = 'wx7fabb95db3af3f32'
const secret = '23556585c75455b68624253090f4993b'

//极光推送
const appKey = 'dbbd84ea648f5e367fdfdc24'
const masterSecret = '7aa30eff307e56f32e45091b'
const JPush = require("jpush-sdk")
const client = JPush.buildClient(appKey, masterSecret);

exports.WechatResource = (req, res) => {
    let method = req.query.method;
    if (method === 'get_show') {
        getShowAct(req, res)
    } else if (method === 'get_openid') {
        getOpenIdAct(req, res)
    } else if (method === 'get_collection') {
        getCollectionAct(req, res)
    } else if (method === 'add_collection') {
        addCollectionAct(req, res);
    } else if (method === 'rm_collection') {
        rmCollectionAct(req, res);
    } else if (method === 'submit_style_test') {
        submitStyleTest(req, res);
    } else if (method === 'get_phone') {
        getPhoneAct(req, res);
    } else if (method === 'get_user') {
        getUserAct(req, res);
    } else if (method === 'get_qr') {
        getQRAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let getShowAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body)
        let decorates = await tb_decorateinfo.findAll({
           where: {
               decorate_type: {
                   $in:['1','2']
               },
               state: GLBConfig.ENABLE
           }
        });
        let returnData = []
        for (let d of decorates) {
            let files = await tb_uploadfile.findAll({
                where: {
                    srv_id: d.decorate_id,
                    api_name: 'ERCSMALLPROGRAMCONTROL',
                    state: GLBConfig.ENABLE
                }
            });
            //erc用户1 微信用户2
            let collection;
            if (doc.type === '1') {
                collection = await tb_usercollection.findOne({
                    where: {
                        user_id: doc.user_id,
                        decorate_id: d.decorate_id,
                        state: GLBConfig.ENABLE
                    }
                });
            } else if (doc.type === '2') {
                collection = await tb_usercollection.findOne({
                    where: {
                        open_id: doc.open_id,
                        decorate_id: d.decorate_id,
                        state: GLBConfig.ENABLE
                    }

                });
            }

            let result = JSON.parse(JSON.stringify(d));
            let bannerArr = [];
            let desImgArr = [];
            for (let file of files) {
                if (file.srv_type === '2') {
                    bannerArr.push(file)
                } else if (file.srv_type === '3'){
                    desImgArr.push(file)
                }
            }
            //is_collection=0 未收藏 1 收藏
            result.is_collection = '0'
            if (collection) {
                result.is_collection = '1'
            }
            result.bannerArr = bannerArr;
            result.desImgArr = desImgArr;
            returnData.push(result);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let getOpenIdAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body)

        let returnData = await getOpenId(doc.code)
        if (returnData.session_key){
            returnData.session_key = ''
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

function getOpenId(code) {
    let wxHost = 'api.weixin.qq.com';

    return new Promise(function (resolve, reject) {
        let options = {
            hostname: wxHost,
            path: encodeURI(`/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`),
            method: 'GET',
        };

        let req = https.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                let resJson = JSON.parse(chunk);
                resolve(resJson);
            });
            res.on('end', () => {
            });
        });
        req.on('error', function (e) {
            logger.error(e.message);
            reject(e);
        });
        req.end();
    });
}

async function getCollectionAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let collection = [];
        if (doc.type === '1') {
            collection = await tb_usercollection.findAll({
                where: {
                    user_id: doc.user_id,
                    state: 1
                }
            });
        } else if (doc.type === '2') {
            collection = await tb_usercollection.findAll({
                where: {
                    open_id: doc.open_id,
                    state: 1
                }
            });
        } else {
            return common.sendError(res, 'collecton_01');
        }


        let returnData = []
        for (let c of collection) {
            logger.info('decorate_id: ', c.decorate_id)
            let packages =  await ERCCmsSRV.getCmsContentById(c.decorate_id)
            if (packages.length > 0) {
                returnData.push(packages[0])
            }
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addCollectionAct(req, res) {
    try {
        let doc = common.docTrim(req.body)//erc用户传1 微信用户2
        let addrow = null;
        if (doc.type === '1') {
            let collection = await tb_usercollection.findOne({
                where: {
                    user_id: doc.user_id,
                    decorate_id: doc.decorate_id
                }
            });
            if (collection) {
                if (collection.state === '0'){
                    collection.state = '1';
                    await collection.save();
                    addrow = collection;
                } else {
                    return common.sendError(res, 'collecton_02');
                }
            } else {
                addrow = await tb_usercollection.create({
                    user_id: doc.user_id,
                    decorate_id: doc.decorate_id
                });
            }
        } else if (doc.type === '2') {

            let collection = await tb_usercollection.findOne({
                where: {
                    open_id: doc.open_id,
                    decorate_id: doc.decorate_id
                }
            });
            if (collection) {
                if (collection.state === 0){
                    collection.state = 1;
                    await collection.save();
                    addrow = collection;
                } else {
                    return common.sendError(res, 'collecton_02');
                }
            } else {
                addrow = await tb_usercollection.create({
                    open_id: doc.open_id,
                    decorate_id: doc.decorate_id
                });
            }
        } else {
            return common.sendError(res, 'collecton_01');
        }
        let retData = JSON.parse(JSON.stringify(addrow));
        common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function rmCollectionAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let addrow = null;
        if (doc.type === '1') {
            let collection = await tb_usercollection.findOne({
                where: {
                    user_id: doc.user_id,
                    decorate_id: doc.decorate_id,
                    state: 1
                }

            });
            if (collection) {
                collection.state = '0'
                await collection.save();
                addrow = collection;
            }
        } else if (doc.type === '2') {
            let collection = await tb_usercollection.findOne({
                where: {
                    open_id: doc.open_id,
                    decorate_id: doc.decorate_id,
                    state: 1
                }
            });
            if (collection) {
                collection.state = '0'
                await collection.save();
                addrow = collection;
            }
        } else {
            return common.sendError(res, 'collecton_01');
        }
        let retData = JSON.parse(JSON.stringify(addrow));
        common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function submitStyleTest(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let inquiryList = await tb_inquiry.findAll({
            where: {
                phone: doc.phone,
                domain_id: 0
            }
        });
        let isSameDate = false;
        for (let i of inquiryList) {
            let interval = i.created_at - new Date();
            logger.info('style test interval');
            logger.info(Math.floor(interval/(24*3600*1000)));
            if (Math.floor(interval/(24*3600*1000)) >= -1){
                isSameDate = true;
                break;
            }
        }
        if (isSameDate) {
            return  common.sendError(res, 'styleTest_01');
        }
        let addInquiry = await tb_inquiry.create({
            phone: doc.phone,
            domain_id: 0,
            house_type: doc.house_type,
            area_code: doc.area_code,
            remark: doc.remark
        });
        let retData = JSON.parse(JSON.stringify(addInquiry));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getPhoneAct(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const data = await getOpenId(doc.code)
        console.log(`***${data.session_key}***`)
        console.log(`***${doc.encryptedData}***`)
        console.log(`***${doc.iv}***`)

        let sessionKey = new Buffer(data.session_key, 'base64')
        let encryptedData = new Buffer(doc.encryptedData, 'base64')
        let iv = new Buffer(doc.iv, 'base64')

        let  decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true)
        let  decoded = decipher.update(encryptedData, 'binary', 'utf8')
        decoded += decipher.final('utf8')
        decoded = JSON.parse(decoded)
        const phone = decoded.phoneNumber;

        // return;
        //
        // const key = CryptoJS.enc.Base64.parse(data.session_key);
        // const iv = CryptoJS.enc.Base64.parse(doc.iv);
        //
        // let encryptedHexStr = CryptoJS.enc.Base64.parse(doc.encryptedData);
        // let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        // let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        // let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        //
        // //把手机号添加到用户表里
        // const decryptedJson = eval('(' + decryptedStr + ')');
        // const phone = decryptedJson.phoneNumber;


        if (!phone) {
            return common.sendError(res, 'wechat_01');
        }
        if (!doc.domain_id) {
            return common.sendError(res, 'wechat_02');
        }



        let usergroup = await tb_userGroup.findOne({
            where: {
                usergroup_type: GLBConfig.TYPE_CUSTOMER
            }
        });

        if (!usergroup) {
            common.sendError(res, 'customer_01')
            return
        }

        let adduser = await tb_user.findOne({
            where: {
                username: phone
            }
        });

        if (!adduser) {
            adduser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: doc.domain_id,
                usergroup_id: usergroup.usergroup_id,
                username: phone,
                phone: phone,
                password: common.generateRandomAlphaNum(6),
                user_type: usergroup.usergroup_type
            });

            let customer = await tb_customer.create({
                user_id: adduser.user_id,
                customer_level: 1,
                customer_type: 1,
                customer_source:"3",
                salesperson_id: doc.salesperson_id,
            });
            //注册用户增加积分
            let pointResult = await point.updateUserPoint(adduser.user_id, 1, 1, '','');
        } else {
            adduser.domain_id = doc.domain_id
            await adduser.save();
        }

        //发送推送给导购pad
        pushNotification(`${doc.salesperson_id}PAD`, phone);
        common.sendData(res, phone);
    } catch (error) {
        common.sendFault(res, error);
    }
}


async function getUserAct(req, res) {
    try {
        const doc = common.docTrim(req.body);

        if (!doc.phone) {
            return common.sendError(res, 'wechat_01');
        }
        if (!doc.domain_id) {
            return common.sendError(res, 'wechat_02');
        }

        let adduser = await tb_user.findOne({
            where: {
                username: doc.phone
            }
        });

        if (adduser) {
            adduser.domain_id = doc.domain_id
            await adduser.save();
        }

        //发送推送给导购pad
        pushNotification(`${doc.salesperson_id}PAD`, doc.phone);
        let retData = JSON.parse(JSON.stringify(adduser));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

function pushNotification(alias, phone) {
    client.push().setPlatform(JPush.ALL)
        .setAudience(JPush.alias(alias))
        .setMessage(phone, null, null, null)
        .send(function(err, res) {
            if (err) {
                console.log(err.message)
            } else {
                console.log('Sendno: ' + res.sendno)
                console.log('Msg_id: ' + res.msg_id)
            }
        });
}

async function getQRAct(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const user = req.user
        let options = {
            method: 'GET',
            uri: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
        };
        let data = await rp(options)
        data = JSON.parse(data)

        let getQr = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${data.access_token}`,
            body: {
                scene: doc.scene,
                page: doc.page
            },
            json: true,
            encoding: null
        };
        let qrData = await rp(getQr)
        const base64 = qrData.toString('base64');

        common.sendData(res, base64);
    } catch (error) {
        common.sendFault(res, error);
    }
}


