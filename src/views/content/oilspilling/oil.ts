// TODO:[-] 21-01-12 引入 temporalGeoJSONLayer 插件
// import { TemporalGeoJSONLayer } from '@/plugins/L.TemporalGeoJSONLayer'
// TODO:[-] 21-01-13 使用 npm 安装 leaflet-temporal-geojson
// import 'leaflet-temporal-geojson'
// TODO:[-] 21-01-26 尝试使用分离出的的 ts 文件，而不通过 npm 导入
import '@/plugins/L.TemporalGeoJSONLayer'
import { Map } from 'leaflet'
import moment from 'moment'
// import chroma from 'chroma-js'
import chroma from 'chroma-js'
import * as L from 'leaflet'
// import 'chroma-js'

// 前后台通信接口
import { loadOilTrackAllTime, loadOilTrackCurrent } from '@/api/oil'
import { AxiosResponse } from 'axios'
export interface IOilOptions {
    code: string
    dt: Date
    interval: number
}
/**
 * 分页选项接口
 *
 * @export
 * @interface IPageOptions
 */
export interface IPageOptions {
    pageCount: number
    isPagination: boolean
}

export interface IOptions extends IOilOptions, IPageOptions {}

type Callback = (code: string, dt: Date, index: number, count: number) => Promise<void>

export class Oil {
    private defaultsOil: IOilOptions = {
        code: 'default',
        dt: new Date(),
        interval: 3000
    }
    private defaultsPage: IPageOptions = {
        pageCount: 200,
        isPagination: true
    }

    private code: string
    private dt: Date
    private interval: number
    private pageCount = 200
    private options: IOptions

    public constructor(options?: IOptions) {
        this.options = {
            ...this.defaultsOil,
            ...this.defaultsPage,
            ...options
        }
        this.code = this.options.code
        this.dt = this.options.dt
        this.interval = this.options.interval
        this.pageCount = this.options.pageCount
    }

    /**
     *  定时请求
     *  根据传入的当前散点的总数/page_count => page_index
     *
     * @param {number} count
     * @param {*} func 回调函数
     * @param {{ rate: number; num: { current: number; sum: number } }} options
     * @memberof Oil
     */
    public intervalLoadTracks(
        count: number,
        func: any,
        options: { rate: number; num: { current: number; sum: number } }
    ) {
        // let interval = this.options?.interval;
        // 讲结果向上取整
        const pageIndex = Math.ceil(count / this.pageCount)
        // 循环进行分页请求
        // for (var index = 0; index < pageIndex; index++) {
        //   setTimeout(() => {
        //     // this.loadTracks(index, func);
        //     console.log(new Date());
        //   }, this.interval);
        // }
        // 注意不需要再写循环了，只在定时器中做计数器的加法即可

        let indexTemp = 0
        options.rate = 0
        // console.log(`${index_temp}`)
        options.num.current = 0

        // TODO:[-] 20-02-01 重新调整修改current的逻辑
        // 统一放在oilSpillingMap中修改，不放在Oil中修改，只是在调用本方法时，先执行清空操作
        // options.num.current = this.pageCount * index_temp

        // TODO:[*] 20-06-14 暂时备份掉
        // const timer = setInterval(() => {
        //     // console.log(new Date())
        //     indexTemp++
        //     // 当前的进度(向上取整)
        //     options.rate = Math.ceil((100 / pageIndex) * indexTemp)
        //     // TODO:[-] 20-02-01 将当前的页容积赋值给options.num——不再这样做
        //     // options.num.current = this.pageCount * pageIndex
        //     // console.log(options.rate);
        //     // console.log(`${index_temp}`)
        //     this.loadTracks(indexTemp, func)

        //     if (indexTemp === pageIndex || indexTemp > pageIndex) {
        //         clearInterval(timer)
        //     }
        // }, this.interval)
        const listPromise: Promise<void>[] = []
        // return new Promise((resolve, reject) => {
        //     resolve('resolve')
        // })
        // let index = 0

        // 使用方式2还是有问题
        // const timer = setInterval(() => {
        //     // TODO:[*] 20-06-14 方式1:貌似有问题
        //     // listPromise.push(
        //     //     new Promise((resolve, reject) => {
        //     //         indexTemp++
        //     //         // 当前的进度(向上取整)
        //     //         options.rate = Math.ceil((100 / pageIndex) * indexTemp)
        //     //         // TODO:[-] 20-02-01 将当前的页容积赋值给options.num——不再这样做
        //     //         // options.num.current = this.pageCount * pageIndex
        //     //         this.loadTracks(indexTemp, func).then((_) => {
        //     //             resolve(`完成加载 tracks num:${index}`)
        //     //         })

        //     //         if (indexTemp === pageIndex || indexTemp > pageIndex) {
        //     //             clearInterval(timer)
        //     //         }
        //     //     })
        //     // )

        //     // 方式2:
        //     indexTemp++
        //     // 当前的进度(向上取整)
        //     options.rate = Math.ceil((100 / pageIndex) * indexTemp)
        //     // TODO:[-] 20-02-01 将当前的页容积赋值给options.num——不再这样做
        //     // options.num.current = this.pageCount * pageIndex
        //     listPromise.push(this.loadTracks(indexTemp, func))

        //     if (indexTemp === pageIndex || indexTemp > pageIndex) {
        //         clearInterval(timer)
        //     }

        //     console.log(`list Promise push num:${index}`)
        //     index++
        // }, this.interval)
        // this.loadTracks(indexTemp, func)
        listPromise.push(this.loadTracks(indexTemp, func))
        // TODO:[-] 20-06-20 此处加入判断，若 this.isPagination == false 说明不需要分页，直接请求一次即可
        if (this.options.isPagination == true) {
            for (let index = 0; index < pageIndex; index++) {
                // 方式2:
                indexTemp++
                // 当前的进度(向上取整)
                options.rate = Math.ceil((100 / pageIndex) * indexTemp)
                // TODO:[-] 20-02-01 将当前的页容积赋值给options.num——不再这样做
                // options.num.current = this.pageCount * pageIndex
                listPromise.push(this.loadTracks(indexTemp, func))
                // console.log(`list Promise push num:${index}`)
                index++
            }
        }
        return Promise.all(listPromise).then()
        // return timer
    }

