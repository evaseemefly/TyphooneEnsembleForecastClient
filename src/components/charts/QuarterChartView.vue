<template>
    <div id="station_quarter_charts" style=""></div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import * as echarts from 'echarts'
import * as elementResizeDetectorMaker from 'element-resize-detector'
import moment from 'moment'
import { getStationSurgeRealDataQuarterList } from '@/api/station'
import { Draggable } from '@/directives/drag'
import { DEFAULT_TIMESTAMP, DEFAULT_TYPHOON_CODE, DEFAULT_STATION_CODE } from '@/const/common'
@Component({
    directives: {
        drag: Draggable
    }
})
export default class QuarterView extends Vue {
    @Prop()
    tyCode: string
    @Prop()
    stationCode: string
    @Prop()
    timestampStr: string
    isExpanded = false
    screenHeight = 0
    screenWidth = 0
    size: { divWidth: number; divHeight: number } = {
        divWidth: 0,
        divHeight: 0
    }
    sizeDefault: { divWidth: number; divHeight: number } = {
        divWidth: 400,
        divHeight: 400
    }
    quarterList: {
        stationCode: string
        max: number
        min: number
        quarterVal: number
        threeQuartersVal: number
        medianVal: number
        forecastDt: Date
    }[] = []
    mydata: any = null
    myChart: echarts.ECharts = null
    mounted() {
        console.log('QuarterChartView mounted!')
        const that = this
        this.screenHeight = window.innerHeight
        this.screenWidth = window.innerWidth
        window.onresize = () => {
            return () => {
                that.screenHeight = window.innerHeight
                that.screenWidth = window.innerWidth
            }
        }
        // document.getElementById("station_surge").onresize = (e) => {
        //   return () => {
        //     that.size.divWidth = e.scrollWidth;
        //   };
        // };
        // var elementResizeDetectorMaker = require("element-resize-detector");
        const erd = elementResizeDetectorMaker()
        erd.listenTo(document.getElementById('station_surge'), function(element: HTMLElement) {
            that.size.divWidth = element.offsetWidth
            that.size.divHeight = element.offsetHeight
            // that.$nextTick(function() {
            //   console.log("Size: " + width + "x" + height);
            // });
        })
        if (
            this.tyCode !== DEFAULT_TYPHOON_CODE &&
            this.stationCode !== DEFAULT_STATION_CODE &&
            this.timestampStr !== DEFAULT_TIMESTAMP
        ) {
            this.loadQuarterCharts(this.tyCode, this.stationCode, this.timestampStr)
        }
    }
    get getQuaterOptions(): {
        tyCode: string
        stationCode: string
        timestampStr: string
    } {
        const { tyCode, stationCode, timestampStr } = this
        return { tyCode, stationCode, timestampStr }
    }
    @Watch('getQuaterOptions')
    onQuaterOptions(val: { tyCode: string; stationCode: string; timestampStr: string }): void {
        console.log(
            `QuarterChartView 监听到options发生变化:tyCode:${val.tyCode},stationCode:${val.stationCode},timestampStr:${val.timestampStr}`
        )
        if (
            val.tyCode !== DEFAULT_TYPHOON_CODE &&
            val.stationCode !== DEFAULT_STATION_CODE &&
            val.timestampStr !== DEFAULT_TIMESTAMP
        ) {
            this.loadQuarterCharts(val.tyCode, val.stationCode, val.timestampStr)
        }
    }

    loadStationRealDataQuarterList(tyCode: string, stationCode: string, timestampStr: string) {
        this.quarterList = []
        return getStationSurgeRealDataQuarterList(tyCode, timestampStr, stationCode).then((res) => {
            if (res.status === 200) {
                console.log(res.data)
                if (res.data.length > 0) {
                    res.data.forEach(
                        (element: {
                            forecast_dt: string
                            median_val: number
                            quarter_val: number
                            three_quarters_val: number
                            station_code: string
                            ty_code: string
                            max_val: number
                            min_val: number
                        }) => {
                            /*
                                forecast_dt: "2020-09-15T09:00:00Z"
                                forecast_index: 0
                                median_val: 0
                                quarter_val: 0
                                station_code: "SHW"
                                three_quarters_val: 0
                                ty_code: "2022"
                            */
                            const pushTemp = {
                                stationCode: element.station_code,
                                quarterVal: element.quarter_val,
                                threeQuartersVal: element.three_quarters_val,
                                medianVal: element.median_val,
                                forecastDt: new Date(element.forecast_dt),
                                max: element.max_val,
                                min: element.min_val
                            }
                            this.quarterList.push(pushTemp)
                        }
                    )
                }
            }
        })
    }

    loadQuarterCharts(tyCode: string, stationCode: string, timestampStr: string) {
        this.loadStationRealDataQuarterList(tyCode, stationCode, timestampStr).then((res) => {
            this.initCharts()
        })
    }

