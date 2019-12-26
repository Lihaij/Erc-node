/**
 * Created by Szane on 17/7/13.
 */

const fs = require('fs');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const Sequence = require('../../util/Sequence');
const logger = require('../../util/Logger').createLogger('MBGuestSRV');
const model = require('../../model');

const sequelize = model.sequelize;
const tb_domain = model.common_domain;
const INF = 0xffffff;

exports.MBGuestResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
    } else if (method === 'search') {
    } else if (method === 'search_d') {
        searchDomainAct(req, res)
    } else if (method === 'modify') {
    } else {
        common.sendError(res, 'common_01')
    }
};
async function searchDomainAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let domains = await tb_domain.findAll({
            where: {
                domain_type: '1',
                state: GLBConfig.ENABLE
            }
        });
        domains = JSON.parse(JSON.stringify(domains));
        let result = [];
        for (let d of domains) {
            d.value = await coordinateToMeter(doc.now_coordinate, d.domain_coordinate);
            if (doc.nearby == 1) {
                if (d.value <= 50)
                    result.push(d);
            }
            else result.push(d);
        }
        result = quickSort(result);
        common.sendData(res, result);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
let quickSort = function (arr) {
    if (arr.length <= 1) {
        return arr;
    }
    let pivotIndex = Math.floor(arr.length / 2);
    let pivot = arr.splice(pivotIndex, 1)[0];
    let left = [];
    let right = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].value <= pivot.value) {
            left.push(arr[i]);
        }
        else {
            right.push(arr[i]);
        }
    }
    if (pivot)
        return quickSort(left).concat([pivot], quickSort(right));
    else
        return quickSort(left).concat(quickSort(right));
};
/**
 * 将坐标转换为距离
 * @param start
 * @param end
 * @returns {number}
 */
let coordinateToMeter = function (start, end) {
    if (!start || !end || end == `` || start == ``)
        return INF;
    let startCd = start.split(`,`);
    let endCd = end.split(`,`);
    if (startCd.length != 2 || endCd.length != 2)
        return INF;
    let lat = [startCd[1], endCd[1]];
    let lng = [startCd[0], endCd[0]];
    const R = 6378137;//地球赤道半径（米）
    let dLat = (lat[1] - lat[0]) * Math.PI / 180;
    let dLng = (lng[1] - lng[0]) * Math.PI / 180;
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180)
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return Math.round(d) / 1000.00;
};