<template>
    <div id="base_form_createcast" v-drag style="visibility: hidden;">
        <div class="base-card">
            <div class="base-card-title"><h4>台风信息</h4></div>
            <div class="base-card-content">
                <div class="base-card-row">
                    <p>台风编号</p>
                    <!-- <el-select v-model="value" placeholder="请选择">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select> -->
                    <el-select v-model="tyCode" clearable placeholder="请选择">
                        <el-option
                            v-for="item in tyCodeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                    <!-- <el-select placeholder="请选择" v-model="form.oilType">
                        <el-option
                            v-for="item in optionOilType"
                            :key="item.key"
                            :label="item.name"
                            :value="item.key"
                        ></el-option>
                    </el-select> -->
                </div>
            </div>
        </div>
        <div class="base-card">
            <div class="base-card-title">
                <h4>预报区域</h4>
            </div>
            <div class="base-card-content">
                <div class="base-card-row">
                    西北
                    <el-input
                        v-model="forecastScope.nw"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                    东北
                    <el-input
                        v-model="forecastScope.ne"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                </div>
                <div class="base-card-row">
                    西南
                    <el-input
                        v-model="forecastScope.sw"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                    东南
                    <el-input
                        v-model="forecastScope.se"
                        placeholder="请输入内容"
                        style="width:30%"
                    ></el-input>
                </div>
            </div>
        </div>
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
                        误差半径增减
                        <el-input-number
                            v-model="deviationRadiusNum"
                            :min="deviationRadiusLenMin"
                            :max="deviationRadiusLenMax"
                            label="描述文字"
                            @change="deviationChange"
                        ></el-input-number>
                    </div>
                    <div class="base-card-row">
                        <div class="cell" :key="item.key" v-for="item in deviationRadiusList">
                            <p>{{ item.hours }}h</p>
                            <el-input v-model="item.radius" placeholder="请输入内容"></el-input>
                        </div>
                    </div>
                </div>
            </el-collapse-transition>
        </div>
        <div class="form-footer">
            <button type="button" class="el-button el-button--default" @click="isClosed = false">
                取消
            </button>
            <button type="button" class="el-button el-button--primary">确定</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Draggable } from '@/directives/drag'
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
    deviationRadiusList: { hours: number; radius: number }[] = [
        { hours: 24, radius: 60 },
        { hours: 48, radius: 100 },
        { hours: 72, radius: 120 },
        { hours: 96, radius: 150 }
    ]
    deviationRadiusLenMin = 4
    deviationRadiusLenMax = 8
    tyCode = ''
    membersNum = 0
    deviationRadiusNum = 4
    isShowAdvancedCard = false // + 21-07-10 是否显示高级选项
    // + 21-07-10 预报范围(西北，东北，西南，东南)
    forecastScope: { nw: number; ne: number; sw: number; se: number } = {
        nw: 0,
        ne: 0,
        sw: 0,
        se: 0
    }
    @Prop()
    isShow: boolean

    // toClose = false
    isClosed = true

    mounted() {
        this.isClosed = !this.isShow
    }

    deviationChange(num: number, oldNum: number): void {
        const hoursInterval = 24
        const radiusInterval = 30
        const lastDeviation = this.deviationRadiusList.slice(-1)[0]
        if (num > oldNum) {
            // +
            if (this.deviationRadiusList.length <= this.deviationRadiusLenMax - 1) {
                const newDeviationHours = lastDeviation.hours + hoursInterval
                const newDeviationRadius = lastDeviation.radius + radiusInterval
                const newDeviation = { hours: newDeviationHours, radius: newDeviationRadius }
                this.deviationRadiusList.push(newDeviation)
                console.log(newDeviation)
            }
        } else if (num < oldNum) {
            if (this.deviationRadiusList.length > this.deviationRadiusLenMin) {
                this.deviationRadiusList.pop()
            }
        }
        console.log(`new:${num},old:${oldNum}`)
    }

    @Watch('isShow')
    onIsShow(val: boolean): void {
        this.isClosed = !this.isShow
        this.toShow(val)
    }

    @Watch('isClosed')
    onIsClosed(val: boolean): void {
        this.toShow(!val)
    }

    toShow(val: boolean): void {
        const divCreateForm = document.getElementById('base_form_createcast')
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

    get getDeviationRadiusNum(): number {
        return this.deviationRadiusList.length
    }
}
</script>
<style scoped lang="less">
#base_form_createcast {
    background: white;
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
        background: #34495e;
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
        .base-card-row {
            line-height: 2.5rem;
            justify-content: space-around;
        }
    }
    // 底部 footer
    .form-footer {
        padding: 10px 20px 20px;
        text-align: right;
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
