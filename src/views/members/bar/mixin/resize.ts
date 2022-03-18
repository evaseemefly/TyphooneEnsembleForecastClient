/*
    21-03-18 + resize mixin
    @author: evaseemefly
*/
import { Component, Vue } from 'vue-property-decorator'
import * as elementResizeDetectorMaker from 'element-resize-detector'
@Component
class ResizeMixin extends Vue {
    watchDivClassName = 'div'
    // watchDiv: HTMLBodyElement = document.getElementsByClassName(this.watchDivClassName)[0]
    observer = null
    // 当前的宽高，组件监听该变量
    recordOldValue: {
        // 记录下旧的宽高数据，避免重复触发回调函数
        width: number
        height: number
    } = { width: 0, height: 0 }

    mountedResize(clsName: string): void {
        const that = this
        const erd = elementResizeDetectorMaker()
        erd.listenTo(document.getElementsByClassName(clsName), (element: HTMLElement) => {
            that.recordOldValue.width = element.clientWidth
            that.recordOldValue.height = element.clientHeight
        })
    }
}

export { ResizeMixin }
