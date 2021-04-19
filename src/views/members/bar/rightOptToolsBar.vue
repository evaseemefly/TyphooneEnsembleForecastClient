<template>
    <div id="right-opt-toolsbar">
        <a v-for="item in toolsBar" :key="item.key">
            <div class="tools-icon fa " :class="item.iconClass"></div>
            <div class="tools-font" @click="onClick(item)">
                {{ item.title }}
            </div>
            <div
                class="show-form"
                :class="item.isExpanded ? 'form-fade-in' : 'form-fade-out'"
                v-show="item.isExpanded"
            >
                <component v-bind:is="item.html"></component>
            </div>
        </a>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({
    components: {}
})
export default class RightOptToolsBar extends Vue {
    isExpanded = false
    toolsBar: {
        isExpanded: boolean
        html: string
        iconClass: string
        title: string
    }[] = [
        {
            isExpanded: false,
            html: 'OilShowTypeSelect',
            iconClass: 'fa-television',
            title: '显示模式'
        },
        {
            isExpanded: false,
            html: 'OilFactorSelect',
            iconClass: 'fa-sort-numeric-desc',
            title: '权重'
        },
        {
            isExpanded: false,
            html: 'MakePointBtn',
            iconClass: 'fa-map-marker',
            title: '选取位置'
        }
    ]
    onClick(item: { isExpanded: boolean; html: string; iconClass: string }): void {
        item.isExpanded = !item.isExpanded
    }
}
</script>

<style scoped lang="less">
@background: #4c818aad;
@border-radius: 2em;
@margin: 0.4em 0.4em;
#right-opt-toolsbar {
    // width: 100px;
    background-color: @background;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    border-radius: @border-radius;
    // 加入了文字不可选
    user-select: none;
    a {
        position: relative;
        color: #fff3e1;
        text-shadow: 0 0 4px black;
        margin: @margin;
        cursor: pointer;
    }
    a > div.tools-font:hover {
        background-color: @background;
        border-radius: @border-radius;
        // margin: 0 0.4em;
        // width: 90px;
        // margin: @margin;
        transition: background-color 0.8s;
        transition: width 0.8s;
        transition-property: background-color;
        transition-duration: 0.8s;
        transition-timing-function: ease;
        transition-delay: 0s;
    }
    a > div.tools-font {
        width: 70px;
        position: float;
        position: absolute;
        float: left;
        left: -80px;
        top: 0px;
    }
    a > div.show-form {
        background-color: @background;
        border-radius: 0.8em;
        // width: 130px;
        position: float;
        position: absolute;
        float: rigth;
        left: 130px;
        // background-color: white;
        top: 0px;
        transform: translate(-0, -45%);
        box-shadow: 1px 2px 8px black;
    }
    a > div.show-form:hover {
        color: #fff3e1;
    }
    // show 的 动画
    .form-fade-in {
        animation: go_in 1s;
        // transition: transform 2s;
    }
    @keyframes go_in {
        0% {
            opacity: 0;
            // transform: scale(0);
        }
        100% {
            opacity: 1;
            // transform: scale(1);
        }
    }
    .form-fade-out {
        animation: go_out 1s;
        // transition: transform 2s;
    }
    @keyframes go_out {
        0% {
            opacity: 1;
            // transform: scale(1);
            // visibility: visible;
        }
        100% {
            opacity: 0;
            // transform: scale(0);
        }
    }
}
</style>
