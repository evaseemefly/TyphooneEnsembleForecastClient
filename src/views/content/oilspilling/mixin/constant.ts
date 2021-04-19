import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
/**
 * + 21-02-08 作为 常量 mixin
 *
 * @class ConstantMixin
 * @extends {Vue}
 */
@Component
class ConstantMixin extends Vue {
    /**
     * 缩放的等级 level 与 step 的对应关系
     *
     * @memberof ConstantMixin
     */
    dict_level = {
        7: 10,
        5: 15,
        3: 20
    }
}
export { ConstantMixin }
