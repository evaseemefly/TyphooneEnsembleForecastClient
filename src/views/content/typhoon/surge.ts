import { loadMaxSurgeTif } from '@/api/geo'

export interface ISurge {
    getGeoTifUrl(tyCode: string, tyTimeStamp: string): Promise<string>
}

abstract class Surge implements ISurge {
    tyCode: string
    tyTimeStamp: string
    constructor(tyCode: string, tyTimeStamp: string) {
        this.tyCode = tyCode
        this.tyTimeStamp = tyTimeStamp
    }

    abstract getGeoTifUrl(tyCode: string, tyTimeStamp: string): Promise<string>
}

class MaxSurge extends Surge {
    /**
     * - 22-06-11 注意此处存在一个bug若请求出现异常则会返回 '' 注意!
     *
     * @param {string} tyCode
     * @param {string} tyTimeStamp
     * @return {*}
     * @memberof MaxSurge
     */
    async getGeoTifUrl(tyCode: string, tyTimeStamp: string) {
        let tifUrl = ''
        try {
            // 此处不使用异步
            const tifResp = await loadMaxSurgeTif(tyCode, tyTimeStamp)
            tifUrl = tifResp.data
        } catch (error) {
            console.log(error)
        }

        return tifUrl
    }
}

export { Surge, MaxSurge }
