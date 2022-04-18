// vuex 常量
import { SET_MAP_LAYERS, SET_CURRENT_LATLNG_LOCK } from '@/store/types'
import { Mutation, namespace } from 'vuex-class'
import { mapMutations } from 'vuex'
// @Mutation(SET_MAP_LAYERS, { namespace: 'map' }) setLayers
// ...mapMutations([SET_MAP_LAYERS])
const INIT_LAYERS = (): void => {}

export { INIT_LAYERS }
