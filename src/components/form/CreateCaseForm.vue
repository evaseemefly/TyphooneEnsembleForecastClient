<template>
    <div id="base_form_createcast" style="visibility: hidden;">
        <div class="base-card">
            <div class="base-card-title"><h4>台风信息</h4></div>
            <div class="base-card-content">
                <div class="base-card-row"><p>台风编号</p></div>
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
    mydata: any = null
    @Prop()
    isShow: boolean
    get computedTest() {
        return null
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
    box-shadow: 7px 8px 10px 1px #888888;
    width: 600px;
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
        font-size: large;
        .base-card-row {
            line-height: 2.5rem;
        }
    }
}
</style>
