<template>
    <el-tooltip class="item" effect="dark" content="切换为栅格或等值面图层" placement="top-start">
        <div id="switch-base-map">
            <font>增水场显示切换</font>
            <div class="card-list-bar">
                <div
                    class="card-info "
                    :key="layer.code"
                    :class="[layer.isActive ? 'my-sub' : '', getbaseRasterLayerType(layer)]"
                    @click="setbaseRasterLayerType(layer)"
                    v-for="layer in showLayers"
                >
                    <i :class="layer.iconCls"></i>
                </div>
            </div>
        </div>
    </el-tooltip>
</template>
<script lang="ts">
// + 21-08-23 加入的切换底图的 switch bar
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace, Getter } from 'vuex-class'
import { RasterLayerEnum } from '@/enum/map'
import { SET_RASTER_LAYER_KEY } from '@/store/types'
@Component({})
export default class SwitchRasterLayer extends Vue {
    mydata: any = null
    isLocalMap = false
    showLayers: {
        code: number
        name: string
        val: string
        desc: string
        isActive: boolean
        iconCls: string
    }[] = [
        {
            code: RasterLayerEnum.RASTER_LAYER,
            name: '栅格图层',
            val: 'raster',
            desc: '栅格图层',
            isActive: false,
            iconCls: 'fas fa-th'
        },
        {
            code: RasterLayerEnum.ISOSURFACE_LAYER,
            name: '等值面',
            val: 'isosurface',
            desc: '等值面',
            isActive: true,
            iconCls: 'fas fa-bacon'
        }
    ]
    /** 默认栅格图层 */
    baseRasterLayerType: RasterLayerEnum = RasterLayerEnum.ISOSURFACE_LAYER
    getbaseRasterLayerType(area: { code: number }): string {
        if (this.showLayers.length > 0) {
            return 'my-primary'
        }
        return ''
    }

    /** 设置当前栅格图层 */
    setbaseRasterLayerType(val: {
        code: number
        name: string
        val: string
        desc: string
        isActive: boolean
    }): void {
        this.baseRasterLayerType = val.code
        this.setRasterLayerKey(this.baseRasterLayerType)
        this.showLayers.map((temp) => {
            if (temp.code === val.code) {
                temp.isActive = !temp.isActive
            } else {
                temp.isActive = false
            }
        })
    }

    @Mutation(SET_RASTER_LAYER_KEY, { namespace: 'map' }) setRasterLayerKey
}
</script>
<style scoped lang="less">
@import '../../styles/common/card';
#switch-base-map {
    margin: 2px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    .card-list-bar {
        width: 200px;
    }
    font {
        font-size: 14px;
        color: white;
        text-shadow: 0 0 4px black;
    }
    .el-switch {
        margin-left: 15px;
    }
}
</style>
