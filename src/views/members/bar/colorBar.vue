<template>
    <div class="color-bar">
        <span>m/s</span>
        <span>0</span>
        <span>0.2</span>
        <span>0.4</span>
        <span>0.6</span>
        <span>0.8</span>
        <span>1.0</span>
        <span>1.0</span>
        <span>1.2</span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace } from 'vuex-class'
@Component({})
export default class ColorBar extends Vue {}
</script>
<style lang="less" scoped>
.color-bar {
    background: linear-gradient(
        to right,
        rgb(98, 113, 184),
        rgb(98, 113, 184),
        rgb(61, 110, 163),
        rgb(74, 148, 170),
        rgb(74, 146, 148),
        rgb(77, 142, 124),
        rgb(76, 164, 76),
        rgb(103, 164, 54),
        rgb(162, 135, 64),
        rgb(162, 109, 92),
        rgb(141, 63, 92),
        rgb(151, 75, 145)
    );
    width: 300px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 black;
    span {
        margin-left: 8px;
        width: 15px;
        color: white;
    }
}
</style>
