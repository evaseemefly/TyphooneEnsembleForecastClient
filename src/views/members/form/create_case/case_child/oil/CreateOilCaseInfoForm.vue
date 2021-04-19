<template>
    <div>
        <el-form ref="form" :model="form" label-width="120px" :label-position="labelPosition">
            <el-form-item label="案例名称" :span="8">
                <el-input v-model="form.caseName" :span="6"></el-input>
                <!-- <el-input v-model="form.name" :md="4"></el-input> -->
            </el-form-item>
            <el-form-item label="案例描述">
                <el-input type="textarea" v-model="form.caseDesc"></el-input>
            </el-form-item>
            <el-form-item label="经纬度">
                <el-col :span="11">
                    <el-input v-model="form.lat"></el-input>
                </el-col>
                <el-col class="line" :span="2">-</el-col>
                <el-col :span="11">
                    <el-input v-model="form.lon"></el-input>
                </el-col>
            </el-form-item>
            <div class="coverage_filter_form">
                <el-form-item label="起始时间">
                    <!-- <el-col :span="11"> -->
                    <el-col>
                        <el-date-picker
                            type="datetime"
                            placeholder="选择日期"
                            v-model="form.forecastdate"
                            style="width: 100%;"
                        ></el-date-picker>
                    </el-col>
                </el-form-item>
                <el-form-item label="结束时间">
                    <!-- <el-col :span="11"> -->
                    <el-col>
                        <el-date-picker
                            type="datetime"
                            placeholder="选择日期"
                            v-model="form.enddate"
                            style="width: 100%;"
                        ></el-date-picker>
                    </el-col>
                </el-form-item>
                <!-- 暂时保留区域的注释部分 -->
                <!-- <el-form-item label="区域">
                    <el-select placeholder="请选择" v-model="form.equation">
                        <el-option
                            v-for="item in optionEquationType"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item> -->
            </div>
            <div class="coverage_filter_form">
                <el-form-item label="风场">
                    <el-select placeholder="请选择" v-model="form.windId">
                        <el-option
                            v-for="item in getCoverageListByType(myEnum.COVERAGE_TYPE_WIND)"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="流场">
                    <el-select placeholder="请选择" v-model="form.currentId">
                        <el-option
                            v-for="item in getCoverageListByType(myEnum.COVERAGE_TYPE_CURRENT)"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
            </div>

            <!-- <el-form-item label="模拟时长">
        <el-input v-model="form.name" size="small"></el-input>
      </el-form-item> -->
            <div class="coverage_filter_form">
                <!-- TODO:[-] 19-11-21 此处修改为计数器的方式 -->
                <el-form-item label="释放时间">
                    <!-- <span class="demonstration">{{ currentNon }}</span> -->
                    <el-input-number
                        size="medium"
                        v-model="form.duration"
                        :max="formDefaultOption.durationMax"
                    ></el-input-number>
                </el-form-item>
                <!-- TODO:[X] 20-05-28 去掉失事物类型，显示油品类型 -->
                <!-- <el-form-item label="失事物类型">
                    <el-select placeholder="请选择" v-model="form.goodType">
                        <el-option
                            v-for="item in optionWreckType"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item> -->
                <el-form-item label="油品类型">
                    <el-select placeholder="请选择" v-model="form.oilType">
                        <el-option
                            v-for="item in optionOilType"
                            :key="item.key"
                            :label="item.name"
                            :value="item.key"
                        ></el-option>
                    </el-select>
                </el-form-item>
            </div>
            <el-form-item label="隐藏非常用设置" :span="8">
                <div id="switch_unused">
                    <el-switch
                        v-model="form.isShowNoUsed"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                    >
                    </el-switch>
                </div>
            </el-form-item>
            <el-collapse-transition>
                <div v-show="form.isShowNoUsed">
                    <el-form-item label="释放半径">
                        <span class="demonstration">{{ form.radius }}</span>
                        <el-slider
                            v-model="form.radius"
                            :step="formDefaultOption.radiusStep"
                            :max="formDefaultOption.radiusMax"
                        ></el-slider>
                    </el-form-item>
                    <el-form-item label="释放粒子数">
                        <span class="demonstration">{{ form.nums }}</span>
                        <el-slider
                            v-model="form.nums"
                            :step="formDefaultOption.numsStep"
                            :max="formDefaultOption.numsMax"
                        ></el-slider>
                    </el-form-item>
                    <el-form-item label="油量(吨)">
                        <span class="demonstration">{{ form.mass }}</span>
                        <el-slider
                            v-model="form.mass"
                            :step="formDefaultOption.numsStep"
                            :max="formDefaultOption.massMax"
                        ></el-slider>
                    </el-form-item>
                </div>
            </el-collapse-transition>

            <!-- <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
      </el-form-item>-->
        </el-form>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// 第三方库
