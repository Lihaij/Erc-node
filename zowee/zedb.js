// const oracledb = require('oracledb');

const config = require('../config');
const common = require('../util/CommonUtil.js');
const logger = require('../util/Logger').createLogger('zedb.js');

let g_Pool = null;

exports.getConnection = () => {
    return new Promise(function(resolve, reject) {
        // if (!g_Pool) {
        //     oracledb.createPool({
        //             user: config.zowee.user,
        //             password: config.zowee.password,
        //             connectString: config.zowee.connectString
        //         },
        //         function(err, pool) {
        //             if (err) reject(error);
        //             g_Pool = pool
        //             pool.getConnection(
        //                 function(err, connection) {
        //                     if (err) reject(error);
        //                     resolve(connection)
        //                 });
        //         });
        // } else {
        //     g_Pool.getConnection(
        //         function(err, connection) {
        //             if (err) reject(err);
        //             resolve(connection)
        //         });
        // }
    })
}
