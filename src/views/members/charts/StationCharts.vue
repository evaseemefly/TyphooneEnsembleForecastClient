<template>
    <div id="station_charts"></div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// import Echarts from 'echarts'
import * as echarts from 'echarts'
@Component({})
export default class StationCharts extends Vue {
    mydata: any = null
    mounted() {
        const nodeDiv = document.getElementById('station_charts')
        if (nodeDiv) {
            const myChart: echarts.ECharts = echarts.init(nodeDiv)
            const option = {
                title: {
                    text: '潮位站实测数据',
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
                        data: [
                            '2020-09-15 17',
                            '2020-09-15 18',
                            '2020-09-15 19',
                            '2020-09-15 20',
                            '2020-09-15 21',
                            '2020-09-15 22',
                            '2020-09-15 23',
                            '2020-09-16 00',
                            '2020-09-16 01',
                            '2020-09-16 02',
                            '2020-09-16 03',
                            '2020-09-16 04',
                            '2020-09-16 05',
                            '2020-09-16 06',
                            '2020-09-16 07',
                            '2020-09-16 08',
                            '2020-09-16 09',
                            '2020-09-16 10',
                            '2020-09-16 11',
                            '2020-09-16 12',
                            '2020-09-16 13',
                            '2020-09-16 14',
                            '2020-09-16 15',
                            '2020-09-16 16',
                            '2020-09-16 17',
                            '2020-09-16 18',
                            '2020-09-16 19',
                            '2020-09-16 20',
                            '2020-09-16 21',
                            '2020-09-16 22',
                            '2020-09-16 23',
                            '2020-09-17 00',
                            '2020-09-17 01',
                            '2020-09-17 02',
                            '2020-09-17 03',
                            '2020-09-17 04',
                            '2020-09-17 05',
                            '2020-09-17 06',
                            '2020-09-17 07',
                            '2020-09-17 08',
                            '2020-09-17 09',
                            '2020-09-17 10',
                            '2020-09-17 11',
                            '2020-09-17 12',
                            '2020-09-17 13',
                            '2020-09-17 14',
                            '2020-09-17 15',
                            '2020-09-17 16',
                            '2020-09-17 17'
                        ],
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
                        data: [
                            0 - 0.6,
                            -3.1,
                            -6.6,
                            -10.7,
                            -14.4,
                            -12,
                            11.1,
                            26.8,
                            37,
                            34.9,
                            31.1,
                            36,
                            39.1,
                            39.5,
                            44.5,
                            61.4,
                            90.2,
                            130,
                            169.5,
                            192.8,
                            266.6,
                            317.3,
                            249.9,
                            181.6,
                            213.7,
                            229.1,
                            232.1,
                            226.2,
                            221.4,
                            214.4,
                            199.8,
                            175.3,
                            148.6,
                            123.5,
                            101,
                            81.3,
                            64.1,
                            49.7,
                            37.8,
                            27.4,
                            17.6,
                            8.5,
                            0.8,
                            -2.2,
                            -1.1,
                            -0.8,
                            1.2,
                            3.2
                        ]
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
                        data: [
                            0,
                            -5.7,
                            -11.8,
                            -17.2,
                            -21.5,
                            -26.6,
                            -22.1,
                            4.2,
                            13.1,
                            13.5,
                            11.9,
                            10.4,
                            10.2,
                            0.3,
                            -9.8,
                            -7.8,
                            4.6,
                            22.6,
                            42.1,
                            57.6,
                            69.4,
                            77.3,
                            74.9,
                            62.4,
                            49.1,
                            40.3,
                            34.7,
                            32.5,
                            27.9,
                            22.6,
                            24.2,
                            21.4,
                            15.5,
                            10.6,
                            7.1,
                            5,
                            5.4,
                            5.8,
                            2.9,
                            -3,
                            -6.5,
                            -6.1,
                            -5,
                            -4.9,
                            -4.6,
                            -3.5,
                            -3.1,
                            -3,
                            -1.3
                        ]
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
                        data: [
                            0,
                            -5.7,
                            -11.9,
                            -17.5,
                            -22.2,
                            -27.7,
                            -35.5,
                            -45.1,
                            -54,
                            -54.7,
                            -48.7,
                            -46.2,
                            -49,
                            -58.4,
                            -71.3,
                            -87.7,
                            -109.8,
                            -136,
                            -169.9,
                            -209,
                            -255.4,
                            -310.9,
                            -428.8,
                            -466.9,
                            -358.5,
                            -144.6,
                            -51.1,
                            23.6,
                            18.5,
                            17.3,
                            18,
                            15.8,
                            10.7,
                            4.8,
                            0.9,
                            0.5,
                            0.9,
                            -2,
                            -5.8,
                            -9.7,
                            -13,
                            -13.7,
                            -13.7,
                            -12.6,
                            -13.1,
                            -13.8,
                            -14.3,
                            -12.2,
                            -10.6
                        ]
                    }
                ]
            }
            myChart.setOption(option)
        }
    }
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
#station_charts {
    border-radius: 5px;
    position: absolute;
    right: 10px;
    width: 500px;
    height: 300px;
    background: linear-gradient(
        to right,
        rgba(77, 142, 124, 0.726) 40%,
        rgba(74, 145, 148, 0.726),
        #34495e
    );
    box-shadow: 2px 3px 8px black;
    // background: #f8f8f7;
}
</style>