    initCharts(): void {
        // 基于准备好的dom，初始化echarts图表
        const nodeDiv = document.getElementById('station_quarter_charts')
        const myChart: echarts.ECharts = echarts.init(nodeDiv)
        const StationCode: string = this.stationCode

        const xData: Date[] = []
        const xDataFormatted: string[] = []
        const myConvertedData = []
        const max = 10
        const min = -20
        for (const temp of this.quarterList) {
            /*
		  {
			ty_code: "2022",
			station_code: "SHW",
			forecast_index: 0,
			forecast_dt: "2020-09-15T09:00:00Z",
			quarter_val: 0.0,
			three_quarters_val: 0.0,
			median_val: 0.0,
		  },
		*/
            //var temp=myData[index]
            myConvertedData.push([
                // temp.forecastDt,
                temp.min,
                temp.quarterVal,
                temp.medianVal,
                temp.threeQuartersVal,
                temp.max
            ])
            xData.push(temp.forecastDt)
            xDataFormatted.push(moment(temp.forecastDt).format('MM/DD/HH:mm'))
        }

        const option = {
            title: [
                {
                    text: `${StationCode}潮位站增水分布图`,
                    left: 'center',
                    textStyle: {
                        fontSize: 20,
                        color: '#f8f8f7'
                    }
                }
                // {
                //   text: "max:最大增水,Q3:3/4分位数 \n M:中位数,Q1:1/4分位数,min:最小值",
                //   borderColor: "#f8f8f7",
                //   borderWidth: 1,
                //   textStyle: {
                //     fontWeight: "normal",
                //     fontSize: 14,
                //     lineHeight: 20,
                //   },
                //   left: "10%",
                //   top: "90%",
                // },
            ],
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: xDataFormatted,
                boundaryGap: true,
                nameGap: 30,
                splitArea: {
                    show: false
                },
                axisLabel: {
                    //坐标轴刻度标签的相关设置。
                    color: '#f8f8f7'
                },
                splitLine: {
                    show: false
                },
                formatter: (val: Date) => {
                    return moment(val).format('MM/DD/HH:mm')
                },
                axisLine: {
                    show: true, //是否显示坐标轴轴线。
                    lineStyle: {
                        width: 2,
                        color: 'rgb(49, 59, 89)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '潮位:增水 unit:m',
                splitArea: {
                    show: false //坐标轴在 grid 区域中的分隔区域，默认不显示。
                },
                axisLabel: {
                    //坐标轴刻度标签的相关设置。
                    //formatter: 'expr {value}',  // 使用字符串模板，模板变量为刻度默认标签 {value}
                    show: true, //是否显示刻度标签。
                    //interval: 'auto', //坐标轴刻度标签的显示间隔，在类目轴中有效。
                    color: '#f8f8f7'
                },
                // 坐标轴在 grid 区域中的分隔线。
                splitLine: {
                    show: true, // 是否显示
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: ['#aaa']
                    }
                },
                axisLine: {
                    show: true, //是否显示坐标轴轴线。
                    //onZero:false,//X 轴或者 Y 轴的轴线是否在另一个轴的 0 刻度上，只有在另一个轴为数值轴且包含 0 刻度时有效。
                    //symbol:'arrow', //轴线两边的箭头
                    lineStyle: {
                        width: 2,
                        color: 'rgb(49, 59, 89)'
                    }
                }
            },
            series: [
                {
                    name: '统计信息', //箱形图
                    type: 'boxplot',
                    //legendHoverLink: true, //是否启用图例 hover 时的联动高亮。
                    //hoverAnimation: false, //是否开启 hover 在 box 上的动画效果。
                    itemStyle: {
                        //盒须图样式。
                        color: '#f39c12', //boxplot图形的颜色。 默认从全局调色盘 option.color 获取颜色
                        borderColor: '#d35400' //boxplot图形的描边颜色。支持的颜色格式同 color，不支持回调函数。
                    },
                    data: myConvertedData
                }
            ]
        }
        // 为echarts对象加载数据
        myChart.setOption(option)
        if (!this.myChart) {
            this.myChart = myChart
        }
    }

    @Watch('size', { immediate: true, deep: true })
    onSize(val: { divWidth: number; divHeight: number }) {
        console.log(`监听到width:${val.divWidth},height:${val.divHeight}`)
        if (this.myChart) {
            this.myChart.resize()
        }
    }
}
</script>
<style scoped lang="less">
@import '../../styles/station/surge-chart.less';
#station_surge {
    z-index: 1999;
    top: 100px;
}
#station_quarter_charts {
    // height: 100%;
    // width: 100%;
    min-width: 400px;
    min-height: 400px;
    height: 100%;
    width: 100%;
}
</style>
