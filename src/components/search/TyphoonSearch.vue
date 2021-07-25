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
                                    v-for="(item, index) in tyGroupCaseList"
                                    :key="index"
                                    :class="item.active ? 'active' : ''"
                                    @click="selectTyGroup(item)"
                                >
                                    <!-- <th scope="row">{{ item.key }}</th> -->
                                    <td>{{ item.tyCode }}</td>
                                    <td>{{ item.timestamp }}</td>
                                    <td>{{ item.gmtCreated | fortmatData2YMDH }}</td>
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
import { getTyListByYear, getTyCaseListByTyCode } from '@/api/tyhoon'
import { DEFAULT_NUMBER, DEFAULT_SELECT_KEY, DEFAULT_SELECT_VAL } from '@/const/common'
import { SET_TYPHOON_CODE, SET_TYPHOON_ID } from '@/store/types'
import { fortmatData2YMDH } from '@/common/filter'
@Component({
    filters: { fortmatData2YMDH }
})
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
    tyGroupCaseList: {
        gmtCreated: Date
        timestamp: string
        tyCode: string
        tyId: number
        activate: boolean
    }[] = []
    selectedTyGroupMid: {
        gmtCreated: Date
        timestamp: string
        tyCode: string
        tyId: number
    } = { gmtCreated: new Date(), timestamp: '', tyCode: '', tyId: -1 }
    selectedTyCode: string = DEFAULT_SELECT_VAL
    selectedTyId: number = DEFAULT_SELECT_KEY
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
        // console.log(val)
        this.typhoonList = []
        this.setTyphoonCode(val)
        this.loadTyCaseListByTyCode(val)
    }

    loadTyCaseListByTyCode(tyCode: string) {
        const that = this
        const tyCaseList: {
            gmtCreated: Date
            timestamp: string
            tyCode: string
            tyId: number
            active: boolean
        }[] = []
        getTyCaseListByTyCode(tyCode)
            .then(
                (res: {
                    status: number
                    data: {
                        gmt_created: string
                        timestamp: string
                        ty_code: string
                        ty_id: number
                    }[]
                }) => {
                    if (res.status === 200) {
                        if (res.data.length > 0) {
                            /*
                        0:
                            gmt_created: "2021-07-21T09:59:53.112045Z"
                            timestamp: "2021072110"
                            ty_code: "2107"
                            ty_id: 6
                    */
                            // console.log(res.data)
                            res.data.forEach((temp) => {
                                tyCaseList.push({
                                    gmtCreated: new Date(temp.gmt_created),
                                    timestamp: temp.timestamp,
                                    tyCode: temp.ty_code,
                                    tyId: temp.ty_id,
                                    active: false
                                })
                            })
                        }
                    }
                }
            )
            .then(() => {
                that.tyGroupCaseList = tyCaseList
            })
    }

    selectTyGroup(val: {
        gmtCreated: Date
        timestamp: string
        tyCode: string
        tyId: number
        active: boolean
    }): void {
        val.active = !val.active
        if (val.active) {
            this.selectedTyId = val.tyId
            this.selectedTyCode = val.tyCode
        } else {
            this.selectedTyId = DEFAULT_SELECT_KEY
            this.selectedTyCode = DEFAULT_SELECT_VAL
        }
    }

    @Watch('selectedTyId')
    onSelectTyId(tyId: number): void {
        this.setTyphoonId(tyId)
    }

    // @Watch('selectedTyGroupMid')
    // onSelectTyGroupMid(val: {
    //     gmtCreated: Date
    //     timestamp: string
    //     tyCode: string
    //     tyId: number
    // }): void {
    //     this.setTyphoonId(val.tyId)
    // }

    @Mutation(SET_TYPHOON_CODE, { namespace: 'typhoon' }) setTyphoonCode

    @Mutation(SET_TYPHOON_ID, { namespace: 'typhoon' }) setTyphoonId
}
</script>
<style scoped lang="less">
@import '../../styles/base-card';
@import '../../styles/base';
// TODO:[-] 21-07-24 使用 mt num 的方式来确定对应的宽度 px 数值
.mt50 {
    width: 500px;
}
tbody {
    color: white;
    // 加入一个阴影效果
    text-shadow: 2px 2px 8px #212020;
    tr {
        cursor: pointer;
    }
    tr.active {
        background: #f39c12;
    }
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
