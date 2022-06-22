<template>
    <div id="base_form_createcase" @mousedown="drag()" style="visibility: hidden;">
        <div class="base-card">
            <div class="base-card-title"><h4>台风信息</h4></div>
            <div class="base-card-content">
                <div class="base-card-row tiled row-flex-space-around" id="ty_form_create-title">
                    <p>台风编号</p>
                    <el-input v-model="tyCode" value="number" placeholder="台风编号"></el-input>
                    <el-switch
                        v-model="isCustomerTy"
                        active-text="自定义台风"
                        inactive-text="中央台"
                    >
                    </el-switch>
                    <el-tooltip
                        class="item"
                        effect="dark"
                        content="将从中央气象台台风网爬取对应台风路径"
                        placement="bottom"
                    >
                        <button type="top" class="el-button el-button--primary" @click="spiderTy">
                            爬取<i class="fas fa-cloud-download-alt"></i>
                        </button>
                    </el-tooltip>
                </div>
                <div class="base-card-row tiled row-flex-end">
                    <el-tooltip
                        class="item"
                        effect="dark"
                        content="清除当前台风路径信息"
                        placement="bottom"
                    >
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            circle
                            @click="clearTyPathList"
                        ></el-button>
                    </el-tooltip>
                    <el-tooltip
                        class="item"
                        effect="dark"
                        content="将台风路径统一为间隔6小时"
                        placement="bottom"
                    >
                        <button
                            type="button"
                            class="el-button el-button--primary"
                            @click="standardizing(true)"
                        >
                            标准化<i class="fas fa-eraser"></i>
                        </button>
                    </el-tooltip>
                    <el-tooltip
                        class="item"
                        effect="dark"
                        content="检查数据是否正常"
                        placement="bottom"
                    >
                        <button
                            type="button"
                            class="el-button el-button--primary"
                            @click="spiderTy"
                        >
                            检查<i class="fas fa-spell-check"></i>
                        </button>
                    </el-tooltip>
                </div>
                <el-collapse-transition>
                    <div class="base-card-row" id="ty_form_create_info" v-show="isCustomerTy">
                        <!-- TODO: [*]22-02-12 加入的表头  -->
                        <div class="base-row-table">
                            <div>操作</div>
                            <div>时间</div>
                            <div>经度</div>
                            <div>纬度</div>
                            <div>气压</div>
                            <!-- <div>半径</div> -->
                        </div>

                        <div
                            class="base-card-row tiled mini row-flex-space-around"
                            v-for="(item, index) in customerTyCMAList"
                            :key="item.key"
                        >
                            <i class="el-icon-circle-plus" @click="addCustomerTyCMA"></i>
                            <i class="el-icon-delete" @click="deleteCustomerTyCMA(index, item)"></i>
                            <el-date-picker
                                v-model="item.forecastDt"
                                align="right"
                                type="datetime"
                                placeholder="时间"
                            >
                            </el-date-picker>
                            <el-input
                                v-model.number="item.lon"
                                value="number"
                                placeholder="经度"
                            ></el-input>
                            <el-input
                                v-model.number="item.lat"
                                value="number"
                                placeholder="纬度"
                            ></el-input>
                            <el-input
                                v-model.number="item.bp"
                                value="number"
                                placeholder="气压"
                            ></el-input>
                            <!-- 21-09-20 暂时去掉了大风半径 -->
                            <!-- <el-input v-model="item.radius" placeholder="大风半径"></el-input> -->
                        </div>
                    </div>
                </el-collapse-transition>
            </div>
        </div>
        <!-- + 21-09-18 暂时去掉 预报区域 -->
        <!-- <div class="base-card">
            <div class="base-card-title">
                <h4>预报区域</h4>
            </div>
            <div class="base-card-content">
                <div class="base-card-row">
                    北
                    <el-input
                        v-model="forecastScope.n"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                    东
                    <el-input
                        v-model="forecastScope.e"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                </div>
                <div class="base-card-row">
                    西
                    <el-input
                        v-model="forecastScope.w"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                    南
                    <el-input
                        v-model="forecastScope.s"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                </div>
            </div>
        </div> -->
        <div class="base-card">
            <div
                class="base-card-title clickable"
                @click="isShowAdvancedCard = !isShowAdvancedCard"
            >
                <h4>高级</h4>
            </div>
            <el-collapse-transition>
                <div
                    v-show="isShowAdvancedCard"
                    class="base-card-content overflowable advanced-card "
                >
                    <div class="base-card-row row-flex-space-around">
                        成员数量
                        <el-input-number
                            v-model="membersNum"
                            :min="1"
                            label="描述文字"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row row-flex-space-around">
                        大风半径增减值
                        <el-input-number
                            v-model="maxWindRadiusDiff"
                            :min="0"
                            label="描述文字"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row row-flex-space-around">
                        模型计算区域
                        <el-select v-model="selectForecastAreaVal" placeholder="请选择">
                            <el-option
                                v-for="item in forecastAreaList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </div>
                    <div class="base-card-row row-flex-space-around">
                        误差半径
                        <el-input-number
                            v-model="deviationRadiusNum"
                            :min="deviationRadiusLenMin"
                            :max="deviationRadiusLenMax"
                            label="描述文字"
                            @change="deviationChange"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row row-flex-space-around">
                        <div class="cell" :key="item.key" v-for="item in deviationRadiusNumberList">
                            <p>{{ item.hours }}h</p>
                            <el-input
                                v-model.number="item.radius"
                                placeholder="请输入内容"
                            ></el-input>
                        </div>
                    </div>
                </div>
            </el-collapse-transition>
        </div>
        <div class="form-footer">
            <button type="button" class="el-button el-button--default" @click="isShow = false">
                取消
            </button>
            <button type="button" class="el-button el-button--primary" @click="commit">确定</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
