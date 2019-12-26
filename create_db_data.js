const model = require('./model.js');
const { codeArray, nameArray, detailArray, typeArray, typeCodeArray } = require('./util/AccountConst');

const { argv } = process;

if (argv.length < 3) {
    console.error('argv failed');
    console.info('command shell like << node create_single_db.js erc_order >>');
    process.exit(0);
}

const [ , , arg3 ] = argv;
const tb_table = model[arg3];

(async function main() {
    await tb_table.bulkCreate(codeArray.map(item => ({ accounting_subject_code: item })));

    const dataList = await tb_table.findAll();
    for (let i = 0; i < dataList.length; i++) {
        const dataItem = dataList[i];
        dataItem.accounting_subject_name = nameArray[i];
        dataItem.accounting_subject_detail = detailArray[i];
        dataItem.accounting_subject_type_name = typeArray[i];
        dataItem.accounting_subject_type_code = typeCodeArray[i];
        await dataItem.save();
    }
})();
