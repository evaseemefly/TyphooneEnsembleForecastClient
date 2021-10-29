<template>
    <div
        class="right-station-surge-form"
        :class="isExpanded ? 'mybar-right-in' : 'mybar-right-out'"
    >
        <div class="my-detail-title" @click="isExpanded = !isExpanded">潮位统计信息</div>
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
import {
    getStationSurgeRealDataListAndRange,
    getAstronomictideTideRealDataList,
    getStationAlert,
    getStationSurgeRealDataQuarterList
} from '@/api/station'
// 枚举
import { AlertTideEnum } from '@/enum/surge'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { DEFAULT_ALERT_TIDE } from '@/const/surge'
import { DEFAULT_STATION_CODE, DEFAULT_STATION_NAME } from '@/const/station'
@Component({})
export default class StationStatisticsCharts extends Vue {
    mydata: any = null
    // 是否展开窗口| false:未展开, true:展开了|默认未展开
    isExpanded = false
    // 21-08-28 是否为叠加后的潮位
    isAdditionTide = false
    @Prop()
    tyCode: string
    @Prop()
    stationCode: string
    @Prop()
    stationName: string
    @Prop()
    timeStamp: string

    forecastDateList: Date[] = []
    forecastSurgeValList: number[] = []
    forecastSurgeMaxList: number[] = []
    forecastSurgeMinList: number[] = []
    forecastAstronomicTideList: number[] = []
    alertBlue: number = DEFAULT_ALERT_TIDE
    alertYellow: number = DEFAULT_ALERT_TIDE
    alertOrange: number = DEFAULT_ALERT_TIDE
    alertRed: number = DEFAULT_ALERT_TIDE

    quarterList: {
        stationCode: string
        quarterVal: number
        threeQuartersVal: number
        medianVal: number
        forecastDt: Date
    }[] = []

    async loadStationSurgeRealDataListAndRange(
        tyCode: string,
        timeStamp: string,
        stationCode: string
    ) {
        const that = this
        this.quarterList = []
        await getStationSurgeRealDataQuarterList(tyCode, timeStamp, stationCode).then((res) => {
            if (res.status == 200) {
                // eg:
                // {
                //     "ty_code": "2022",
                //     "station_code": "SHW",
                //     "forecast_index": 0,
                //     "forecast_dt": "2020-09-15T09:00:00Z",
                //     "quarter_val": 0.0,
                //     "three_quarters_val": 0.0,
                //     "median_val": 0.0
                // },
                if (res.data.length > 0) {
                    res.data.forEach(
                        (item: {
                            station_code: string
                            quarter_val: number
                            three_quarters_val: number
                            median_val: number
                            forecast_dt: Date
                        }) => {
                            that.quarterList.push({
                                stationCode: item.station_code,
                                quarterVal: item.quarter_val,
                                threeQuartersVal: item.three_quarters_val,
                                medianVal: item.median_val,
                                forecastDt: item.forecast_dt
                            })
                        }
                    )
                }
            }
        })

        that.initChart()
    }

    clearForecastSurge() {
        this.forecastDateList = []
        this.forecastSurgeValList = []
        this.forecastSurgeMaxList = []
        this.forecastSurgeMinList = []
    }

    initLine() {
        if (
            this.alertBlue !== DEFAULT_ALERT_TIDE &&
            this.alertYellow !== DEFAULT_ALERT_TIDE &&
            this.alertOrange !== DEFAULT_ALERT_TIDE &&
            this.alertRed !== DEFAULT_ALERT_TIDE
        ) {
            const markLine = []
            const positions = ['start', 'middle', 'end']
        }
    }

    initChart() {
        const that = this
        const nodeDiv = document.getElementById('station_charts')
        if (nodeDiv) {
            const myChart: echarts.ECharts = echarts.init(nodeDiv)
            option = {
                xAxis: {
                    data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
                },
                yAxis: {},
                series: [
                    {
                        type: 'candlestick',
                        data: [
                            [20, 34, 10, 38],
                            [40, 35, 30, 50],
                            [31, 38, 33, 44],
                            [38, 15, 5, 42]
                        ]
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
        this.$notify({
            title: '成功',
            message: `加载海洋站:${val.stationCode}潮位数据`,
            type: 'success'
        })
        this.clearForecastSurge()
        if (
            val.tyCode !== DEFAULTTYCODE &&
            val.timeStamp !== DEFAULTTIMESTAMP &&
            val.stationCode !== DEFAULT_STATION_CODE
        ) {
            this.loadStationSurgeRealDataListAndRange(val.tyCode, val.timeStamp, val.stationCode)
        }
    }

    get getOptions(): { tyCode: string; stationCode: string; timeStamp: string } {
        const { tyCode, stationCode, timeStamp } = this
        return { tyCode, stationCode, timeStamp }
    }

    get getForecastDtList(): string[] {
        const forecastDtFormatList: string[] = []
        if (this.forecastDateList.length > 0) {
            this.forecastDateList.forEach((dt: Date) => {
                forecastDtFormatList.push(moment(dt).format('MM/DD/HH:mm'))
            })
        }
        return forecastDtFormatList
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/station/surge-chart';
.test {
    background: rgb(19, 184, 196);
}
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
