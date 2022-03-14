<!--
* 注意在子组件继承父组件中，子组件只修改 script , template 与 style 不需要加入否则会覆盖
*
-->
<script lang="ts">
// --
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import IBaseOptionsCard from '@/components/card/BaseOptionsCard.vue'
import { GroupPathLayerOptEnum } from '@/enum/layersOpt/LayersOpt'
// -- store
import { SET_TY_GROUP_PATH_LATERS_OPTS } from '@/store/types'
@Component({})
export default class TyphoonOptionsCard extends IBaseOptionsCard {
    optionItems: {
        cardTitle: string
        options: { title: string; key: number; val: string; checked: boolean }[]
    } = {
        cardTitle: '台风集合路径配置项',
        options: [
            {
                title: '台风中心路径',
                key: GroupPathLayerOptEnum.CENTER_PATH_LAYER,
                val: 'opt1',
                checked: true
            },
            // {
            //     title: '集合路径',
            //     key: GroupPathLayerOptEnum.GROUP_PATH_LAYER,
            //     val: 'opt2',
            //     checked: false
            // },
            {
                title: '集合路径外轮廓',
                key: GroupPathLayerOptEnum.OUTLINE_POLYGON_LAYER,
                val: 'opt3',
                checked: true
            },
            // {
            //     title: '终点的中心概率圆',
            //     key: GroupPathLayerOptEnum.LAST_CENTER_CIRCLE_LAYER,
            //     val: 'opt3',
            //     checked: false
            // },
            // {
            //     title: '台风的当前大风半径',
            //     key: GroupPathLayerOptEnum.TY_CIRCLE_LAYER,
            //     val: 'opt3',
            //     checked: false
            // },
            {
                title: '台风实时信息框',
                key: GroupPathLayerOptEnum.TY_REAL_DATA_FORM,
                val: 'opt4',
                checked: false
            }
        ]
    }
    mounted() {}

    get getOptionVals(): number[] {
        const children = this.optionItems.options.filter((child) => {
            return child.checked === true
        })
        const keys = []
        if (children.length > 0) {
            children.forEach((child) => {
                if (child != undefined) {
                    keys.push(child.key)
                }
            })
        }
        return keys
    }

    @Watch('getOptionVals')
    onOptionVals(vals: number[]): void {
        console.log(`监听到optionsvals:${vals}`)
        this.setTyGroupPathLayersOpts(vals)
    }

    @Mutation(SET_TY_GROUP_PATH_LATERS_OPTS, { namespace: 'opts' }) setTyGroupPathLayersOpts
}
</script>
