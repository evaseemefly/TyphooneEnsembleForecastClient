<template>
    <div
        id="station_surge"
        class="right-station-surge-form"
        @mousedown="drag($event, defaultFormId, 40, 45)"
        :class="isExpanded ? 'mybar-right-in' : 'mybar-right-out'"
    >
        <div class="my-detail-title" @click="isExpanded = !isExpanded">
            {{ isExpanded ? '收起' : '展开' }}
        </div>
        <div class="my-detail-form">
            <div class="sub-titles">
                <div
                    :class="
                        index == subTitleIndex ? 'actived my-sub-title' : 'unactived my-sub-title'
                    "
                    :key="index"
                    @click="checkSubTitle(index)"
                    v-for="(item, index) in subTitles"
                >
                    {{ item.title }}
                </div>
            </div>
            <div class="detail-content">
                <!-- <QuarterView
                    :tyCode="tyCode"
                    :stationCode="stationCode"
                    :timestampStr="timestampStr"
                    :stationName="stationName"
                ></QuarterView> -->
                <component
                    :is="getActiveCompName"
                    :tyCode="tyCode"
                    :stationCode="stationCode"
                    :timestampStr="timestampStr"
                    :stationName="stationName"
                    :toResize="toResize"
                ></component>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import * as echarts from 'echarts'
import * as elementResizeDetectorMaker from 'element-resize-detector'
import moment from 'moment'
import { getStationSurgeRealDataQuarterList } from '@/api/station'
import { Draggable, mouseDrag } from '@/directives/drag'
import { DEFAULT_TIMESTAMP, DEFAULT_TYPHOON_CODE } from '@/const/common'
import { DEFAULT_STATION_CODE } from '@/const/station'
import QuarterView from '@/components/charts/QuarterChartView.vue'
import StationCharts from '@/views/members/charts/StationCharts.vue'
@Component({
    directives: {
        drag: Draggable
    },
    components: {
        'quarter-view': QuarterView,
        'station-chart': StationCharts
    }
})
export default class TabContent extends Vue {
    @Prop()
    tyCode: string
    @Prop()
    stationCode: string
    @Prop()
    timestampStr: string
    @Prop()
    stationName: string
    isExpanded = false
    screenHeight = 0
    screenWidth = 0
    defaultFormId = 'station_surge'
    size: { divWidth: number; divHeight: number } = {
        divWidth: 0,
        divHeight: 0
    }
    sizeDefault: { divWidth: number; divHeight: number } = {
        divWidth: 500,
        divHeight: 400
    }
    subTitles: Array<{ title: string; index: number; componetName: string }> = [
        { title: '潮位分析数据', index: 0, componetName: 'quarter-view' },
        { title: '潮位站预报', index: 1, componetName: 'station-chart' }
    ]
    toResize = false
    subTitleIndex = 0
    //   quarterOptions: {
    //     tyCode: string;
    //     stationCode: string;
    //     timestampStr: string;
    //   } = {
    //     tyCode: "DEFAULT",
    //     stationCode: "DEFAULT",
    //     timestampStr: "",
    //   };
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
            `监听到options发生变化:tyCode:${val.tyCode},stationCode:${val.stationCode},timestampStr:${val.timestampStr}`
        )
        if (
            val.tyCode !== DEFAULT_TYPHOON_CODE &&
            val.stationCode !== DEFAULT_STATION_CODE &&
            val.timestampStr !== DEFAULT_TIMESTAMP
        ) {
            // 若监听到 options 发生变化，则展开 form
            this.isExpanded = true
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
                                max: element.three_quarters_val + 4,
                                min: element.quarter_val - 3
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

    checkSubTitle(index: number): void {
        this.subTitleIndex = index
    }

    initCharts(): void {
        // 基于准备好的dom，初始化echarts图表
        const nodeDiv = document.getElementById('station_quarter_charts')
        const myChart: echarts.ECharts = echarts.init(nodeDiv)

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
                    text: 'XXX潮位站增水分布图',
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

    drag(event: MouseEvent, elId: string, ignoreLeftSpace?: number, ignoreTopSpace?: number): void {
        mouseDrag(event, elId, ignoreLeftSpace, ignoreTopSpace)
    }

    // 重置当前 form 的大小(使用修改style的 height 与 width)
    resetSize(): void {
        const targetDiv: HTMLElement | null = document.getElementById(this.defaultFormId)
        if (targetDiv) {
            targetDiv.style.width = this.sizeDefault.divWidth + 'px'
            targetDiv.style.height = this.sizeDefault.divHeight + 'px'
        }
    }

    @Watch('isExpanded')
    onIsExpanded(val: boolean): void {
        // 收起时触发将 form 重置大小的操作
        this.toResize = !val
        if (this.toResize) {
            this.resetSize()
        }

        // if (!val) {
        //     this.toResize = true
        // }
    }

    @Watch('size', { immediate: true, deep: true })
    onSize(val: { divWidth: number; divHeight: number }) {
        console.log(`监听到width:${val.divWidth},height:${val.divHeight}`)
        if (this.myChart) {
            this.myChart.resize()
        }
    }

    get getActiveCompName() {
        return this.subTitles[this.subTitleIndex].componetName
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/station/surge-chart2';
.test {
    background: rgb(252, 182, 31);
    color: rgb(235, 232, 70);
}

// .my-detail-title {
//   min-width: 400px;
//   min-height: 400px;
// }
#station_quarter_charts {
    // height: 100%;
    // width: 100%;
    min-width: 400px;
    min-height: 400px;
    height: 100%;
}
</style>
