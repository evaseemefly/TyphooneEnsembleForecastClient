<template>
    <div id="base_form_createcast" style="visibility: hidden;">
        <div class="base-card">
            <div class="base-card-title"><h4>台风信息</h4></div>
            <div class="base-card-content">
                <div class="base-card-row">
                    <p>台风编号</p>
                    <el-select v-model="value" placeholder="请选择">
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
            <div class="base-card-title"><h4>高级</h4></div>
            <div class="base-card-content">
                <div class="base-card-row">成员数量</div>
                <div class="base-card-row">误差半径增减</div>
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
    value = ''
    @Prop()
    isShow: boolean
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
    z-index: 9999;
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
        }
    }
}
.base-card-row {
    display: flex;
}
</style>