    /**
     * 根据code与dt获取指定时间的散点
     *
     * @param {number} index page_index
     * @param {Callback} func
     * @memberof Oil
     */
    public loadTracks(index: number, func: Callback): Promise<void> {
        // let _that = this;
        // 获取每页的page_count
        const defaultCount = this.options.pageCount
        return func(this.code, this.dt, index, defaultCount)
    }
}

/**
 * 21-01-12
 * 溢油散点
 *
 * @export
 * @class OilScatter
 * @template T
 */
export class OilScatter {
    /**
     *
     *
     * @private
     * @type {T[]}
     * @memberof OilScatter
     */
    private listVal: number[] = []

    /**
     * list_val 的最小值
     *
     * @private
     * @type {number}
     * @memberof OilScatter
     */
    private min: number

    /**
     * list_val 的最大值
     *
     * @private
     * @type {number}
     * @memberof OilScatter
     */
    private max: number

    private colorBar: any

    private temporalGeoJSONLayer: any = null

    private frameKey: string = null

    private caseId: string | number

    constructor(caseId: string | number, tempMark: string) {
        this.caseId = caseId
        // this.listVal = geoJson.featrues.map((x) => +x.properties[tempMark])
        // this.min = Math.min(...this.listVal)
        // this.max = Math.max(...this.listVal)
        // const colorBar = chroma.scale(chroma.brewer.Virids.reverse()).domain([this.min, this.max])
        // this.colorBar = colorBar
    }

    /**
     * 初始化 this.temporalGeoJSONLayer 并加入了 cover，若=T，则覆盖之前的 temporalGeoJSONLayer
     *
     * @private
     * @param {*} data
     * @param {boolean} [cover=true] T: 覆盖 this.temporalGeoJSONLayer
     * @return {*}  {void}
     * @memberof OilScatter
     */
    private initTemporalGeoJSONLayer(data: any, cover = true): void {
        const paneName = 'myCustom'
        const that = this
        if (this.temporalGeoJSONLayer || cover) {
            const temporalGeoJSONLayer = L.temporalGeoJSONLayer({
                features: data.features,
                style(feature) {
                    return {
                        // do custom styling things
                        fillColor: that.colorBar(feature.properties['mass_oil']),
                        stroke: false
                    }
                },
                circleMarkerOptions: {
                    radius: 3
                },
                paneName: paneName,
                timeKey: 'time'

                // OPTIONAL
                // popupFunction(layer) {
                //     return `wow, very popup: ${layer.feature.properties.time}`
                // }
            })
            this.temporalGeoJSONLayer = temporalGeoJSONLayer
        }
    }

    private getGeoJsonLayer(): L.temporalGeoJSONLayer {
        if (this.temporalGeoJSONLayer === null) {
            // this.initTemporalGeoJSONLayer()
            // TODO:[*] 21-01-013 此处修改为直接报错较好
        }
        return this.temporalGeoJSONLayer
    }

