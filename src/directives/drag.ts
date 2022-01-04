import { DEFAULT_TYPHOON_GROUP_PATH_ID } from '@/const/common'
import { STRETCHDIRENUM } from '@/enum/common'
import { Options } from 'element-ui/types/rate'

/**
 * 拖拽抽象父类
 *
 * @abstract
 * @class AbsBaseMouseDrag
 */
abstract class AbsBaseMouseDrag {
    /**
     * div 允许拖拽至最小宽度
     *
     * @memberof AbsBaseMouseDrag
     */
    public DIV_MIN_WIDTH = 560
    /**
     * div 允许拖拽至最小高度
     *
     * @memberof AbsBaseMouseDrag
     */
    public DIV_MIN_HEIGHT = 488
    public htmlElement: HTMLElement | null
    // public unitBorder: number = -1;
    public options: {
        dragAreaWidth: number
        needStretch: boolean
        ignoreLeftSpace: number
        ignoreTopSpace: number
    } = {
        dragAreaWidth: 10,
        needStretch: true,
        ignoreLeftSpace: 40,
        ignoreTopSpace: 40
    }
    /**
     * 可以拖拽
     *
     * @private
     * @memberof AbsBaseMouseDrag
     */
    private canStretch = false
    /**
     * 是否需要拖拽
     *
     * @private
     * @memberof AbsBaseMouseDrag
     */
    private needStetch = true

    constructor(
        divId: string,
        divMinWidth: number,
        divMinHeight: number,
        options: {
            dragAreaWidth?: number
            needStretch?: boolean
            ignoreLeftSpace?: number
            ignoreTopSpace?: number
        }
    ) {
        // this.htmlElement = el;
        this.htmlElement = document.getElementById(divId)
        this.DIV_MIN_HEIGHT = divMinHeight
        this.DIV_MIN_WIDTH = divMinWidth
        this.options = { ...options }
    }

    /**
     * 拖拽方法
     *
     * @abstract
     * @memberof AbsBaseMouseDrag
     */
    public abstract drag(options: { ignoreLeftSpace?: number; ignoreTopSpace?: number }): void

    /**
     * 是否在拖拽识别区域内
     *
     * @abstract
     * @return {*}  {boolean}
     * @memberof AbsBaseMouseDrag
     */
    protected abstract isInDragArea(
        mouseEvent: MouseEvent,
        options: {
            ignoreLeftSpace?: number
            ignoreTopSpace?: number
        }
    ): boolean
}

class BaseMouseDrag {
    public DIV_MIN_WIDTH = 560
    public DIV_MIN_HEIGHT = 488
    public htmlElement: HTMLElement
    // public unitBorder: number = -1;
    public options: {
        unitBorder: number
        divXOuterBorder: number
    } = {
        divXOuterBorder: 40,
        unitBorder: 10
    }
    private canStretch = false
    /**
     * Creates an instance of BaseMouseDrag.
     * @param {HTMLElement} el 当前需要拖拽的 htmlelement
     * @param {number} divMinWidth  拖拽允许的最小宽度
     * @param {number} divMinHeigh  拖拽允许的最小高度
     * @param {{
     *       ingoreLeftSpace?: number;
     *       ignoreTopSpace?: number;
     *       unitBorder?: number;
     *     }} options unitBorder? 拖拽识别的边框内宽
     * @memberof BaseMouseDrag
     */
    public constructor(
        el: HTMLElement,
        divMinWidth: number,
        divMinHeigh: number,
        options: {
            unitBorder?: number
        }
    ) {
        const htmlElement = el
        this.DIV_MIN_HEIGHT = divMinHeigh
        this.DIV_MIN_WIDTH = divMinWidth
        this.htmlElement = htmlElement
        this.options = { ...options }
    }

