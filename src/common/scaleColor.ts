/*
    TODO:[-] 21-03-12 
*/
// import { BIconChevronCompactUp } from 'bootstrap-vue'
import chroma from 'chroma-js'
class ScaleColor {
    min: number
    max: number
    scale: chroma.Scale
    constructor(min: number, max: number) {
        this.min = min
        this.max = max
    }
    setScale(scaleName: string | string[] = 'Viridis') {
        this.scale = chroma.scale(scaleName)
    }
    getColor(val: number): string {
        if (this.scale === undefined) {
            this.setScale()
        }
        const scale = this.scale
        if (val === 0 || Number.isNaN(val)) return '#7f8c8d'

        // scale to 0 - 1 used by chroma
        const scaledPixelValue = (val - this.min) / (this.max - this.min)

        const color = scale(scaledPixelValue).hex()

        return color
    }
}

/**
 * 台风集合路径配色
 *
 * @class TyGroupPathScaleColor
 * @extends {ScaleColor}
 */
class TyGroupPathScaleColor extends ScaleColor {
    setScale(scaleName: string | string[] = 'Viridis') {
        this.scale = chroma.scale([
            '#00429d',
            '#4771b2',
            '#73a2c6',
            '#a5d5d8',
            '#ffffe0',
            '#ffbcaf',
            '#f4777f',
            '#cf3759',
            '#93003a'
        ])
        // this.scale = chroma.scale([
        //     '#93003a',
        //     '#cf3759',
        //     '#f4777f',
        //     '#ffbcaf',
        //     '#ffffe0',
        //     '#a5d5d8',
        //     '#73a2c6',
        //     '#4771b2',
        //     '#00429d'
        // ])
    }
}

export { ScaleColor, TyGroupPathScaleColor }