import { StationDrag } from '@/directives/drag'
import { loading } from '@/common/common'
import { createTyCase } from '@/api/task'
import { getTargetTyCase, spiderTargetTyPathList } from '@/api/tyhoon'
// STORE 常量
import { GET_CREATE_FORM } from '@/store/types'
// vuex -> types
import { SET_GEO_COVERAGEID, SET_TYPHOON_PATH_LIST } from '@/store/types'
import { AreaEnum } from '@/enum/area'

const checkCustomerTyList = (
    tyList: {
        forecastDt: Date
        lat: number
        lon: number
        bp: number
        isForecast: boolean
        // radius: number
    }[]
): boolean => {
    let isOk = false
    // 升序排列
    const sortedTyList = tyList.sort((a, b) => {
        return b.forecastDt.getTime() - a.forecastDt.getTime() > 0
    })
    if (sortedTyList.length > 0) {
        const diffMs =
            sortedTyList[sortedTyList.length - 1].forecastDt.getTime() -
            sortedTyList[0].forecastDt.getTime()

        const diffHours = diffMs / (1000 * 60 * 60)
        if (diffHours <= 24 * 5) {
            isOk = true
        }
    }

    return isOk
}

@Component({
    directives: {
        // drag: Draggable
    }
})
export default class CreateCaseForm extends Vue {
    tyCodeOptions: { label: string; value: string }[] = [
        { label: '101', value: '101' },
        { label: '102', value: '102' },
        { label: '103', value: '103' }
    ]
    isCustomerTy = false
    deviationRadiusNumberList: { hours: number; radius: number }[] = [
        { hours: 24, radius: 60 },
        { hours: 48, radius: 100 },
        { hours: 72, radius: 120 },
        { hours: 96, radius: 150 },
        { hours: 120, radius: 180 }
    ]
    customerTyCMAList: {
        forecastDt: Date
        lat: number
        lon: number
        bp: number
        isForecast: boolean
        tyType: string
        // radius: number
    }[] = []
    forecastAreaList = [
        {
            value: AreaEnum.NULL,
            label: '未选择'
        },
        {
            value: AreaEnum.SOUTHCHINASEA,
            label: '南海区'
        },
        {
            value: AreaEnum.EASTCHINASEA,
            label: '东海区'
        },
        {
            value: AreaEnum.BOHAISEA,
            label: '北海区'
        }
    ]
    selectForecastAreaVal = AreaEnum.NULL
    dragCls: StationDrag
    deviationRadiusLenMin = 0
    deviationRadiusLenMax = 100
    maxWindRadiusDiff = 0
    tyCode = '2109'
    membersNum = 145
    deviationRadiusNum = this.deviationRadiusNumberList.length
    isShowAdvancedCard = false // + 21-07-10 是否显示高级选项
    // + 21-07-10 预报范围(西北，东北，西南，东南)
    // w: 110
    // e: 118
    // s: 19
    // n: 24
    forecastScope: { n: number; e: number; w: number; s: number } = {
        n: 26.0,
        e: 123.0,
        w: 105.0,
        s: 15.0
    }
    // @Prop()
    isShow = false