    /**
     * 将当前的 layer 添加至 map 中
     *
     * @param {Map} map
     * @memberof OilScatter
     */
    add2Map(map: Map): void {
        const layer = this.getGeoJsonLayer()
        layer.addTo(map)
    }

    getFrameKeys(): string[] {
        if (this.temporalGeoJSONLayer !== null) {
            return this.temporalGeoJSONLayer.getFrameKeys()
        } else {
            return []
        }
    }

    initLayerByInitKey(): void {
        if (this.temporalGeoJSONLayer !== null) {
            if (this.getFrameKeys.length > 0) {
                this.frameKey = this.getFrameKeys[0]
                this.setFrameKey(this.frameKey)
            }
        }
    }

    private async loadTrack(caseId: string | number): Promise<AxiosResponse<any>> {
        return loadOilTrackAllTime(caseId)
    }

    /**
     * + 21-01-25
     * 新加入的 以时间为索引 分页加载 轨迹
     *
     * @private
     * @param {(string | number)} caseId
     * @param {Date} current
     * @param {string} markName
     * @return {*}  {Promise<AxiosResponse<any>>}
     * @memberof OilScatter
     */
    public async loadTargetDtTrack(caseId: string, current: Date, markName: string): Promise<void> {
        const that = this
        const dtStr = moment(current)
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        return loadOilTrackCurrent(caseId, current).then((res) => {
            if (res.status === 200) {
                const geoJson: {
                    features: { properties: { id: number; mass_oil: number; time: Date } }[]
                } = res.data
                that.listVal = geoJson.features.map((x) => +x.properties[markName])
                that.min = Math.min(...that.listVal)
                that.max = Math.max(...that.listVal)
                // TODO:[*] 21-01-12
                // ERROR:Uncaught (in promise) TypeError: Cannot read property 'reverse' of undefined
                // source 是 2.0.3
                // target 是 2.1.0
                that.colorBar = chroma.scale('YlGnBu').domain([that.min, that.max])
                if (that.getGeoJsonLayer() === null) {
                    that.initTemporalGeoJSONLayer(geoJson)
                } else {
                    that.getGeoJsonLayer().setFrame(dtStr, geoJson.features)
                }
            }
        })
    }

    /**
     * 初始化 geojson ，异步请求 获取指定 caseId 的全部散点的 geojson
     * 为 min | max | colorBar 赋值
     * TODO:[*] 21-01-25 此处需要修改 为 可去掉 本方法，将 加载放在 setCurrent 方法中
     *
     * @param {(string | number)} caseId
     * @param {string} tempMark
     * @return {*}  void
     * @memberof OilScatter
     */
    async initGeoJson(caseId: string | number, tempMark: string): Promise<void> {
        const that = this
        await this.loadTrack(caseId).then((res) => {
            if (res.status === 200) {
                const geoJson: {
                    features: { properties: { id: number; mass_oil: number; time: Date } }[]
                } = res.data
                that.listVal = geoJson.features.map((x) => +x.properties[tempMark])
                that.min = Math.min(...that.listVal)
                that.max = Math.max(...that.listVal)
                // TODO:[*] 21-01-12
                // ERROR:Uncaught (in promise) TypeError: Cannot read property 'reverse' of undefined
                // source 是 2.0.3
                // target 是 2.1.0
                const colorBar = chroma.scale('YlGnBu').domain([that.min, that.max])
                that.colorBar = colorBar
                this.initTemporalGeoJSONLayer(geoJson)
            }
        })
    }

    private setFrameKey(key: string): void {
        if (this.temporalGeoJSONLayer !== null) {
            const frameKeys = this.getFrameKeys()

            if (frameKeys.includes(key)) {
                this.temporalGeoJSONLayer.setFrame(key)
            }
        }
    }

    get getFrameKey(): string {
        return this.frameKey
    }

    /**
     * 更新当前的 时间
     *
     * @param {Date} dt
     * @memberof OilScatter
     */
    setCurrent(dt: Date): void {
        /*
            步骤:
                -1 将传入的 dt -> string
                -2 判断当前 string 是否在 framekeys 中
                -3 t -> setFrameKey 
        */
        // "2021-01-04T17:00:00.0000+08:00"
        const dtStr = moment(dt)
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        const dtstr1 = moment(dt).format('YYYY-MM-DDTHH:mm:ss.SSSS[Z]')
        const frameKeys = this.getFrameKeys()
        if (frameKeys.includes(dtStr)) {
            this.setFrameKey(dtStr)
        }
    }
}
