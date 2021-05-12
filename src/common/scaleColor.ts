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
        if(this.scale===undefined){
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

export { ScaleColor }
