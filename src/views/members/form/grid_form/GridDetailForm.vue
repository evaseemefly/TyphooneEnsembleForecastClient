<template>
    <div>
        <!-- TODO:[-] 20-05-19 将 el-dialog 封装至组件中 -->
        <el-dialog
            title="创建作业"
            :visible.sync="isCaseDialogVisible"
            width="45%"
            :before-close="handleClose"
        >
            <GridDetailChart ref="oil"></GridDetailChart>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isCaseDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import GridDetailChart from '@/views/members/charts/GridDetailCharts.vue'
@Component({ components: { GridDetailChart } })
export default class GridDetailForm extends Vue {
    mydata: any = null
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
.el-dialog__body {
    background: #34495e !important;
    color: #ffffff !important;
    .el-tabs__item .is-active {
        color: aqua !important;
    }
    .el-tabs__item {
        color: #ffffff !important;
    }
}
</style>
