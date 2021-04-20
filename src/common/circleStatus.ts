const DEFAULT_RADIUS = 1

/**
 * + 21-04-20 台风圆 状态
 *
 * @class TyphoonCircleStatus
 */
class TyphoonCircleStatus {
    // color_enum=Color
    // 最大风速
    radius = DEFAULT_RADIUS
    // 气压
    bp: number

    constructor(radius: number, bp: number) {
        this.radius = radius
        this.bp = bp
    }
    //获取颜色（string）
    getColor(): string {
        let colorStr = 'blue'
        const val = this.radius
        if (val <= 2) {
            // return color_str
        } else if (val < 4) {
            colorStr = 'yellow'
            // return color_str
        } else if (val < 6) {
            colorStr = 'red'
        }
        return colorStr
    }
    //获取圆圈的半径
    getWeight(): number {
        let weight = 2
        const val = this.radius
        if (val <= 30) {
            weight = 3
        } else if (val < 40) {
            weight = 5
        } else if (val < 60) {
            weight = 8
        } else if (val < 100) {
            weight = 10
        } else {
            weight = 12
        }
        return weight
    }
}

export { TyphoonCircleStatus }
