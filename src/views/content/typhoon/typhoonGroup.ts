/*
+ 21-05-18 关于 tyGroupPath 相关的class
*/
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { getTargetTyGroupDistDate, getTargetTyGroupDateRange } from '@/api/tyhoon'
import moment from 'moment'
export interface ITyGroupPathOptions {
    tyCode: string
    timestamp: string
}

class TyGroupPath {
    defaultOptions: ITyGroupPathOptions = {
        tyCode: DEFAULTTYCODE,
        timestamp: DEFAULTTIMESTAMP
    }
    tyCode: string
    timestamp: string
    constructor(tyCode?: string, timestamp?: string) {
        this.tyCode = this.defaultOptions.tyCode
        this.timestamp = this.defaultOptions.timestamp
        if (tyCode) {
            this.tyCode = tyCode
        }
        if (timestamp) {
            this.timestamp = timestamp
        }
    }

    async getTargetTyGroupDateRange(tyCode?: string, timestamp?: string): Promise<Date[]> {
        let dateRange: Date[] = []
        if (tyCode) {
            this.tyCode = tyCode
        }
        if (timestamp) {
            this.timestamp = timestamp
        }
        await getTargetTyGroupDateRange(this.tyCode, this.timestamp).then(
            (res: { status: number; data: string[] }) => {
                if (res.status === 200) {
                    const dateList: Date[] = []
                    if (res.data.length > 0) {
                        res.data.forEach((temp) => {
                            // "2021-05-18T11:00:00"
                            const temoDt: Date = new Date(temp)
                            // console.log(moment(temp, 'YYYY-MM-DDTHH:mm:ss').utc())
                            // console.log(moment(temp, 'YYYY-MM-DDTHH:mm:ss'))
                            dateList.push(temoDt)
                        })
                    }
                    dateRange = dateList
                }
            }
        )
        return dateRange
    }
    async getTargetTyGroupDistDate(tyCode?: string, timestamp?: string): Promise<Date[]> {
        let dateList: Date[] = []
        if (tyCode) {
            this.tyCode = tyCode
        }
        if (timestamp) {
            this.timestamp = timestamp
        }
        await getTargetTyGroupDistDate(this.tyCode, this.timestamp).then((res) => {
            if (res.status === 200) {
                dateList = res.data
            }
        })
        return dateList
    }
}

export { TyGroupPath }
