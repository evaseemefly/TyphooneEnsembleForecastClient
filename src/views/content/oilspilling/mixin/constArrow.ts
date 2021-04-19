import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'

import { WindArrow } from '@/views/content/oilspilling/arrow'
/**
 * + 21-02-08 作为 常量 mixin
 *
 * @class ConstantMixin
 * @extends {Vue}
 */
@Component
class ConstArrowMixin extends Vue {
    /**
     * 缩放的等级 level 与 step 的对应关系
     *
     * @memberof ConstantMixin
     */
    arrow: WindArrow = new WindArrow()
}
export { ConstArrowMixin }
