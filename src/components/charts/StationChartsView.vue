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
        <!-- 对于非集合路径才提供叠加天文潮位的选项 -->
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
    getStationAlert,
    getStationSurgeBaseLevelDiff,
    getStationD85SurgeDiff,
    getSurgeRealDataListByGroupPath
} from '@/api/station'
// 枚举
import { AlertTideEnum } from '@/enum/surge'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { DEFAULT_ALERT_TIDE, DEFAULT_SURGE_DIFF } from '@/const/surge'
import { DEFAULT_STATION_CODE, DEFAULT_STATION_NAME } from '@/const/station'
import station from '@/store/modules/station'

const formatNumber = (val: number): string => {
    return val.toFixed(2)
}

@Component({})
export default class StationChartsView extends Vue {
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

    /** 是否为集合路径 */
    @Prop()
    isGroup: boolean

    // isSwitchOn = true
    forecastDateList: Date[] = []
    /** 中间路径的预报潮位值(若isAdditionTide=true —— 则是 = 增水值+天文潮位) */
    forecastSurgeValList: number[] = []

    /** 预报潮位的最大值集合 */
    forecastSurgeMaxList: number[] = []

    /** 预报潮位的最小值集合 */
    forecastSurgeMinList: number[] = []
    // + 22-05-06 最大值与最小值的差
    forecastSurgediffList: number[] = []

    /** 天文潮集合(-基面) */
    forecastAstronomicTideList: number[] = []
    // 22-02-21 注意四色警戒潮位是对应的总潮位值
    alertBlue: number = DEFAULT_ALERT_TIDE
    alertYellow: number = DEFAULT_ALERT_TIDE
    alertOrange: number = DEFAULT_ALERT_TIDE
    alertRed: number = DEFAULT_ALERT_TIDE
    surgeDiff: number | null = DEFAULT_SURGE_DIFF

    /** 85基面的差值 */
    d85Diff: number | null = DEFAULT_SURGE_DIFF

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

