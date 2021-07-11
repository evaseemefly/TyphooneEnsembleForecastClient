const Draggable = {
    bind(el: HTMLElement) {
        const odiv = el //获取当前元素

        odiv.onmousedown = (e) => {
            //算出鼠标相对元素的位置
            const disX = e.clientX - odiv.offsetLeft
            const disY = e.clientY - odiv.offsetTop
            const that = this

            document.onmousemove = (e) => {
                //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                const left = e.clientX - disX
                const top = e.clientY - disY

                //绑定元素位置到positionX和positionY上面
                console.log(this)
                // this.positionX = top
                // this.positionY = left

                //移动当前元素
                odiv.style.left = left + 'px'
                odiv.style.top = top + 'px'
            }
            document.onmouseup = (e) => {
                document.onmousemove = null
                document.onmouseup = null
            }
        }
    }
}

export { Draggable }
