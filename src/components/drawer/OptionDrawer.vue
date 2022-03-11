<template>
    <div>
        <el-drawer
            title="配置项"
            :visible.sync="drawer"
            :direction="direction"
            :before-close="handleClose"
        >
            <div class="drawer-content">
                <div class="options-drawer-card-root">
                    <TyphoonOptionsCard></TyphoonOptionsCard>
                </div>
            </div>
        </el-drawer>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import OptionsDrawerCard from '@/components/card/BaseOptionsCard.vue'
import TyphoonOptionsCard from '@/components/card/TyphoonOptionsCard.vue'
// 配置项抽屉
@Component({ components: { OptionsDrawerCard, TyphoonOptionsCard } })
export default class OptionsDrawer extends Vue {
    mydata: any = null
    drawer = false
    direction = 'ltr'
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
