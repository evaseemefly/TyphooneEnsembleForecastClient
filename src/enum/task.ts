/**
 *任务状态枚举
 *
 * @export
 * @enum {number}
 */
export enum TaskStateEnum {
    UNLESS_INIT = -1,
    INIT_CELERY = 0,
    GET_TY_DETAIL,
    GEN_PATH_FILES,
    GEN_CONTROL_FILES,
    STORE_TY_DETAIL, // 存储 获取到的 ty
    STORE_GROUP_PATH,
    STORE_STATION,
    TASK_BATCH,
    TXT_2_NC,
    STORE_FIELD_SURGE,
    TXT_2_NC_PRO,
    STORE_PRO_SURGE
}

/**
 * 获取当前任务枚举对应的显示信息
 *
 * @param {TaskStateEnum} temEnum
 * @return {*}  {string}
 */
const getTaskStateVal = (temEnum: TaskStateEnum): string => {
    let message = '其他状态'
    switch (true) {
        case temEnum === TaskStateEnum.UNLESS_INIT:
            message = '未执行'
            break
        case temEnum === TaskStateEnum.INIT_CELERY:
            message = '初始化异步作业框架'
            break
        case temEnum === TaskStateEnum.GET_TY_DETAIL:
            message = '爬取台风数据'
            break
        case temEnum === TaskStateEnum.GEN_PATH_FILES:
            message = '生成台风中间文件'
            break
        case temEnum === TaskStateEnum.GEN_CONTROL_FILES:
            message = '生成控制文件'
            break
        case temEnum === TaskStateEnum.STORE_TY_DETAIL:
            message = '存储台风信息'
            break
        case temEnum === TaskStateEnum.STORE_GROUP_PATH:
            message = '存储集合信息'
            break
        case temEnum === TaskStateEnum.STORE_STATION:
            message = '存储海洋站信息'
            break
        case temEnum === TaskStateEnum.TASK_BATCH:
            message = 'GPU计算中'
            break
        case temEnum === TaskStateEnum.TXT_2_NC:
            message = '生成nc中'
            break
        case temEnum === TaskStateEnum.STORE_FIELD_SURGE:
            message = '存储逐时场'
            break
        case temEnum === TaskStateEnum.TXT_2_NC_PRO:
            message = '生成概率场nc中'
            break
        case temEnum === TaskStateEnum.STORE_PRO_SURGE:
            message = '存储概率场'
            break
    }
    return message
}

export { getTaskStateVal }
