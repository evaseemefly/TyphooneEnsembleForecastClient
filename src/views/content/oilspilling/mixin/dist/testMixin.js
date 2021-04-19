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
exports.TestMixin = void 0;
var vue_property_decorator_1 = require("vue-property-decorator");
/**
 * + 21-02-05 新加入的测试 mixin
 *
 * @class CommonOptMixin
 * @extends {Vue}
 */
var TestMixin = /** @class */ (function (_super) {
    __extends(TestMixin, _super);
    function TestMixin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.test = true;
        return _this;
    }
    /**
     * 监听 autoPlay 的变化
     * t -> 继续播放，关闭 停止加载 raster -> loadRasterLock =false
     *
     * @param {boolean} val
     * @memberof CommonOptMixin
     */
    TestMixin.prototype.onZoom = function (val) {
        console.log("\u5F53\u524Dzoom:" + val);
    };
    __decorate([
        vue_property_decorator_1.Watch('zoom')
    ], TestMixin.prototype, "onZoom");
    TestMixin = __decorate([
        vue_property_decorator_1.Component
    ], TestMixin);
    return TestMixin;
}(vue_property_decorator_1.Vue));
exports.TestMixin = TestMixin;
