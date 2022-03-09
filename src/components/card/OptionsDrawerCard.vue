<template>
    <div class="options-drawer-card-root">
        <div class="drawer-children-card" v-for="father in optionItems" :key="father.key">
            <div class="card-title">{{ father.cardTitle }}</div>
            <div class="card-content">
                <div v-for="child in father.options" :key="child.key">
                    <div :class="[child.checked ? 'fas fa-check' : '', 'check-box']">
                        {{ child.checked ? '' : ' ' }}
                    </div>
                    <font>{{ child.title }}</font>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({})
export default class OptionsDrawerCard extends Vue {
    mydata: any = null
    optionItems: {
        cardTitle: string
        options: { title: string; key: number; val: string; checked: boolean }[]
    }[] = [
        {
            cardTitle: '测试1',
            options: [
                { title: '选项1', key: 1, val: 'opt1', checked: true },
                { title: '选项2', key: 2, val: 'opt2', checked: false },
                { title: '选项3', key: 3, val: 'opt3', checked: false }
            ]
        }
    ]
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
.options-drawer-card-root {
    width: 80%;
    background: linear-gradient(
        to right,
        #34495e 40%,
        rgba(74, 145, 148, 0.726),
        rgba(77, 142, 124, 0.739)
    );
    border-radius: 10px;
    .drawer-children-card {
        display: flex;
        flex-direction: column;
        align-items: baseline;
        box-shadow: 3px 7px 10px 0px #000000c7;
        .card-title {
            margin: 10px;
        }
        .card-content {
            margin: 8px;
        }
    }
}
</style>
