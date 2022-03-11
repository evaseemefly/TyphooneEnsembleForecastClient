/**
 * + 22-03-11
 * 集合路径相关的配置枚举
 *
 * @enum {number}
 */
enum GroupPathLayerOptEnum {
    /**
     * 台风中心路径
     */
    CENTER_PATH_LAYER = 711,

    /**
     * 集合路径
     */
    GROUP_PATH_LAYER = 712,

    /**
     * 集合路径外轮廓
     */
    OUTLINE_POLYGON_LAYER = 713,
    /**
     * 终点的中心概率圆
     */
    LAST_CENTER_CIRCLE_LAYER = 714,

    /**
     * 台风的当前大风半径 circle
     */
    TY_CIRCLE_LAYER = 715
}

export { GroupPathLayerOptEnum }
