module.exports = {
    // TODO:[*] 有什么用
    root: true,
    // parser: '@typescript-eslint/parser', //定义ESLint的解析器
    // plugins: ['@typescript-eslint'], //定义了该eslint文件所依赖的插件
    plugins: [
        // TODO:20-09-21 @typescript-eslin 相关配置
        // 告诉ESLint加载您已安装的插件包（@typescript-eslint/eslint-plugin）。
        // 这使您可以在代码库中使用规则。
        '@typescript-eslint',
        // 其他
        'prettier',
        'vue'
    ],
    // 参考https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
    // 目前使用的拓展有：
    // eslint-plugin-vue
    // eslint-config-alloy
    // typescript-eslint
    extends: [
        // 新加入了alloy用来
        // TODO:[*] 引入了腾讯的规范会出现冲突
        // 'alloy',
        // 'alloy/typescript',
        // 'alloy/vue',
        // TODO:20-09-21 @typescript-eslin 相关配置
        // 由于采用了alloy去掉的配置
        'eslint:recommended',
        // 接口不能是I开头
        // TODO:由于采用了alloy去掉的配置
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        // TODO:[-]下面这个standard-with-typescript需要注释掉否则会有冲突
        // 'standard-with-typescript',
        // prettier/@typescript-eslint：//使得@typescript-eslint中的样式规范失效，遵循prettier中的样式规范

        // TODO:由于采用了alloy去掉的配置
        'prettier/@typescript-eslint',
        // plugin:prettier/recommended：使用prettier中的样式规范，且如果使得ESLint会检测prettier的格式问题，同样将格式问题以error的形式抛出
        // 'plugin:prettier/recommended'
        // TODO:[-]加入了vue的插件，否则会提示xx'<'的错误
        // 'plugin:vue/recommended',
        // TODO:[-] 注意要使用下面这个插件，否则会与eslint有冲突
        // 文件检测说明配置extends
        // eslint-plugin-vue
        'plugin:vue/essential',
        // TODO:由于采用了alloy去掉的配置
        // 'plugin:vue/base'

        // TODO:[*] 仿照vue cli创建的部分拓展
        // TODO:由于采用了alloy去掉的配置
        // '@vue/prettier',
        // '@vue/typescript'
        // TODO:20-09-21 由于处理 接口不能以I开头的 warning 提示加入的
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    env: {
        browser: true
    },
    // 目前使用的parser器有typescript-eslint / parser
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports,
        // TODO:20-09-21 @typescript-eslin 相关配置
        // 告诉ESLint使用您安装的解析器包（@typescript-eslint/parser）。
        // 这使ESLint可以理解TypeScript语法。
        // 这是必需的，否则ESLint在尝试解析TypeScript代码时会像常规JavaScript一样抛出错误。
        parser: '@typescript-eslint/parser' //定义ESLint的解析器
    },
    rules: {
        // 禁止使用 var
        // 'no-var': 'error',
        // 此处配置的禁用console有效
        'no-console': 'warn',
        // TODO:[*]这个规则是干嘛的
        'prettier/prettier': 'error',
        // ---
        // ts-eslint 相关
        // 优先使用 interface 而不是 type
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        // 要求所有接口都以"I"或作为前缀"_I"
        // prefixWithI: 'always',
        // allowUnderscorePrefix: true,
        // '@typescript-eslint/interface-name-prefix': ['your-setting-here'],
        //强制使用单引号
        quotes: ['error', 'single'],
        //强制不使用分号结尾
        semi: ['error', 'never'],
        // TODO:[*]这个规则是干嘛的
        'prettier/prettier': ['error', { endOfLine: 'auto' }],

        'vue/html-self-closing': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
        // '@typescript-eslint/interface-name-prefix': 0,
        // TODO:20-09-21 由于处理 接口不能以I开头的 warning 提示加入的
        // The rule @typescript-eslint/interface-name-prefix has been removed as you can see here.
        // '@typescript-eslint/interface-name-prefix': [
        //     'waring',
        //     {
        //         prefixWithI: 'always'
        //     }
        // ],
        // "@typescript-eslint/naming-convention": [
        //     "error",
        //     {
        //       "selector": ["variable", "function"],
        //       "format": ["camelCase"],
        //       "leadingUnderscore": "allow"
        //     }
        //   ]
    }
}
