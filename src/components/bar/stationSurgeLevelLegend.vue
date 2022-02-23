<template>
    <div id="station-level-legend">
        <font>{{ legendTitle }}</font>
        <div class="card-list-bar">
            <div
                class="card-info "
                :key="icon.key"
                :class="[icon.styleCls]"
                v-for="icon in iconList"
            >
                <i :class="icon.iconCls">{{ icon.name }}</i>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// + 22-02-17 海洋站潮位颜色对应关系图例

@Component({})
export default class StationSurgeLevelLegeng extends Vue {
    mydata: any = null
    legendTitle = '海洋站图例'
    iconList: Array<{
        iconCls: string
        name: string
        key: number
        isActive: boolean
        styleCls: string
    }> = [
        { iconCls: '', name: '<=100', key: 1, isActive: false, styleCls: 'green' },
        { iconCls: '', name: '<=150', key: 2, isActive: false, styleCls: 'blue' },
        { iconCls: '', name: '<=200', key: 3, isActive: false, styleCls: 'yellow' },
        { iconCls: '', name: '<=250', key: 4, isActive: false, styleCls: 'orange' },
        { iconCls: '', name: '>250', key: 5, isActive: false, styleCls: 'red' }
    ]
    getBaseMapType(area: { code: number }): string {
        if (this.iconList.length > 0) {
            return 'my-primary'
        }
        return ''
    }
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
// @import '../../styles/common/card';
@import '../../styles/common/card';
@import '../../styles/base-color';
#station-level-legend {
    margin: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font {
        font-size: 16px;
        color: white;
        text-shadow: 0 0 4px black;
    }
    .el-switch {
        margin-left: 15px;
    }
    @legend();
}
</style>
