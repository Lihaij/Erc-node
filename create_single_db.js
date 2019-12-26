const model = require('./model.js');

// node shell [node create_single_db.js erc_order]

const { argv } = process;
// console.log('create_single_id:', argv);

if (argv.length < 3) {
    console.error('argv failed');
    console.info('command shell like << node create_single_db.js erc_order >>');
    process.exit(0);
}

const [ arg1, arg2, arg3 ] = argv;
const tb_table = model[arg3];

if (process.env.NODE_ENV !== 'production') {
    tb_table.sync({
        force: true
    }).then(result => {
        console.info('success');
        process.exit(0);
    });
} else {
    console.log('Cannot sync() when NODE_ENV is set to \'production\'.');
}
