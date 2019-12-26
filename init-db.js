const model = require('./model.js');

const { argv } = process;
const [ arg1, arg2, arg3] = argv;

if (arg3 === 'init') {
    model.sync().then(() => {
        console.log('Init database OK!')
        process.exit(0)
    }).catch((e) => {
        console.log(e)
    })
} else if (arg3 === 'truncate') {
    model.truncate().then(() => {
        console.log('Init database OK!')
        process.exit(0)
    }).catch((e) => {
        console.log(e)
    })
}

