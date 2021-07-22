<template>
    <div>
        <div class="base-card">
            <div class="base-card-title"></div>
            <div class="base-card-content">
                <div class="base-card-row">
                    <p>年份</p>
                    <el-select v-model="tyCode" clearable placeholder="请选择">
                        <el-option v-for="item in years" :key="item.id" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({})
export default class TyphoonSearch extends Vue {
    /* 
        此窗口主要用来显示台风的搜索form
    */
    years: number[] = [2021, 2020, 2019]
    mydata: any = null
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped></style>
