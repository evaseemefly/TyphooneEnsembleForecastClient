<template>
    <div>
        <div class="my-card-root">
            <div class="my-card-bg"></div>
            <div class="my-card-real">
                <!-- 左侧的圆环进度 -->
                <div class="my-card-circle">
                    <el-progress
                        type="circle"
                        :stroke-width="12"
                        :percentage="taskRate.caseRate"
                        :width="85"
                    ></el-progress>
                </div>
                <div class="my-card-show">
                    <div class="my-card-info">
                        <div class="my-card-primary-title">当前任务</div>
                        <div class="my-card-content">
                            <div class="my-card-primary-content">{{ tyCode | fortmatTyCode }}</div>
                            <div class="my-card-sub-content">
                                {{ taskRate.gmtCreated | fortmatDate('MM/DD HH:mm') }}
                            </div>
                        </div>
                    </div>
                    <div class="my-card-info">
                        <div class="my-card-primary-title">当前进度</div>
                        <div class="my-card-content">
                            <div class="my-card-primary-content">
                                {{ taskRate.caseState | getTaskStateVal }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace, Action, Getter } from 'vuex-class'

import {
    DEFAULT_NUMBER,
    DEFAULT_SELECT_KEY,
    DEFAULT_SELECT_VAL,
    DEFAULT_TYPHOON_ID,
    DEFAULT_TYPHOON_CODE,
    DEFAULT_CELERY_ID,
    DEFAULT_DATE
} from '@/const/common'
import { TaskStateEnum, getTaskStateVal } from '@/enum/task'
import { DEFAULTTIMESTAMP } from '@/const/typhoon'
import {
    SET_TYPHOON_CODE,
    SET_TYPHOON_ID,
    SET_TYPHOON_TIMESTAMP,
    GET_TYPHOON_ID,
    GET_TYPHOON_CODE
} from '@/store/types'
import { getTaskRateByTy } from '@/api/task'
import { fortmatData2YMDH, fortmatData2YMDHM, fortmatDate, fortmatTyCode } from '@/common/filter'
@Component({
    filters: { fortmatData2YMDH, fortmatData2YMDHM, fortmatDate, getTaskStateVal, fortmatTyCode }
})
export default class TaskRateCard extends Vue {
    tyId: number = DEFAULT_TYPHOON_ID
    // tyCode: string = DEFAULT_TYPHOON_CODE
    taskRate: {
        celeryId: string
        caseState: TaskStateEnum
        caseRate: number
        gmtCreated: Date
    } = {
        celeryId: DEFAULT_CELERY_ID,
        caseState: TaskStateEnum.UNLESS_INIT,
        caseRate: 0,
        gmtCreated: DEFAULT_DATE
    }
    @Watch('getTyphoonId')
    onTyphoonId(tyId: number): void {
        getTaskRateByTy(tyId).then(
            (res: {
                status: number
                data: {
                    celery_id: string
                    case_state: number
                    case_rate: number
                    gmt_created: Date
                }
            }) => {
                if (res.status === 200) {
                    this.taskRate = {
                        celeryId: res.data.celery_id,
                        caseState: res.data.case_state,
                        caseRate: res.data.case_rate,
                        gmtCreated: res.data.gmt_created
                    }
                }
            }
        )
    }
    @Getter(GET_TYPHOON_ID, { namespace: 'typhoon' })
    getTyphoonId
    @Getter(GET_TYPHOON_CODE, { namespace: 'typhoon' })
    getTyphoonCode

    get tyCode(): string {
        return this.getTyphoonCode
    }
}
</script>
<style lang="less">
// .el-progress--circle {
//     .el-progress-circle {
//         height: 100px;
//         width: 100px;
//     }
// }
.el-progress--circle {
    margin: 15px;
}
.el-progress__text {
    color: aliceblue !important;
}
// 修改圆圈进度条的背景色
.el-progress path:first-child {
    stroke: #292f467c;
}
// .el-progress-circle__path {
//     fill: #0d132e1c;
// }
// + 21-09-14 加入了高斯背景模糊的效果
.my-card-root {
    position: absolute;
    top: 100px;
    right: 100px;
    z-index: 999;
}
.my-card-bg {
    width: 300px;
    height: 118px;
    // background: #34495ee5;
    // filter: blur(1px);
    // border-radius: 8px;
    // background: rgba(114, 114, 114, 0.07);
    background: linear-gradient(
        to right,
        #34495e 40%,
        rgba(74, 145, 148, 0.726),
        rgba(77, 142, 124, 0.739)
    );
    border-radius: 10px;
    backdrop-filter: blur(4px);
}

.my-card-real {
    position: absolute;
    top: 0px;
    display: flex;
    // background: #34495e;
    width: 300px;
    .my-card-circle {
        width: 40%;
        // height: 100%;
        // background: #314950de;
    }
    // 当前card的主要文字显示区域
    .my-card-show {
        display: flex;
        flex-direction: column;
        width: 60%;
        padding: 5px;
        .my-card-info {
            display: flex;
            flex-direction: column;
            .my-card-primary-title {
                font-family: 'Microsoft Yahei', Arial, sans-serif;
                font-size: 20px;
                color: rgb(255, 255, 255);
                text-align: left;
            }
            .my-card-content {
                display: flex;
                .my-card-primary-content {
                    font-family: 'Microsoft Yahei', Arial, sans-serif;
                    color: #f1c40f;
                    margin-right: 10px;
                }
                .my-card-sub-content {
                    font-family: 'Microsoft Yahei', Arial, sans-serif;
                    color: #1abc9c;
                }
            }
        }
    }
}
</style>
