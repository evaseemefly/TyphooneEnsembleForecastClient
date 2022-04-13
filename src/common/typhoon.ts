/**
 * 根据台风等级获取对应的台风路径填色颜色
 *
 * @param {string} tyType
 * @return {*}
 */
const getTyPathLineColor = (tyType: string) => {
    let colorStr = '#38ada9'
    switch (true) {
        // 热带风暴
        case tyType === 'TS':
            colorStr = '#38ada9'
            break
        // 强热带风暴ß
        case tyType === 'STS':
            colorStr = '#60a3bc'
            break
        // 台风
        case tyType === 'TY':
            colorStr = '#f6b93b'
            break
        // 强台风
        case tyType === 'STY':
            colorStr = '#e55039'
            break
        // 超强台风
        case tyType === 'SuperTY':
            colorStr = '#b71540'
            break
        default:
            break
    }
    return colorStr
}

export { getTyPathLineColor }
