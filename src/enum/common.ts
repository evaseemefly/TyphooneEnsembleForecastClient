const getEnumVal = <T>(tempEnum: T, index: number): string => {
    const areaStr = tempEnum[index]
    return areaStr
}

export enum LayerTypeEnum {
    GEO_RASTER_LAYER = 1001,
    STATION_SURGE_ICON_LAYER = 1002,
    TYPHOON_GROUPPATH_LAYER = 1003
}

/**
 * + 21-08-26 icon 种类
 *
 * @export
 * @enum {number}
 */
export enum IconTypeEnum {
    /**
     * 台风当前所在位置脉冲 icon
     */
    TY_PULSING_ICON,

    /**
     * 台风路径示意 icon
     */
    TY_PATH_ICON
}

export { getEnumVal }
