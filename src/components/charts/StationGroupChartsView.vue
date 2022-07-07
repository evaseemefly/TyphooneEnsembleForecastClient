<template>
    <div
        id="station_chart_form"
        class="my-detail-form"
        v-loading="isLoading"
        element-loading-spinner="el-icon-loading"
        element-loading-background="#16a084bb"
    >
        <el-switch v-model="isAdditionTide" active-text="总潮位" inactive-text="风暴增水">
        </el-switch>
        <div id="station_charts"></div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import StationChartsView from './StationChartsView.vue'
import { DEFAULT_ALERT_TIDE, DEFAULT_SURGE_DIFF } from '@/const/surge'
import { DEFAULT_STATION_CODE, DEFAULT_STATION_NAME } from '@/const/station'
import * as echarts from 'echarts'
@Component({})
export default class StationGroupChartsView extends StationChartsView {
    mydata: any = null
    // mounted() {}
    /** 初始化 chart */
    initChart(): void {
        const that = this
        const nodeDiv = document.getElementById('station_charts')
        if (nodeDiv) {
            const myChart: echarts.ECharts = echarts.init(nodeDiv)
            // this.surgeByGroupPath = []
            const option = {
                title: {
                    text: `${that.stationName}`,
                    subtext: '潮位站',
                    textStyle: {
                        color: '#f8f8f7'
                    }
                },
                tooltip: {
                    // axisPointer: {
                    //     type: 'cross',
                    //     label: {
                    //         backgroundColor: '#d4e257'
                    //     }
                    // },
                    show: true,
                    trigger: 'none',
                    showContent: false,
                    axisPointer: {
                        type: 'cross',
                        snap: false
                        // label:true
                    },
                    triggerOn: 'click',
                    valueFormatter: (val) => val.toFixed(1)
                },
                legend: {
                    data: ['中间预测路径值', '天文潮位'],
                    itemStyle: {
                        color: '#f8f8f7'
                    },
                    right: '10%'
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        // data: that.forecastDateList,
                        data: that.getForecastDtList,
                        nameTextStyle: {
                            color: '#f8f8f7'
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#f8f8f7', //字体颜色
                                fontSize: 12 //字体大小
                            }
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        nameTextStyle: {
                            color: '#f8f8f7'
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#f8f8f7', //字体颜色
                                fontSize: 12 //字体大小
                            }
                        },
                        min: that.yAxisMin,
                        max: that.yAxisMax
                        // scale: true
                    }
                ],
                series: [
                    {
                        name: '中间预测路径值',
                        type: 'line',
                        lineStyle: { color: 'rgba(255, 191, 0)', width: 5, opacity: 0.8 },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeValList,
                        showSymbol: false,
                        smooth: true,
                        zlevel: 9999
                    },

                    {
                        name: '天文潮位',
                        type: 'line',
                        lineStyle: { color: 'rgba(0, 221, 255)' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastAstronomicTideList,
                        smooth: true
                    },
                    // TODO: 21-08-25 新加入的四色警戒潮位标线
                    {
                        name: '警戒潮位',
                        type: 'line',
                        markLine: {
                            symbol: 'none', // 虚线不显示端点的圆圈及箭头
                            itemStyle: {
                                color: 'rgb(19, 184, 196)'
                            },
                            data: [
                                {
                                    name: '蓝色警戒潮位',
                                    yAxis: this.isAdditionTide ? this.alertBlue : DEFAULT_ALERT_TIDE
                                }
                            ]
                        }
                    },
                    {
                        name: '警戒潮位',
                        type: 'line',
                        markLine: {
                            symbol: 'none',
                            itemStyle: {
                                color: 'rgb(245, 241, 20)'
                            },
                            data: [
                                {
                                    name: '黄色警戒潮位',
                                    yAxis: this.isAdditionTide
                                        ? this.alertYellow
                                        : DEFAULT_ALERT_TIDE
                                }
                            ]
                        }
                    },
                    {
                        name: '警戒潮位',
                        type: 'line',
                        markLine: {
                            symbol: 'none',
                            itemStyle: {
                                color: 'rgb(235, 134, 19)'
                            },
                            data: [
                                {
                                    name: '橙色警戒潮位',
                                    yAxis: this.isAdditionTide
                                        ? this.alertOrange
                                        : DEFAULT_ALERT_TIDE
                                }
                            ]
                        }
                    },
                    {
                        name: '警戒潮位',
                        type: 'line',
                        markLine: {
                            symbol: 'none',
                            itemStyle: {
                                color: 'rgb(241, 11, 11)',
                                lineStyle: {
                                    cap: 'round',
                                    type: 'dotted'
                                }
                            },
                            data: [
                                {
                                    name: '红色警戒潮位',
                                    yAxis: this.isAdditionTide ? this.alertRed : DEFAULT_ALERT_TIDE
                                }
                            ]
                        }
                    }
                ]
            }
            // TODO:[-] 22-07-05 加入多条集合路径曲线
            const lineStyle = {
                width: 1,
                opacity: 0.5
            }
            if (this.surgeByGroupPath.length > 0) {
                this.surgeByGroupPath.forEach((temp) => {
                    const tempSeries = {
                        name: temp.gpId,
                        data: [...temp.listSurge],
                        type: 'line',
                        smooth: true,
                        Symbol: 'none',
                        symbolSize: 0,
                        lineStyle: lineStyle
                    }
                    option.series.push(tempSeries)
                })
            }
            myChart.setOption(option)
            if (!this.myChart) {
                this.myChart = myChart
            }
        }
    }
}
</script>
<style scoped lang="less">
@import '../../styles/station/surge-chart';
.my-detail-form {
    height: 100%;
    width: 100%;
}
#station_charts {
    // min-width: 660px;
    // min-height: 445px;
    height: 100%;
    width: 100%;
}
#station_chart_form {
    @base-station-form();
    height: 100%;
    width: 100%;
}
// #station_charts {
//     border-radius: 5px;
//     position: absolute;
//     right: 10px;
//     width: 500px;
//     height: 300px;
//     background: linear-gradient(
//         to right,
//         rgba(77, 142, 124, 0.726) 40%,
//         rgba(74, 145, 148, 0.726),
//         #34495e
//     );
//     box-shadow: 2px 3px 8px black;
//     // background: #f8f8f7;
// }
</style>
