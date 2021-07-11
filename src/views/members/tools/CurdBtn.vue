<template>
    <div id="user-case">
        <div class="user-statistics">
            <!-- TODO:[-] 19-11-19 注意此处对组件直接通过@click绑定是无效的，需要通过@click.native进行绑定click事件 -->
            <InfoBox
                :msg="showMsg"
                :iconstyle="isExpanded ? 'fas fa-angle-left' : 'fas fa-angle-right'"
                :levelstyle="'my-primary'"
                :showsize="'small'"
                :isExpanded="isExpanded"
                @click.native="isExpanded = !isExpanded"
            ></InfoBox>
            <!-- <transition-group name="fade"> -->
            <transition name="fade">
                <InfoBox
                    v-show="isExpanded"
                    :key="1"
                    :msg="'创建case'"
                    :iconstyle="'fa-edit'"
                    :levelstyle="'my-opt-btn'"
                    :showsize="'small'"
                    @click.native="isCaseDialogVisible = !isCaseDialogVisible"
                ></InfoBox>
            </transition>
            <transition name="fade">
                <InfoBox
                    v-show="isExpanded"
                    :key="2"
                    :msg="'历史查询'"
                    :iconstyle="'fas fa-search '"
                    :levelstyle="'my-opt-btn'"
                    :showsize="'small'"
                    @click.native="onClick"
                ></InfoBox>
            </transition>
            <transition name="fade">
                <InfoBox
                    :key="3"
                    v-show="isExpanded"
                    :msg="'风场+流场数据'"
                    :iconstyle="'fa-map'"
                    :levelstyle="'my-opt-btn'"
                    :showsize="'small'"
                    @click.native="isShowByCoverageSearch = !isShowByCoverageSearch"
                ></InfoBox>
            </transition>
            <!-- </transition-group> -->
        </div>

        <transition name="fade">
            <div class="user-caselist my-caselist" v-show="isShowByList">
                <JobList :caseList="caseList"></JobList>
            </div>
        </transition>
        <transition name="fade">
            <div class="user_caselist my-coverage-searchform" v-show="isShowByCoverageSearch">
                <CoverageSearchForm></CoverageSearchForm>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import InfoBox from '@/views/members/form/InfoBox.vue'
import JobListUser from '@/views/members/table/JobListByUser.vue'
import JobList from '@/views/members/table/JobListMin.vue'
import CoverageSearchForm from '@/views/members/form/search_form/CoverageSearchForm.vue'
import { ICaseMin, CaseMinInfo } from '@/middle_model/case'
import { SET_CREATE_OIL_CASE_MODAL } from '@/store/types'
import { Mutation } from 'vuex-class'
@Component({
    components: { InfoBox, JobListUser, JobList, CoverageSearchForm }
})
export default class CurdBtn extends Vue {
    mydata: any = null
    isShowByList = false
    isShowByCoverageSearch = false
    isCaseDialogVisible = false
    isShowCreateForm = false // + 21-07-11 创建case form (风暴潮)
    // 已经展开
    isExpanded = false
    @Prop()
    caseList: CaseMinInfo[]

    mounted() {}
    onClick() {
        this.isShowByList = !this.isShowByList
        // console.log('被点击了')
    }

    @Mutation(SET_CREATE_OIL_CASE_MODAL, { namespace: 'map' }) setIsShow

    @Watch('isCaseDialogVisible')
    onIsShow(isShow: boolean): void {
        // console.log(`is show被切换了${isShow}`)
        this.setIsShow(isShow)
    }

    get showMsg(): string {
        let msg = ''
        if (this.isExpanded) {
            msg = '隐藏'
        } else {
            msg = '展开'
        }
        return msg
    }
}
</script>
<style scoped lang="less">
@import '../../../styles/base.less';
@margin: {
    margin: 0.5em;
};
.user-statistics {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
#case_list_content {
    width: 100%;
    display: flex;
    padding: 0.5em;
    // margin: 0.5em;
    flex-direction: column;
    @centerbackground();
    // 用户的统计信息
}
#user-case {
    display: flex;
    flex-direction: column;
    position: relative;
    // .user-caselist {
    //     position: absolute;
    // }
    .my-caselist {
        top: 80px;
        left: 80px;
        width: 23em;
        position: absolute;
    }
    .my-coverage-searchform {
        top: 80px;
        left: 80px;
        width: 600px;
        position: absolute;
    }
}
// .fade-enter-active,
// .fade-leave-active {
//     transition: opacity 0.5s;
// }

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
.fade-enter-active {
    transition: 0.75s;
}
.fade-leave-active {
    transition: 0.75s;
}

.user-statistics {
    .info-box:nth-child(2) {
        transition-delay: 0.25s;
        // background: red;
    }
    .info-box:nth-child(3) {
        transition-delay: 0.5s;
        // background: green;
    }
    .info-box:nth-child(4) {
        transition-delay: 0.75s;
        // background: yellow;
    }
}
// 有一些问题暂时注释掉
// .user-statistics:nth-child(2) {
//     transition-delay: 1s;
// }
// .user-statistics:nth-child(3) {
//     transition-delay: 2s;
// }
// .user-statistics:nth-child(4) {
//     transition-delay: 3s;
// }

// ----
// .user-statistics:nth-child(3n + 1) {
//     transition-delay: 1s;
// }
// .user-statistics:nth-child(3n + 2) {
//     transition-delay: 2s;
// }
// .user-statistics:nth-child(3n + 3) {
//     transition-delay: 3s;
// }
// ----
// .fade-enter-active:nth-child(3n + 1) {
//     transition-delay: 0.3s;
// }
// .fade-enter-active:nth-child(3n + 3) {
//     transition-delay: 0.3s;
// }
// .fade-enter-active:nth-child(3n + 3) {
//     transition-delay: 0.3s;
// }
// .fade-enter-active:nth-child(3n + 4) {
//     transition-delay: 0.3s;
// }
</style>
