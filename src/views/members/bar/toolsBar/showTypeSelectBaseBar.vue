<template>
    <div></div>
</template>
<script lang="ts">
// TODO:[-] 20-11-11 将之前的 显示类型选择 提取出来
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapMutations } from 'vuex'
import { Mutation, namespace } from 'vuex-class'
import { IExpandModel, ToolTypeEnum } from './types'
import { LayerTypeEnum } from '@/enum/map'
import { ToolBarOptionsEnum } from '@/enum/options'
@Component({})
export default class OilShowTypeSelectBar extends Vue {
    mydata: any = null
    optionsShowTypes: { value: string; label: string; key: number }[] = []
    valueShowTypes = ToolBarOptionsEnum.SCATTER

    // 当前组件的 toolsBar 对象数组
    toolsShowTypeBar: IExpandModel[] = [
        // {
        //     isExpanded: false,
        //     html: '',
        //     iconClass: 'fas fa-desktop',
        //     title: '显示模式',
        //     hasChildren: true,
        //     isChildren: false,
        //     toolType: ToolTypeEnum.OPTION,
        //     val: '',
        //     checked: false,
        //     children: [
        //         {
        //             isExpanded: false,
        //             html: '',
        //             iconClass: 'fas fa-braille',
        //             title: '散点',
        //             hasChildren: false,
        //             isChildren: true,
        //             toolType: ToolTypeEnum.SHOWTYPEOPTION,
        //             optionsType: ToolBarOptionsEnum.SCATTER,
        //             val: '',
        //             checked: true,
        //             isRadio: true
        //         },
        //         {
        //             isExpanded: false,
        //             html: '',
        //             iconClass: 'fas fa-thermometer-half',
        //             title: '热图',
        //             hasChildren: false,
        //             isChildren: true,
        //             toolType: ToolTypeEnum.SHOWTYPEOPTION,
        //             optionsType: ToolBarOptionsEnum.HEATMAP,
        //             val: '',
        //             checked: false,
        //             isRadio: true
        //         }
        //     ]
        // }
    ]
    mounted() {}

    handleOption(val?: ToolBarOptionsEnum): void {
        if (val !== undefined) {
            this.setType(val)
        }
    }
    setType(val: number): void {
        this.setShowType({ data: val })
    }

    @Mutation('setShowType', { namespace: 'oil' }) setShowType

    @Watch('toolsBarBase')
    onToolBarBase(valNew: IExpandModel, valOld: IExpandModel) {
        console.log(`toolsBarBase发生了改变new:${valNew}|old:${valOld}`)
    }
}
</script>
<style scoped></style>
