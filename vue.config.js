// vue.config.js
const debug = process.env.NODE_ENV !== 'production'
console.log('')
console.log(
    '本地启动或构建的文件信息 | 开始--------------------------------------------------------------'
)
// console.log(vueConf.pages)
console.log(
    '本地启动或构建的文件信息 | 结束--------------------------------------------------------------'
)
console.log('')
module.exports = {
    // 选项...
    transpileDependencies: [], // 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
    productionSourceMap: true, // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
    configureWebpack: (config) => {
        // webpack配置，值位对象时会合并配置，为方法时会改写配置
        if (debug) {
            // 开发环境配置
            config.devtool = 'cheap-module-eval-source-map'
        } else {
            // 生产环境配置
        }
    }
}
