module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly',
        '__dirname': true,
        '__filename': true,
        'global': true,
        'process': true
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        'no-console': 0,
        'no-undef': 2, //禁用未声明的变量，除非它们在 /*global */ 注释中被提到
        'no-trailing-spaces': 2, //禁用行尾空格
        'no-multi-spaces': 2, //禁止使用多个空格
        'eol-last:': 0, //文件末尾强制换行
        'no-spaced-func': 2, //禁止 function 标识符和括号之间出现空格
        'space-before-blocks': 2, //强制在块之前使用一致的空格
        'space-before-function-paren': [2, 'never'], //强制在 function的左括号之前使用一致的空格
        'space-infix-ops': 2, //操作符之间有空格
        'key-spacing': [2, { 'beforeColon': false, 'afterColon': true }], //对象字面量中冒号的前后空格
        'space-in-parens': [2, 'never'], //小括号里面要不要有空格
        'keyword-spacing': ['error', { 'before': true }], //关键字空格
        'eqeqeq': ['error', 'smart'], //===判断
        'brace-style': ['error'], // else 与它的大  括号同行
        'id-length': ['error', { 'min': 2 }],
        'no-inner-declarations': [2, 'functions'],
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-multiple-empty-lines': [
            'error',
            {
                'max': 1
            }
        ],
        'curly': [
            'error',
            'all'
        ],
        'comma-spacing': [
            'error', {
                'before': false, 'after': true
            }
        ],
        'comma-style': [
            'error',
            'last'
        ],
    }
};
