const config = {
  // for sequelize`
//    sequelize: {
//       dialect: 'mysql',
//       database: 'erc',
//       username: 'root',
//       password: 'yhxx54321',
//       host: '120.24.85.11',
//       port: 3306
//   },
  sequelize: {
      dialect: 'mysql',
      database: 'erc',
      username: 'root',
      password: '1234',
      host: '127.0.0.1',
      port: 3306
  },
  // for zowee`
  zowee: {
      user: "pdmzowee",
      password: "y13zowee",
      connectString: "//120.77.216.64/orcl",
      soapUrl: 'http://121.12.253.157:8004/ErpService.asmx?wsdl',
      joinno: '888888',
      shopno: '888888',
      brandid: 2,
      contracttypeid: 1,
      remedyid: 468
  },
  // for redis
  redisCache: true,
  redis: {
      host: 'localhost',
      port: 6379,
      opts: {}
  },
  // for mongo
  mongoFlag: true,
  mongo: {
      connect: 'mongodb://localhost:27017'
  },
  // for elasticsearch
  elasticsearchFlag: false,
  elasticsearch: {
      index: 'ncahouse',
      host: 'localhost:9200',
      log: {
          type: 'file',
          level: 'error',
          path: '../log/elasticsearch.log'
      }
  },
  // 电子签名
  signPDF: {
      server: 'http://localhost:8081/tech-sdkwrapper'
  },
  // for logger
  loggerConfig: {
      level: 'DEBUG',
      config: {
          appenders: {
              out: {
                  type: 'stdout'
              },
              everything: {
                  type: 'dateFile',
                  filename: '../log/app.log',
                  pattern: '-yyyy-MM-dd',
                  compress: true
              }
          },
          categories: {
              default: {
                  appenders: ['out', 'everything'],
                  level: 'debug'
              }
          }
      }
  },
  syslogFlag: true,
  uploadOptions: {
      uploadDir: '../public/temp',
      maxFileSize: 2 * 1024 * 1024,
      keepExtensions: true
  },
  tempDir: '../public/temp',
  filesDir: '../public/files',
  tmpUrlBase: '/temp/',
  fileUrlBase: '/files/',
  // SECRET_KEY
  SECRET_KEY: 'zc7#_66#g%u2n$j_)j$-r(swt63d(2l%wc2y=wqt_m8kpy%04*',
  TOKEN_AGE: 43200000, // 12 * 60 * 60 * 10000
  MOBILE_TOKEN_AGE: 31536000000, // 365 * 24 * 60 * 60 * 1000
  mrpDir: '../../mrpLog/',
  NoAuthApis:['ERCPARKMAPCONTROL','ERCPARKCOMPANYCONTROL','ERCPARKDATACONTROL','ERCPARKSUPPLIERCONTROL']
};

module.exports = config;
