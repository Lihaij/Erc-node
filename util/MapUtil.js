/**
 * Created by Szane on 17/7/13.
 */
/** 地图相关接口 **/

const http = require('http');
const GaoDeKey = `4d210102c8884faf71f43eff1ffd55c2`;
const GaoDeHost = `restapi.amap.com`;
const logger = require('./Logger').createLogger('MapUtil.js');


exports.getGeoByAddress = (address)=> {
    return new Promise(function (resolve, reject) {
        let options = {
            hostname: GaoDeHost,
            port: 80,
            path: encodeURI(`/v3/geocode/geo?key=${GaoDeKey}&address=${address}`),
            method: 'GET'
        };
        let req = http.request(options, (res) => {
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
};