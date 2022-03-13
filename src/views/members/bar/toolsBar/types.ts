// 枚举
import { LayerTypeEnum } from '@/enum/map'
import { ToolBarOptionsEnum } from '@/enum/options'
export interface IExpandModel extends ICon, IOptions, IExpand, ILayer, ICheck, IShow {
    // 子 template
    html: string
    // tool的种类
    toolType: ToolTypeEnum
    // 子节点数组
    children?: IExpandModel[]
}
interface ICon {
    // 显示的 icon 的 clasName
    iconClass: string
    title: string
}
interface IOptions {
    val: string
    key?: number
    optionsType?: ToolBarOptionsEnum
    hasOptions?: boolean // + 21-08-11 新加入的 是否有可展开的 options
    options?: IChildOptions[]
    showOptions?: boolean
    group?: number
}

// 新加入了的 子级选项接口
interface IChildOptions {
    key: number
    val: string
    optionsType?: LayerTypeEnum
    group?: number
}
interface IExpand {
    // 是否展开 展开: true | 否则: false
    isExpanded: boolean
    // 是否有子节点
    hasChildren: boolean
    // 是否是子节点
    isChildren: boolean
}
interface IShow {
    isTitleShow: boolean
}
interface ILayer {
    // 若为 layer 的种类枚举
    layerType?: LayerTypeEnum
}
interface ICheck {
    // 是否为勾选状态
    checked: boolean
    // 是否为单选按钮
    isRadio?: boolean
}
interface IFather {
    isFather: boolean
}
export enum ToolTypeEnum {
    // 图层
    LAYER = 0,
    // 选项
    OPTION = 1,

    /**
     *显示模式
     */
    SHOWTYPEOPTION = 2,

    /**
     *油品权重
     */
    OILFACTOR = 3,
    /**
     *选取位置按钮
     */
    SELECTPOSITION = 4,
    OPTIONS = 5
}
