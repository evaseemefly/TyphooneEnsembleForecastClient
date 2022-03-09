<template>
    <div>
        <el-drawer
            title="我是标题"
            :visible.sync="drawer"
            :direction="direction"
            :before-close="handleClose"
        >
            <span>我来啦!</span>
            <div class="drawer-content">
                <OptionsDrawerCard></OptionsDrawerCard>
            </div>
        </el-drawer>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import OptionsDrawerCard from '@/components/card/OptionsDrawerCard.vue'
// 配置项抽屉
@Component({ components: { OptionsDrawerCard } })
export default class OptionsDrawer extends Vue {
    mydata: any = null
    drawer = true
    direction = 'ltr'
    mounted() {}
    get computedTest() {
        return null
    }
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
</style>
