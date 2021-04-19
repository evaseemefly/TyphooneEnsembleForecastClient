import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
/**
 * + 21-02-05 新加入的测试 mixin
 *
 * @class CommonOptMixin
 * @extends {Vue}
 */
@Component
class TestMixin extends Vue {
    test = true
    /**
     * 监听 autoPlay 的变化
     * t -> 继续播放，关闭 停止加载 raster -> loadRasterLock =false
     *
     * @param {boolean} val
     * @memberof CommonOptMixin
     */
    @Watch('zoom')
    onZoom(val: boolean): void {
        console.log(`当前zoom:${val}`)
    }
}
export { TestMixin }
