import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'

// STORE 常量
import { GET_TIMER_LOCK, GET_AUTO_PLAY } from '@/store/types'
/**
 * + 21-01-29 作为 常量 的 opt mixin
 *
 * @class CommonOptMixin
 * @extends {Vue}
 */
@Component
class CommonOptMixin extends Vue {
    /**
     * lock = true : on  -> 打开，加载
     * lock = false: off -> 关闭，不加载
     *
     * @memberof CommonOptMixin
     */
    loadRasterLock = true

    /**
     * 配合 map -> SET_TIMER_LOCK 使用的, lock = true 锁住,lock =false 打开
     * autoPlay = true : on  -> 继续播放
     *          = false: off -> 停止播放
     * @memberof CommonOptMixin
     */
    // autoPlay = false

    /**
     * 监听 autoPlay 的变化
     * t -> 继续播放，关闭 停止加载 raster -> loadRasterLock =false
     *
     * @param {boolean} val
     * @memberof CommonOptMixin
     */
    @Watch('autoPlay')
    onAutoPlay(val: boolean): void {
        if (val) {
            this.loadRasterLock = false
        } else {
            this.loadRasterLock = true
        }
    }

    // TODO:[-] 21-01-29 配合 map -> SET_TIMER_LOCK 使用的, lock = true 锁住,lock =false 打开
    @Getter(GET_AUTO_PLAY, { namespace: 'map' }) autoPlay: boolean
}
export { CommonOptMixin }
