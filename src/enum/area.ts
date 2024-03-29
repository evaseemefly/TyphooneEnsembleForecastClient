import { getEnumVal } from './common'
export enum AreaEnum {
    NULL = -1,
    NORTHWEST = 0,
    CHINASEA,
    // EASTCHINASEA,
    // + 21-02-18 新加入的全球区域 对应全球 流场 | 风场
    GLOBAL = 507,
    BOHAISEA = 501, // 渤海 - 区域1
    EASTCHINASEA = 502, // 东海 - 区域2
    SOUTHCHINASEA = 503 // 南海 - 区域3
}
/**
 * 根据传入的 area 枚举获取对应的val(string)
 *
 * @param {AreaEnum} area
 * @returns {string}
 */
// const getAreaVal = (index: number): string => {
//     const areaStr = AreaEnum[index]
//     return areaStr
// }
const getAreaVal = (x: AreaEnum, index: number): string => {
    return getEnumVal<AreaEnum>(x, index)
}

export { getAreaVal }