    // toClose = false
    // isClosed = true

    mounted() {
        // this.isClosed = !this.isShow
        this.dragCls = new StationDrag('base_form_createcase', 600, 309.6, {
            needStretch: false,
            dragAreaWidth: 10,
            ignoreLeftSpace: 0,
            ignoreTopSpace: 0
        })
    }

    drag(): void {
        this.dragCls.drag({ divId: 'base_form_createcase' })
    }

    deviationChange(num: number, oldNum: number): void {
        const hoursInterval = 24
        const radiusInterval = 30
        const lastDeviation = this.deviationRadiusNumberList.slice(-1)[0]
        if (num > oldNum) {
            // +
            if (this.deviationRadiusNumberList.length <= this.deviationRadiusLenMax - 1) {
                const newDeviationHours = lastDeviation.hours + hoursInterval
                const newDeviationRadius = lastDeviation.radius + radiusInterval
                const newDeviation = { hours: newDeviationHours, radius: newDeviationRadius }
                this.deviationRadiusNumberList.push(newDeviation)
                console.log(newDeviation)
            }
        } else if (num < oldNum) {
            if (this.deviationRadiusNumberList.length > this.deviationRadiusLenMin) {
                this.deviationRadiusNumberList.pop()
            }
        }
        // console.log(`new:${num},old:${oldNum}`)
    }

    @Watch('isShow')
    onIsShow(val: boolean): void {
        // this.isClosed = !this.isShow
        this.toShow(val)
    }

    toShow(val: boolean): void {
        const divCreateForm = document.getElementById('base_form_createcase')
        if (divCreateForm) {
            if (divCreateForm.style) {
                if (divCreateForm.style.visibility != undefined) {
                    const isShow = divCreateForm.style.visibility
                    if (val) {
                        divCreateForm.style.visibility = 'visible'
                    } else {
                        divCreateForm.style.visibility = 'hidden'
                    }
                }
            }
        }
    }

    // 清除台风路径及台风编号信息
    clearTyPathList(): void {
        this.customerTyCMAList = []
        this.tyCode = ''
    }