    public drag(ignoreLeftSpace?: number, ignoreTopSpace?: number): void {
        const that = this
        // const unitBorder = 10; // 拖拽距离外侧边框的识别距离
        const unitBorder = this.options.unitBorder // 拖拽距离外侧边框的识别距离
        const odiv = this.htmlElement
        const screenX = window.innerWidth
        const screenY = window.innerHeight

        let canStretch = false
        if (odiv) {
            odiv.onmousedown = (tempMouseDown) => {
                const divDisLeft = tempMouseDown.offsetX // 鼠标距离div左侧的距离
                const divDisTop = tempMouseDown.offsetY // 鼠标距离div外侧的距离
                const divDisBottom = odiv.offsetHeight - divDisTop
                const disX = tempMouseDown.clientX - odiv.offsetLeft // 获取当前鼠标距离外侧div最左边的距离(可能当前element有一个外侧的div，但也在当前div中)
                const disY = tempMouseDown.clientY - odiv.offsetTop // 获取div顶部的距离(可能当前element有一个外侧的div，但也在当前div中)
                // TODO:[-] 21-11-04 加入一个判断是否是拖拽的判断
                // 目前去掉了对于右侧的判断，由于使用了嵌套的div 对于 mouseevent 只会针对当前的 div 获取距离
                if (
                    divDisLeft < unitBorder ||
                    divDisTop < unitBorder ||
                    divDisBottom < unitBorder
                ) {
                    canStretch = true
                }
                // TODO:[-] 21-12-28 加入判断若当前 的 div的 width 与 heigh 均已小于 DIV_MIN_WIDTH 与 DIV_MIN_HEIGHT 则不再拖拽
                // canStretch =false
                // 注意此处的 odiv.offsetHeight 是包含了div里面向外翻折的div的高度(相当于是当前div——通常是父级div的总高度)
                if (
                    odiv.offsetHeight < that.DIV_MIN_HEIGHT ||
                    odiv.offsetWidth < that.DIV_MIN_WIDTH
                ) {
                    canStretch = false
                    // TODO:[-] 21-12-29 加入 return
                    // return;
                }
                document.onmousemove = (tempMouseMove) => {
                    const disX4Right = odiv.scrollWidth - disX
                    // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
                    // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
                    const veldisX = tempMouseMove.clientX - tempMouseDown.clientX
                    const veldisY = tempMouseMove.clientY - tempMouseDown.clientY
                    console.log(`当前x矢量位移:${veldisX};y矢量位移:${veldisY}`)
                    // 是否为拉伸 form
                    if (canStretch) {
                        // + 21-11-06 新的实现
                        // div 的 宽 + 高
                        const divWidth = odiv.offsetWidth
                        const divHeight = odiv.offsetHeight
                        // 鼠标距离 左，上的距离
                        const mouseOffsetClientX = tempMouseMove.clientX
                        const mouseOffsetClientY = tempMouseMove.clientY

                        // 拉伸的方向
                        let velDir = STRETCHDIRENUM.LEFT
                        // 判断拉伸的方向(拖拽)
                        if (divDisTop < unitBorder && divDisLeft < unitBorder) {
                            velDir = STRETCHDIRENUM.LEFTTOP
                        } else if (divDisLeft < unitBorder) {
                            velDir = STRETCHDIRENUM.LEFT
                        } else if (divDisTop < unitBorder) {
                            velDir = STRETCHDIRENUM.TOP
                        } else if (divDisBottom < unitBorder) {
                            velDir = STRETCHDIRENUM.BOTTOM
                        }
                        console.log(`当前拉拽的是:${velDir}`)
                        switch (true) {
                            case velDir === STRETCHDIRENUM.LEFTTOP:
                                odiv.style.width = divWidth - veldisX + 'px'
                                odiv.style.height = divHeight - veldisY + 'px'
                                odiv.style.top = mouseOffsetClientY + 'px'
                                break
                            case velDir === STRETCHDIRENUM.LEFT:
                                odiv.style.width = divWidth - veldisX + 'px'
                                odiv.style.height = divHeight + 'px'
                                break
                            case velDir === STRETCHDIRENUM.TOP:
                                // 当拉动的是顶部
                                /*
                当前 div 的 bottom = mousemove.clientY - 当前的div的高度
                当前 div 的 height = 当前div的高度 + 鼠标移动的距离 mousemove.movementY
              */
                                odiv.style.height = divHeight - veldisY + 'px'
                                odiv.style.width = divWidth + 'px'
                                odiv.style.top = mouseOffsetClientY + 'px'
                                break
                        }
                    }
                    // 不拉伸 form
                    else {
                        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                        const mouseright4screen = window.innerWidth - tempMouseMove.clientX
                        // const right =
                        //   tempMouseMove.clientX -
                        //   odiv.offsetLeft +
                        //   odiv.offsetWidth +
                        //   veldisX;
                        // const right =
                        //   mouseright4screen -
                        //   (odiv.offsetWidth - (tempMouseMove.clientX - odiv.offsetLeft));
                        // const right =
                        //   mouseright4screen - (odiv.offsetWidth - tempMouseMove.offsetX);
                        const odivRight4Screen =
                            window.innerWidth - odiv.offsetWidth - odiv.offsetLeft
                        const right = odivRight4Screen - veldisX
                        const top = tempMouseMove.clientY - odiv.offsetTop + veldisY
                        console.log(`当前鼠标距离屏幕右侧的距离${mouseright4screen}`)
                        console.log(`当前div的right:${right}`)
                        // console.log(`当前div的top:${top}`);
                        //移动当前元素
                        odiv.style.right = right + 'px'
                        odiv.style.top = top + 'px'
                    }
                }
                document.onmouseup = (e) => {
                    canStretch = false
                    document.onmousemove = null
                    document.onmouseup = null
                }
            }
        }
    }

