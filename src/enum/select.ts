// 用来读取下拉选项的
// TODO:[-] 20-02-16 注意此处需要与 commom/models -> SelectModel中的choice一致

/**
 *  用来读取下拉选项的
 *  对应db: table -> common_select.type_select
 *
 * @export
 * @enum {number}
 */
export enum SelectTypeEnum {
    /**
     * 失事类型
     */
    WRECK = 1,

    /**
     * 求解方法
     */
    EQUATION = 2,
    COVERAGE = 4,
    COVERAGE_AREA = 5,

    /**
     * 油品种类
     */
    OILTYPE = 6
}
