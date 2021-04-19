<template>
    <div>
        <div id="my_grid_detail_chart"></div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import echarts from 'echarts'
//引入fecha格式化时间
import fecha from 'fecha'
@Component({})
export default class GridDetailChart extends Vue {
    // 外部传入的 格点 的id
    @Prop(Number)
    gridId: number

    // echart 的 chart 对象
    myChart: any
    mydata: any = null
    mounted() {}
    get computedTest() {
        return null
    }
    // 初始化echarts表格
    initCharts() {
        // 基于准备好的dom，初始化echarts图表
        const myself = this
        myself.myChart = null
        // this.disposeCharts()
        if (myself.myChart === null) {
        }
        const domChart = document.getElementById('my_grid_detail_chart')
        if (domChart) {
            myself.myChart = echarts.init(domChart)
        }

        // this.values = [];
        // this.columns = [];
        // console.log(params);
        //				var myChartContent=echarts.init(document.getElementById('bar_content'));
        //		var myBar = echarts.init(document.getElementById('mybar'));
        const option = {
            tooltip: {
                show: true
            },
            legend: {
                data: ['天文潮位'],
                textStyle: {
                    color: 'rgba(238, 238, 16, 0.92)'
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

                    data: myself.columns2format,
                    //使用以下方式实现显示全部x坐标上的点
                    axisLabel: {
                        //interval: 0,
                        textStyle: {
                            color: '#FFFFFF'
                        }
                    }

                    //                  interval:0
                }
            ],
            yAxis: [
                {
                    // min: function () {
                    //   let min = Math.min(myself.values)
                    //   return min;
                    // },
                    type: 'value',
                    scale: true,
                    axisLabel: {
                        //					interval: 0,
                        textStyle: {
                            color: '#FFFFFF'
                        }
                        // formatter: function (value, index) {
                        //   return value.toFixed(2);
                        // }
                    }
                }
            ],
            series: [
                {
                    name: '天文潮位', //需要与legend中的data相同
                    type: 'line',
                    smooth: true, //不是折线，是曲线
                    itemStyle: {
                        normal: {
                            //设置折点的颜色
                            color: 'rgb(189, 196, 56)',
                            //注意lineStyle需要卸载normal里面
                            //自定义折线颜色
                            lineStyle: {
                                color: '#00FF00'
                            },
                            //自定义折线下区域的颜色
                            areaStyle: {
                                color: 'rgb(56, 196, 147)'
                            }

                            // label: {
                            //   show: true //显示每个点的值
                            // }
                        }
                    }, //向下填充区域
                    data: []
                    // label: {
                    //   normal: {
                    //     show: true
                    //   }
                    // }
                }
            ]
        }
    }
}
</script>
<style scoped></style>
