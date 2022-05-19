/**
 * 根据台风等级获取对应的台风 icon url
 *
 * @param {string} tyType
 * @return {*}
 */
const getTyIconUrlByType = (tyType: string) => {
    let iconUrl = ''
    switch (true) {
        // 热带风暴
        case tyType === 'TS':
            iconUrl = '/static/icons/ty/ty_icon_green.svg'
            break
        // 强热带风暴
        case tyType === 'STS':
            iconUrl = '/static/icons/ty/ty_icon_blue.svg'
            break
        // 台风
        case tyType === 'TY':
            iconUrl = '/static/icons/ty/ty_icon_yellow.svg'
            break
        // 强台风
        case tyType === 'STY':
            iconUrl = '/static/icons/ty/ty_icon_orange.svg'
            break
        // 超强台风
        case tyType === 'SuperTY':
            iconUrl = '/static/icons/ty/ty_icon_red.svg'
            break
        default:
            iconUrl = '/static/icons/ty/ty_icon_green.svg'
            break
    }
    return iconUrl
}

export { getTyIconUrlByType }
