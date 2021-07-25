<template>
    <div>
        <div class="card">
            <div class="card-my-header">条件搜索</div>
            <div class="card-my-body">
                <div class="base-card-row vertical-center">
                    <!-- <div>年份</div> -->
                    <span class="font-shadow-base font-white">年份</span>
                    <!-- <h4>年份</h4> -->
                    <el-select v-model="selectedYear" clearable placeholder="请选择">
                        <el-option v-for="item in years" :key="item.id" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </div>
                <div class="base-card-row vertical-center">
                    <span class="font-shadow-base font-white">台风编号</span>
                    <el-select v-model="selectedTyCode" clearable placeholder="请选择">
                        <el-option
                            v-for="item in typhoonList"
                            :key="item.id"
                            :label="item.tyName"
                            :value="item.tyCode"
                        >
                            <span style="float: left">{{ item.tyCode }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{
                                item.tyName
                            }}</span>
                        </el-option>
                    </el-select>
                </div>
            </div>
        </div>
        <div class="card mt50">
            <div class="card-header card-my-header">
                集合预报列表
            </div>
            <div class="card-header card-my-body">
                <div class="row">
                    <div class="col">
                        <table class="table">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">台风编号</th>
                                    <th scope="col">时间戳</th>
                                    <th scope="col">创建时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(item, index) in coverageList"
                                    :key="index"
                                    @click="selectCoverage(item)"
                                >
                                    <th scope="row">{{ item.key }}</th>
                                    <td>{{ item.name }}</td>
                                    <td>{{ item.areaId }}</td>
                                    <td>{{ item.typeId }}</td>
                                    <td>{{ item.size }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace, Action } from 'vuex-class'
import { getTyListByYear } from '@/api/tyhoon'
import { DEFAULT_NUMBER, DEFAULT_SELECT_KEY, DEFAULT_SELECT_VAL } from '@/const/common'
import { SET_TYPHOON_CODE } from '@/store/types'
@Component({})
export default class TyphoonSearch extends Vue {
    /* 
        此窗口主要用来显示台风的搜索form
    */
    years: number[] = [2021, 2020, 2019]
    selectedYear: number = DEFAULT_NUMBER
    typhoonList: { tyCode: string; tyName: string }[] = [
        // { tyCode: '2107', tyName: 'xxx' },
        // { tyCode: '2016', tyName: 'xxx1' },
        // { tyCode: '2105', tyName: 'xxx2' }
    ]
    selectedTyCode: string = DEFAULT_SELECT_VAL
    mounted() {
        const now = new Date()
        const nowYear = now.getUTCFullYear()
        console.log(this.selectedYear)
    }
    created() {
        console.log(this.selectedYear)
        this.selectedYear = this.years[0]
    }
    @Watch('selectedYear')
    onSelectYear(val: number): void {
        const that = this
        getTyListByYear(val).then((res) => {
            if (res.status === 200) {
                if (res.data.length > 0) {
                    console.log(res.data)
                    res.data.forEach((item) => {
                        that.typhoonList.push({ tyCode: item.code, tyName: item.organ_code })
                    })
                }
            }
        })
    }

    @Watch('selectedTyCode')
    onSelectTyCode(val: string): void {
        console.log(val)
        this.setTyphoonCode(val)
    }

    @Mutation(SET_TYPHOON_CODE, { namespace: 'typhoon' }) setTyphoonCode
}
</script>
<style scoped lang="less">
@import '../../styles/base-card';
@import '../../styles/base';
// TODO:[-] 21-07-24 使用 mt num 的方式来确定对应的宽度 px 数值
.mt50 {
    width: 500px;
}
// .base-card {
//     // padding: 10px;
// }
// .base-card-title {
//     padding: 15px;
//     background: #34495e;
//     color: white;
//     user-select: none;
// }
// .base-card-content {
//     // ---
//     padding: 15px;
//     font-size: larger;
//     font-weight: 500;
//     line-height: 1.5;
//     color: #212529;
//     text-align: left;
//     .base-card-row {
//         line-height: 2.5rem;
//         justify-content: space-around;
//     }
// }
// .base-card-row {
//     display: flex;
//     flex-wrap: wrap;
//     padding: 10px;
//     // margin-bottom: 15px;
//     .cell {
//         display: flex;
//         margin: 5px;
//     }
//     .cell > p {
//         margin-right: 8px;
//     }
// }
</style>
