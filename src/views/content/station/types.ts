import { ISurgeLayer } from '@/views/content/typhoon/types'
import { DEFAULT_STATION_CODE, DEFAULT_STATION_NAME } from '@/const/station'
export interface IStation {
    stationCode: string
    stationName: string
}

const DefaultStationOptions: IStation = {
    stationCode: DEFAULT_STATION_CODE,
    stationName: DEFAULT_STATION_NAME
}

export { DefaultStationOptions }
