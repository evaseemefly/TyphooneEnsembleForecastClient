// 定义一些常用的常量

// 默认的 select key
const DEFAULT_SELECT_KEY = -1

// 对应 db: dict_base -> 默认的 code
const DEFAULT_DICT_KEY = -1

const DEFAULT_COVERAGE_ID = -1

// 默认的 无实际意义的 coverage id 但需要与 DEFAULT 区别的
/** @type {number} 默认的 无实际意义的 coverage id 但需要与 DEFAULT 区别的*/
const USELESS_COVERAGE_ID = -9999

const DEFAULT_NUMBER = -1

// 默认的 leaflet layer id
const DEFAULT_LAYER_ID = -1

// 默认的 select item
const DEFAULT_SELECT_ITEM = {
    key: -1,
    name: '未选择',
    did: -1
}

// 默认的未选中的 coverage area
const DEFAULT_COVERAGE_AREA = -1

/**  默认未选中的 coverage_type : wind | current @type {*} */
const DEFAULT_COVERAGE_TYPE = -1

/** map 的缩放默认等级 @type {*} */
const DEFAULT_ZOOM_LEVEL = 8

export {
    DEFAULT_SELECT_KEY,
    DEFAULT_SELECT_ITEM,
    DEFAULT_DICT_KEY,
    DEFAULT_COVERAGE_ID,
    DEFAULT_NUMBER,
    DEFAULT_COVERAGE_AREA,
    DEFAULT_LAYER_ID,
    DEFAULT_COVERAGE_TYPE,
    USELESS_COVERAGE_ID,
    DEFAULT_ZOOM_LEVEL
}
