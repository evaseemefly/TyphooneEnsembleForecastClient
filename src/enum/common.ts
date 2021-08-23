const getEnumVal = <T>(tempEnum: T, index: number): string => {
    const areaStr = tempEnum[index]
    return areaStr
}

export enum LayerTypeEnum {
    GEO_RASTER_LAYER = 1001,
    STATION_SURGE_ICON_LAYER = 1002,
    TYPHOON_GROUPPATH_LAYER = 1003
}

export enum MapLayerEnum {
    SATELITE_MAP = 4001,
    SIMPLE_MAP = 4002
}
export { getEnumVal }
