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
                        :percentage="25"
                        :width="85"
                    ></el-progress>
                </div>
                <div class="my-card-show">
                    <div class="my-card-info">
                        <div class="my-card-primary-title">当前任务</div>
                        <div class="my-card-content">
                            <div class="my-card-primary-content">TY2114</div>
                            <div class="my-card-sub-content">09/14 10:15</div>
                        </div>
                    </div>
                    <div class="my-card-info">
                        <div class="my-card-primary-title">当前进度</div>
                        <div class="my-card-content">
                            <div class="my-card-primary-content">写入db</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({})
export default class TaskRateCard extends Vue {
    mydata: any = null
    mounted() {}
    get computedTest() {
        return null
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
    background: rgba(114, 114, 114, 0.07);
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
