import { STRETCHDIRENUM } from '@/enum/common'

const Draggable = {
    bind(el: HTMLElement) {
        const odiv = el //获取当前元素
        const screenX = window.innerWidth
        const screenY = window.innerHeight
        const divXOuterBorder = 40
        const divYOuterBorder = 45
        const DIVMINWIDTH = 200
        const DIVMINHEIGHT = 150

        const unitBorder = 10 // 拖拽距离外侧边框的识别距离
        let canStretch = false
        console.log(el)
        // console.log(`屏幕宽度:${screenX},高度:${screenY}`);
        odiv.onmousedown = (e) => {
            const boxWidth = odiv.offsetWidth
            const boxHeight = odiv.offsetHeight
            //算出鼠标相对元素的位置
            // e.clientX 当前鼠标距离screen 的 top 与 left 的距离
            // odiv.offsetLeft 当前元素距离 screen 的距离
            const tempMouseDown = e
            console.log(e)
            const disX = tempMouseDown.clientX - odiv.offsetLeft
            const disX4Right = odiv.scrollWidth - disX
            const disY = tempMouseDown.clientY - odiv.offsetTop
            const divDisLeft = e.offsetX
            const divDisTop = e.offsetY
            const divDisBottom = odiv.offsetHeight - divDisTop
            const divDisRight = odiv.offsetWidth - divDisLeft
            const mouseStartClientX = e.clientX
            const mouseStartClientY = e.clientY
            // TODO:[-] 21-11-04 加入一个判断是否是拖拽的判断
            // 目前去掉了对于右侧的判断，由于使用了嵌套的div 对于 mouseevent 只会针对当前的 div 获取距离
            if (divDisLeft < unitBorder || divDisTop < unitBorder || divDisBottom < unitBorder) {
                canStretch = true
            }
            // TODO:[-] 21-12-28 加入判断若当前 的 div的 width 与 heigh 均已小于 DIV_MIN_WIDTH 与 DIV_MIN_HEIGHT 则不再拖拽
            // canStretch =false
            if (odiv.offsetHeight < this.DIV_MIN_HEIGHT || odiv.offsetWidth < this.DIV_MIN_WIDTH) {
                canStretch = false
            }

            const that = this

            document.onmousemove = (e) => {
                const tempMouseMove = e
                // 是否为拉伸 form
                if (canStretch) {
                    // + 21-11-06 新的实现
                    // div 的 宽 + 高
                    const divWidth = odiv.offsetWidth
                    const divHeight = odiv.offsetHeight
                    // div 距离四周的距离
                    const divOffsetClientX = odiv.offsetLeft
                    const divOffsetClientY = odiv.offsetTop
                    const divOffsetBottom = odiv.offsetTop + divHeight
                    const divOffsetRight = odiv.offsetLeft + divWidth
                    // 鼠标距离 左，上的距离
                    const mouseOffsetClientX = tempMouseMove.clientX
                    const mouseOffsetClientY = tempMouseMove.clientY
                    // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
                    // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
                    const veldisX = mouseOffsetClientX - (divOffsetClientX + divXOuterBorder)
                    const veldisY = mouseOffsetClientY - divOffsetClientY
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
                    switch (true) {
                        case velDir === STRETCHDIRENUM.LEFTTOP:
                            odiv.style.width = divWidth - veldisX + 'px'
                            odiv.style.height = divHeight - veldisY + 'px'
                            odiv.style.top = mouseOffsetClientY + 'px'
                            break
                        case velDir === STRETCHDIRENUM.LEFT:
                            if (divWidth - veldisX > DIVMINWIDTH) {
                                console.log(`divWidth:${divWidth},veldisX:${veldisX}`)
                                odiv.style.width = divWidth - veldisX + 'px'
                                odiv.style.height = divHeight + 'px'
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
                            if (divHeight - veldisY > DIVMINHEIGHT) {
                                odiv.style.height = divHeight - veldisY + 'px'
                                odiv.style.width = divWidth + 'px'
                                odiv.style.top = mouseOffsetClientY + 'px'
                                console.log(
                                    `odiv.style.height:${odiv.style.height},odiv.style.width:${odiv.style.width},,odiv.style.top:${odiv.style.top}`
                                )
                            }
                            break
                    }
                }
                // 不拉伸 form
                else {
                    //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                    const left = tempMouseMove.clientX - disX
                    const right = screenX - tempMouseMove.clientX
                    const top = tempMouseMove.clientY - disY

                    //绑定元素位置到positionX和positionY上面
                    // console.log(this);
                    // this.positionX = top
                    // this.positionY = left

                    //移动当前元素
                    // odiv.style.left = left + "px";
                    odiv.style.right = right - disX4Right + 'px'
                    // odiv.style.right = clientX - left + "px";
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
/**
 * 监听鼠标拖拽操作
 *
 * @param {MouseEvent} event 鼠标事件
 * @param {string} elId id选择器
 * @param {number} [ignoreLeftSpace] 忽视的左侧边框(相当于去掉左侧的xx px)
 * @param {number} [ignoreTopSpace] 忽视的顶部边框(相当于去掉顶部的xx px)
 */
const mouseDrag = (
    event: MouseEvent,
    elId: string,
    ignoreLeftSpace?: number,
    ignoreTopSpace?: number
) => {
    const el = document.getElementById(elId)
    const odiv = el //获取当前元素
    const screenX = window.innerWidth
    const screenY = window.innerHeight
    const divXOuterBorder = 40
    const divYOuterBorder = 45
    const DIVMINWIDTH = 200
    const DIVMINHEIGHT = 150

    const unitBorder = 10 // 拖拽距离外侧边框的识别距离
    let canStretch = false
    console.log(el)
    // console.log(`屏幕宽度:${screenX},高度:${screenY}`);
    if (odiv) {
        odiv.onmousedown = (e) => {
            const boxWidth = odiv.offsetWidth
            const boxHeight = odiv.offsetHeight
            //算出鼠标相对元素的位置
            // e.clientX 当前鼠标距离screen 的 top 与 left 的距离
            // odiv.offsetLeft 当前元素距离 screen 的距离
            const tempMouseDown = e
            console.log(e)
            const disX = tempMouseDown.clientX - odiv.offsetLeft
            const disX4Right = odiv.scrollWidth - disX
            const disY = tempMouseDown.clientY - odiv.offsetTop
            const divDisLeft = e.offsetX
            const divDisTop = e.offsetY
            const divDisBottom = odiv.offsetHeight - divDisTop
            const divDisRight = odiv.offsetWidth - divDisLeft
            const mouseStartClientX = e.clientX
            const mouseStartClientY = e.clientY
            // TODO:[-] 21-11-14 加入一个判断区域，由于左侧及顶部会有一些标签，需要将这些标签剔除
            if (ignoreLeftSpace && disX < ignoreLeftSpace) {
                return
                // if()
            }
            if (ignoreTopSpace && disY < ignoreTopSpace) {
                return
            }

            // TODO:[-] 21-11-04 加入一个判断是否是拖拽的判断
            // 目前去掉了对于右侧的判断，由于使用了嵌套的div 对于 mouseevent 只会针对当前的 div 获取距离
            if (divDisLeft < unitBorder || divDisTop < unitBorder || divDisBottom < unitBorder) {
                canStretch = true
            }

            const that = this

            document.onmousemove = (e) => {
                const tempMouseMove = e
                // 是否为拉伸 form
                if (canStretch) {
                    // + 21-11-06 新的实现
                    // div 的 宽 + 高
                    const divWidth = odiv.offsetWidth
                    const divHeight = odiv.offsetHeight
                    // div 距离四周的距离
                    const divOffsetClientX = odiv.offsetLeft
                    const divOffsetClientY = odiv.offsetTop
                    const divOffsetBottom = odiv.offsetTop + divHeight
                    const divOffsetRight = odiv.offsetLeft + divWidth
                    // 鼠标距离 左，上的距离
                    const mouseOffsetClientX = tempMouseMove.clientX
                    const mouseOffsetClientY = tempMouseMove.clientY
                    // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
                    // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
                    const veldisX = mouseOffsetClientX - (divOffsetClientX + divXOuterBorder)
                    const veldisY = mouseOffsetClientY - divOffsetClientY
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
                    switch (true) {
                        case velDir === STRETCHDIRENUM.LEFTTOP:
                            odiv.style.width = divWidth - veldisX + 'px'
                            odiv.style.height = divHeight - veldisY + 'px'
                            odiv.style.top = mouseOffsetClientY + 'px'
                            break
                        case velDir === STRETCHDIRENUM.LEFT:
                            if (divWidth - veldisX > DIVMINWIDTH) {
                                console.log(`divWidth:${divWidth},veldisX:${veldisX}`)
                                odiv.style.width = divWidth - veldisX + 'px'
                                odiv.style.height = divHeight + 'px'
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
                            if (divHeight - veldisY > DIVMINHEIGHT) {
                                odiv.style.height = divHeight - veldisY + 'px'
                                odiv.style.width = divWidth + 'px'
                                odiv.style.top = mouseOffsetClientY + 'px'
                                console.log(
                                    `odiv.style.height:${odiv.style.height},odiv.style.width:${odiv.style.width},,odiv.style.top:${odiv.style.top}`
                                )
                            }
                            break
                    }
                }
                // 不拉伸 form
                else {
                    //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                    const left = tempMouseMove.clientX - disX
                    const right = screenX - tempMouseMove.clientX
                    const top = tempMouseMove.clientY - disY

                    //绑定元素位置到positionX和positionY上面
                    // console.log(this);
                    // this.positionX = top
                    // this.positionY = left

                    //移动当前元素
                    // odiv.style.left = left + "px";
                    odiv.style.right = right - disX4Right + 'px'
                    // odiv.style.right = clientX - left + "px";
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

class MouseDrag {
    public DIV_MIN_WIDTH = 560
    public DIV_MIN_HEIGHT = 488
    public htmlElement: HTMLElement
    public options: {
        ingoreLeftSpace: number // 距离左侧的距离
        ignoreTopSpace: number // 距离顶部的距离
        unitBorder: number
        divXOuterBorder: number
    } = {
        ingoreLeftSpace: 40,
        ignoreTopSpace: 45,
        divXOuterBorder: 40,
        unitBorder: 10
    }
    private canStretch = false

    public constructor(
        el: HTMLElement,
        divMinWidth = 560,
        divMinHeight = 488,
        options: {
            // divMinWidth: number
            // divMinHeight: number
            ingoreLeftSpace?: number
            ignoreTopSpace?: number
            unitBorder?: number
        }
    ) {
        const htmlElement = el
        this.htmlElement = htmlElement
        this.options = { ...options }
        this.DIV_MIN_HEIGHT = divMinHeight
        this.DIV_MIN_WIDTH = divMinWidth
    }

    /**
     * 拖动
     *
     * @memberof MouseDrag
     */
    // public drag(): void {
    //   const odiv = this.htmlElement;
    //   if (this.htmlElement) {
    //     odiv.onmousedown = (e) => {
    //       const boxWidth = odiv.offsetWidth;
    //       const boxHeight = odiv.offsetHeight;
    //       //算出鼠标相对元素的位置
    //       // e.clientX 当前鼠标距离screen 的 top 与 left 的距离
    //       // odiv.offsetLeft 当前元素距离 screen 的距离
    //       const tempMouseDown = e;
    //       console.log(e);
    //       const disX = tempMouseDown.clientX - odiv.offsetLeft; // 鼠标在 div 内部的x轴偏移量
    //       const disX4Right = odiv.scrollWidth - disX;
    //       const disY = tempMouseDown.clientY - odiv.offsetTop; // 鼠标在 div 内部的y轴偏移量
    //       const divDisLeft = e.offsetX; // TODO:[-] e.offsetX 与 odiv.offsetLeft 相同吗？不相同，e.offsetX是鼠标距离外部div的偏移距离
    //       const divDisTop = e.offsetY; // TODO:[-] 21-12-28 注意查看会不会出现负数的情况
    //       const divDisBottom = odiv.offsetHeight - divDisTop;

    //       // 21-11-14 加入一个判断区域，由于左侧及顶部会有一些标签，需要将这些标签剔除
    //       if (
    //         this.options.ingoreLeftSpace &&
    //         disX < this.options.ingoreLeftSpace
    //       ) {
    //         return;
    //         // if()
    //       }
    //       if (this.options.ignoreTopSpace && disY < this.options.ignoreTopSpace) {
    //         return;
    //       }

    //       // TODO:[-] 21-11-04 加入一个判断是否是拖拽的判断
    //       // 目前去掉了对于右侧的判断，由于使用了嵌套的div 对于 mouseevent 只会针对当前的 div 获取距离
    //       if (
    //         divDisLeft < this.options.unitBorder ||
    //         divDisTop < this.options.unitBorder ||
    //         divDisBottom < this.options.unitBorder
    //       ) {
    //         this.canStretch = true;
    //       }
    //       document.onmousemove = (tempMouseMove) => {
    //         // const tempMouseMove = e;
    //         // 是否为拉伸 form
    //         if (this.canStretch) {
    //           // + 21-11-06 新的实现
    //           // div 的 宽 + 高
    //           const divWidth = odiv.offsetWidth;
    //           const divHeight = odiv.offsetHeight;
    //           // div 距离四周的距离
    //           const divOffsetClientX = odiv.offsetLeft;
    //           const divOffsetClientY = odiv.offsetTop;
    //           // 鼠标距离 左，上的距离
    //           const mouseOffsetClientX = tempMouseMove.clientX;
    //           const mouseOffsetClientY = tempMouseMove.clientY;
    //           // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
    //           // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
    //           const veldisX =
    //             mouseOffsetClientX -
    //             (divOffsetClientX + this.options.divXOuterBorder);
    //           const veldisY = mouseOffsetClientY - divOffsetClientY;
    //           // 拉伸的方向
    //           let velDir = STRETCHDIRENUM.LEFT;
    //           // 判断拉伸的方向(拖拽)
    //           if (
    //             divDisTop < this.options.unitBorder &&
    //             divDisLeft < this.options.unitBorder
    //           ) {
    //             velDir = STRETCHDIRENUM.LEFTTOP;
    //           } else if (divDisLeft < this.options.unitBorder) {
    //             velDir = STRETCHDIRENUM.LEFT;
    //           } else if (divDisTop < this.options.unitBorder) {
    //             velDir = STRETCHDIRENUM.TOP;
    //           } else if (divDisBottom < this.options.unitBorder) {
    //             velDir = STRETCHDIRENUM.BOTTOM;
    //           }
    //           switch (true) {
    //             case velDir === STRETCHDIRENUM.LEFTTOP:
    //               odiv.style.width = divWidth - veldisX + "px";
    //               odiv.style.height = divHeight - veldisY + "px";
    //               odiv.style.top = mouseOffsetClientY + "px";
    //               break;
    //             case velDir === STRETCHDIRENUM.LEFT:
    //               if (divWidth - veldisX > this.DIV_MIN_WIDTH) {
    //                 console.log(`divWidth:${divWidth},veldisX:${veldisX}`);
    //                 odiv.style.width = divWidth - veldisX + "px";
    //                 odiv.style.height = divHeight + "px";
    //                 // [*] warning: 注意不需要手动的控制 div.style.left 因为会之后拖动时还会修改 div.style.right 与 top
    //                 // odiv.style.left = tempMouseMove.clientX - disX + "px";
    //               }
    //               break;
    //             case velDir === STRETCHDIRENUM.TOP:
    //               // 当拉动的是顶部
    //               /*
    //                   当前 div 的 bottom = mousemove.clientY - 当前的div的高度
    //                   当前 div 的 height = 当前div的高度 + 鼠标移动的距离 mousemove.movementY
    //                 */
    //               if (divHeight - veldisY > this.DIV_MIN_HEIGHT) {
    //                 odiv.style.height = divHeight - veldisY + "px";
    //                 odiv.style.width = divWidth + "px";
    //                 odiv.style.top = mouseOffsetClientY + "px";
    //                 console.log(
    //                   `odiv.style.height:${odiv.style.height},odiv.style.width:${
    //                     odiv.style.width
    //                   },,odiv.style.top:${odiv.style.top}`
    //                 );
    //               }
    //               break;
    //           }
    //         }
    //         // 不拉伸 form
    //         else {
    //           //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
    //           const left = tempMouseMove.clientX - disX;
    //           const right = screenX - tempMouseMove.clientX;
    //           const top = tempMouseMove.clientY - disY;

    //           //绑定元素位置到positionX和positionY上面
    //           // console.log(this);
    //           // this.positionX = top
    //           // this.positionY = left

    //           //移动当前元素
    //           // odiv.style.left = left + "px";
    //           odiv.style.right = right - disX4Right + "px";
    //           // odiv.style.right = clientX - left + "px";
    //           odiv.style.top = top + "px";
    //         }
    //       };
    //       document.onmouseup = (e) => {
    //         this.canStretch = false;
    //         document.onmousemove = null;
    //         document.onmouseup = null;
    //       };
    //     };
    //   }
    // }
    public drag(elId: string, ignoreLeftSpace?: number, ignoreTopSpace?: number): void {
        const el = document.getElementById(elId)
        const odiv = el //获取当前元素
        const screenX = window.innerWidth
        const screenY = window.innerHeight
        let divXOuterBorder = -1
        let divYOuterBorder = -1
        // const DIVMINWIDTH = 200;
        // const DIVMINHEIGHT = 150;

        const unitBorder = 10 // 拖拽距离外侧边框的识别距离
        let canStretch = false
        // console.log(el);
        // console.log(`屏幕宽度:${screenX},高度:${screenY}`);
        if (odiv) {
            odiv.onmousedown = (tempMouseDown) => {
                divXOuterBorder = tempMouseDown.clientX - odiv.offsetLeft
                divYOuterBorder = tempMouseDown.clientY - odiv.offsetTop
                //算出鼠标相对元素的位置
                // e.clientX 当前鼠标距离screen 的 top 与 left 的距离
                // odiv.offsetLeft 当前元素距离 screen 的距离
                // const tempMouseDown = e
                console.log(tempMouseDown)
                const disX = tempMouseDown.clientX - odiv.offsetLeft // 获取div左部的距离(可能当前element有一个外侧的div，但也在当前div中)
                const disX4Right = odiv.scrollWidth - disX
                const disY = tempMouseDown.clientY - odiv.offsetTop // 获取div顶部的距离(可能当前element有一个外侧的div，但也在当前div中)
                const divDisLeft = tempMouseDown.offsetX // 鼠标距离div左侧的距离
                const divDisTop = tempMouseDown.offsetY // 鼠标距离div外侧的距离
                const divDisBottom = odiv.offsetHeight - divDisTop
                const divDisRight = odiv.offsetWidth - divDisLeft
                const mouseStartClientX = tempMouseDown.clientX
                const mouseStartClientY = tempMouseDown.clientY
                // TODO:[-] 21-11-14 加入一个判断区域，由于左侧及顶部会有一些标签，需要将这些标签剔除
                if (ignoreLeftSpace && divXOuterBorder < ignoreLeftSpace) {
                    return
                    // if()
                }
                if (ignoreTopSpace && divYOuterBorder < ignoreTopSpace) {
                    return
                }

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
                    odiv.offsetHeight < this.DIV_MIN_HEIGHT ||
                    odiv.offsetWidth < this.DIV_MIN_WIDTH
                ) {
                    canStretch = false
                    // TODO:[-] 21-12-29 加入 return
                    return
                }
                document.onmousemove = (tempMouseMove) => {
                    // const tempMouseMove = e
                    // 是否为拉伸 form
                    if (canStretch) {
                        // + 21-11-06 新的实现
                        // div 的 宽 + 高
                        const divWidth = odiv.offsetWidth
                        const divInnerWidth = divWidth - divXOuterBorder
                        const divHeight = odiv.offsetHeight
                        const divInnerHeight = divHeight - divYOuterBorder
                        // div 距离四周的距离
                        const divOffsetClientX = odiv.offsetLeft
                        const divOffsetClientY = odiv.offsetTop
                        // 鼠标距离 左，上的距离
                        const mouseOffsetClientX = tempMouseMove.clientX
                        const mouseOffsetClientY = tempMouseMove.clientY
                        // 鼠标的矢量位移 左 - 右 + , 上 - ,下 +
                        // TODO:[-] 21-11-12 注意此处需要加入一个外部的上下两个标签
                        const veldisX = mouseOffsetClientX - (divOffsetClientX + divXOuterBorder)
                        const veldisY = mouseOffsetClientY - divOffsetClientY
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
                        switch (true) {
                            case velDir === STRETCHDIRENUM.LEFTTOP:
                                odiv.style.width = divWidth - veldisX + 'px'
                                odiv.style.height = divHeight - veldisY + 'px'
                                odiv.style.top = mouseOffsetClientY + 'px'
                                break
                            case velDir === STRETCHDIRENUM.LEFT:
                                if (divInnerWidth - veldisX > this.DIV_MIN_WIDTH) {
                                    // console.log(`divWidth:${divWidth},veldisX:${veldisX}`)
                                    odiv.style.width = divWidth - veldisX + 'px'
                                    odiv.style.height = divHeight + 'px'
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
                                if (divInnerHeight - veldisY > this.DIV_MIN_HEIGHT) {
                                    odiv.style.height = divHeight - veldisY + 'px'
                                    odiv.style.width = divWidth + 'px'
                                    odiv.style.top = mouseOffsetClientY + 'px'
                                    // console.log(
                                    //     `odiv.style.height:${odiv.style.height},odiv.style.width:${odiv.style.width},,odiv.style.top:${odiv.style.top}`
                                    // )
                                }
                                break
                        }
                    }
                    // 不拉伸 form
                    else {
                        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                        const left = tempMouseMove.clientX - disX
                        const right = screenX - tempMouseMove.clientX
                        const top = tempMouseMove.clientY - disY

                        //绑定元素位置到positionX和positionY上面
                        // console.log(this);
                        // this.positionX = top
                        // this.positionY = left

                        //移动当前元素
                        // odiv.style.left = left + "px";
                        odiv.style.right = right - disX4Right + 'px'
                        // odiv.style.right = clientX - left + "px";
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
}

export { Draggable, mouseDrag, MouseDrag }