    // public get disOutBorderX(){
    //   const divXOuterBorder=
    // }
}

class StationDrag extends AbsBaseMouseDrag {
    public drag(options?: {
        ignoreLeftSpace?: number
        ignoreTopSpace?: number
        divId?: string
    }): void {
        const that = this
        let odiv = this.htmlElement
        if (options) {
            if (options.divId) {
                if (document.getElementById(options.divId)) {
                    odiv = document.getElementById(options.divId)
                }
            }
            if (odiv) {
                odiv.onmousedown = (tempMouseDown) => {
                    // step 1 : 鼠标进入了实际的div中
                    if (that.isInActualDiv(odiv, tempMouseDown, options)) {
                        let canStretch = false
                        const disX = tempMouseDown.clientX - odiv.offsetLeft
                        const disY = tempMouseDown.clientY - odiv.offsetTop
                        document.onmousemove = (tempMouseMove) => {
                            if (that.isInDragArea(tempMouseDown, options)) {
                                canStretch = true
                            }
                            const strechDir = that.getStretchDir(tempMouseDown)
                            const currentOdiv = document.getElementById(options.divId)
                            if (currentOdiv) {
                                that.setStyle(disX, disY, tempMouseMove, strechDir, currentOdiv)
                            }
                        }
                        // 切记此处需要当mouse不在按压时需要将onmousemove取消的操作
                        document.onmouseup = (e) => {
                            canStretch = false
                            document.onmousemove = null
                            document.onmouseup = null
                        }
                    }
                }
            }
        }
    }

    /**
     * 若鼠标移入刨除 左侧 与 顶部 的 div 之后的 div 中的外围border 内 则为可拖拽状态
     *
     * @param {MouseEvent} mouseEvent
     * @param {{
     *       ignoreLeftSpace?: number;
     *       ignoreTopSpace?: number;
     *     }} options
     * @return {*}  {boolean}
     * @memberof StationDrag
     */
    protected isInDragArea(
        mouseEvent: MouseEvent,
        options: {
            ignoreLeftSpace?: number
            ignoreTopSpace?: number
        }
    ): boolean {
        let isOk = false
        if (this.htmlElement) {
            if (
                options.ignoreLeftSpace &&
                mouseEvent.offsetX - options.ignoreLeftSpace < this.options.dragAreaWidth
            ) {
                isOk = true
            }
            if (
                options.ignoreTopSpace &&
                mouseEvent.offsetY - options.ignoreTopSpace < this.options.dragAreaWidth
            ) {
                isOk = true
            }
        }
        return isOk
    }

    /**
     * 判断鼠标是否移入实际div中，
     * station form 存在左侧与顶部两处需要跳过的区域
     *
     * @protected
     * @param {HTMLElement} odiv
     * @return {*}  {boolean}
     * @memberof StationDrag
     */
    protected isInActualDiv(
        odiv: HTMLElement,
        mouse: MouseEvent,
        options: {
            ignoreLeftSpace?: number
            ignoreTopSpace?: number
        }
    ): boolean {
        let isOk = true
        if (options.ignoreLeftSpace && mouse.clientX - odiv.offsetLeft < options.ignoreLeftSpace) {
            isOk = false
        }
        if (options.ignoreTopSpace && mouse.clientY - odiv.offsetTop < options.ignoreTopSpace) {
            isOk = false
        }
        return isOk
    }

