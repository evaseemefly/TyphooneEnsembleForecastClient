<template>
    <div id="base_form_createcase" v-drag style="visibility: hidden;">
        <div class="base-card">
            <div class="base-card-title"><h4>台风信息</h4></div>
            <div class="base-card-content">
                <!-- <div class="base-card-row"> -->
                <!-- <el-select v-model="value" placeholder="请选择">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select> -->
                <!-- <el-select v-model="tyCode" clearable placeholder="请选择">
                        <el-option
                            v-for="item in tyCodeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select> -->
                <!-- </div> -->
                <div class="base-card-row tiled" id="ty_form_create-title">
                    <p>台风编号</p>
                    <el-input v-model="tyCode" value="number" placeholder="台风编号"></el-input>
                    <el-switch
                        v-model="isCustomerTy"
                        active-text="自定义台风"
                        inactive-text="中央台"
                    >
                    </el-switch>
                </div>
                <el-collapse-transition>
                    <div class="base-card-row" id="ty_form_create_info" v-show="isCustomerTy">
                        <div
                            class="base-card-row tiled mini"
                            v-for="item in customerTyCMAList"
                            :key="item.key"
                        >
                            <i class="el-icon-circle-plus" @click="addCustomerTyCMA"></i>
                            <i class="el-icon-delete" @click="deleteCustomerTyCMA"></i>
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
                    <div class="base-card-row">
                        成员数量
                        <el-input-number
                            v-model="membersNum"
                            :min="1"
                            label="描述文字"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row">
                        大风半径增减值
                        <el-input-number
                            v-model="maxWindRadiusDiff"
                            :min="0"
                            label="描述文字"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row">
                        误差半径成员
                        <el-input-number
                            v-model="deviationRadiusNum"
                            :min="deviationRadiusLenMin"
                            :max="deviationRadiusLenMax"
                            label="描述文字"
                            @change="deviationChange"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row">
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
import { Draggable } from '@/directives/drag'
import { createTyCase } from '@/api/task'
// STORE 常量
import { GET_CREATE_FORM } from '@/store/types'
@Component({
    directives: {
        drag: Draggable
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
        { hours: 96, radius: 150 }
    ]
    customerTyCMAList: {
        forecastDt: Date
        lat: number
        lon: number
        bp: number
        // radius: number
    }[] = [
        { forecastDt: new Date(2021, 8, 4, 14), lon: 115.7, lat: 21.5, bp: 990 },
        { forecastDt: new Date(2021, 8, 4, 20), lon: 116.3, lat: 22.0, bp: 988 },
        { forecastDt: new Date(2021, 8, 5, 8), lon: 116.8, lat: 22.6, bp: 985 },
        { forecastDt: new Date(2021, 8, 5, 14), lon: 117.0, lat: 23.0, bp: 980 },
        { forecastDt: new Date(2021, 8, 5, 20), lon: 117.0, lat: 23.5, bp: 985 },
        { forecastDt: new Date(2021, 8, 6, 2), lon: 116.9, lat: 24.1, bp: 989 },
        { forecastDt: new Date(2021, 8, 6, 8), lon: 116.9, lat: 24.5, bp: 990 },
        { forecastDt: new Date(2021, 8, 6, 14), lon: 116.9, lat: 24.7, bp: 991 },
        { forecastDt: new Date(2021, 8, 6, 20), lon: 117.0, lat: 24.8, bp: 992 },
        { forecastDt: new Date(2021, 8, 7, 2), lon: 117.3, lat: 25.0, bp: 992 }
    ]
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
        console.log(`new:${num},old:${oldNum}`)
    }

    @Watch('isShow')
    onIsShow(val: boolean): void {
        // this.isClosed = !this.isShow
        this.toShow(val)
    }

    // @Watch('isClosed')
    // onIsClosed(val: boolean): void {
    //     this.toShow(!val)
    // }

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

    @Getter(GET_CREATE_FORM, { namespace: 'map' }) getIsShowForm

    @Watch('getIsShowForm')
    onIsShowForm(isShow: boolean): void {
        console.log(`监听到vuex -> map -> is_show:${isShow}`)
        this.isShow = isShow
    }

    get getDeviationRadiusNum(): number {
        return this.deviationRadiusNumberList.length
    }

    // + 21-09-15 提交当前页面中的信息
    commit(): void {
        const postData = {
            ty_code: this.tyCode,
            is_customer_ty: this.isCustomerTy,
            customer_ty_cma_list: this.customerTyCMAList,
            max_wind_radius_diff: this.maxWindRadiusDiff,
            members_num: this.membersNum,
            deviation_radius_list: this.deviationRadiusNumberList
        }
        createTyCase(postData).then((res) => {
            if (res.status === 200) {
                console.log(res.data)
            }
        })
    }

    // 在 customerTyCMAList 后面追加数组中的最后一个对象
    addCustomerTyCMA(): void {
        console.log(this.customerTyCMAList)
        const tempCustomerTyCMA = { ...this.customerTyCMAList[this.customerTyCMAList.length - 1] }
        this.customerTyCMAList.push(tempCustomerTyCMA)
    }

    // 在 customerTyCMAList 中取出最后一组对象
    deleteCustomerTyCMA(): void {
        const popCMA = this.customerTyCMAList.pop()
        console.log(popCMA)
    }
}
</script>
<style scoped lang="less">
#base_form_createcase {
    // background: white;
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
    left: 30%;
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
            justify-content: space-around;
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

.base-card-row.tiled.mini {
    align-items: center;
    padding: 2px;
    .el-input {
        width: 16%;
        margin-right: 2px;
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
