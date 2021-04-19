<template>
    <div></div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapMutations } from 'vuex'
import { Mutation, namespace } from 'vuex-class'

// const oilModule = namespace("oilStore");

// 引入常量
import { optionsFactors, optionsShowTypes } from '@/const/Oil'
import { ToolBarOptionsEnum } from '@/enum/options'
import { IExpandModel, ToolTypeEnum } from './types'

@Component({})
export default class FactorSelectBaseBar extends Vue {
    optionsFactors: { value: string; label: string; key: number }[] = []
    // 默认值
    valueFactors = 0
    optionsShowTypes: { value: string; label: string; key: number }[] = []
    valueShowTypes = ToolBarOptionsEnum.SCATTER

    toolsFactorBar: IExpandModel[] = [
        {
            isExpanded: false,
            html: '',
            iconClass: 'fas fa-vial',
            title: '权重',
            hasChildren: true,
            isChildren: false,
            toolType: ToolTypeEnum.OPTION,
            val: '',
            checked: false,
            children: [
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-weight',
                    title: '油膜厚度',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.OILFACTOR,
                    optionsType: ToolBarOptionsEnum.THICKNESS,
                    val: '',
                    checked: true,
                    isRadio: true
                },
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-flask',
                    title: '油膜质量',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.OILFACTOR,
                    optionsType: ToolBarOptionsEnum.MASS,
                    val: '',
                    checked: false,
                    isRadio: true
                }
            ]
        }
    ]

    // TODO:[*] 19-11-08
    /* error：
  [vuex] unknown mutation type: setShowFactor
  */
    // @oilModule.Mutation("setShowFactor") mutationShowFactor;
    @Mutation('setShowFactor', { namespace: 'oil' }) setShowFactor
    // @Mutation setShowFactor: any;

    @Mutation('setShowType', { namespace: 'oil' }) setShowType

    mounted() {
        const myself = this
        console.log('select 加载成功')
        this.optionsFactors = optionsFactors
        // this.mutationShowFactor({ data: myself.optionsFactors });
        this.optionsShowTypes = optionsShowTypes
        this.setType(this.valueShowTypes)
        this.setFactor(this.valueFactors)
    }

    setType(val: number): void {
        console.log(`选中显示模式${val}`)
        this.setShowType({ data: val })
    }

    setFactor(val: number): void {
        console.log(`选中权重${val}`)
        this.setShowFactor({ data: val })
    }
    // ...mapMutations(['getShowFactor','getShowType'])
    get computedTest() {
        return null
    }
}
</script>
<style lang="less" scoped></style>
