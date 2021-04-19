// 公用的字典
// 对应db:table -> dict_base.code ,只关联 pid 为0 的
// value 为 type_code (全大写) = key为 code (数字)
export enum DictEnum {
    // 栅格文件种类
    COVERAGE_TYPE = 400,
    // 栅格文件所属区域
    COVERAGE_AREA = 500,
    // coverage 流场
    COVERAGE_TYPE_CURRENT = 401,
    // coverage 风场
    COVERAGE_TYPE_WIND = 402,
    // 油品种类
    OIL_TYPE = 600
}

/**
 * 预报产品种类 流场|风场|...
 *
 * @export
 * @enum {number}
 */
export enum ProductEnum {
    COVERAGE_TYPE_CURRENT = 401,
    COVERAGE_TYPE_WIND = 402,
    COVERAGE_TYPE_WAVE = 403,

    /**
     * 海浪-浪向
     */
    COVERAGE_TYPE_WAVE_MWD = 404,

    /**
     * 海浪-海表面高度
     */
    COVERAGE_TYPE_WAVE_WVE = 405
}
