<template>
    <div class="dateBar" ref="datebar">
        <div class="progress-line" @mouseover="overProgressLine" @click="setTimeBar">
            <div id="played" class="played" style="width: 10px;"></div>
            <div class="avbl"></div>
            <i style="left: 85.6454px;"></i>
        </div>
        <div id="playpause" @click="timerRecovery" class="play-pause iconfont clickable off"></div>
        <div id="calendar">
            <div class="calendar_interval" :class="!isShowTimeBar ? 'disabled' : ''">
                <div
                    v-for="item in allDateList"
                    :key="item.id"
                    :style="'width:' + hoursCellWidth + 'px;'"
                    :class="getMaskLayerCls(item)"
                ></div>
            </div>
            <!-- 20-07-21 备份 -->
            <!-- <div class="calendar_cutting_line">
                <div
                    v-for="(item, index) in cuttingLinesWidth"
                    :key="item.id"
                    :style="'width:' + lenUnit * item + 'px;'"
                >
                    {{ cuttingLinesIndex[index] }}小时
                </div>
            </div> -->
            <div class="calendar_cutting_line" :class="!isShowTimeBar ? 'disabled' : ''">
                <div
                    v-for="(item, index) in datelist"
                    :key="item.id"
                    :style="'width:' + daysCellWidth + 'px;'"
                >
                    {{ item.date | fortmatDate2YMD }}
                </div>
            </div>
        </div>
        <!-- TODO:[-] 21-01-18 遮罩 -->
        <!-- <div id="mask_layer">
            <div class="mask_interval">
                <div
                    v-for="item in allDateList"
                    :key="item.id"
                    :style="'width:' + hoursCellWidth + 'px;'"
                    :class="getMaskLayerCls(item)"
                ></div>
            </div>
        </div> -->
        <div id="msg">{{ slideDateLabelr }}</div>
        <div id="staticmsg">{{ staticDateLabel }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { Mutation, State, namespace, Getter } from 'vuex-class'

import { DateModel } from '@/model/bar/timebar'
import { SET_MAP_NOW, GET_TIMER_LOCK, SET_AUTO_PLAY, GET_AUTO_PLAY } from '@/store/types'
import moment from 'moment'
import dateformat from 'dateformat'
import { fortmatDate2YMD } from '@/common/filter'
// 引入 mid model
import { CaseDateInfo } from '@/middle_model/case'
// import _ from 'underscore'
// 直接使用 lodash 在配合 vue-property-decorator 时会出现不执行的问题
import lodash from 'lodash'
import { debounce } from 'lodash-es'
import { Debounce } from 'vue-debounce-decorator'
@Component({
    filters: {
        fortmatDate2YMD
    }
})
export default class TimeBar extends Vue {
    mydata: any = null
    datelist: Array<DateModel> = []
    allDateList: Array<DateModel> = []
    // 每个格子对应的datelist
    datetimelist: Array<Date> = []
    // 选中的时间在datelist中对应的obj
    selectDate: any = null
    selectHour = ''
    // 滑动时显示的日期label
    slideDateLabelr = ''
    // 点击后固定在点击处的日期label
    staticDateLabel = ''
    hoverCurrentDt: Date = new Date(1970, 1, 1)
    selectedCurrentDt: Date = new Date(1970, 1, 1)
    // TODO:[*] 19-09-12 新加入的复用子组件的需要用到的一些变量
    lenTimeBar = 600
    // 起始偏移位置
    siteStart: number

    // TODO:[-] 21-01-18 与case date 相关的 mid model
    caseDateInfo: CaseDateInfo = null

    // 每日共划分的间隔
    // intervalOfDay: number;

    // 共显示的天数
    // days: number;
    // TODO:[-] 21-01-14 计时器开关，true -> 打开,false -> 关闭
    timerLock = false

    // TODO:[-] 21-12-17 加入遮罩开关
    disabled = true // true 不可用 ,false 关闭遮罩

    timer = 0
    // + 21-01-27 播放 dt 的时间间隔
    timerInterval = 1000 * 2.0

    // 当前控件的长款
    contentStyleObj: {
        height: number
        width: number
    } = {
        height: 0,
        width: 0
    }
    // 不让 监听 -> contentStyleObj 的频率过快的 watcher
    watcherContentStyleObj = false
    daysCellWidth = 0
    hoursCellWidth = 0
    timeLineWidth = 0

    @Prop(Date)
    startDateTime!: Date
    @Prop(Date)
    endDateTime!: Date
    //每日共划分的间隔
    @Prop(Number)
    interval!: number
    @Prop(Boolean)
    isShowTimeBar: boolean
    // 总共划分的天数
    days = 3

    // 计算属性计算出lenUnit——单位格子的长度
    get lenUnit(): number {
        if (this.interval != 0) {
            return this.lenTimeBar / this.countUnit
        } else {
            return 0
        }
    }
    // 计算：第一个完整的00时所在的格子
    get startIndex(): number {
        return this.diff2StartDayFinish * (24 / this.interval)
    }
    // 计算：获取总格子数
    get countUnit(): number {
        // TODO:[*] 19-09-12 注意此处不需要这么计算直接根据days来计算即可，因为总共只有days天的数据
        // return (
        //   this.days * this.interval +
        //   this.diff2StartDayFinish / (24 / this.interval)
        // );
        return this.days * this.interval
    }

    get cellArr(): number[] {
        // TODO:[-] 19-09-12 快速创建长度为100的数组
        return [...Array(this.countUnit).keys()]
    }

    timerRecovery(): void {
        this.timerLock = !this.timerLock
    }

    @Watch('timerLock')
    onTimerLock(lock: boolean): void {
        /*
            大体逻辑:
                lock = true : on -> 打开，继续计时
                lock =false : off -> 关闭，停止计时
            由 intervalStamp -> 获取对应的时间间隔
        */
        const time = this.timerInterval
        const index = 1
        const that = this
        // autoPlay = true : on  -> 继续播放
        //          = false: off -> 停止播放
        this.setAutoPlay(lock)
        if (lock) {
            if (this.timer === 0)
                // this.timer = setInterval(() => {
                //     this.selectedCurrentDt = new Date(
                //         this.selectedCurrentDt.getTime() + index * 60 * 60 * 1000
                //     )
                // }, time)
                // TODO:[-] 21-01-27 将 setInterval -> setTimeOut
                this.timer = setInterval(() => {
                    if (!that.getMapTimerLock) {
                        setTimeout(() => {
                            that.selectedCurrentDt = new Date(
                                that.selectedCurrentDt.getTime() + index * 60 * 60 * 1000
                            )
                            console.log(`当前时间为:${that.selectedCurrentDt}`)
                        }, time)
                    }
                }, time)
        } else {
            clearInterval(this.timer)
            this.timer = 0
            // clearTimeout(this.timer)
        }
    }

    // 计算：获取分割线数组
    get cuttingLinesIndex(): number[] {
        const nums: number[] = []
        nums.push(0)
        nums.push(this.startIndex)
        if (this.days > 1) {
            for (let index = 1; index <= this.days; index++) {
                // const element = array[index];
                nums.push(index * (24 / this.intervalStamp))
            }
        }

        return nums
    }

    get cuttingLinesWidth(): number[] {
        const nums: number[] = []

        nums.push(this.startIndex)
        if (this.days > 1) {
            for (let index = 1; index <= this.days; index++) {
                nums.push(24 / this.intervalStamp)
            }
        }

        return nums
    }
    // 计算：起始时间距离第一天结束的时间差（hour）
    get diff2StartDayFinish(): number {
        return 24 - this.startDateTime.getHours()
    }

    get getWidth(): string {
        if (this.$refs.databar !== undefined) {
            return this.$refs.databar.offsetWidth + 'px'
        } else {
            return ''
        }
    }

    getHeightWidth(): void {
        this.contentStyleObj.width = this.$refs.datebar.offsetWidth
        this.contentStyleObj.height = this.$refs.datebar.offsetHeight
        console.log(
            `当前 time bar 大小:h:${this.contentStyleObj.height}|w:${this.contentStyleObj.width}`
        )
    }

    prefixInteger(num: string, length: string): string {
        return ('0000000000000000' + num).substr(-length)
    }

    //每个间隔的小时（单位：小时）
    get intervalStamp(): number {
        return 24 / this.interval
    }
    // 鼠标移入时间line时的操作
    overProgressLineBak(event: any): void {
        // console.log(this);
        // console.log(event);
        const myself = this
        // + 21-12-17 若不显示则直接跳出
        if (!this.isShowTimeBar) {
            return
        }
        const mainDom = document.getElementsByClassName('progress-line')
        // 1 计算整个进度条的长度
        const lenTotal = event.currentTarget.clientWidth
        // 2-1 计算后除以12份（计算72小时的，间隔6小时一个，共12个格子）
        // 2-2计算每一个格子的宽度
        // TODO:[*] 19-09-10 修改格子的间隔为每小时一个格子
        // var cellWidth = lenTotal / 12;
        const cellWidth = this.lenUnit
        // 3 获取鼠标选中的点的位置
        const lenTarget = event.offsetX
        // 4 然后获取该位置属于的格子
        const indexTarget = lenTarget / cellWidth
        const indexTargetCell = parseInt(indexTarget.toString())

        // 4-s1 根据格子的位置获取该日的位置
        const unit = 4
        const indexDate = parseInt((indexTargetCell / unit).toString())
        // 5 将进度条中的填色部分宽度改变
        const playedDom = document.getElementById('played')
        if (playedDom != null) {
            playedDom.style.width = event.offsetX + '.px'
        }

        // 6 显示数值
        // 6-s1 根据选中的日期获取该日所在的位置的数值，以及children中的label
        const dateTemp = myself.datelist[indexTargetCell].children.filter((obj: any) => {
            return obj.value === indexTargetCell
        })
        // 判断获取的dateTemp是否长度为1
        if (dateTemp.length === 1) {
            const currentDate = dateTemp[0]
            myself.hoverCurrentDt = currentDate.date
            // myself.tempCurrentDt=currentDate.
            myself.slideDateLabelr = currentDate.datetimeStr()
            // myself.selectDate = dateTemp
            const msg = document.getElementById('msg')
            if (msg != null) {
                msg.style.display = 'block'
                msg.style.left = event.offsetX + 10 + '.px'
                // msg.style.top = e.clientY - 35 + ".px";
                // 注意在vue组件中，若使用绝对定位，若在style中使用了scoped，则这个绝对定位是针对当前组件而言的
                // msg.style.top = event.offsetY - 45 + '.px'
            }
        }
        // msg.innerText = dates[indexTarget];
        // msg.html(dates[indexTarget]);
        // console.log(indexTarget)
    }

    // 鼠标移入 progress line 触发的方法
    overProgressLine(event: any): void {
        // function log() {
        //     console.log('throttle')
        // }
        // // _.throttle(log, 1000)
        // // _.debounce(log, 1000)
        // this.delayTest()
        // lodash.debounce(() => {
        //     console.log('debounce')
        // }, 2000)
        // lodash.throttle(() => {
        //     console.log('debounce')
        // }, 2000)
        // lodash.throttle((event: any) => {}, 1.5 * 1000)
        // + 21-12-17 若不显示则直接跳出
        if (!this.isShowTimeBar) {
            return
        }
        // TODO:[-] 21-01-20 在外侧获取 event.currentTarget.clientWidth
        // -> div.progress-line 的宽度
        // ERROR:此处传递给 delayMoveProgressLine 方法的 event 缺失了部分的信息？
        const progressLineWidth: number = event.currentTarget.clientWidth
        this.delayMoveProgressLine(event, progressLineWidth)
    }

    @Debounce(2000)
    delayTest(): void {
        console.log('间隔输出')
        // lodash.debounce(function() {
        //     console.log('间隔输出')
        // }, 500)
    }

    @Debounce(600)
    delayMoveProgressLine(event: any, lineWidth: number): void {
        // 加入防抖功能
        const myself = this
        const mainDom = document.getElementsByClassName('progress-line')

        // TODO:[-] 21-01-19 以下已经做了封装，暂时注释掉
        // --- 21-01-19 ---
        // 1 计算整个进度条的长度
        const lenTotal = lineWidth
        // 2-1 计算后除以12份（计算72小时的，间隔6小时一个，共12个格子）
        // 2-2计算每一个格子的宽度
        // TODO:[*] 19-09-10 修改格子的间隔为每小时一个格子
        const cellWidth = this.hoursCellWidth
        // 3 获取鼠标选中的点的位置
        const lenTarget = event.offsetX
        // 4 然后获取该位置属于的格子
        const indexTarget = lenTarget / cellWidth
        const indexTargetCell = parseInt(indexTarget.toString())

        // // 4-s1 根据格子的位置获取该日的位置
        // const unit = 4
        // const indexDate = parseInt((indexTargetCell / unit).toString())
        // // 5 将进度条中的填色部分宽度改变
        // const playedDom = document.getElementById('played')
        // if (playedDom != null) {
        //     playedDom.style.width = event.offsetX + '.px'
        // }
        // --- 21-01-19 ---

        // 6 显示数值
        // V1
        // 6-s1 根据选中的日期获取该日所在的位置的数值，以及children中的label
        // var dateTemp = myself.datelist[indexTargetCell].children.filter(
        //   (obj: any) => {
        //     return obj.value === indexTargetCell;
        //   }
        // );
        // // 判断获取的dateTemp是否长度为1
        // if (dateTemp.length === 1) {
        //   let currentDate = dateTemp[0];
        //   myself.hoverCurrentDt = currentDate.date;
        //   // myself.tempCurrentDt=currentDate.
        //   myself.slideDateLabelr = currentDate.datetimeStr();
        //   // myself.selectDate = dateTemp
        //   var msg = document.getElementById("msg");
        //   if (msg != null) {
        //     msg.style.display = "block";
        //     msg.style.left = event.offsetX + 10 + ".px";
        //     // msg.style.top = e.clientY - 35 + ".px";
        //     // 注意在vue组件中，若使用绝对定位，若在style中使用了scoped，则这个绝对定位是针对当前组件而言的
        //     msg.style.top = event.offsetY - 35 + ".px";
        //   }
        // }
        // TODO:[*] 19-09-12 使用v2方法
        const dateTemp = this.allDateList[indexTargetCell]

        const currentDate = dateTemp.date

        // TODO:[-] 21-01-19 此处加入时间范围的判断
        // 还需要加入将 overline回复到指定位置的步骤
        // if (
        //     this.caseDateInfo &&
        //     (currentDate < this.caseDateInfo.start || currentDate > this.caseDateInfo.end)
        // ) {
        //     if (currentDate < this.caseDateInfo.start) {
        //         currentDate = this.caseDateInfo.start
        //     } else {
        //         currentDate = this.caseDateInfo.end
        //     }
        // }

        // TODO:[-] 21-01-19 根据当前的时间获取 设置对应的 progressLine width
        /*
            1- 根据起止时间获取所在的格子位置
            2- 根据格子位置若在 起止范围外，则直接渲染至起止范围处
        */
        // 5 将进度条中的填色部分宽度改变
        const playedDom = document.getElementById('played')

        let progressLineWidth = 0
        if (this.verifyDate(currentDate)) {
            // 在预报范围内
            progressLineWidth = event.offsetX
        } else {
            progressLineWidth = this.getCurrentProgressLineWidth(currentDate)
        }
        if (playedDom != null) {
            playedDom.style.width = progressLineWidth + '.px'
        }
        // --- 21-01-19 ---
        // const currentTimeIndex = this.getRegularedNearDatetimeIndex(currentDate)
        // myself.tempCurrentDt=currentDate.
        myself.slideDateLabelr = dateformat(currentDate, 'mm/dd HH:MM')
        // myself.selectDate = dateTemp
        const msg = document.getElementById('msg')
        if (msg != null) {
            msg.style.display = 'block'
            msg.style.left = event.offsetX + 10 + '.px'
            // msg.style.top = e.clientY - 35 + ".px";
            // 注意在vue组件中，若使用绝对定位，若在style中使用了scoped，则这个绝对定位是针对当前组件而言的
            msg.style.top = event.offsetY - 45 + '.px'
        }
        myself.hoverCurrentDt = currentDate
    }

    setTimeBar(event: any): void {
        // console.log('点击事件')
        // 点击之后更新这个选中的时间
        // + 21-12-17 若不显示则直接跳出
        if (!this.isShowTimeBar) {
            return
        }
        this.selectedCurrentDt = this.hoverCurrentDt
    }
    // 初始化当前 date list
    // startDateTime yyyy-mm-dd 00:00 -> endDateTime yyyy-mm-dd 23:59
    initDateList(): void {
        // this.moment()
        //TODO:[*] 注意new Date时，month为从0开始
        // var currentTemp = new Date(1990, 0, 1, 0, 0);
        // var currentTemp = new Date(2016, 6, 20, 12, 0);
        // TODO:[*] 20-07-21 注意此处修改为传入的是起止时间，重新修改后的还需要获取由起止时间获取的起止日期

        this.datelist = []
        // 注意加入了全部 date 的 list
        this.allDateList = []
        const startTemp = this.startDateTime
        // yyyy-mm-dd 00:00
        const startDate = new Date(
            startTemp.getFullYear(),
            startTemp.getMonth(),
            startTemp.getDate(),
            0,
            0
        )

        // yyyy-mm-dd 23:59
        const endDate = new Date(
            this.endDateTime.getFullYear(),
            this.endDateTime.getMonth(),
            this.endDateTime.getDate(),
            23,
            59
        )
        const endTemp = this.endDateTime
        // 转换成时间戳
        const startStamp = startTemp.getTime()
        const endStamp = endTemp.getTime()
        const minUnit = 60 * 1000

        // 获取起止时间之间的时间间隔(hour)
        const diffHours = (endStamp - startStamp) / (minUnit * 60)
        const diffDays = Math.ceil(diffHours / 24)

        /*
            startDate
            Mon Jan 04 2021 00:00:00 GMT+0800 (中国标准时间)
            endDate
            Tue Jan 05 2021 23:59:00 GMT+0800 (中国标准时间)
            对于上面这种情况 diffHours =24
                            difDays = 1
                需要加入判断，只需要判断起始时间 utc hours !== 16 即可，既 非 0-23 的情况
        */
        if (startDate.getUTCHours() === 16) {
            this.days = diffDays + 1
        } else {
            this.days = diffDays
        }

        const tempTimeStampInterval: number = this.intervalStamp * 60 * minUnit
        const countIntervalByDay = this.interval
        // 每日的分隔数量

        // var temp = currentTemp.setHours(currentTemp.getHours() + 6);
        // console.log(temp);
        // days
        for (let i = 0; i < this.days; i++) {
            // 直接加一天
            this.datelist.push(
                new DateModel(i, new Date(startDate.getTime() + i * 24 * 60 * minUnit), [])
            )
            // hours
            for (let j = 0; j < countIntervalByDay; j++) {
                const tempDateModel = new DateModel(
                    i * countIntervalByDay + j,
                    new Date(
                        startDate.getTime() + (i * countIntervalByDay + j) * tempTimeStampInterval
                    )
                )
                this.datelist[i].children.push(tempDateModel)
                this.allDateList.push(tempDateModel)
            }
        }
    }

    // [+] 21-01-18 根据传入的 startDt 初始化 hover 橙色的dt
    initHoverCurrentDtLine(startDt: Date): void {
        this.hoverCurrentDt = startDt
        // 根据 startDt -> 找到对应的格子，并填色
        // local 时间
        const lineStartDate = new Date(
            startDt.getFullYear(),
            startDt.getMonth(),
            startDt.getDate(),
            0,
            0
        )
        // 计算 startDt 与 lineStartDate 的 hours 差值
        const splitHours = Math.round(
            (this.hoverCurrentDt.getTime() - lineStartDate.getTime()) / (60 * 60 * 1000)
        )
        const cellWidth = this.hoursCellWidth
        const playedDom = document.getElementById('played')
        if (playedDom) {
            playedDom.style.width = splitHours * cellWidth + 'px'
        }
    }

    // TODO:[*] 19-09-12 每个格子对应的 date list
    initDateTimeList(): void {
        this.datetimelist = []
        // 根据 起始时间——startDate，总共的天数——days，每日的间隔——interval 共同计算

        // 每个单元格在时间上的间隔
        const intervalUnit = 24 / this.interval
        const startStamp = this.startDateTime.getTime()
        // 每个间隔的间隔时间（ms）
        const tempTimeInterval: number = (24 / this.interval) * 60 * 60 * 1000
        for (let index = 0; index < this.countUnit; index++) {
            this.datetimelist.push(new Date(startStamp + index * tempTimeInterval))
        }
    }

    // 为时间分割线设置起始位置
    initCuttingLinesClass(): void {
        // 找到日期分个符的外侧div
        const calendarDom = document.getElementById('calendar')
        if (calendarDom != null) {
            // TODO:[*] 19-09-12 注意此时的calendar dom并没有子节点
            // 找到第一个子div设置left的偏移
            const child: HTMLElement = calendarDom.childNodes[1] as HTMLElement
            // eg: 第一个为8，8*格子的宽度
            child.style['left'] = this.cuttingLinesIndex[1] * this.lenUnit + 'px'
            if (calendarDom.childNodes.length > 1) {
                // 其余的子div设置宽度
                // 从数组中刨除位置为0的
                const arr = calendarDom.childNodes
                // TODO:[*] 19-09-12 注意此处的arr是NodeList而并不是array！！注意
                /*
          参考文章：
          https://gomakethings.com/converting-a-nodelist-to-an-array-with-vanilla-javascript/
          使用方法：
          Array.from()
          注意此方法不适用于ie
        */
                let tempArr = Array.from(arr)
                const lastIndex = tempArr.length - 1
                tempArr = tempArr.slice(1, lastIndex)
                tempArr.forEach((temp: ChildNode) => {
                    (temp as HTMLElement).style.width = this.lenUnit * this.interval + 'px'
                    // temp.style.width = this.lenUnit * this.interval + "px";
                })
            }
        }
    }

    // 为所有的cell添加样式（实际就是宽度）
    initCellArrClass(): void {}

    mounted() {
        // var myself = this;
        const myself = this
        this.getHeightWidth()
        this.initDate()
        this.caseDateInfo = new CaseDateInfo()
        //  21-01-18 新加入来的为 timebar 加入初始化的 startDt 的所在位置的橙色线条
        // this.initHoverCurrentDtLine()
        window.onresize = () => {
            myself.contentStyleObj.width = myself.$refs.datebar.offsetWidth
        }
        // window.onresize = () => {
        //     return (() => {
        //         myself.contentStyleObj.width = myself.$refs.datebar.offsetWidth
        //     })()
        // }
    }
    getMaskLayerCls(val: DateModel): string {
        /*
            大体逻辑:
                判断当前的 date 是否在 case 的 start - end 范围内
        */
        if (
            this.caseDateInfo &&
            (val.date < this.caseDateInfo.start || val.date > this.caseDateInfo.end)
        ) {
            return 'masked'
        }
    }

    // 21-01-19 验证当前时间是否在 预报范围内
    // t -> 在预报范围内
    // f -> 不在预报范围内
    verifyDate(date: Date): boolean {
        if (date < this.caseDateInfo.start || date > this.caseDateInfo.end) {
            return false
        } else {
            return true
        }
    }
    // 21-01-19 根据传入的 date 判断是否在 预报范围内，不再则返回临近的格子的位置
    getRegularedNearDatetimeIndex(date: Date): number {
        let index = 0
        if (this.verifyDate(date)) {
            index = this.getDateIndex(date)
        } else {
            if (date < this.caseDateInfo.start) {
                index = this.getDateIndex(this.caseDateInfo.start)
            } else if (date > this.caseDateInfo.end) {
                index = this.getDateIndex(this.caseDateInfo.end)
            }
        }
        return index
    }

    getCurrentProgressLineWidth(date: Date): number {
        const index = this.getRegularedNearDatetimeIndex(date)
        const lineWidth = index * this.hoursCellWidth
        return lineWidth
    }

    // 21-01-19 根据传入的 date 从 allDateList 中找到临近时间的所在位置
    getDateIndex(date: Date): number {
        const nearTimeIndex = this.allDateList.findIndex((val) => {
            return date.getTime() === val.date.getTime()
        })
        return nearTimeIndex
    }

    @Mutation('setcurrent', { namespace: 'map' }) setCurrent

    // TODO:[-] 20-02-20
    @Mutation(SET_MAP_NOW, { namespace: 'map' }) setNow

    // TODO:[-] 21-01-29 配合 map -> SET_TIMER_LOCK 使用的, lock = true 锁住,lock =false 打开
    // autoPlay = true : on  -> 继续播放
    //          = false: off -> 停止播放
    @Mutation(SET_AUTO_PLAY, { namespace: 'map' }) setAutoPlay

    @Watch('selectedCurrentDt')
    onSelectedCurrentDt(dt: Date): void {
        // 当修改 当前选中的dt 修改vuex中的对应的值
        // 修改vuex中的 current （注意：current为str类型）
        // TODO:[*] 注意此处
        /*
      dt:Thu Feb 01 1990 12:00:00 GMT+0800 (中国标准时间)
      dt.toUTCString():
        "Thu, 01 Feb 1990 04:00:00 GMT"
      dt.toISOString():
        "1990-02-01T04:00:00.000Z"
    */

        //TODO:[*] 19-11-12 以vuex-class的方式调用mutation
        // this.$store.commit("current", dt.toISOString());
        // this.setCurrent(dt.toISOString())
        this.setNow(dt)
    }
    @Watch('datelist')
    onDateList(): void {
        // 当监听到datelist发生变化时，等该dom渲染完毕后再执行
        const myself = this
        this.$nextTick(function() {
            // myself.initCuttingLinesClass();
        })
    }

    // TODO:[-] 21-01-18 监听 起始时间-prop 的变化
    @Watch('startDateTime')
    onTargetDate(val: Date): void {
        this.initDate()
        //
        this.caseDateInfo.start = val
        this.caseDateInfo.end = this.endDateTime
    }

    initDate(): void {
        // TODO:[*] 19-09-12 为了避免父组件还未为prop赋值子组件就执行mounted方法初始化监听的 startDate prop，把它放在监听方法中
        // 初始化时间列表
        this.initDateList()
        // 初始化每个间隔的时间列表
        this.initDateTimeList()
    }

    @Watch('contentStyleObj', { immediate: true, deep: true })
    onContentStyleObj(val: { height: number; width: number }): void {
        const that = this
        if (!this.watcherContentStyleObj) {
            this.watcherContentStyleObj = true
            setTimeout(() => {
                // console.log(`监听到组件 timebar 的大小发生变化,w:${val.width}|h:${val.height}`)
                that.watcherContentStyleObj = false
                // 修改当前的 days cell width
                that.daysCellWidth = val.width / that.days
                that.hoursCellWidth = val.width / that.allDateList.length
            }, 400)
        }
    }

    @Watch('startDateTime')
    onStartDateTime(val: Date): void {
        this.initHoverCurrentDtLine(val)
    }

    @Watch('caseDateInfo', { immediate: true, deep: true })
    onCaseDateInfo(val: CaseDateInfo): void {}

    @Getter(GET_TIMER_LOCK, { namespace: 'map' }) getMapTimerLock: boolean
}
</script>
<style scoped lang="less">
@import '../../../styles/base';
.dateDiv {
    /* position: absolute; */
    /* bottom: 100px; */
    /* left: 250px; */
    z-index: 999;
    background: #29242168;
    /* width:  */
    box-shadow: 0 20px 10px -11px #35312e68;
    border-radius: 2.5px;

    display: flex;
    /* 主轴对其方式 */
    justify-content: center;
    /* 交叉轴对其方式 */
    align-items: center;
    height: 50px;
}

.dateBar {
    z-index: 999;
    /* position: absolute;
    left: 250px;
    right: 0;
    bottom: 90px; */
    white-space: nowrap;
    /* width: 600px; */
    display: flex;
    // width: 100%;
    width: 80%; // + 21-08-17 将 width修改为原宽度的百分之80
    // background: red;
    /* 两边的边距 */
    margin-right: 20px;
    margin-left: 20px;
}

#calendar {
    top: -20px;
    position: absolute;
}
// - 21-01-18 新加入的 遮罩 mask_layer
#mask_layer {
    top: -20px;
    position: absolute;
    display: flex;
    .mask_interval {
        div {
            height: 0px;
        }
        .masked {
            height: 30px;
        }
    }
}

