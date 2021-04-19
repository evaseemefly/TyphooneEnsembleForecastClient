<template>
    <!-- <div
        id="oil_model_detail"
        class="right-bar-oil"
        :class="isExpanded ? 'mybar_right_in' : 'mybar_right_out'"
        @mouseover="isExpanded = true"
        @mouseleave="isExpanded = false"
    > -->
    <div
        id="oil_model_detail"
        class="right-bar-oil"
        :class="isExpanded ? 'mybar_right_in' : 'mybar_right_out'"
        @click="isExpanded = !isExpanded"
    >
        <div class="my-detail-title">模型信息</div>
        <div id="oil_detail" class="mb-3 box-shadow my-detail-form">
            <!-- <div id="oil_detail" class="mb-3 box-shadow"> -->
            <div class="card-header">模型信息</div>
            <div class="card-body">
                <div class="form">
                    <div class="cell">
                        <div class="title">起始时间</div>
                        <div class="content">
                            {{ oilModelData.forecastDate | fortmatData2YMDH }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">结束时间</div>
                        <div class="content">
                            {{ oilModelData.enddate | fortmatData2YMDH }}
                        </div>
                    </div>
                </div>
                <div class="form">
                    <div class="cell">
                        <div class="title">中心位置</div>
                        <div class="content">
                            {{ oilModelData.lat | formatFixed }},{{
                                oilModelData.lon | formatFixed
                            }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">求解方法</div>
                        <div class="content">{{ oilModelData.equation }}</div>
                    </div>
                </div>
                <div class="form">
                    <div class="cell">
                        <div class="title">释放散点数</div>
                        <div class="content my-font-primary">
                            {{ oilModelData.nums }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">半径</div>
                        <div class="content my-font-primary">{{ oilModelData.radius }}</div>
                    </div>
                </div>
                <!-- 由于暂时不显示风偏系数，所以暂时去掉 -->
                <!-- <div class="form">
                <div class="cell">
                    <div class="title">风偏系数</div>
                    <div class="content my-font-primary">
                        {{ oilModelData.windCoefficient }}
                    </div>
                </div>
                <div class="cell">
                    <div class="title">风偏角度</div>
                    <div class="content my-font-primary">{{ oilModelData.equation }}</div>
                </div>
            </div> -->
                <div class="form">
                    <div class="cell">
                        <div class="title">模拟步长</div>
                        <div class="content my-font-primary">{{ oilModelData.simulationStep }}</div>
                    </div>
                    <div class="cell">
                        <div class="title">输出步长</div>
                        <div class="content my-font-primary">{{ oilModelData.consoleStep }}</div>
                    </div>
                </div>
                <div class="form">
                    <div class="cell">
                        <div class="title">释放时长</div>
                        <div class="content my-font-primary">
                            {{ oilModelData.simulationDuration }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">油量(吨)</div>
                        <div class="content my-font-primary">
                            {{ oilModelData.mass }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">油品</div>
                        <div class="content my-font-primary">
                            {{ oilModelData.oilTypeStr }}
                        </div>
                    </div>
                </div>
                <!-- <div class="form">
                <div class="cell">
                    <div class="title">流畅不确定性</div>
                    <div class="content my-font-primary">
                        {{ oilModelData.currentNondeterminacy }}
                    </div>
                </div>
                <div class="cell">
                    <div class="title">风场不确定性</div>
                    <div class="content my-font-primary">
                        {{ oilModelData.windNondeterminacy }}
                    </div>
                </div>
            </div> -->
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { OilModelDetailMidModel } from '@/middle_model/oil'
import { CaseOilModel } from '@/middle_model/case'
// 所有的 filter 公共的 均放在此处
import { fortmatData2YMDH, formatAbs, formatFixed, formatDir } from '@/common/filter'
import moment from 'moment'
@Component({
    filters: {
        fortmatData2YMDH,
        formatFixed
    }
})
export default class OilModelDetailForm extends Vue {
    // 是否展开窗口| false:未展开, true:展开了|默认未展开
    isExpanded = false
    get computedTest() {
        return null
    }
    public mydata: any = null

    // @Prop(Object)
    // private oilModelDetailData: OilModelDetailMidModel

    @Prop(Object)
    private oilModelData: CaseOilModel
    public mounted() {
        // let temp = new OilModelDetailMidModel();
    }
}
</script>
<style scoped lang="less">
@import '../../styles/base';
@import '../../styles/base-right-bar';

/* 移出效果：从左边向外部移出 */
// 未展开
// .mybar_right_out {
//     background-color: rgba(150, 189, 87, 0.5);
//     transition: background-color 2;
//     transition: transform 2s;
//     transform: translateX(95%);
// }

// // 展开
// .mybar_right_in {
//     background-color: #adff2f;
//     transition: background-color 2s;
//     transition: transform 2s;
//     transform: translateX(0px);
// }

@keyframes move-out {
    0% {
        right: 0px;
    }
    100% {
        right: -400px;
    }
}

/* 渐入效果：从左边外侧移入 */

@keyframes move-in {
    0% {
        right: -400px;
    }
    100% {
        right: 0px;
    }
}
</style>