import moment from 'moment'
import { Mutation, State, namespace, Getter } from 'vuex-class'
import { loadSelectByType, loadSelectParentByType } from '@/api/select'
import { SelectTypeEnum } from '@/enum/select'
import { DictEnum } from '@/enum/dict'
import { DEFAULT_COVERAGE_ID } from '@/const/common'
import { SelectMidModel } from '@/middle_model/select'
import {
    IFormOilCaseInfo,
    IInitSelectFunc,
    loadSelectionByType,
    FormOilCaseInfo,
    FormOilCaseModel
} from '@/views/members/form/create_case/case_child/oil/select'
import { loadFilterCoverageList } from '@/api/geo'
import { Form } from 'element-ui'

// store相关
import { GET_CURRENT_LATLNG } from '@/store/types'

// 常量
import { DEFAULT_SELECT_KEY, DEFAULT_SELECT_ITEM, DEFAULT_DICT_KEY } from '@/const/common'
// TODO:[-] 20-02-16 此处放在 ./select.ts中
// export interface IFormOilCaseInfo {
//     caseName: string
//     caseDesc: string
//     lat: number
//     lon: number
//     forecastdate: Date
//     duration: number
//     goodType: number
//     radius: number
//     nums: number
// }
// export interface IInitSelectFunc {
//     (value: string, label: string): void
// }
@Component({})
export default class OilCaseInfoForm extends Vue {
    mydata: any = null
    myEnum: any = DictEnum
    // 与下载选项相关的默认值
    formDefaultOption: {
        radiusStep: number
        radiusMax: number
        numsStep: number
        numsMax: number
        durationMax: number
        massMax: number
    } = {
        radiusStep: 10,
        radiusMax: 500,
        numsStep: 100,
        numsMax: 5000,
        durationMax: 148,
        massMax: 20000
    }
    form: FormOilCaseInfo = {
        caseName: 'default_case',
        caseDesc: 'default_case',
        lat: 12,
        lon: 12,
        forecastdate: new Date(),
        enddate: new Date(),
        // goodType: 0,
        oilType: DEFAULT_SELECT_KEY,
        radius: 50,
        nums: 2000,
        // 释放时间
        duration: 72,
        mass: 2000,
        currentId: DEFAULT_COVERAGE_ID,
        windId: DEFAULT_COVERAGE_ID,
        isShowNoUsed: false
    }
    // 失事类型
    optionWreckType: Array<{ value: string; label: string }> = [
        {
            value: '0',
            label: 'defalut'
        }
    ]
    // 求解方法
    optionEquationType: Array<{ value: string; label: string }> = [
        {
            value: '0',
            label: 'defalut'
        }
    ]
    // coverage 种类的 options
    optionCoverageType: Array<{ value: number; label: string }> = [
        {
            value: 401,
            label: '海流'
        },
        {
            value: 402,
            label: '风'
        }
    ]

    optionOilType: Array<{ key: number; name: string; did: number }> = []

    // coverage info list 列表
    coverageList: Array<{ id: number; label: string; type: number }> = []

    labelPosition = 'right'
    burningTime = 72
    radius = 0
    nums = 100
    mounted() {
        // 初始化各个select
        // loadSelectionByType(SelectTypeEnum.WRECK, this.initWreckTypeSelect)
        // this.loadSelectByType(SelectTypeEnum.EQUATION, this.initEquationSelect)
        this.loadSelectByType(DictEnum.OIL_TYPE, SelectTypeEnum.OILTYPE, this.initOilTypeSelect)
    }
    // 提交表达方法
    onSubmit() {}
    // TODO:[X] 20-05-28 由于不再需要加载区域所以此部分注释，但代码保留
    // loadSelectByType(type: SelectTypeEnum, func: IInitSelectFunc): void {
    //     this.optionWreckType = []
    //     // const myself = this
    //     loadSelectByType(type).then((res) => {
    //         if (res.status === 200) {
    //             // console.log(res.data)
    //             // 找到所有失事类型的selec集合
    //             if (res.data.length > 0) {
    //                 res.data.map(
    //                     (temp: { name: string; val: string; id: number; type_select: number }) => {
    //                         if (temp.type_select === type) {
    //                             // 此处修改为调用方法
    //                             // this.optionWreckType.push({ value: temp.val, label: temp.name })
    //                             func(temp.val, temp.name)
    //                         }
    //                     }
    //                 )
    //             }
    //         }
    //     })
    // }

