import { getEnumVal } from './common'
export enum AreaEnum {
    NULL = -1,
    NORTHWEST = 0,
    CHINASEA,
    // EASTCHINASEA,
    // + 21-02-18 新加入的全球区域 对应全球 流场 | 风场
    GLOBAL = 507,
    BOHAISEA = 510, // 渤海 - 区域1
    EASTCHINASEA = 511, // 东海 - 区域2
    SOUTHCHINASEA = 512 // 南海 - 区域3
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

/**
 * @description 根据传入的区域枚举获取对应的区域名称
 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
 * @date 15/07/2022
 * @param {AreaEnum} x
 * @returns {*}  {string}
 */
const getAreaName = (x: AreaEnum): string => {
    let name = '区域1'
    switch (x) {
        case AreaEnum.BOHAISEA:
            name = '区域1'
            break
        case AreaEnum.EASTCHINASEA:
            name = '区域2'
            break
        case AreaEnum.NULL:
            name = '区域3'
            break
    }
    return name
}

export { getAreaVal, getAreaName }