    /** + 22-07-04 潮位数据(通过 grouppath)聚合 */
    surgeByGroupPath: { gpId: number; listSurge: Array<number> }[] = []
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
                this.stationCode,
                this.isGroup
            ).then((_) => {
                // this.isLoading = false
            })
        }
    }

    /** 加载海洋站潮位实时数据
     *  会调用 loadAstronomicTideList (加载天文潮位,加载天文潮位时获取基面差值)
     *
     */
    async loadStationSurgeRealDataListAndRange(
        tyCode: string,
        timestampStr: string,
        stationCode: string,
        isGroup = false
    ): Promise<void> {
        const that = this
        that.isLoading = true
        this.resetAlertLevels()
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
                            that.forecastSurgediffList.push(item.surge_max - item.surge_min)
                        }
                    )
                }
                if (isGroup) {
                    this.surgeByGroupPath = []
                    return getSurgeRealDataListByGroupPath(tyCode, timestampStr, stationCode).then(
                        (res: {
                            status: number
                            data: Array<{ gp_id: number; list_realdata: Array<{ surge: string }> }>
                        }) => {
                            if (res.status == 200) {
                                /*
                                {
                                    "gp_id": 14361,
                                    "list_realdata": [
                                        {
                                            "ty_code": "2203",
                                            "gp_id": 14361,
                                            "station_code": "QZH",
                                            "forecast_index": 0,
                                            "forecast_dt": "2022-07-01T13:00:00Z",
                                            "surge": 0.0
                                        }
                                    ]
                                },
                                */
                                if (res.data.length > 0) {
                                    res.data.forEach((temp) => {
                                        const tempListRealdata: Array<number> = []
                                        temp.list_realdata.forEach((element) => {
                                            tempListRealdata.push(parseFloat(element.surge))
                                        })
                                        const tempSurgeObj = {
                                            gpId: temp.gp_id,
                                            listSurge: tempListRealdata
                                        }
                                        that.surgeByGroupPath.push(tempSurgeObj)
                                    })
                                }
                            }
                        }
                    )
                }
            }
        })
        // + 21-08-24 信加入的加载 天文潮位数据
        await this.loadAstronomicTideList(tyCode, timestampStr, stationCode)
            .then((_) => {
                // TODO:[-] 21-08-25 将 三类潮位 分别叠加 天文潮计算一个总潮位
                if (that.isAdditionTide) {
                    that.add2AstornomicTid(isGroup)
                }

                that.loadAlertTideList(stationCode)
                    // .then((res) => {
                    //     console.log(res)
                    // })
                    .finally((_) => {})
            })
            .finally((_) => {
                that.isLoading = false
            })
            .catch((err) => {
                that.$message({
                    message: err,
                    center: true,
                    type: 'warning'
                })
                that.isLoading = false
            })

        that.initChart()
    }

    // + 22-02-21 新加入的对四色警戒潮位进行重置
    resetAlertLevels(): void {
        this.alertBlue = DEFAULT_ALERT_TIDE
        this.alertYellow = DEFAULT_ALERT_TIDE
        this.alertOrange = DEFAULT_ALERT_TIDE
        this.alertRed = DEFAULT_ALERT_TIDE
    }

    /** 加载天文潮位list */
    async loadAstronomicTideList(
        tyCode: string,
        timestampStr: string,
        stationCode: string
    ): Promise<void> {
        const that = this
        let surgeDiff = 0
        // this.surgeDiff = DEFAULT_SURGE_DIFF
        await getStationSurgeBaseLevelDiff(stationCode)
            .then(
                (diffRes: {
                    status: number
                    data: { station_code: string; surge_diff: number }
                }) => {
                    if (diffRes.status == 200) {
                        /** 基面的差值 */
                        surgeDiff = diffRes.data.surge_diff
                        // that.surgeDiff = surgeDiff
                    }
                }
            )
            .catch((err) => {
                that.surgeDiff = DEFAULT_SURGE_DIFF
            })
        await getAstronomictideTideRealDataList(tyCode, timestampStr, stationCode)
            .then((res) => {
                if (res.status == 200) {
                    /*
                    {
                        "station_code": "CWH",
                        "forecast_dt": "2020-09-15T09:00:00Z",
                        "surge": 171.0
                    },
                    */

                    if (res.data.length > 0) {
                        // TODO:[-] - 22-05-10 注意此处每次需要清空一下
                        // TODO:[*] - 22-06-23 + 加入了获取基面差值的请求
                        that.forecastAstronomicTideList = []
                        res.data.forEach(
                            (item: {
                                station_code: string
                                surge: number
                                forecast_dt: string
                            }) => {
                                that.forecastAstronomicTideList.push(item.surge - surgeDiff)
                            }
                        )
                        // that.initChart()
                    }
                }
            })
            .then((res) => {
                getStationSurgeBaseLevelDiff(stationCode).then(
                    (diffRes: {
                        status: number
                        data: { station_code: string; surge_diff: number }
                    }) => {
                        // if (diffRes.status == 200) {
                        //     /** 基面的差值 */
                        //     const surgeDiff: number = diffRes.data.surge_diff
                        // }
                    }
                )
            })
    }

    /** 加载警戒潮位集合 */
    async loadAlertTideList(stationCode: string): Promise<void> {
        const that = this
        return getStationAlert(stationCode).then((res): Promise<void> | undefined => {
            if (res.status === 200) {
                return getStationD85SurgeDiff(stationCode).then(
                    (d85res: {
                        status: number
                        data: { station_code: string; d85_diff: number | null }
                    }) => {
                        if (d85res.status == 200) {
                            that.d85Diff = d85res.data.d85_diff
                        }
                        res.data.forEach(
                            (val: { station_code: string; tide: number; alert: AlertTideEnum }) => {
                                /*
                                {
                                    "station_code": "CWH",
                                    "tide": 443.0,
                                    "alert": 5001
                                },
                            */
                                // TODO:[*] 22-06-29 此处存在问题:有的站存在 d85diff 与 四色警戒潮位均为 null 的情况
                                const alertTide =
                                    that.d85Diff != null && that.d85Diff !== DEFAULT_SURGE_DIFF
                                        ? val.tide - that.d85Diff
                                        : val.tide
                                switch (true) {
                                    case val.alert === AlertTideEnum.BLUE:
                                        that.alertBlue = alertTide

                                        break
                                    case val.alert === AlertTideEnum.YELLOW:
                                        that.alertYellow = alertTide
                                        break
                                    case val.alert === AlertTideEnum.ORANGE:
                                        that.alertOrange = alertTide
                                        break
                                    case val.alert === AlertTideEnum.RED:
                                        that.alertRed = alertTide
                                        break
                                }
                            }
                        )
                    }
                )
            }
        })
    }

    /** 叠加天文潮
     * - 22-07-07 加入了根据 isAddGroupSurge 判断是否对  this.surgeByGroupPath => listSurge 叠加天文潮位
     */
    add2AstornomicTid(isAddGroupSurge = false): void {
        const that = this
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeValList[index] += val
            that.forecastSurgeMaxList[index] += val
            that.forecastSurgeMinList[index] += val
            if (isAddGroupSurge && this.surgeByGroupPath.length > 0) {
                this.surgeByGroupPath.forEach((group) => {
                    group.listSurge[index] += val
                })
            }
        })
        // this.forecastAstronomicTideList.map((val, index) => {

        // })
        // this.forecastAstronomicTideList.map((val, index) => {

        // })
    }

    /** 清除天文潮 */
    wipe2AstornomicTide(isAddGroupSurge = false): void {
        const that = this
        this.forecastAstronomicTideList.map((val, index) => {
            that.forecastSurgeValList[index] -= val
            that.forecastSurgeMaxList[index] -= val
            that.forecastSurgeMinList[index] -= val
            if (isAddGroupSurge && this.surgeByGroupPath.length > 0) {
                this.surgeByGroupPath.forEach((group) => {
                    group.listSurge[index] -= val
                })
            }
        })
    }

    clearForecastSurge() {
        this.forecastDateList = []
        this.forecastSurgeValList = []
        this.forecastSurgeMaxList = []
        this.forecastSurgeMinList = []
        this.forecastAstronomicTideList = []
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
                    trigger: 'axis',
                    showContent: true,
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#d4e257'
                        }
                    },
                    valueFormatter: (val) => val.toFixed(1)
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
                        },
                        min: that.yAxisMin,
                        max: that.yAxisMax
                        // scale: true
                    }
                ],
                series: [
                    {
                        name: '最小值',
                        type: 'line',
                        // areaStyle: { color: '#e74c3c' },
                        // areaStyle: {
                        //     opacity: 0.2,
                        //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        //         {
                        //             offset: 0,
                        //             color: 'rgba(255, 0, 135)'
                        //         },
                        //         {
                        //             offset: 1,
                        //             color: 'rgba(135, 0, 157)'
                        //         }
                        //     ])
                        // },
                        itemStyle: {
                            formatter: function(params) {
                                return params.toFixed(2)
                            }
                        },

                        lineStyle: { color: 'rgba(255, 0, 135)' },

                        data: that.forecastSurgeMinList,
                        showSymbol: false,
                        smooth: true
                    },
                    {
                        name: '中间预测路径值',
                        type: 'line',
                        areaStyle: { color: '#e67e22' },
                        areaStyle: {
                            opacity: 0.4,
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
                        name: '最大值',
                        type: 'line',
                        // areaStyle: {
                        //     opacity: 0.2,
                        //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        //         {
                        //             offset: 0,
                        //             color: 'rgb(55, 162, 255)'
                        //         },
                        //         {
                        //             offset: 1,
                        //             color: 'rgb(116, 21, 219)'
                        //         }
                        //     ])
                        // },
                        itemStyle: {
                            formatter: function(params) {
                                return params.toFixed(2)
                            }
                        },

                        lineStyle: { color: 'rgba(1, 191, 236)' },

                        // emphasis: {
                        //     focus: 'series'
                        // },
                        data: that.forecastSurgeMaxList,
                        // data: that.forecastSurgeMinList.map((val, index) => {
                        //     return that.forecastSurgeMaxList[index] - val
                        // }),
                        // data: that.forecastSurgeMinList.forEach((temp) => {
                        //     return -temp
                        // }),

                        // data: that.forecastSurgeMinList.map((val, index) => {
                        //     return -(that.forecastSurgeMaxList[index] - val)
                        // }),
                        showSymbol: false,
                        smooth: true
                        // stack: 'confidence-band'
                    },

                    {
                        name: '天文潮位',
                        type: 'line',
                        // areaStyle: { color: '#9b59b6' },
                        // areaStyle: {
                        //     opacity: 0.8,
                        //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        //         {
                        //             offset: 0,
                        //             color: 'rgba(0, 221, 255)'
                        //         },
                        //         {
                        //             offset: 1,
                        //             color: 'rgba(77, 119, 255)'
                        //         }
                        //     ])
                        // },
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
    @Watch('getOptions')
    ontimestampStr(val: { tyCode: string; stationCode: string; timestampStr: string }): void {
        // console.log(
        //     `StationCharts,options发生变化tyCode:${val.tyCode},stationCode:${val.stationCode},timestampStr:${val.timestampStr}发生变化`
        // )

        this.clearForecastSurge()
        if (
            val.tyCode !== DEFAULTTYCODE &&
            val.timestampStr !== DEFAULTTIMESTAMP &&
            val.stationCode !== DEFAULT_STATION_CODE
        ) {
            // 若加载的不是默认的 ty | timestamp | station 则会执行加载 real data list 以及提示操作
            this.$notify({
                title: '成功',
                message: `加载海洋站:${val.stationCode}潮位数据`,
                type: 'success'
            })
            this.loadStationSurgeRealDataListAndRange(
                val.tyCode,
                val.timestampStr,
                val.stationCode,
                this.isGroup
            )
            this.initChart()
        }
    }

    @Watch('isAdditionTide')
    onIsAdditionTide(isAdd: boolean): void {
        if (isAdd) {
            this.add2AstornomicTid(this.isGroup)
        } else {
            // 若不是叠加后的潮位，不需要叠加四色警戒潮位，四色警戒潮位只对应总潮位
            // this.resetAlertLevels()
            this.wipe2AstornomicTide(this.isGroup)
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
        console.log(`StationChartsView监听到width:${val.divWidth},height:${val.divHeight}`)
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

    /** 获取y轴上限 */
    get yAxisMax(): number {
        /** 距离chart顶部的距离 */
        const MARGIN_TOP = 20
        let yAxisMax = 0
        /** 最大增水值 */
        const surgeMax = Math.max(
            ...this.forecastSurgeMaxList.filter((val) => {
                return !Number.isNaN(val)
            })
        )

        /** 天文潮最大值 */
        const astoronomicTideMax = Math.max(
            ...this.forecastAstronomicTideList.filter((val) => {
                return !Number.isNaN(val)
            })
        )
        /** 警戒潮位值(最大) */
        const alertTide =
            this.alertRed != DEFAULT_ALERT_TIDE
                ? this.alertRed
                : this.alertOrange != DEFAULT_ALERT_TIDE
                ? this.alertOrange
                : this.alertYellow != DEFAULT_ALERT_TIDE
                ? this.alertYellow
                : this.alertBlue != DEFAULT_ALERT_TIDE
                ? this.alertBlue
                : 0
        yAxisMax = Math.max(surgeMax, astoronomicTideMax, this.isAdditionTide ? alertTide : 0)
        return parseFloat(yAxisMax.toFixed(1)) + MARGIN_TOP
    }

    /** TODO:[*] 22-06-29 注意此处虽然更新了 forecastSurgeMinList 但不会触发此计算方法
     * 获取y轴下限 */
    get yAxisMin(): number {
        /** 距离chart底部的距离 */
        const MARGIN_BOTTOM = 20
        let yAxisMin = 0
        const surgeMin = Math.min(
            ...this.forecastSurgeMinList.filter((val) => {
                return !Number.isNaN(val)
            })
        )
        const astoronomicTideMin = Math.min(
            ...this.forecastAstronomicTideList.filter((val) => {
                return !Number.isNaN(val)
            })
        )
        const isAdd = this.isAdditionTide
        yAxisMin = Math.min(...[surgeMin, astoronomicTideMin])

        return parseFloat(yAxisMin.toFixed(1)) - MARGIN_BOTTOM
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
