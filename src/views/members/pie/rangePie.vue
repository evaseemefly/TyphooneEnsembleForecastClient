/* eslint-disable @typescript-eslint/no-this-alias */
<template>
    <div
        class="container"
        :class="isExpanded ? 'mybar_right_in' : 'mybar_right_out'"
        @mouseover="isExpanded = true"
        @mouseleave="isExpanded = false"
    >
        <div id="range_pie"></div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import echarts from 'echarts'
@Component({})
export default class CustomPie extends Vue {
    mydata = null
    chart?: any = null
    // 是否展开窗口| false:未展开, true:展开了|默认未展开
    isExpanded = false
    @Prop(Number)
    leftNum: number
    @Prop(Number)
    currentNum: number
    mounted(): void {
        //
        this.initChart()
        // console.log('测试eslint')
    }
    initChart(): void {
        const chartEle = document.getElementById('range_pie') as HTMLDivElement
        if (chartEle != null) {
            this.chart = echarts.init(chartEle)
            const option = {
                backgroundColor: '#1a6865',

                title: {
                    text: '溢油散点数量',
                    left: 'center',
                    top: 20,
                    textStyle: {
                        color: '#ccc'
                    }
                },

                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },

                visualMap: {
                    show: false,
                    min: 80,
                    max: 600,
                    inRange: {
                        colorLightness: [0, 1]
                    }
                },
                series: [
                    {
                        name: '读取进度',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '50%'],
                        color: ['rgb(84, 240, 17)', 'rgb(249, 241, 17)'],
                        data: [
                            { value: 0, name: '当前散点数' },
                            { value: 100, name: '总数' }
                        ].sort(function(a, b) {
                            return a.value - b.value
                        }),
                        roseType: 'radius',
                        label: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        },
                        labelLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.3)'
                            },
                            smooth: 0.2,
                            length: 10,
                            length2: 20
                        },
                        itemStyle: {
                            color: '#17a2b8',
                            shadowBlur: 200,
                            shadowColor: '#17a2b8'
                        },

                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: function(idx): number {
                            return Math.random() * 200
                        }
                    }
                ],
                color: [
                    'rgb(254,67,101)',
                    'rgb(252,157,154)',
                    'rgb(249,205,173)',
                    'rgb(200,200,169)',
                    'rgb(131,175,155)'
                ]
            }
            this.chart.setOption(option)
            // this.timerReloadData()
        }
    }
    // 定时更新数据
    timerReloadData(): void {
        let index = 0
        // const that = this
        const timer = setInterval(() => {
            index++
            this.leftNum = 100 - index * 10
            this.currentNum = index * 10
            if (this.leftNum <= 0) {
                clearInterval(timer)
            }
        }, 2000)
    }
    @Watch('currentNum')
    onCurrentNum(val?: number): void {
        const option = {
            series: [
                {
                    data: [
                        { value: this.currentNum, name: '当前散点数' },
                        { value: this.leftNum, name: '总数' }
                    ]
                }
            ]
        }
        // 修改设置
        if (this.chart != undefined) {
            this.chart.setOption(option)
        }
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/base';
.container {
    height: calc(100% - 460px);
    // background-color: #bbbbbb;
    padding: 0;
    @formradius();
}
#range_pie {
    /* width: 217px; */
    width: 100%;
    /* height: 200px; */
    height: 100%;
    // background: rgb(202, 195, 195);
    @formradius();
    div:last-child {
        @formradius();
    }
}
#range_pie > div {
    background: red;
}
#range_pie > div:last-child {
    width: 80%;
}
</style>
