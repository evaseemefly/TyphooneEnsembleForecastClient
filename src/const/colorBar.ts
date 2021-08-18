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
    },
    {
        key: 'my-rainbow',
        scale: {
            range: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
            scaleColorList: [
                'rgb(98, 113, 184)',
                'rgb(98, 113, 184)',
                'rgb(61, 110, 163)',
                'rgb(74, 148, 170)',
                'rgb(74, 146, 148)',
                'rgb(77, 142, 124)',
                'rgb(76, 164, 76)',
                'rgb(103, 164, 54)',
                'rgb(162, 135, 64)',
                'rgb(162, 109, 92)',
                'rgb(141, 63, 92)',
                'rgb(151, 75, 145)'
            ]
        }
    },
    {
        key: 'my-ocean',
        scale: {
            range: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
            scaleColorList: [
                '#ffffd9',
                '#edf8b1',
                '#c7e9b4',
                '#7fcdbb',
                '#41b6c4',
                '#1d91c0',
                '#225ea8',
                '#253494',
                '#081d58'
            ]
        }
    }
]

const DEFAULT_COLOR_INDEX=-1

export { ColorScales }
