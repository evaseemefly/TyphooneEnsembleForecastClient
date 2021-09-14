import moment from 'moment'

/**
 * 将时间转换为指定的格式(str)
 *
 * @param {Date} now
 * @returns {string}
 */
const fortmatData2YMDHM = (now: Date): string => {
    return moment(now).format('YYYY-MM-DD HH:mm')
}
const fortmatData2YMDH = (now: Date): string => {
    return moment(now).format('YYYY-MM-DD HH')
}
const fortmatDate2YMD = (now: Date): string => {
    return moment(now).format('YYYY-MM-DD')
}
const fortmatDate = (now: Date, formatStr: string) => {
    return moment(now).format(formatStr)
}
/**
 * 获取 abs val
 *
 * @param {{ x: number; y: number }} val
 * @returns {string}
 */
const formatAbs = (val: { x: number; y: number }): string => {
    // parseFloat(Math.pow(3.5,2).toFixed(2))
    return Math.sqrt(
        parseFloat(Math.pow(val.x, 2).toFixed(2)) + parseFloat(Math.pow(val.y, 2).toFixed(2))
    ).toFixed(2)
}

/**
 * 保留有效数字
 *
 * @param {number} val
 * @param {number} [keepNum=2]
 * @returns {string}
 */
const formatFixed = (val: number, keepNum = 2): string => {
    return val.toFixed(keepNum)
}
/**
 * 转换角度
 *
 * @param {{ x: number; y: number }} val
 * @param {number} [keepNum=2]
 * @returns {string}
 */
const formatDir = (val: { x: number; y: number }, keepNum = 2): string => {
    // console.log(`${val.x}|${val.y}`)
    let dir = (Math.atan2(val.y, val.x) * 180) / Math.PI
    if (dir < 0) {
        dir = dir + 180
    }
    return dir.toFixed(keepNum)
}

export {
    fortmatData2YMDH,
    fortmatData2YMDHM,
    fortmatDate,
    formatAbs,
    formatFixed,
    formatDir,
    fortmatDate2YMD
}
