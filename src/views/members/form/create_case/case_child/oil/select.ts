import { loadSelectByType, loadSelectParentByType } from '@/api/select'
import { SelectTypeEnum } from '@/enum/select'
import { DEFAULT_COVERAGE_ID } from '@/const/common'
export interface IFormOilCaseInfo {
    caseName: string
    caseDesc: string
    lat: number
    lon: number
    forecastdate: Date

    /**
     *模拟时长
     *
     * @type {number}
     * @memberof IFormOilCaseInfo
     */
    duration: number
    // goodType: number
    oilType: number
    radius: number
    /**
     * 散点数量
     *
     * @type {number}
     * @memberof IFormOilCaseInfo
     */
    nums: number

    /**
     * 油量(顿)
     *
     * @type {number}
     * @memberof IFormOilCaseInfo
     */
    mass: number
    // dateDuration: number
}

export class FormOilCaseInfo implements IFormOilCaseInfo {
    caseName: string
    caseDesc: string
    lat: number
    lon: number
    forecastdate: Date
    enddate: Date
    duration: number
    // TODO:[X] 20-05-28 去掉 失事物类型，放在搜救系统中
    // goodType: number
    oilType: number
    radius: number
    nums: number
    mass: number

    currentId = DEFAULT_COVERAGE_ID
    windId = DEFAULT_COVERAGE_ID
    isShowNoUsed: boolean
}
export interface IFormOilCaseModel {
    simulationStep: number
    consoleStep: number
    windNon: number
    currentNon: number
    optionEquationType: number
}

export class FormOilCaseModel implements IFormOilCaseModel {
    simulationStep: number
    consoleStep: number
    windNon: number
    currentNon: number
    optionEquationType: number
}
// export interface IInitSelectFunc {
//     (value: string, label: string): void
// }

export interface IInitSelectFunc {
    (key: number, name: string, did: number): void
}

// export interface IInitSelectImpl{

// }
const loadSelectionByType = (type: SelectTypeEnum, func: IInitSelectFunc): void => {
    // const myself = this
    // TODO:[X] 20-05-28 此处以下注释掉，使用另一个方法
    // loadSelectByType(type).then((res) => {
    //     if (res.status === 200) {
    //         // console.log(res.data)
    //         // 找到所有失事类型的selec集合
    //         if (res.data.length > 0) {
    //             res.data.map(
    //                 (temp: { name: string; val: string; id: number; type_select: number }) => {
    //                     if (temp.type_select === type) {
    //                         // 此处修改为调用方法
    //                         // this.optionWreckType.push({ value: temp.val, label: temp.name })
    //                         func(temp.val, temp.name)
    //                     }
    //                 }
    //             )
    //         }
    //     }
    // })

    loadSelectParentByType(type).then((res) => {
        if (res.status === 200) {
            // console.log(res.data)
            // 找到所有失事类型的selec集合
            if (res.data.length > 0) {
                res.data.map(
                    (temp: { name: string; id: number; did_id: number; type_select: number }) => {
                        if (temp.type_select === type) {
                            // 此处修改为调用方法
                            // this.optionWreckType.push({ value: temp.val, label: temp.name })
                            func(temp.id, temp.name, temp.did_id)
                        }
                    }
                )
            }
        }
    })
}

export { loadSelectionByType }