// - 21-12-17 新加入的 遮罩
.disabled {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    background: #eeeeee;
    opacity: 0.5;
    filter: alpha(opacity=40);
    z-index: 5;
}

.calendar_cutting_line {
    // background-color: #5d585899;
}

.calendar_cutting_line_test {
    position: absolute;
    display: inline-block;
    box-sizing: border-box;
    text-align: left;
    padding: 6px 0 0 8px;
    font-size: 12px;
    line-height: 1;
    height: 26px;
    white-space: nowrap;
    overflow: hidden;
    /* width: 30%; */
    /*字体*/
    text-shadow: 0 0 4px black;
    color: #fff3e1;
    /*加入边框样式*/
    border-left: 1px solid black;
    /*border-right:1px solid black;*/
}
.calendar_interval {
    position: absolute;
    // background-color: #5d585899;
}
.calendar_interval div {
    /* position: absolute; */
    display: inline-block;
    box-sizing: border-box;
    text-align: left;
    padding: 6px 0 0 8px;
    font-size: 8px;
    line-height: 1;
    height: 8px;
    white-space: nowrap;
    overflow: hidden;
    /* width: 30%; */
    /*字体*/
    text-shadow: 0 0 4px black;
    color: #fff3e1;
    /*加入边框样式*/
    border-left: 1px solid rgb(146, 158, 74);
    /*border-right:1px solid black;*/
}
.calendar_cutting_line {
    position: absolute;
    top: 30px;
}
.calendar_cutting_line div {
    /* position: absolute; */
    display: inline-block;
    box-sizing: border-box;
    text-align: left;
    padding: 6px 0 0 8px;
    font-size: 12px;
    line-height: 1;
    height: 26px;
    white-space: nowrap;
    overflow: hidden;
    /* width: 30%; */
    /*字体*/
    text-shadow: 0 0 4px black;
    color: #fff3e1;
    /*加入边框样式*/
    border-left: 1px solid black;
    /*border-right:1px solid black;*/
}
#playpause {
    position: absolute;
    top: -12px;
    left: -35px;
    z-index: 10;
}

