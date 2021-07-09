<template>
    <div id="base_form_createcast" style="visibility: hidden;">
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
                <h4>高级</h4>
            </div>
            <div class="base-card-content">
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
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({})
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
    tyCode = ''
    membersNum = 0
    deviationRadiusNum = 4
    @Prop()
    isShow: boolean

    deviationChange(num: number, oldNum: number): void {
        const hoursInterval = 24
        const radiusInterval = 30
        const lastDeviation = this.deviationRadiusList.slice(-1)[0]
        if (num > oldNum) {
            // +
            const newDeviationHours = lastDeviation.hours + hoursInterval
            const newDeviationRadius = lastDeviation.radius + radiusInterval
            const newDeviation = { hours: newDeviationHours, radius: newDeviationRadius }
            this.deviationRadiusList.push(newDeviation)
            console.log(newDeviation)
        } else if (num < oldNum) {
            if (this.deviationRadiusList.length > this.deviationRadiusLenMin) {
                this.deviationRadiusList.pop()
            }
        }
        console.log(`new:${num},old:${oldNum}`)
    }

    @Watch('isShow')
    onIsShow(val: boolean): void {
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
    top: 50%;
    left: 30%;
    z-index: 999;
    .base-card {
        // padding: 10px;
    }
    .base-card-title {
        padding: 15px;
        background: #34495e;
        color: white;
    }
    .base-card-content {
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
}
.base-card-row {
    display: flex;
    .cell {
        display: flex;
        margin: 5px;
    }
    .cell > p {
        margin-right: 8px;
    }
}
</style>
