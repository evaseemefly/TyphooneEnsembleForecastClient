enum LayerTypeEnum {
    // TODO:[-] 20-10-26 gx501 更新至 tb:dict_base -> pid=700
    // TODO:[*] 20-10-30 7530 只对应左侧的 图层
    // 风场 栅格 图层
    WIND_RASTER_LAYER = 701,
    // 风场 风力杆 图层
    WIND_BAR_LAYER = 703,
    // 流场flow图层，类似 windy 的效果
    CURRENT_FLOW_LAYER = 702,
    // 流场 栅格 图层
    CURRENT_RASTER_LAYER = 704,

    /**
     * + 21-03-26 海浪等值线
     */
    WAVE_CONTOUR = 705,
    /*
      + 21-04-08 海浪-海表面高度栅格图层
    */
    WAVE_WVE_RASTER = 706

    // WIND_NWP = 701,
    // CURRENT_LAYER = 702
}
export { LayerTypeEnum }
