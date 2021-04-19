<template>
    <div id="forecast-area-bar">
        <div class="subtitle">
            <span>预报范围</span>
            <div class="color-bar-mini">
                <div class=" my-primary">流场</div>
                <div class="my-sub">风场</div>
            </div>
        </div>
        <div class="card-list-bar">
            <div
                class="card-info "
                :class="[isActive(area) ? 'active' : '', getCoverageType(area)]"
                :key="area.code"
                v-for="area in areas"
            >
                {{ area.desc }}
            </div>
            <!-- <div class="card-info">东中国海</div>
            <div class="card-info">东中国海</div>
            <div class="card-info">东中国海</div> -->
            <!-- <div class="board"></div> -->
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { loadForecastArea } from '@/api/comm'
// 引入常量
import { DictEnum } from '@/enum/dict'
// 引入部分中间变量
import { CoverageMin } from '@/views/content/oilspilling/coverage'
@Component({})
export default class ForecastAreaBar extends Vue {
    mydata: any = null
    areas: { code: number; name: string; val: string; desc: string }[] = []

    // @Prop(Number)
    // currentArea?: number
    @Prop(Array)
    currentCaseCoverageList!: CoverageMin[]
    mounted() {
        this.loadForecastAreaList()
    }
    loadForecastAreaList(): void {
        loadForecastArea().then((res) => {
            // console.log(res)
            if (res.status == 200) {
                if (res.data.length > 0) {
                    res.data.forEach(
                        (temp: {
                            code: number
                            desc: string
                            name: string
                            pid: number
                            type_code: string
                            val: string
                        }) => {
                            this.areas.push({ ...temp })
                        }
                    )
                }
            }
        })
    }

    // @Watch('currentCaseCoverageList')
    get areaList(): number[] {
        const tempAreaList: number[] = []
        if (this.currentCaseCoverageList && this.currentCaseCoverageList.length > 0) {
            this.currentCaseCoverageList.forEach((temp) => {
                tempAreaList.push(temp.coverageArea)
            })
        }
        return tempAreaList
    }
    // @Watch('currentCaseCoverageList')
    get coverageTypeList(): { coverageArea: number; coverageType: DictEnum }[] {
        const coverageList: { coverageArea: number; coverageType: DictEnum }[] = []
        if (this.currentCaseCoverageList && this.currentCaseCoverageList.length > 0) {
            this.currentCaseCoverageList.forEach((temp) => {
                coverageList.push({ ...temp })
            })
        }
        return coverageList
    }
    isActive(area: { code: number }): boolean {
        if (this.areaList.indexOf(area.code) != -1) {
            return true
        } else {
            return false
        }
    }
    getCoverageType(area: { code: number }): string {
        const coverageTemp = this.coverageTypeList.find((item) => {
            return item.coverageArea == area.code
        })
        if (coverageTemp) {
            if (coverageTemp.coverageType === DictEnum.COVERAGE_TYPE_CURRENT) {
                return 'my-primary'
            } else if (coverageTemp.coverageType === DictEnum.COVERAGE_TYPE_WIND) {
                return 'my-sub'
            }
        }
        return ''
    }
}
</script>
<style scoped lang="less">
#forecast-area-bar {
    width: 300px;
    position: absolute;
    bottom: 40px;
}
// .card-list-bar {
//     width: 300px;
//     border-radius: 0.4em;
//     box-shadow: 0 0 4px 0 rgb(151, 144, 144);
//     display: flex;
//     align-items: flex-end;
//     position: relative;
//     background: #7f8c8d71;
//     /* 防止子元素的阴影溢出父元素 */
//     overflow: hidden;
//     height: 85px;
//     color: white;
//     text-shadow: 0 0 4px black;
//     box-shadow: 0 0 4px 0 black;
// }

// .board {
//     background: darkgray;
//     width: 300px;
//     height: 30px;
//     position: absolute;
//     z-index: 3;
//     background: #2c3e50;
//     border-bottom-left-radius: 0.4em;
//     border-bottom-right-radius: 0.4em;
//     box-shadow: 0 0 5px black;
// }

// .card-list-bar > .card-info {
//     width: 50px;
//     height: 60px;
//     background: #16a085;
//     margin-left: -10px;
//     z-index: 1;
//     border-radius: 0.4em;
//     text-align: center;
//     line-height: 60px;
//     box-shadow: 1px 1px 9px black;
//     transition: 1s;
// }

// .card-list-bar > .card-info.active {
//     width: 100px;
//     height: 80px;
//     margin-left: 0px;
//     background: #1abc9c;
//     z-index: 2;
//     transition: 1s;
// }

// .card-list-bar > .card-info:hover {
//     width: 100px;
//     height: 80px;
//     margin-left: 0px;
//     background: #1abc9c;
//     z-index: 2;
//     transition: 1s;
// }

.card-list-bar {
    width: 300px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 black;
    display: flex;
    align-items: flex-end;
    position: relative;
    background: #7f8c8d71;
    /* 防止子元素的阴影溢出父元素 */
    overflow: hidden;
    /* height: 85px; */
    color: white;
    text-shadow: 0 0 4px black;
}

.board {
    background: darkgray;
    width: 300px;
    height: 30px;
    position: absolute;
    z-index: 3;
    background: #2c3e50;
    border-bottom-left-radius: 0.4em;
    border-bottom-right-radius: 0.4em;
    box-shadow: 0 0 5px black;
    /* position: absoulte; */
}

.card-list-bar > .card-info {
    width: 70px;
    height: 40px;
    background: #16a085;
    /* border: 2px black dashed; */
    margin-left: 4px;
    margin-right: 4px;
    margin-top: 2px;
    margin-bottom: 2px;
    z-index: 1;
    border-radius: 0.3em;
    text-align: center;
    line-height: 40px;
    /* box-shadow: 0 0 3px black; */
    box-shadow: 1px 1px 9px black;
    transition: 1s;
    /* transition: 1s width; */
    padding: 2px;
}

.card-list-bar > .card-info.active {
    width: 100px;
    /* height: 80px; */
    margin-left: 0px;
    // background: #34495e;
    z-index: 2;
    transition: 1s;
}
.card-list-bar > .card-info.my-primary {
    background: #34495e;
}
.card-list-bar > .card-info.my-sub {
    background: #f39c12;
}
.card-list-bar > .card-info:hover {
    width: 100px;
    /* height: 80px; */
    margin-left: 0px;
    background: #1abc9c;
    z-index: 2;
    transition: 1s;
    /* transition: 1s width; */
    /* transform: scale(1.5, 1.5) */
}

// 新加入的关于subtitle的
.subtitle {
    width: 300px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.subtitle > .color-bar-mini {
    display: flex;
}
.subtitle > span {
    font-size: 20px;
    color: white;
    text-shadow: 0 0 4px black;
}

.subtitle > .color-bar-mini > div {
    width: 50px;
    height: 30px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 rgb(151, 144, 144);
    margin-right: 5px;
    margin-left: 5px;
    box-shadow: 0 0 4px 0 black;
    /* 设置垂直与上下居中 */
    line-height: 30px;
    text-align: center;
    /* 字体颜色 */
    color: white;
    text-shadow: 0 0 4px black;
}

.subtitle > .color-bar-mini > .my-primary {
    background: #34495e;
}

.subtitle > .color-bar-mini > .my-sub {
    background: #f39c12;
}
</style>
