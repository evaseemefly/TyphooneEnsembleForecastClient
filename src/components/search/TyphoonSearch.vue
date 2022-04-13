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
                            :label="item.code"
                            :value="item.code"
                        >
                            <span style="float: left">{{ item.code }}</span>
                            <!-- 不再显示 时间戳，只显示不同的 ty_code -->
                            <!-- <span style="float: right; color: #8492a6; font-size: 13px">{{
                                item.timestamp
                            }}</span> -->
                        </el-option>
                    </el-select>
                </div>
            </div>
        </div>
        <div class="card mt50">
            <div class="card-header card-my-header">
                集合预报列表
            </div>
            <div class="card-header card-my-body my-result-table-parent">
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
                                    <td>{{ item.gmtCreated | fortmatData2YMDHM }}</td>
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
import {
    DEFAULT_NUMBER,
    DEFAULT_SELECT_KEY,
    DEFAULT_SELECT_VAL,
    DEFAULT_TYPHOON_ID // 默认未赋值时的台风id
    // DEFAULT_TYPHOON_CODE // 默认未赋值时的台风code
} from '@/const/common'
import { DEFAULTTIMESTAMP, DEFAULTTYCODE } from '@/const/typhoon'
import { SET_TYPHOON_CODE, SET_TYPHOON_ID, SET_TYPHOON_TIMESTAMP } from '@/store/types'
import { fortmatData2YMDH, fortmatData2YMDHM, formatTyphoonCode } from '@/common/filter'
@Component({
    filters: { fortmatData2YMDH, fortmatData2YMDHM }
})
export default class TyphoonSearch extends Vue {
    /*
        此窗口主要用来显示台风的搜索form
    */
    years: number[] = [2022, 2021, 2020, 2019]
    selectedYear: number = DEFAULT_NUMBER
    typhoonList: { code: string }[] = []
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
    // selectedTyCode: string = DEFAULTTYCODE
    selectedTyCode = ''
    selectedTyId: number = DEFAULT_TYPHOON_ID
    selectedTyTimeStampStr: string = DEFAULTTIMESTAMP
    mounted() {
        const now = new Date()
        const nowYear = now.getUTCFullYear()
        // console.log(this.selectedYear)
    }
    created() {
        // console.log(this.selectedYear)
        this.selectedYear = this.years[0]
    }
    @Watch('selectedYear')
    onSelectYear(val: number): void {
        const that = this
        this.typhoonList = []
        getTyListByYear(val).then((res) => {
            if (res.status === 200) {
                if (res.data.length > 0) {
                    // console.log(res.data)
                    res.data.forEach((item) => {
                        that.typhoonList.push({ code: item.code })
                    })
                    this.selectedTyCode = this.typhoonList[this.typhoonList.length - 1].code
                }
            }
        })
    }

    @Watch('selectedTyCode')
    onSelectTyCode(val: string): void {
        // console.log(val)
        // this.typhoonList = []
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
                // TODO:[-] 22-02-17 加入了排序
                tyCaseList.sort((a, b) => {
                    if (a.gmtCreated > b.gmtCreated) {
                        // 返回正数，b排在a的前面
                        return -1
                    } else {
                        return 1
                    }
                })
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
        // TODO:[-] 21-07-28 选中指定的集合预报路径集，修改 tyId 与 tyCode + timestamp
        val.active = !val.active
        if (val.active) {
            this.selectedTyId = val.tyId
            this.selectedTyCode = val.tyCode
            this.selectedTyTimeStampStr = val.timestamp
        } else {
            this.selectedTyId = DEFAULT_TYPHOON_ID
            this.selectedTyCode = DEFAULTTYCODE
            this.selectedTyTimeStampStr = DEFAULTTIMESTAMP
        }
    }

    // + 22-01-07 新加入的 compute 计算属性用来处理 v-mode 无法直接加入过滤器的问题
    get getTyCodeFormated(): string {
        return formatTyphoonCode(this.selectedTyCode)
    }

    @Watch('selectedTyId')
    onSelectTyId(tyId: number): void {
        this.setTyphoonId(tyId)
    }

    @Watch('selectedTyTimeStampStr')
    onSelectTyTimeStamp(ts: string): void {
        this.setTyTimeStamp(ts)
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

    @Mutation(SET_TYPHOON_TIMESTAMP, { namespace: 'typhoon' }) setTyTimeStamp
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
// + 21-09-11 加入结果列表的高度限制以及显示滚动条
.my-result-table-parent {
    max-height: 300px;
    overflow-y: scroll;
    overflow-x: hidden;
}
// TODO:[-] 21-09-12 加入的滚动条的相关样式
// 参考文章: https://segmentfault.com/a/1190000012800450
// 滑轨的背景色
.my-result-table-parent::-webkit-scrollbar {
    width: 16px;
    height: 16px;
    background-color: rgba(4, 107, 114, 0.639);
}
/*定义滚动条轨道
 内阴影+圆角*/
.my-result-table-parent::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    background-color: #f5f5f5c2;
}
/*定义滑块
 内阴影+圆角*/
.my-result-table-parent::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #34495eb0;
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
