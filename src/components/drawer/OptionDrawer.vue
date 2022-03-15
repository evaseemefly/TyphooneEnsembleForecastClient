<template>
    <div>
        <el-drawer
            title="配置项"
            :visible.sync="drawer"
            :direction="direction"
            :before-close="handleClose"
            :size="drawerSize"
        >
            <div class="drawer-content">
                <div class="options-drawer-card-root">
                    <TyphoonOptionsCard
                        :defaultOptionsItems="tyGroupDefaultOptions"
                    ></TyphoonOptionsCard>
                </div>
            </div>
        </el-drawer>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, namespace, Getter } from 'vuex-class'
import { GroupPathLayerOptEnum } from '@/enum/layersOpt/LayersOpt'
import OptionsDrawerCard from '@/components/card/BaseOptionsCard.vue'
import TyphoonOptionsCard from '@/components/card/TyphoonOptionsCard.vue'
// vuex 常量
import {
    GET_SHOW_OPTS_FORM,
    SET_SHOW_OPTS_FORM,
    SET_TY_GROUP_PATH_LATERS_OPTS
} from '@/store/types'
// 配置项抽屉
@Component({ components: { OptionsDrawerCard, TyphoonOptionsCard } })
export default class OptionsDrawer extends Vue {
    mydata: any = null
    drawer = false
    direction = 'ltr'
    drawerSize = '20%' // 设置抽屉的宽度

    tyGroupDefaultOptions: {
        cardTitle: string
        options: { title: string; key: number; val: string; checked: boolean }[]
    } = {
        cardTitle: '',
        options: [
            {
                title: '台风中心路径',
                key: GroupPathLayerOptEnum.CENTER_PATH_LAYER,
                val: 'opt1',
                checked: true
            },
            {
                title: '集合路径外轮廓',
                key: GroupPathLayerOptEnum.OUTLINE_POLYGON_LAYER,
                val: 'opt3',
                checked: true
            },
            {
                title: '台风实时信息框',
                key: GroupPathLayerOptEnum.TY_REAL_DATA_FORM,
                val: 'opt4',
                checked: false
            }
        ]
    }

    mounted() {
        // TODO:[-] 22-03-15 将 tyGroupDefaultOptions 同步至 store 中
        this.setTyGroupPathLayersOpts(this.getOptionVals)
    }

    get getOptionVals(): number[] {
        const children = this.tyGroupDefaultOptions.options.filter((child) => {
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

    @Getter(GET_SHOW_OPTS_FORM, { namespace: 'common' }) getShowOptsForm

    @Watch('getShowOptsForm')
    onIsShowOptsForm(val: boolean): void {
        this.drawer = val
    }

    // @Watch

    @Mutation(SET_SHOW_OPTS_FORM, { namespace: 'common' }) setShowOptsForm

    @Mutation(SET_TY_GROUP_PATH_LATERS_OPTS, { namespace: 'opts' }) setTyGroupPathLayersOpts
}
</script>
<style lang="less">
.el-drawer.ltr {
    background: #34495ee5;
    backdrop-filter: blur(4px);
}
.drawer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.options-drawer-card-root {
    width: 80%;
}
</style>
