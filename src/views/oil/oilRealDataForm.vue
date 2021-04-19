<template>
    <div
        id="oil_detail"
        class="right-bar-oil mb-3 box-shadow"
        :class="isExpanded ? 'mybar_right_in' : 'mybar_right_out'"
        @click="isExpanded = !isExpanded"
    >
        <div class="my-detail-title">平均轨迹信息</div>
        <div class="mb-3 box-shadow my-detail-form">
            <div class="card-header">平均轨迹信息</div>
            <div class="card-body">
                <div class="form">
                    <div class="cell">
                        <div class="title">时间</div>
                        <div class="content">
                            {{ oilRealData.time | fortmatData2YMDH }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">中心位置</div>
                        <div class="content">
                            <!-- TODO [-] 20-06-24 由于 oilRealData.latlon 没有默认值，所以会出现为空的情况 -->
                            {{ oilRealData.latlon[0] | formatFixed }},{{
                                oilRealData.latlon[1] | formatFixed
                            }}
                        </div>
                    </div>
                </div>
                <div class="form">
                    <div class="cell">
                        <div class="title">风速</div>
                        <div class="content my-font-primary">
                            {{ oilRealData.wind | formatAbs }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">风向</div>
                        <div class="content my-font-primary">
                            {{ oilRealData.wind | formatDir }}
                        </div>
                    </div>
                </div>
                <div class="form">
                    <div class="cell">
                        <div class="title">流速</div>
                        <div class="content my-font-primary">
                            {{ oilRealData.current | formatAbs }}
                        </div>
                    </div>
                    <div class="cell">
                        <div class="title">流向</div>
                        <div class="content my-font-primary">
                            {{ oilRealData.current | formatDir }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { OilMidModel } from '@/middle_model/oil'
import moment from 'moment'
import { fortmatData2YMDH, formatAbs, formatFixed, formatDir } from '@/common/filter'
@Component({
    filters: {
        fortmatData2YMDH,
        formatAbs,
        formatFixed,
        formatDir
        // fortmatDate(now: Date): string {
        //     return moment(now).format('YYYY-MM-DD HH')
        // },
        // // 获取 abs val
        // formatAbs(val: { x: number; y: number }): string {
        //     // parseFloat(Math.pow(3.5,2).toFixed(2))
        //     return Math.sqrt(
        //         parseFloat(Math.pow(val.x, 2).toFixed(2)) +
        //             parseFloat(Math.pow(val.y, 2).toFixed(2))
        //     ).toFixed(2)
        // },
        // // 保留有效数字
        // formatFixed(val: number, keepNum = 2): string {
        //     return val.toFixed(keepNum)
        // },
        // // 转换角度
        // formatDir(val: { x: number; y: number }, keepNum = 2): string {
        //     // console.log(`${val.x}|${val.y}`)
        //     let dir = (Math.atan2(val.y, val.x) * 180) / Math.PI
        //     if (dir < 0) {
        //         dir = dir + 180
        //     }
        //     return dir.toFixed(keepNum)
        // }
    }
})
export default class OilRealDataForm extends Vue {
    // 是否展开窗口| false:未展开, true:展开了|默认未展开
    isExpanded = false
    get computedTest() {
        return null
    }
    public mydata: any = null
    @Prop(Object)
    private oilRealData!: OilMidModel
    public mounted() {}
}
</script>
<style scoped lang="less">
@import '../../styles/base';
@import '../../styles/base-right-bar';
// 20-07-19 以下部分注释掉，已经放在 styles/base-right-bar.less 中
// #oil_detail {
//     @base_font();
//     font-size: 0.7em;
//     margin-bottom: 7px !important;
//     //   @formbox();
//     // 加入四个角的圆角+阴影
//     // border-top-left-radius: 15px;
//     // border-top-right-radius: 10px;
//     // border-bottom-right-radius: 10px;
//     // border-bottom-left-radius: 10px;
//     @formradius();
//     box-shadow: 2px 2px 10px rgba(41, 101, 141, 0.863);
//     // box-shadow: 2px 2px 10px rgb(109, 96, 96);
//     background: linear-gradient(rgb(50, 157, 150), rgb(49, 59, 89));
// }
// // 两种字体颜色
// .my-font-primary {
//     color: rgb(255, 255, 255);
// }
// .my-font-contrast {
//     color: rgb(206, 201, 45);
// }
// @base_font: {
//     text-shadow: 2px 2px 8px rgb(33, 32, 32);
// };
// #oil_detail .card-header {
//     // background: #125a8abd;
//     /* background: linear-gradient(rgb(150, 210, 225), rgb(93, 134, 181)); */
//     /* background: rgb(49, 159, 178); */
//     color: rgb(161, 251, 246);
//     text-shadow: 2px 2px 1px 5px rgb(161, 251, 246);
//     font-weight: 400;
//     padding-top: 7px;
//     padding-bottom: 7px !important;
// }

// #oil_detail .card-body {
//     /* background: #2367e4bd; */
//     /* background: rgb(45, 93, 133); */
//     // background: linear-gradient(rgb(50, 157, 150), rgb(49, 59, 89));

//     color: rgb(240, 237, 56);
//     font-weight: 500;

//     padding-bottom: 5px;
//     padding-top: 5px;
//     //   @bottomradius();
//     display: flex;
//     flex-direction: column;
//     .form {
//         display: flex;
//         flex-wrap: wrap;
//         margin-bottom: 0.75em;
//         .cell {
//             width: 50%;
//         }
//         .title {
//             flex: 1;
//             font-size: 90%;
//             font-weight: 500;
//             color: aliceblue;
//         }
//         .content {
//             flex: 2;
//             display: flex;
//             /* 主轴对其方式 */
//             justify-content: center;
//             /* 交叉轴对其方式 */
//             align-items: center;
//             font-size: 120%;
//             font-weight: 600;
//         }
//     }
// }

// #oil_detail .card-header {
//     text-align: center;
//     text-shadow: 4px 4px 15px rgb(216, 57, 57);
// }

// .row {
//     text-align: center;
//     text-shadow: 2px 2px 8px rgb(210, 214, 155);
//     margin-bottom: 5px;
// }
</style>