    // 爬取台风
    spiderTy(): void {
        /*
            ty_code: "2121"
            ty_id: 2726099
            ty_name_ch: "妮亚图"
            ty_name_en: "NYATOH"
            ty_path_list: Array(24)
            0:
            bp: 998
            forecast_dt: "2021-11-30T00:00:00Z"
            forecast_ty_path_list: (8) [
                0:
                bp: 990
                forecast_dt: "2021-11-30T12:00:00Z"
                lat: 13.2
                lon: 137.6
                ts: 1638273600
                ty_type: "TS"
                ,...
            ]
            lat: 12.6
            lon: 139.2
            ts: 1638230400000
            ty_type: "TS"
        */
        //
        const loadInstance = loading('等待加载等值面', {
            fullscreen: true,
            background: 'rgba(49, 59, 89, 0.733)'
        })
        spiderTargetTyPathList(this.tyCode)
            .then(
                (res: {
                    status: number
                    data: {
                        ty_code: string
                        ty_id: number
                        ty_name_ch: string
                        ty_name_en: string
                        ty_path_list: Array<{
                            lat: number
                            lon: number
                            ts: number
                            ty_type: string
                            bp: number
                            forecast_dt: Date
                            forecast_ty_path_list: Array<{
                                lat: number
                                lon: number
                                ts: number
                                ty_type: string
                                bp: number
                                forecast_dt: string
                            }>
                        }>
                    }
                }) => {
                    if (res.status === 200) {
                        /*
                            step-1: 对于 res.data.ty_path_list 根据ts(时间戳)按照从小到大进行排序
                            step-2: 遍历 res.data.ty_path_list 提取每个时刻的台风实况
                            step-3: 获取 index=count 的实况中的 forecast_ty_path_list push 至台风路径 list 中
                        */
                        // if (
                        //     !res.data.hasOwnProperty('ty_path_list') &&
                        //     res.data.ty_path_list.length <= 0
                        if (
                            !res.data.hasOwnProperty('ty_path_list') ||
                            res.data.ty_path_list.length <= 0
                        ) {
                            throw new Error(`无法爬取${this.tyCode}的台风路径`)
                        }
                        const tyPathList: Array<{
                            lat: number
                            lon: number
                            ts: number
                            tyType: string
                            bp: number
                            forecastDt: Date
                            isForecast: boolean
                        }> = []
                        const tempTyPathList = res.data.ty_path_list.sort((a, b) => {
                            return a.ts - b.ts
                        })
                        tempTyPathList.forEach((temp) => {
                            tyPathList.push({
                                lat: temp.lat,
                                lon: temp.lon,
                                ts: temp.ts,
                                tyType: temp.ty_type,
                                bp: temp.bp,
                                forecastDt: new Date(temp.forecast_dt),
                                isForecast: false
                            })
                        })
                        tempTyPathList[tempTyPathList.length - 1].forecast_ty_path_list.forEach(
                            (temp) => {
                                tyPathList.push({
                                    lat: temp.lat,
                                    lon: temp.lon,
                                    ts: temp.ts,
                                    tyType: temp.ty_type,
                                    bp: temp.bp,
                                    forecastDt: new Date(temp.forecast_dt),
                                    isForecast: true
                                })
                            }
                        )
                        // console.log(tyPathList)
                        this.customerTyCMAList = []
                        tyPathList.forEach((temp) => {
                            this.customerTyCMAList.push({
                                forecastDt: temp.forecastDt,
                                lat: temp.lat,
                                lon: temp.lon,
                                bp: temp.bp,
                                isForecast: temp.isForecast,
                                tyType: temp.tyType
                            })
                        })
                    }
                }
            )
            .catch((e: Error) => {
                // console.log(e)
                this.$message.error(e.message)
                this.customerTyCMAList = []
            })
            .finally((_) => {
                // console.log(res.data)
                // this.setTyphoonPathList(this.customerTyCMAList)
                if (this.customerTyCMAList.length > 0) {
                    this.$message(`爬取台风编号:${this.tyCode}成功`)
                }
                loadInstance.close()
            })
    }

