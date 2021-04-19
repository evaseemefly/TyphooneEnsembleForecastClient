<template>
    <div id="oil_factor_select">
        <!-- <h1>模式切换</h1> -->
        <div class="show">
            <div class="row">
                <!-- <span>显示模式</span> -->
                <el-select v-model="valueShowTypes" placeholder="请选择" @change="setType">
                    <el-option
                        v-for="item in optionsShowTypes"
                        :key="item.key"
                        :label="item.label"
                        :value="item.key"
                    ></el-option>
                </el-select>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapMutations } from 'vuex'
import { Mutation, namespace } from 'vuex-class'
// 引入常量
import { optionsFactors, optionsShowTypes } from '@/const/Oil'
// 引入枚举
import { ToolBarOptionsEnum } from '@/enum/options'
@Component({})
export default class OilShowTypeSelect extends Vue {
    optionsShowTypes: { value: string; label: string; key: number }[] = []
    valueShowTypes = ToolBarOptionsEnum.SCATTER

    @Mutation('setShowType', { namespace: 'oil' }) setShowType

    mounted() {
        this.optionsShowTypes = optionsShowTypes
        this.setType(this.valueShowTypes)
    }

    setType(val: number): void {
        this.setShowType({ data: val })
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/base';
#oil_factor_select {
    display: flex;
    flex-direction: column;
    width: 150px;
}

#oil_factor_select .show {
    .show {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 2;
        width: 30%;
        background: #99a9bf;
    }
}
.row {
    //   background: #d3dce6;
    /* margin-bottom: 20px; */
    display: flex;
    align-items: center;
    justify-content: center;
    // padding-left: 30px;
    // margin: 0px;
    // @formmargin();
    margin: 0.7em;
}
.el-select {
    // width: 60%;
    box-shadow: 0 0 4px black;
}
.el-col {
    border-radius: 4px;
}
.bg-purple-dark {
    background: #99a9bf;
}
.bg-purple {
    background: #d3dce6;
}
.bg-purple-light {
    background: #e5e9f2;
}
.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
.row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
}
</style>