.play-pause {
    display: block;
    font-size: 25px;
    color: #9d0300;
    width: 1.2em;
    height: 1.2em;
    border-radius: 1.2em;
    box-shadow: 0 0 4px 0 black;
    background-color: #e5e5e5;
}

.progress-line {
    width: 100%;
    height: 6px;
    cursor: pointer;
    position: relative;
    border: 10px solid transparent;
    border-right-color: transparent;
    border-right-style: solid;
    border-right-width: 10px;
    border-left-color: transparent;
    border-left-style: solid;
    border-left-width: 10px;
    background-clip: padding-box;
    border-right: none;
    border-left: none;
    top: -10px;
    .played {
        // 改变的是 .progress-line -> .played 的 width
        -webkit-transition: width ease-in-out 0.7s;
        transition: width ease-in-out 0.7s;
    }
}

/* @keyframes transform-time-line{
    0%{

    }
} */

.progress-line .played {
    background: rgba(251, 165, 6, 0.788);
    // background-color: #e5e5e5;
    height: 6px;
    float: left;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    width: 15%;
}

.progress-line .avbl {
    height: 6px;
    background-color: rgba(0, 0, 0, 0.6);
    box-shadow: 1px 3px 6px 0px black;
    width: 100%;
    border-radius: 6px;
}

#msg {
    position: absolute;
    display: none;
    // color: rgb(231, 180, 40);
    // background: @baseformbackground-lightgreen;
    @baseformbackground-lightgreen();
    color: #f5f7fa;
    padding: 3px;
    border-radius: 5px;
    top: -45px;
    box-shadow: 0 0 10px 0px black;
}
#staticmsg {
    position: absolute;
    display: none;
    background: #1bc5a3;
    border-radius: 0.5em;

    /*字体*/
    text-shadow: 0 0 4px black;
    color: #fff3e1;
}
/* 以下暂时不用了 */
/* #date {
  width: 150px;
} */
.row {
    margin-right: 0px;
    margin-left: 0px;
    display: flex;
    /* 主轴对其方式 */
    justify-content: center;
    /* 交叉轴对其方式 */
    align-items: center;
}
.row > div {
    margin-right: 3px;
    margin-left: 3px;
}
.dateDiv > .row > .title {
    color: rgb(175, 184, 191);
    font-size: 2em;
    font-weight: bold;
    text-shadow: 2px 2px 10px rgb(220, 243, 14);
    border-radius: 2px;
}
</style>