    // 标准化
    /*
        step1:找到第一个预报时刻
        step2:将第一个预报时刻之前的台风实况路径均取间隔6小时的实况
    */
    standardizing(desc: boolean): void {
        // 1- 将台风路径列表按照时间升序排序，越近的越靠后
        checkCustomerTyList(this.customerTyCMAList)
        // 2- 找到第一个预报路径
        let firstForecastTyPath: {
            forecastDt: Date
            lat: number
            lon: number
            bp: number
            isForecast: boolean
        } | null = null
        /** 台风预报路径的index */
        let firstForecastTyPathIndex = this.customerTyCMAList.findIndex((temp) => {
            return temp.isForecast === true
        })
        const tyForecastPathList = this.customerTyCMAList.filter((v) => {
            return v.isForecast === true
        })
        const newTyRealPathList: {
            forecastDt: Date
            lat: number
            lon: number
            bp: number
            isForecast: boolean
        }[] = []
        // 3- 取出之前的台风实况路径
        let tyRealPathList = this.customerTyCMAList.filter((item) => {
            return item.isForecast === false
        })
        // 22-06-20 由于可能会出现最后一个实况的预报路径为[]的情况
        // 若最后一个实况路径不包含预报路径则默认将 firstForecastTyPathIndex 设置为 customerTyCMAList 数组长度
        firstForecastTyPathIndex =
            firstForecastTyPathIndex >= 0
                ? firstForecastTyPathIndex
                : this.customerTyCMAList.length - 1
        if (firstForecastTyPathIndex >= 0) {
            firstForecastTyPath = this.customerTyCMAList[firstForecastTyPathIndex]

            // 3-2 获取可以被 diffHours 整除的 实况路径列表
            const diffHours = 6 * 1000 * 60 * 60
            tyRealPathList = tyRealPathList.sort((a, b) => {
                return b.forecastDt.getTime() - a.forecastDt.getTime()
            })

            for (let index = 0; index < tyRealPathList.length; index++) {
                if (
                    (tyRealPathList[index].forecastDt.getTime() -
                        firstForecastTyPath.forecastDt.getTime()) %
                        diffHours ===
                    0
                ) {
                    if (tyRealPathList[index]) {
                        newTyRealPathList.push(tyRealPathList[index])
                    }
                }
            }
        }
        // 3-3 将实况列表+预报路径列表拼接
        const mergeTyPathList = [...tyForecastPathList, ...newTyRealPathList]
        if (desc) {
            mergeTyPathList.sort((a, b) => {
                return a.forecastDt.getTime() - b.forecastDt.getTime()
            })
        }
        this.customerTyCMAList = []
        this.customerTyCMAList = mergeTyPathList
    }

    @Getter(GET_CREATE_FORM, { namespace: 'map' }) getIsShowForm

    @Watch('getIsShowForm')
    onIsShowForm(isShow: boolean): void {
        // console.log(`监听到vuex -> map -> is_show:${isShow}`)
        this.isShow = isShow
    }

    @Watch('customerTyCMAList')
    onCustomerTyCMAList(
        val: {
            forecastDt: Date
            lat: number
            lon: number
            bp: number
            isForecast: boolean
            // radius: number
        }[]
    ): void {
        this.setTyphoonPathList(val)
    }

    get getDeviationRadiusNum(): number {
        return this.deviationRadiusNumberList.length
    }

