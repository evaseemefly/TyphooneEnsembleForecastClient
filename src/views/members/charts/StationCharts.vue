<template>
    <div
        class="right-station-surge-form"
        :class="isExpanded ? 'mybar-right-in' : 'mybar-right-out'"
        @click="isExpanded = !isExpanded"
    >
        <div class="my-detail-title">潮位数据</div>
        <div class="my-detail-form">
            <div id="station_charts"></div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// import Echarts from 'echarts'
import * as echarts from 'echarts'
import moment from 'moment'
import { getStationSurgeRealDataListAndRange } from '@/api/station'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
@Component({})
export default class StationCharts extends Vue {
    mydata: any = null
    // 是否展开窗口| false:未展开, true:展开了|默认未展开
    isExpanded = false
    @Prop()
    tyCode: string
    @Prop()
    stationCode: string
    @Prop()
    timeStamp: string

    forecastDateList: Date[] = []
    forecastSurgeValList: number[] = []
    forecastSurgeMaxList: number[] = []
    forecastSurgeMinList: number[] = []

    loadStationSurgeRealDataListAndRange(tyCode: string, timeStamp: string, stationCode: string) {
        const that = this
        getStationSurgeRealDataListAndRange(tyCode, timeStamp, stationCode).then((res) => {
            if (res.status == 200) {
                // eg:
                // forecast_dt: "2020-09-15T17:00:00Z"
                // surge: 0
                // surge_max: 0
                // surge_min: 0
                console.log(res.data)
                if (res.data.length > 0) {
                    res.data.forEach(
                        (item: {
                            forecast_dt: string
                            surge: number
                            surge_max: number
                            surge_min: number
                        }) => {
                            that.forecastDateList.push(new Date(item.forecast_dt))
                            that.forecastSurgeValList.push(item.surge)
                            that.forecastSurgeMaxList.push(item.surge_max)
                            that.forecastSurgeMinList.push(item.surge_min)
                        }
                    )
                    that.initChart()
                }
            }
        })
    }
    clearForecastSurge() {
        this.forecastDateList = []
        this.forecastSurgeValList = []
        this.forecastSurgeMaxList = []
        this.forecastSurgeMinList = []
    }
    initChart() {
        const that = this
        const nodeDiv = document.getElementById('station_charts')
        if (nodeDiv) {
            const myChart: echarts.ECharts = echarts.init(nodeDiv)
            const option = {
                title: {
                    text: `${that.stationCode}潮位站实测数据`,
                    textStyle: {
                        color: '#f8f8f7'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#d4e257'
                        }
                    }
                },
                legend: {
                    data: ['最大值', '中间预测路径值', '最小值'],
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
                        data: that.forecastDateList,
                        nameTextStyle: {
                            color: '#f8f8f7'
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#f8f8f7', //字体颜色
                                fontSize: 12 //字体大小
                            },
                            formatter: (val: Date) => {
                                return moment(val).format('MM/DD/HH:mm')
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
                        }
                    }
                ],
                series: [
                    {
                        name: '最大值',
                        type: 'line',
                        stack: '总量',
                        areaStyle: { color: '#e74c3c' },
                        lineStyle: { color: '#c0392b' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeMaxList
                    },
                    {
                        name: '中间预测路径值',
                        type: 'line',
                        stack: '总量',
                        areaStyle: { color: '#e67e22' },
                        lineStyle: { color: '#d35400' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeValList
                    },
                    {
                        name: '最小值',
                        type: 'line',
                        stack: '总量',
                        areaStyle: { color: '#f1c40f' },
                        lineStyle: { color: '#f39c12' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeMinList
                    }
                ]
            }
            myChart.setOption(option)
        }
    }
    @Watch('getOptions')
    onTimeStamp(val: { tyCode: string; stationCode: string; timeStamp: string }): void {
        console.log(
            `options发生变化tyCode:${val.tyCode},stationCode:${val.stationCode},timeStamp:${val.timeStamp}发生变化`
        )
        this.clearForecastSurge()
        if (val.tyCode !== DEFAULTTYCODE && val.timeStamp !== DEFAULTTIMESTAMP) {
            this.loadStationSurgeRealDataListAndRange(val.tyCode, val.timeStamp, val.stationCode)
        }
    }
    get getOptions(): { tyCode: string; stationCode: string; timeStamp: string } {
        const { tyCode, stationCode, timeStamp } = this
        return { tyCode, stationCode, timeStamp }
    }
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/station/surge-chart';
// .right-station-surge-form {
//     border-radius: 5px;
//     position: absolute;
//     right: 10px;
//     background: linear-gradient(
//         to right,
//         rgba(77, 142, 124, 0.726) 40%,
//         rgba(74, 145, 148, 0.726),
//         #34495e
//     );
//     box-shadow: 2px 3px 8px black;
// }
#station_charts {
    width: 500px;
    height: 300px;
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
