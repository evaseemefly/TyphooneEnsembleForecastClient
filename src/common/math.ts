/*
    + 22-07-08 数学相关的公共方法

*/

const asc = (arr) => arr.sort((a, b) => a - b)

const sum = (arr) => arr.reduce((a, b) => a + b, 0)

const mean = (arr) => sum(arr) / arr.length

/** 获取标准差 */
const std = (arr) => {
    const mu = mean(arr)
    const diffArr = arr.map((a) => (a - mu) ** 2)
    return Math.sqrt(sum(diffArr) / (arr.length - 1))
}

/** 获取百分位数 */
const quantile = (arr, q) => {
    const sorted = asc(arr)
    const pos = (sorted.length - 1) * q
    const base = Math.floor(pos)
    const rest = pos - base
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base])
    } else {
        return sorted[base]
    }
}

export { quantile, std }