    // + 21-09-15 提交当前页面中的信息
    commit(): void {
        const that = this
        const postData = {
            ty_code: this.tyCode,
            is_customer_ty: this.isCustomerTy,
            customer_ty_cma_list: this.customerTyCMAList,
            max_wind_radius_diff: this.maxWindRadiusDiff,
            members_num: this.membersNum,
            deviation_radius_list: this.deviationRadiusNumberList,
            forecast_area: this.selectForecastAreaVal
        }
        if (!checkCustomerTyList(this.customerTyCMAList)) {
            this.$confirm('提交的起止时间间隔需要在120小时内')
            return
        }
        this.$confirm('请确认是否要提交计算作业, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
            .then(() => {
                createTyCase(postData).then(
                    (res: { data: { ty_code: string; timestamp: string }; status: number }) => {
                        if (res.status === 200) {
                            // TODO:[-] 21-12-01 注意此处修改了后台逻辑，会返回 task_id
                            this.$message('提交成功')

                            const tyCode = res.data.ty_code
                            const timestamp = res.data.timestamp
                            // TODO:[*] 21-12-02 由于提交作业后作业可能会等待或运行一段时间
                            // getTargetTyCase(tyCode, timestamp).then((res: { data: { id: number } }) => {
                            //     const tyId = res.data.id
                            //     that.selectCoverageId(tyId)
                            // })
                            // console.log(res.data)
                        } else {
                            this.$message.error('创建作业错误！')
                        }
                    }
                )
                this.$message({
                    type: 'success',
                    message: '作业提交成功!'
                })
                this.isShow = false
            })
            .catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消提交!'
                })
                this.isShow = false
            })
    }

    @Mutation(SET_GEO_COVERAGEID, { namespace: 'geo' }) selectCoverageId

    // + 22-04-07 设置当前台风路径
    @Mutation(SET_TYPHOON_PATH_LIST, { namespace: 'typhoon' }) setTyphoonPathList

    // 在 customerTyCMAList 后面追加数组中的最后一个对象
    addCustomerTyCMA(): void {
        // console.log(this.customerTyCMAList)
        const tempCustomerTyCMA = { ...this.customerTyCMAList[this.customerTyCMAList.length - 1] }
        this.customerTyCMAList.push(tempCustomerTyCMA)
    }

    // 在 customerTyCMAList 中取出最后一组对象
    deleteCustomerTyCMA(index: number): void {
        this.customerTyCMAList.splice(index, 1)
    }
}
</script>
<style scoped lang="less">
@import '../../styles/my-elementui/common';
#base_form_createcase {
    // background: white;f
    // padding: 15px;
    // form 四个角圆角
    border-radius: 1.25rem;
    // 解决加入了圆角但导致子元素溢出的问题
    overflow: hidden;
    // 加入阴影
    box-shadow: 7px 8px 10px 1px #323134;
    width: 600px;
    // visibility: visible;
    position: absolute;
    top: 25%;
    right: 30%; // TODO:[-] 22-02-03 注意由于加入了拖拽操作，拖拽目前是修改 right的pixel，所以将默认的left->right
    z-index: 999;
    .base-card {
        // padding: 10px;
    }
    .base-card-title {
        padding: 15px;
        background: #34495eb0;
        backdrop-filter: blur(4px);
        color: white;
        user-select: none;
    }
    .base-card-content {
        // ---
        padding: 15px;
        font-size: larger;
        font-weight: 500;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background: white;
        max-height: 300px; // 设置最大高度，剩余部分滚动显示
        overflow-y: scroll;
        .base-card-row {
            line-height: 2.5rem;
        }
    }
    // 底部 footer
    .form-footer {
        padding: 10px 20px 20px;
        text-align: right;
        background: #327f7785;
        backdrop-filter: blur(4px);
    }
}
.base-card-row {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    // margin-bottom: 15px;
    .cell {
        display: flex;
        margin: 5px;
    }
    .cell > p {
        margin-right: 8px;
    }
}
.row-flex-space-around {
    justify-content: space-around;
}
.row-flex-end {
    justify-content: flex-end;
}
// TODO:[*] 22-02-12 新加入的表头样式
.base-card {
    .base-row-table {
        display: flex;
        width: 100%;
        div {
            display: flex;
            margin-right: 10px;
            width: 85px;
        }
        div:nth-child(1) {
            width: 50px;
        }
        div:nth-child(2) {
            width: 190px;
        }
        // div:nth-child(2) {
        //     width: 85px;
        // }
    }
}

.base-card-row.tiled.mini {
    align-items: center;
    padding: 2px;
    .el-input {
        width: 16%;
        margin-right: 2px;
    }
    .el-date-editor {
        width: 190px;
    }
}
.base-card-row.tiled {
    .el-input {
        width: 30%;
    }
}
#ty_form_create-title {
    align-items: center;
    p {
    }
}
#ty_form_create_info {
    // 编辑行的 第一行加入一个 顶部的 border 边框
    border-top: 5px solid transparent;
    border-radius: 15px 0 15px 0;
    border-image: linear-gradient(#f80, #2ed) 20 20;
    padding-top: 10px;
    .base-card-row:nth-child(2) {
    }
}
.overflowable {
    // + 21-07-10 加入y轴滚动条
    overflow-y: scroll;
}
.advanced-card {
    // + 21-07-10 对于下面的内容设置固定高度
    max-height: 400px;
}
// + 21-07-10 对于可点击的 加入 手型图标
.clickable {
    cursor: pointer;
}
</style>
