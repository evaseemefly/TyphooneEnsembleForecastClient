// 引入了各种可能得状态
export const ACTIVATION_BEGIN = 'ACTIVATION_BEGIN'
export const ACTIVATION_CLEAR = 'ACTIVATION_CLEAR'
export const ACTIVATION_FAILURE = 'ACTIVATION_FAILURE'
export const ACTIVATION_SUCCESS = 'ACTIVATION_SUCCESS'
export const LOGIN_BEGIN = 'LOGIN_BEGIN'
export const LOGIN_CLEAR = 'LOGIN_CLEAR'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGOUT = 'LOGOUT'
export const PASSWORD_EMAIL_BEGIN = 'PASSWORD_EMAIL_BEGIN'
export const PASSWORD_EMAIL_CLEAR = 'PASSWORD_EMAIL_CLEAR'
export const PASSWORD_EMAIL_FAILURE = 'PASSWORD_EMAIL_FAILURE'
export const PASSWORD_EMAIL_SUCCESS = 'PASSWORD_EMAIL_SUCCESS'
export const PASSWORD_RESET_BEGIN = 'PASSWORD_RESET_BEGIN'
export const PASSWORD_RESET_CLEAR = 'PASSWORD_RESET_CLEAR'
export const PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE'
export const PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS'
export const REGISTRATION_BEGIN = 'REGISTRATION_BEGIN'
export const REGISTRATION_CLEAR = 'REGISTRATION_CLEAR'
export const REGISTRATION_FAILURE = 'REGISTRATION_FAILURE'
export const REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS'
// export const SET_TOKEN = 'SET_TOKEN'
// TODO:[-] 20-02-07 jwt返回的token的key为 'token'
export const SET_TOKEN = 'token'
// 移除jwt的token,在localStorage中保存的token
export const REMOVE_TOKEN = 'REMOVE_TOKEN'
// 产品的种类(主要是oil还是rescue)
export const SET_PRODUCT_TYPE = 'SET_PRODUCT_TYPE'
export const GET_PRODUCT_TYPE = 'GET_PRODUCT_TYPE'

// case 相关
export const SET_CASE_CODE = 'SET_CASE_CODE'
export const GET_CASE_CODE = 'GET_CASE_CODE'

// ----------------
// map 相关
export const SET_MAP_NOW = 'SET_MAP_NOW'
export const GET_MAP_NOW = 'GET_MAP_NOW'
// 设置当前 map 中的 显示的 layers
export const SET_MAP_LAYERS = 'SET_MAY_LAYERS'
export const GET_MAP_LAYERS = 'GET_MAP_LAYERS'

// map - 修改是否显示创建 oil case model
export const SET_CREATE_OIL_CASE_MODAL = 'SET_CREATE_OIL_CASE_MODAL'
export const GET_CREATE_OIL_CASE_MODAL = 'GET_CREATE_OIL_CASE_MODAL'
// map - 选中的经纬度位置
export const SET_CURRENT_LATLNG = 'SET_CURRENT_LATLNG'
export const GET_CURRENT_LATLNG = 'GET_CURRENT_LATLNG'
// TODO:[-] 21-01-06 map - 初始的经纬度
export const SET_INITIAL_LATLNG = 'SET_INITIAL_LATLNG'
export const GET_INITIAL_LATLNG = 'GET_INITIAL_LATLNG'
// TODO:[-] 21-01-06 map - 选中的经纬度位置锁
// 只有 CURRENT_LATLNG_LOCK =false时，才可以移动点选的位置，否则不可移动
export const SET_CURRENT_LATLNG_LOCK = 'SET_CURRENT_LATLNG_LOCK'
export const GET_CURRENT_LATLNG_LOCK = 'GET_CURRENT_LATLNG_LOCK'

// TODO:[-] 21-01-27 map - 新加入的用来控制组件间触发异步时间造成的错位情况的 时间锁
export const SET_TIMER_LOCK = 'SET_TIMER_LOCK'
export const GET_TIMER_LOCK = 'GET_TIMER_LOCK'

// TODO:[-] 21-01-29 map - 新加入的用来控制是否继续播放的 auto-play
// autoPlay = true : on  -> 继续播放
//          = false: off -> 停止播放
export const SET_AUTO_PLAY = 'SET_AUTO_PLAY'
export const GET_AUTO_PLAY = 'GET_AUTO_PLAY'

// ----------------
// geo 相关
export const SET_GEO_COVERAGEID = 'SET_GEO_COVERAGEID'
export const GET_GEO_COVERAGEID = 'GET_GEO_COVERAGEID'
// geo -> coverage_type
export const SET_GEO_COVERAGETYPE = 'SET_GEO_COVERAGETYPE'
export const GET_GEO_COVERAGETYPE = 'GET_GEO_COVERAGETYPE'

// export { GET_MAP_LAYERS }
