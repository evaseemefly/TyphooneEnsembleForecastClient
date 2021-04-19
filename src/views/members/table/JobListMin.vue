<template>
    <div id="job-list" class="card bg-info">
        <div class="card-header card-my-header text-white">case列表</div>
        <div class="card-body card-my-body">
            <ul class="list-group" v-loading="isLoading">
                <li
                    class="list-group-item list-my-group-item"
                    v-for="(item, index) in caseList"
                    :key="index"
                    @click="onClick(item)"
                >
                    {{ item.convertDate() }}|{{ item.name }}
                </li>
            </ul>
            <el-pagination
                background
                layout="prev, pager, next"
                :total="tableDataCount"
                :page-size="tablePageSize"
                :pager-count="5"
                @current-change="jobPageChange"
            ></el-pagination>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { ICaseMin, CaseMinInfo } from '@/middle_model/case'
import { AreaEnum, getAreaVal } from '@/enum/area'
import { StatueEnum } from '@/enum/status'
import { loadCaseListByUser, loadCaseHistory } from '@/api/api'
import { Case } from './case'
import { Mutation } from 'vuex-class'
import { SET_CASE_CODE } from '@/store/types'
@Component({
    filters: {
        getStatusLevel(val: number) {}
    }
})
export default class JobListUser extends Vue {
    isLoading = true
    tableData: CaseMinInfo[] = []

    mounted() {
        this.loadCaseList()
    }
    getStatusLevel(val: number): string {
        let level = ''
        if (val < 50) {
            level = 'exception'
        } else if (val < 80) {
            level = 'warning'
        } else if (val >= 80) {
            level = 'success'
        }
        return level
    }

    jobPageChange(pageNum: number): void {
        this.tablePageIndex = pageNum
        this.loadCaseList()
    }

    tableDataCount = 100
    // 页总数
    tablePageCount = 0
    // 当前页
    tablePageIndex = 1
    // 当前页容积
    tablePageSize = 10

    // 是否为缩小版
    @Prop({ default: false })
    isMin!: boolean

    // @Prop()
    caseList: CaseMinInfo[] = []
    clearCaseList() {
        this.caseList = []
    }
    // TODO:[-] 20-02-18 不要放在此处，放在oil map 中
    loadCaseList(): void {
        console.log('加载 case list！')
        this.clearCaseList()
        const productType = this.$store.getters['common/productType']
        // const caseList: CaseMinInfo[] = []
        const caseFactory = new Case(productType)
        this.isLoading = true
        caseFactory.getCaseListByUser(this.tablePageIndex, this.tablePageSize).then((res) => {
            console.log(`获取到上面的promise传给的 CaseMinInfo[]:${res}`)
            this.caseList = res.caselist
            this.tableDataCount = res.count
            this.isLoading = false
        })
        // TODO:[x] 以下为之前备份的，先重新封装至 ./case.ts 中
        // const typeProduct: number = this.$store.state.common.productType
        // loadCaseListByUser(typeProduct).then((res) => {
        //     if (res.status === 200) {
        //         res.data.forEach(
        //             (temp: {
        //                 rate: number
        //                 date: string
        //                 name: string
        //                 state: StatueEnum
        //                 tag: string
        //                 area: AreaEnum
        //                 code: string
        //             }) => {
        //                 // const caseTemp: CaseMinInfo = new CaseMinInfo()
        //                 // Object.assign()
        //                 const tempData = new CaseMinInfo(
        //                     new Date(temp.date),
        //                     temp.name,
        //                     temp.code,
        //                     temp.state,
        //                     temp.tag,
        //                     temp.rate,
        //                     temp.area
        //                 )
        //                 // TODO:[*] 20-02-18 注意由后台返回的data建议使用接口声明，然后需要new成实现对象
        //                 this.tableData.push(tempData)
        //             }
        //         )
        //     }
        // })
    }

    @Mutation(SET_CASE_CODE, { namespace: 'case' }) setCaseCode

    onClick(item: CaseMinInfo): void {
        // 获取到选定的item的id传给后台即可
        console.log(item.code)
        // 根据指定的case的id以及user id获取模型信息
        // 加载指定模型的平均轨迹
        //
        // this.$store
        //     .dispatch('case/setCaseCode', item.code)
        //     .then(() => {
        //         console.log(`存入${item.code}`)
        //     })
        //     .catch((err) => {
        //         console.log(`出现错误:${err}`)
        //     })
        this.setCaseCode(item.code)
    }

    get computedTest() {
        return null
    }
    get columnWidth() {
        return this.isMin ? 120 : 180
    }

    get rowStyle(): string {
        let style = ''
        if (this.isMin) {
            style = 'background-color:#329d96;color: #fff;font-weight: 500;'
        }
        return style
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/base-form';
.bg-info {
    background-color: transparent !important;
}
#data_list {
    margin-top: 5px;
    background: rgba(73, 115, 165, 0.701);
    padding-right: 8px;
    border-radius: 5px;
}
li {
    list-style: none;
    text-align: left;
}

.list-my-group-item {
    color: rgb(4, 4, 4);
    font-size: 85%;
    background: rgba(184, 206, 200, 0.557);
    padding-top: 5px;
    padding-bottom: 5px;
    font-weight: 400;
    text-shadow: 2px 2px 8px rgb(33, 32, 32);
}

.list-my-group-item:hover {
    color: rgb(255, 255, 255);
    font-size: 85%;
    background: rgba(111, 238, 204, 0.557);
    padding-top: 5px;
    padding-bottom: 5px;
    font-weight: 600;
}
.form-group .control-label {
    color: #ffffff;
    font-family: 'Lato', Helvetica, Arial, sans-serif;
}

#job-list {
    margin-top: 5px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
    /* 0.5s动画过渡的时间 */
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}

/* #condition .card-my-header {
    background: linear-gradient(to right, #1a6865 30%, rgba(4, 107, 114, 0.639));
    font-size: 90%;
    text-shadow: 2px 2px 8px rgb(33, 32, 32);
  } */

.card {
    @card-box-shadow();
}
/* 自动以的card-body样式 */
#my_condition .card-my-body {
    /* background: linear-gradient(to right, #248e8a 30%, rgba(4, 107, 114, 0.639)); */
    padding-left: 24px;
}

/* 对于多条件搜索的card的一些样式 */
.card-my-header {
    background: linear-gradient(to right, #1a6865 30%, rgba(4, 107, 114, 0.639));
    font-size: 90%;
    text-shadow: 2px 2px 8px rgb(33, 32, 32);
    width: 100%;
}
/* 自动以的card-body样式 */
.card-my-body {
    background: linear-gradient(to right, #248e8a 30%, rgba(4, 107, 114, 0.639));
    padding: 8px 8px 8px 8px !important;
    width: 100%;
}
.btn-my {
    background: #2988d2;
}
</style>