    loadSelectByType(dict: DictEnum, type: SelectTypeEnum, func: IInitSelectFunc): void {
        this.optionWreckType = []
        // const myself = this
        // TODO:[-] 20-05-28 注意此处需要参考之前设置 members/form/search_form/CoverageSearchForm.vue 组件中读取的方式
        // 由于上面是需要有级联操作（即次级菜单是由父级菜单的选择而确定的)
        // 本操作是不涉及到级联菜单的，所以直接调用 loadSelectParentByType即可
        loadSelectParentByType(dict, type).then((res) => {
            if (res.status === 200) {
                // console.log(res.data)
                // 找到所有失事类型的selec集合
                if (res.data.length > 0) {
                    res.data.map(
                        (temp: {
                            name: string
                            id: number
                            did_id: number
                            type_select: number
                        }) => {
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

    // 初始化 失事类型 select
    initWreckTypeSelect(value: string, label: string): void {
        this.optionWreckType.push({ value: value, label: label })
    }
    // 初始化 求解方法 select
    initEquationSelect(value: string, label: string): void {
        this.optionEquationType.push({ value: value, label: label })
    }

    initOilTypeSelect(key: number, name: string, did: number): void {
        this.optionOilType.push({ key: key, name: name, did: did })
        console.log(`init oil type select :key ${key} | name:${name} | did:${did}`)
    }

    // get selectType() {
    //     return this.$store.getters['common/productType']
    // }

    // @Watch('getForecastDate', { immediate: true, deep: true })
    // onFormForecastDate(val: Date, oldVal: Date) {
    //     console.log(`new val:${val}|old val:${oldVal}`)
    // }

    // 监听 data -> form.forecastdate 属性的变化
    @Watch('form.forecastdate', { immediate: true, deep: true })
    onFormForecastDate(val: Date, oldVal: Date): void {
        // 注意需要清除一下 coverageList
        this.coverageList = []
        // console.log(`new val:${val}|old val:${oldVal}`)
        loadFilterCoverageList(val).then((res) => {
            if (res.status == 200) {
                // console.log(res.data)
                if (res.data.length > 0) {
                    res.data.forEach(
                        (temp: { id: number; file_name: string; coverage_type: number }) => {
                            this.coverageList.push({
                                id: temp.id,
                                label: temp.file_name,
                                type: temp.coverage_type
                            })
                        }
                    )
                }
            }
        })
        this.form.enddate = moment(val)
            .add(24, 'h')
            .toDate()
    }
    @Watch('form.duration', { immediate: true, deep: true })
    onDuration(val: number): void {
        // 释放时间 < end-start
        const timeDeltaHour: number =
            (this.form.enddate - this.form.forecastdate) / (1000 * 60 * 60)
        if (val > timeDeltaHour) {
            this.$confirm('释放时间需要小于起止时间间隔')
                .then((_) => {
                    this.form.duration = timeDeltaHour
                })
                .catch((_) => {})
        }
    }
    getCoverageListByType(type: number): Array<{ value: number; label: string }> {
        const filterList: Array<{ value: number; label: string }> = []
        // console.log(DictEnum.COVERAGE_TYPE_CURRENT)
        if (this.coverageList.length > 0) {
            this.coverageList.map((temp) => {
                if (temp.type === type) {
                    filterList.push({ value: temp.id, label: temp.label })
                }
            })
        }
        return filterList
    }

    getForecastDate(): Date {
        return this.form.forecastdate
    }

    // TODO:[-] 20-05-26
    @Getter(GET_CURRENT_LATLNG, { namespace: 'map' }) getLatlng

    @Watch('getLatlng')
    onLatlng(val: Array<number>): void {
        if (val.length > 1) {
            this.form.lat = val[0]
            this.form.lon = val[1]
        }
    }
}
</script>
<style scoped lang="less">
/* 搜救信息 form 中的 时间+区域的 样式 */
@import '../../../../../../styles/base-form.less';
#switch_unused {
    display: flex;
    margin-top: 10px;
}
// .coverage_filter_form {
//     display: flex;
// }
// .coverage_filter_form .el-form-item {
//     flex: 6;
//     .elf-form-item__content {
//         width: 100%;
//     }
// }
</style>
