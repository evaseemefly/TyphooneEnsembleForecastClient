<template>
    <!-- <div
        class="right-station-surge-form"
        :class="isExpanded ? 'mybar-right-in' : 'mybar-right-out'"
    >
        <div class="my-detail-title" @click="isExpanded = !isExpanded">潮位预报</div>
        <div class="my-detail-form">
            <el-switch v-model="isAdditionTide" active-text="总潮位" inactive-text="风暴增水">
            </el-switch>
            <div id="station_charts"></div>
        </div>
    </div> -->
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
// import Echarts from 'echarts'
import * as echarts from 'echarts'
import * as elementResizeDetectorMaker from 'element-resize-detector'
import moment from 'moment'
import {
    getStationSurgeRealDataListAndRange,
    getAstronomictideTideRealDataList,
    getStationAlert
} from '@/api/station'
// 枚举
import { AlertTideEnum } from '@/enum/surge'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { DEFAULT_ALERT_TIDE } from '@/const/surge'
import { DEFAULT_STATION_CODE, DEFAULT_STATION_NAME } from '@/const/station'
@Component({})
export default class StationCharts extends Vue {
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
    timestampStr: string
    @Prop()
    toResize: boolean

    forecastDateList: Date[] = []
    forecastSurgeValList: number[] = []
    forecastSurgeMaxList: number[] = []
    forecastSurgeMinList: number[] = []
    forecastAstronomicTideList: number[] = []
    alertBlue: number = DEFAULT_ALERT_TIDE
    alertYellow: number = DEFAULT_ALERT_TIDE
    alertOrange: number = DEFAULT_ALERT_TIDE
    alertRed: number = DEFAULT_ALERT_TIDE

    isLoading = false // 是否在加载， true - 在加载状态 ; false - 未在加载
    screenHeight = 0
    screenWidth = 0
    size: { divWidth: number; divHeight: number } = {
        divWidth: 0,
        divHeight: 0
    }
    sizeDefault: { divWidth: number; divHeight: number } = {
        divWidth: 660,
        divHeight: 445
    }
    myChart: echarts.ECharts = null

    mounted() {
        console.log('StationCharts mounted!')
        const that = this
        window.onresize = () => {
            return () => {
                that.screenHeight = window.innerHeight
                that.screenWidth = window.innerWidth
            }
        }
        const erd = elementResizeDetectorMaker()
        erd.listenTo(document.getElementById('station_chart_form'), function(element: HTMLElement) {
            that.size.divWidth = element.offsetWidth
            that.size.divHeight = element.offsetHeight
        })
        if (
            this.tyCode !== DEFAULTTYCODE &&
            this.timestampStr !== DEFAULTTIMESTAMP &&
            this.stationCode !== DEFAULT_STATION_CODE
        ) {
            // this.isLoading = true
            this.loadStationSurgeRealDataListAndRange(
                this.tyCode,
                this.timestampStr,
                this.stationCode
            ).then((_) => {
                // this.isLoading = false
            })
        }
    }

    async loadStationSurgeRealDataListAndRange(
        tyCode: string,
        timestampStr: string,
        stationCode: string
    ) {
        const that = this
        that.isLoading = true
        await getStationSurgeRealDataListAndRange(tyCode, timestampStr, stationCode).then((res) => {
            if (res.status == 200) {
                // eg:
                // forecast_dt: "2020-09-15T17:00:00Z"
                // surge: 0
                // surge_max: 0
                // surge_min: 0
                // console.log(res.data)
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
                }
            }
        })
        // + 21-08-24 信加入的加载 天文潮位数据
        await this.loadAstronomicTideList(tyCode, timestampStr, stationCode)
        // TODO:[-] 21-08-25 将 三类潮位 分别叠加 天文潮计算一个总潮位
        if (this.isAdditionTide) {
            this.add2AstornomicTid()
        }

