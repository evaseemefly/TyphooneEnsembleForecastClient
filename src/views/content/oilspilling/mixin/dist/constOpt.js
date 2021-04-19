"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CommonOptMixin = void 0;
var vue_property_decorator_1 = require("vue-property-decorator");
var vuex_class_1 = require("vuex-class");
// STORE 常量
var types_1 = require("@/store/types");
/**
 * + 21-01-29 作为 常量 的 opt mixin
 *
 * @class CommonOptMixin
 * @extends {Vue}
 */
var CommonOptMixin = /** @class */ (function (_super) {
    __extends(CommonOptMixin, _super);
    function CommonOptMixin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * lock = true : on  -> 打开，加载
         * lock = false: off -> 关闭，不加载
         *
         * @memberof CommonOptMixin
         */
        _this.loadRasterLock = true;
        return _this;
    }
    /**
     * 配合 map -> SET_TIMER_LOCK 使用的, lock = true 锁住,lock =false 打开
     * autoPlay = true : on  -> 继续播放
     *          = false: off -> 停止播放
     * @memberof CommonOptMixin
     */
    // autoPlay = false
    /**
     * 监听 autoPlay 的变化
     * t -> 继续播放，关闭 停止加载 raster -> loadRasterLock =false
     *
     * @param {boolean} val
     * @memberof CommonOptMixin
     */
    CommonOptMixin.prototype.onAutoPlay = function (val) {
        if (val) {
            this.loadRasterLock = false;
        }
        else {
            this.loadRasterLock = true;
        }
    };
    __decorate([
        vue_property_decorator_1.Watch('autoPlay')
    ], CommonOptMixin.prototype, "onAutoPlay");
    __decorate([
        vuex_class_1.Getter(types_1.GET_AUTO_PLAY, { namespace: 'map' })
    ], CommonOptMixin.prototype, "autoPlay");
    CommonOptMixin = __decorate([
        vue_property_decorator_1.Component
    ], CommonOptMixin);
    return CommonOptMixin;
}(vue_property_decorator_1.Vue));
exports.CommonOptMixin = CommonOptMixin;
