<template>
    <div id="switch-base-map">
        <font>底图切换</font>
        <!-- <el-switch
            style="display: block"
            v-model="isLocalMap"
            active-color="#16a085"
            inactive-color="#f39c12"
            active-text="卫星底图"
            inactive-text="简略底图"
        >
        </el-switch> -->
        <div class="card-list-bar">
            <div
                class="card-info "
                :class="[layer.isActive ? 'my-sub' : '', getBaseMapType(layer)]"
                :key="layer.code"
                @click="setBaseMapType(layer)"
                v-for="layer in showLayers"
            >
                {{ layer.desc }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
// + 21-08-23 加入的切换底图的 switch bar
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { MapLayerEnum } from '@/enum/common'
@Component({})
export default class SwitchBaseMap extends Vue {
    mydata: any = null
    isLocalMap = false
    showLayers: { code: number; name: string; val: string; desc: string; isActive: boolean }[] = [
        {
            code: MapLayerEnum.SATELITE_MAP,
            name: '卫星底图',
            val: '卫星底图',
            desc: '卫星底图',
            isActive: false
        },
        {
            code: MapLayerEnum.SIMPLE_MAP,
            name: '简略底图',
            val: '简略底图',
            desc: '简略底图',
            isActive: false
        }
    ]
    baseMapType: MapLayerEnum = MapLayerEnum.SIMPLE_MAP
    getBaseMapType(area: { code: number }): string {
        if (this.showLayers.length > 0) {
            return 'my-primary'
        }
        return ''
    }
    setBaseMapType(val: {
        code: number
        name: string
        val: string
        desc: string
        isActive: boolean
    }): void {
        this.baseMapType = val.code
        this.showLayers.map((temp) => {
            if (temp.code === val.code) {
                temp.isActive = !temp.isActive
            } else {
                temp.isActive = false
            }
        })
    }
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
@import '../../styles/common/card';
#switch-base-map {
    margin: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font {
        font-size: 20px;
        color: white;
        text-shadow: 0 0 4px black;
    }
    .el-switch {
        margin-left: 15px;
    }
}
</style>