        await this.loadAlertTideList(stationCode)
        that.initChart()
        this.isLoading = false
    }

    async loadAstronomicTideList(tyCode: string, timestampStr: string, stationCode: string) {
        const that = this
        await getAstronomictideTideRealDataList(tyCode, timestampStr, stationCode).then((res) => {
            if (res.status == 200) {
                /*
                {
                    "station_code": "CWH",
                    "forecast_dt": "2020-09-15T09:00:00Z",
                    "surge": 171.0
                },
                */
                if (res.data.length > 0) {
                    res.data.forEach(
                        (item: { station_code: string; surge: number; forecast_dt: string }) => {
                            that.forecastAstronomicTideList.push(item.surge)
                        }
                    )
                    // that.initChart()
                }
            }
        })
    }

    async loadAlertTideList(stationCode: string): void {
        await getStationAlert(stationCode).then((res) => {
            if (res.status === 200) {
                res.data.forEach(
                    (val: { station_code: string; tide: number; alert: AlertTideEnum }) => {
                        /*
                            {
                                "station_code": "CWH",
                                "tide": 443.0,
                                "alert": 5001
                            },
                        */
                        switch (true) {
                            case val.alert === AlertTideEnum.BLUE:
                                this.alertBlue = val.tide
                                break
                            case val.alert === AlertTideEnum.YELLOW:
                                this.alertYellow = val.tide
                                break
                            case val.alert === AlertTideEnum.ORANGE:
                                this.alertOrange = val.tide
                                break
                            case val.alert === AlertTideEnum.RED:
                                this.alertRed = val.tide
                                break
                        }
                    }
                )
            }
        })
    }

    add2AstornomicTid(): void {
        const that = this
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeValList[index] += val
        })
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeMaxList[index] += val
        })
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeMinList[index] += val
        })
    }

    wipe2AstornomicTide(): void {
        const that = this
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeValList[index] -= val
        })
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeMaxList[index] -= val
        })
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeMinList[index] -= val
        })
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
            const option = {
                title: {
                    text: `${that.stationName}`,
                    subtext: '潮位站',
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
                    // formatter: function(params, ticket, callback) {
                    //     //x轴名称
                    //     const name = params[0].name
                    //     //图表title名称
                    //     const seriesName = params[0].seriesName
                    //     //值
                    //     const value = params[0].value
                    //     return seriesName + '<br />' + name + '<br />' + value
                    // }
                },
                legend: {
                    data: ['最大值', '中间预测路径值', '最小值', '天文潮位'],
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
                            // formatter: (val: Date) => {
                            //     return moment(val).format('MM/DD/HH:mm')
                            // }
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
                        // areaStyle: { color: '#e74c3c' },
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(255, 0, 135)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(135, 0, 157)'
                                }
                            ])
                        },
                        lineStyle: { color: 'rgba(255, 0, 135)' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeMaxList,
                        showSymbol: false,
                        smooth: true
                        // TODO: 21-08-25 新加入的四色警戒潮位标线
                        // markLine: {
                        //     data: [{ type: 'average', name: '平均值' }]
                        // }
                    },
                    {
                        name: '中间预测路径值',
                        type: 'line',
                        // areaStyle: { color: '#e67e22' },
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(255, 191, 0)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(224, 62, 76)'
                                }
                            ])
                        },
                        lineStyle: { color: 'rgba(255, 191, 0)' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeValList,
                        showSymbol: false,
                        smooth: true
                    },
                    {
                        name: '最小值',
                        type: 'line',
                        // areaStyle: { color: '#f1c40f' },
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(128, 255, 165)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(1, 191, 236)'
                                }
                            ])
                        },
                        lineStyle: { color: 'rgba(1, 191, 236)' },
                        emphasis: {
                            focus: 'series'
                        },
                        data: that.forecastSurgeMinList,
                        showSymbol: false,
                        smooth: true
                    },
                    {
                        name: '天文潮位',
                        type: 'line',
                        // areaStyle: { color: '#9b59b6' },
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(0, 221, 255)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(77, 119, 255)'
                                }
                            ])
                        },
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
                                    yAxis: this.alertBlue
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
                                    yAxis: this.alertYellow
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
                                    yAxis: this.alertOrange
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
                                    yAxis: this.alertRed
                                }
                            ]
                        }
                    }
                ]
            }
            myChart.setOption(option)
            if (!this.myChart) {
                this.myChart = myChart
            }
        }
    }
    @Watch('getOptions')
    ontimestampStr(val: { tyCode: string; stationCode: string; timestampStr: string }): void {
        console.log(
            `StationCharts,options发生变化tyCode:${val.tyCode},stationCode:${val.stationCode},timestampStr:${val.timestampStr}发生变化`
        )
        this.$notify({
            title: '成功',
            message: `加载海洋站:${val.stationCode}潮位数据`,
            type: 'success'
        })
        this.clearForecastSurge()
        if (
            val.tyCode !== DEFAULTTYCODE &&
            val.timestampStr !== DEFAULTTIMESTAMP &&
            val.stationCode !== DEFAULT_STATION_CODE
        ) {
            this.loadStationSurgeRealDataListAndRange(val.tyCode, val.timestampStr, val.stationCode)
        }
    }

    @Watch('isAdditionTide')
    onIsAdditionTide(isAdd: boolean): void {
        if (isAdd) {
            this.add2AstornomicTid()
        } else {
            this.wipe2AstornomicTide()
        }
        this.initChart()
    }
    get getOptions(): { tyCode: string; stationCode: string; timestampStr: string } {
        const { tyCode, stationCode, timestampStr } = this
        return { tyCode, stationCode, timestampStr }
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
    get computedTest() {
        return null
    }
    @Watch('size', { immediate: true, deep: true })
    onSize(val: { divWidth: number; divHeight: number }) {
        console.log(`监听到width:${val.divWidth},height:${val.divHeight}`)
        if (this.myChart) {
            this.myChart.resize()
        }
    }
    @Watch('toResize')
    onToResize(val: boolean): void {
        // if (val) {
        //     this.size.divWidth = this.sizeDefault.divWidth
        //     this.size.divHeight = this.sizeDefault.divHeight
        // }
    }
}
</script>
<style scoped lang="less">
.my-detail-form {
    height: 100%;
    width: 100%;
}
#station_charts {
    min-width: 660px;
    min-height: 445px;
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
