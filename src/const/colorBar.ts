export interface IColorScale {
    key: string
    scale: IScale
}
export interface IScale {
    range?: number[]
    scaleColorList?: string | string[]
}

const ColorScales: { key: string; scale: IScale }[] = [
    {
        key: 'my-colour',
        scale: {
            range: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
            scaleColorList: [
                '#ee4620',
                '#ee462f',
                '#ed4633',
                '#ef6b6d',
                '#f3a4a5',
                '#f9dcdd',
                '#dcdcfe'
            ]
        }
    }
]

export { ColorScales }