    /**
     * 获取拖拽的方向
     *
     * @protected
     * @param {MouseEvent} mouse
     * @return {*}  {STRETCHDIRENUM}
     * @memberof StationDrag
     */
    protected getStretchDir(mouse: MouseEvent): STRETCHDIRENUM {
        // 拉伸的方向
        let velDir = STRETCHDIRENUM.UNABLE
        const that = this
        // 判断拉伸的方向(拖拽)
        if (that.options && that.htmlElement) {
            if (
                mouse.offsetY < that.options.dragAreaWidth &&
                mouse.offsetX < that.options.dragAreaWidth
            ) {
                velDir = STRETCHDIRENUM.LEFTTOP
            } else if (mouse.offsetX < that.options.dragAreaWidth) {
                velDir = STRETCHDIRENUM.LEFT
            } else if (mouse.offsetY < that.options.dragAreaWidth) {
                velDir = STRETCHDIRENUM.TOP
            } else if (that.htmlElement.offsetHeight - mouse.offsetY < that.options.dragAreaWidth) {
                velDir = STRETCHDIRENUM.BOTTOM
            }
        }
        return velDir
    }

    /**
     *  重设style
     *
     * @protected
     * @param {number} mouseDownDisX 鼠标按下的距离div的x轴距离
     * @param {number} mouseDownDisY 鼠标按下的距离div的y轴距离
     * @param {MouseEvent} mouseMove 鼠标移动 event
     * @param {STRETCHDIRENUM} velDir 拖拽的方向: top|left|right|bottom
     * @param {HTMLElement} odiv 当前div
     * @memberof StationDrag
     */
    protected setStyle(
        mouseDownDisX: number,
        mouseDownDisY: number,
        mouseMove: MouseEvent,
        velDir: STRETCHDIRENUM,
        odiv: HTMLElement
    ): void {
        /*
      此处一定要切记 odiv 是整个的div
      this.htmlelement 是 实际的内部，抛出了左侧与顶部的div以外的内部div
    */
        const that = this
        // [*] + 22-01-03 注意此处由于 MouseDownDisX 当前鼠标按下时距离 div 的left边距，所以求水平矢量速度应为 mouseMove.clientX-mouseDown.clientX，此处为 (mouseMove.clientX - odiv.offsetLeft)-(mouseDown.clientX-odiv.offsetLeft)
        const veldisX = mouseMove.clientX - odiv.offsetLeft - mouseDownDisX
        const veldisY = mouseMove.clientY - odiv.offsetTop - mouseDownDisY // 鼠标移动距离当前div的top边距-鼠标down距离当前div的top的边距
        const disX = mouseDownDisX - odiv.offsetLeft // 鼠标对于当前div偏移的位移
        if (velDir !== STRETCHDIRENUM.UNABLE) {
            // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
            // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
            if (this.options.ignoreLeftSpace && this.options.ignoreTopSpace && this.htmlElement) {
                // const tempOdivStyle = odiv.style;
                switch (true) {
                    case velDir === STRETCHDIRENUM.LEFTTOP:
                        that.htmlElement.style.width = that.htmlElement.offsetWidth - veldisX + 'px'
                        that.htmlElement.style.height =
                            that.htmlElement.offsetHeight - veldisY + 'px'
                        that.htmlElement.style.top = mouseMove.clientY + 'px'
                        break
                    case velDir === STRETCHDIRENUM.LEFT:
                        if (that.htmlElement.offsetWidth - veldisX > that.DIV_MIN_WIDTH) {
                            that.htmlElement.style.width =
                                that.htmlElement.offsetWidth - veldisX + 'px'
                            that.htmlElement.style.height = that.htmlElement.offsetHeight + 'px'
                            // [*] warning: 注意不需要手动的控制 div.style.left 因为会之后拖动时还会修改 div.style.right 与 top
                            // odiv.style.left = tempMouseMove.clientX - disX + "px";
                        }
                        break
                    case velDir === STRETCHDIRENUM.TOP:
                        // 当拉动的是顶部
                        /*
              当前 div 的 bottom = mousemove.clientY - 当前的div的高度
              当前 div 的 height = 当前div的高度 + 鼠标移动的距离 mousemove.movementY
            */
                        if (odiv.offsetHeight - veldisY > that.DIV_MIN_HEIGHT) {
                            //!!一定要注意，鼠标上-，下+，而对于设置高度的逻辑正好不需要再相减了！！
                            const height = odiv.offsetHeight - veldisY
                            const top = mouseMove.clientY - mouseDownDisY
                            odiv.style.top = top + 'px'
                            odiv.style.height = height + 'px' //!!一定要注意，鼠标上-，下+，而对于设置高度的逻辑正好不需要再相减了！！
                        }
                        break
                }
            }
        } else {
            const div4left = mouseMove.clientX - mouseDownDisX
            const div4right = window.innerWidth - div4left - odiv.offsetWidth
            odiv.style.right = div4right + 'px'
            odiv.style.top = mouseMove.clientY - mouseDownDisY + 'px'
        }
    }

