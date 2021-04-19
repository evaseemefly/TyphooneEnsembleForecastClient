import * as L from 'leaflet'
import 'leaflet-velocity'
// import VelocityLayer from 'leaflet-velocity'
// import VelocityLayer from 'leaflet-velocity-ts'
// import { ICoverageFlow } from './flow'
// 创建的 调用 windy 的相关 class

/**
 * 矢量 显示 参数
 *
 * @export
 * @interface IVelocityDisplayOpt
 */
export interface IVelocityDisplayOpt {
    velocityType: string
    position: string
    emptyString: string
    angleConvention: string
    speedUnit: string
}
/**
 * 矢量 layer 参数
 *
 * @export
 * @interface IVelocityLayerOpt
 */
export interface IVelocityLayerOpt {
    displayValues?: boolean
    displayOptions?: IVelocityDisplayOpt
    maxVelocity?: number // used to align color scale
    colorScale?: number
    velocityScale?: number
    data?: any
}
/**
 * coverage flow 的接口
 *
 * @export
 * @interface ICoverageFlow
 */
export interface ICoverageFlow {
    /**
     * 矢量的 layer
     *
     * @memberof ICoverageFlow
     */
    velocityLayer: L.velocityLayer
    initLayer(data: any): void
}

/**
 * 流场的 flow 实现类
 *
 * @class CoverageCurrentFlow
 * @implements {ICoverageFlow}
 */
export class CoverageCurrentFlow implements ICoverageFlow {
    private velocityLayerOpt: IVelocityLayerOpt = {
        displayValues: true,
        // 之前的配置备份
        //     displayOptions: {
        //         velocityType: 'GBR Wind',
        //         displayPosition: 'bottomleft',
        //         displayEmptyString: 'No wind data'
        //     },
        displayOptions: {
            velocityType: '矢量',
            position: 'bottomleft',
            emptyString: '无栅格数据',
            angleConvention: 'bearingCW',
            speedUnit: 'm/s'
        },
        maxVelocity: 2,
        velocityScale: 0.09,
        // colorScale: 2,
        data: null
    }
    public velocityLayer: any
    public constructor(options?: IVelocityLayerOpt) {
        this.velocityLayerOpt = {
            ...this.velocityLayerOpt,
            ...options
        }
    }
    /**
     * 初始化 this.velocityLayer
     */
    public initLayer(data: any): void {
        this.velocityLayerOpt.data = data
        //flow.ts?06cf:82 Uncaught (in promise) TypeError: leaflet_velocity_ts__WEBPACK_IMPORTED_MODULE_6___default(...) is not a function
        // this.velocityLayer = VelocityLayer(this.velocityLayerOpt)
        this.velocityLayer = L.velocityLayer(this.velocityLayerOpt)
    }
}

// export { ICoverageFlow, CoverageCurrentFlow }
