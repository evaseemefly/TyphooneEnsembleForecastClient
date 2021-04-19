<template>
    <div id="make_point_btn">
        <div class="left text-box">
            <el-input v-model="lat" placeholder="lat"></el-input>
            <el-input v-model="lon" placeholder="lon"></el-input>
        </div>
        <div class="right complex-btn">
            <button type="button" class="btn btn-success">点选</button>
            <button type="button" class="btn btn-danger" @click="reset">复原</button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace, Getter } from 'vuex-class'
// store相关
import { GET_CURRENT_LATLNG, GET_INITIAL_LATLNG, SET_CURRENT_LATLNG } from '@/store/types'
@Component({})
export default class MakePointBtn extends Vue {
    lat = 0
    lon = 0
    // TODO:[-] 20-05-26
    @Getter(GET_CURRENT_LATLNG, { namespace: 'map' }) getLatlng

    @Getter(GET_INITIAL_LATLNG, { namespace: 'map' }) getInitialLatlng

    @Mutation(SET_CURRENT_LATLNG, { namespace: 'map' }) setCurrentLatlng

    mounted() {
        this.lat = this.getLatlng[0]
        this.lon = this.getLatlng[1]
    }

    @Watch('getLatlng')
    onLatlng(val: Array<number>): void {
        if (val.length > 1) {
            this.lat = val[0]
            this.lon = val[1]
        }
    }

    // 复原位置
    reset(): void {
        // 将当前位置复原为 初始位置
        this.setCurrentLatlng(this.getInitialLatlng)
    }
}
</script>

<style scoped lang="less">
#make_point_btn {
    position: fixed;
    bottom: 100px;
    // display: flex;
    // flex-direction: column;
    // position: fixed;
    // bottom: 90px;
    // margin-left: 45px;
    // margin-bottom: 15px;
    .text-box {
        display: flex;
        background: #4d4d4a91;
        .el-input {
            width: 8rem;
            margin: 0.3em;
            input {
                margin: 0.5rem;
            }
        }
    }
    .complex-btn {
        .btn {
            margin: 0.3em;
            box-shadow: 0px 5px 11px #4d4d4a;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
            border-bottom-left-radius: 8px;
        }
    }
}
</style>
