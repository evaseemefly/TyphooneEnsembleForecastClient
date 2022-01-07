enum BaseLayerTypeEnum {
    UN_LAYER = -1,
    // 更新至 tb:dict_base -> pid=700
    // 台风-集合预报路径图层
    GROUP_PATH_LAYER = 701,
    // 潮位站-实时数据图层
    STATION_ICON_LAYER = 702,
    // 栅格-逐时增水图层
    RASTER_HOURLY_SURGE_LAYER = 1104,
    // + 21-08-01 最大增水图层
    RASTER_MAX_SURGE_LAYER = 1102,
    RASTER_PRO_SURGE_LAYER = 1105
    // RASTER_PRO_SURGE_LAYER_GT05 = 1301, // 风暴增水概率
    // RASTER_PRO_SURGE_LAYER_GT10 = 1302, //  增水大于0.5m的概率 nc
    // RASTER_PRO_SURGE_LAYER_GT15 = 1303,
    // RASTER_PRO_SURGE_LAYER_GT20 = 1304,
    // RASTER_PRO_SURGE_LAYER_GT25 = 1305,
    // RASTER_PRO_SURGE_LAYER_GT30 = 1306
}

export enum SurgeProLayerEnum {
    UN_LAYER = -1,
    RASTER_PRO_SURGE_LAYER_GT05 = 1301, // 风暴增水概率
    RASTER_PRO_SURGE_LAYER_GT10 = 1302, //  增水大于0.5m的概率 nc
    RASTER_PRO_SURGE_LAYER_GT15 = 1303,
    RASTER_PRO_SURGE_LAYER_GT20 = 1304,
    RASTER_PRO_SURGE_LAYER_GT25 = 1305,
    RASTER_PRO_SURGE_LAYER_GT30 = 1306
}

/**
 *+ 21-08-23 切换底图的key
 *
 * @export
 * @enum {number}
 */
export enum MapLayerEnum {
    SATELITE_MAP = 4001, // 卫星卫片
    SIMPLE_MAP = 4002 // 简单底图
}
export const LayerTypeEnum = { ...SurgeProLayerEnum, ...BaseLayerTypeEnum }
export type LayerTypeEnum = BaseLayerTypeEnum | SurgeProLayerEnum
// export { LayerTypeEnum&SurgeProLayerEnum }
// export default { ...SurgeProLayerEnum, ...LayerTypeEnum }
// export { LayerTypeEnum }
// export { LayerTypeEnum }
