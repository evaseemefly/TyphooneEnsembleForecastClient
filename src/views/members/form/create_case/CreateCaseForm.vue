<template>
    <div>
        <!-- TODO:[-] 20-05-19 将 el-dialog 封装至组件中 -->
        <el-dialog
            title="创建作业"
            :visible.sync="isCaseDialogVisible"
            width="45%"
            :before-close="handleClose"
        >
            <el-tabs v-model="activeTemp" @tab-click="handleClick">
                <!-- TODO:[*] 19-11-21 加入了左侧的tab，右侧放现在的溢油的form表单 -->
                <!-- 左侧的tab包含 
                    [x] 1- 搜救信息参数
                    [ ] 2- 模型参数-->
                <el-tab-pane label="搜救case" name="OIL">
                    <CreateRescueCaseForm></CreateRescueCaseForm>
                </el-tab-pane>
                <el-tab-pane label="溢油case" name="RESCUE">
                    <CreateOilCaseForm ref="oil"></CreateOilCaseForm>
                </el-tab-pane>
            </el-tabs>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isCaseDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
// import CreateOilCase from '@/views/members/form/CreateOilCaseForm.vue'
import OilCaseInfoForm from '@/views/members/form/create_case/case_child/oil/CreateOilCaseInfoForm.vue'
import OilCaseModelForm from '@/views/members/form/create_case/case_child/oil/CreateOilCaseModelForm.vue'
import CreateRescueCaseForm from '@/views/members/form/create_case/case_child/rescue/CreateRescueCaseForm.vue'
import CreateOilCaseForm from '@/views/members/form/create_case/case_child/oil/CreateOilCaseForm.vue'

import { createCaseInfo, createOilCase } from '@/api/case'
import { CaseTypeEnum } from '@/enum/case'
// STORE 常量
import { GET_CREATE_OIL_CASE_MODAL } from '@/store/types'

@Component({
    components: {
        // CreateOilCase,
        OilCaseInfoForm,
        OilCaseModelForm,
        CreateRescueCaseForm,
        CreateOilCaseForm
    }
})
export default class CreatedCaseForm extends Vue {
    mydata: any = null
    activeTemp = 'oil'
    form: any = {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
    }
    isCaseDialogVisible = false
    @Prop(Boolean)
    // dialogVisible = false
    // 失事类型
    optionWreckType: [
        {
            value: 'a'
            label: 'xx_1'
        }
    ]
    labelPosition: 'right'
    radius = 0
    nums = 100
    mounted() {}
    handleClick(tab: { name: string }, event) {
        // index: "0" label: "搜救case" name: "OIL"
        // TODO:[-] 20-02-17 el-tab-pane 的name与 /enum/case.ts CaseTypeEnum对应！
        const caseName = tab.name
        const productType = CaseTypeEnum[caseName]
        // const productType = CaseTypeEnum.OIL
        // CaseTypeEnum[caseName]
        this.$store.dispatch('common/setProductType', productType)
        // this.$store.commit('common/SET_PRODUCT_TYPE', productType)
        // console.log(tab, event)

        // this.$store.getters('common/productType')
        console.log(this.$store.getters['common/productType'])
    }
    handleClose(done: any) {
        this.$confirm('确认关闭')
            .then((_) => {
                done()
            })
            .catch((_) => {})
    }
    submit() {
        // TODO:[-] 20-02-16 获取嵌套组件中的data
        // const formInfo: any = this.$refs.caseForm.$refs.oil.$refs.infoForm.form
        // const formModel: any = this.$refs.caseForm.$refs.oil.$refs.modelForm.form
        const formInfo: any = this.$refs.oil.$refs.infoForm.form
        const formModel: any = this.$refs.oil.$refs.modelForm.form
        const submitForm = { ...formInfo, ...formModel }
        console.log(submitForm)
        // createCaseInfo(,submitForm)
        // TODO:[*] 20-05-19 完成提交操作
        createOilCase(submitForm)
    }
    @Getter(GET_CREATE_OIL_CASE_MODAL, { namespace: 'map' }) getIsShowOilCaseModal
    @Watch('getIsShowOilCaseModal')
    onIsShowOilCaseModal(isShow: boolean): void {
        console.log(`监听到vuex -> map -> is_show:${isShow}`)
        this.isCaseDialogVisible = isShow
    }
}
</script>
<style lang="less">
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
label {
    color: #ffffff !important;
}
// .el-dialog__body >>> .el-form-item__label {
//     color: #ffffff !important;
// }
</style>