    protected setStyle_bak_1(
        mouseDown: MouseEvent,
        mouseMove: MouseEvent,
        velDir: STRETCHDIRENUM,
        odiv: HTMLElement
    ): void {
        /*
      此处一定要切记 odiv 是整个的div
      this.htmlelement 是 实际的内部，抛出了左侧与顶部的div以外的内部div

    */
        const that = this
        const veldisX = mouseMove.clientX - mouseDown.clientX
        const veldisY = mouseMove.clientY - mouseDown.clientY
        const disX = mouseDown.clientX - odiv.offsetLeft // 鼠标对于当前div偏移的位移
        if (velDir !== STRETCHDIRENUM.UNABLE) {
            // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
            // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
            if (this.options.ignoreLeftSpace && this.options.ignoreTopSpace && this.htmlElement) {
                switch (true) {
                    case velDir === STRETCHDIRENUM.LEFTTOP:
                        that.htmlElement.style.width = that.htmlElement.offsetWidth - veldisX + 'px'
                        that.htmlElement.style.height =
                            that.htmlElement.offsetHeight - veldisY + 'px'
                        that.htmlElement.style.top = mouseMove.clientY + 'px'
                        break
                    case velDir === STRETCHDIRENUM.LEFT:
                        if (that.htmlElement.offsetWidth - veldisX > that.DIV_MIN_WIDTH) {
                            // console.log(`divWidth:${divWidth},veldisX:${veldisX}`);
                            that.htmlElement.style.width =
                                that.htmlElement.offsetWidth - veldisX + 'px'
                            that.htmlElement.style.height = that.htmlElement.offsetHeight + 'px'
                            // [*] warning: 注意不需要手动的控制 div.style.left 因为会之后拖动时还会修改 div.style.right 与 top
                            // odiv.style.left = tempMouseMove.clientX - disX + "px";
                        }
                        break
                    case velDir === STRETCHDIRENUM.TOP:
                        // 当拉动的是顶部
                        /*
              当前 div 的 bottom = mousemove.clientY - 当前的div的高度
              当前 div 的 height = 当前div的高度 + 鼠标移动的距离 mousemove.movementY
            */
                        if (that.htmlElement.offsetHeight - veldisY > that.DIV_MIN_HEIGHT) {
                            that.htmlElement.style.height =
                                that.htmlElement.offsetHeight - veldisY + 'px'
                            that.htmlElement.style.width = that.htmlElement.offsetWidth + 'px'
                            that.htmlElement.style.top = mouseMove.clientY + 'px'
                            // console.log(
                            //   `odiv.style.height:${odiv.style.height},odiv.style.width:${
                            //     odiv.style.width
                            //   },,odiv.style.top:${odiv.style.top}`
                            // );
                        }
                        break
                }
            }
        } else {
            //移动当前元素
            odiv.style.left = mouseMove.clientX - disX + 'px'
            odiv.style.top = top + 'px'
        }
        // console.log(`reset style.right:${odiv.style.right},top:${odiv.style.top}`);
        // console.log(`veldisY:${veldisY},veldisX:${veldisX}`);
    }
}

export { BaseMouseDrag, StationDrag }
