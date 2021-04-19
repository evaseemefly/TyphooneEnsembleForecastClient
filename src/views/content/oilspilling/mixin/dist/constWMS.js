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
exports.WMSMixin = void 0;
var vue_property_decorator_1 = require("vue-property-decorator");
// 20-08-11 wms 相关的中间 model
var geo_1 = require("@/middle_model/geo");
/**
 * + 21-01-27 作为 mixin 的 wms常量
 *
 * @class WMSMixin
 * @extends {Vue}
 */
var WMSMixin = /** @class */ (function (_super) {
    __extends(WMSMixin, _super);
    function WMSMixin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // mixin definition here
        _this.landWMS = new geo_1.WMSMidModel('http://localhost:8082/geoserver/nmefc_current/wms?', new geo_1.WMSOptionsMidModel('nmefc_current:land_china'));
        _this.ninelineWMS = new geo_1.WMSMidModel('http://localhost:8082/geoserver/nmefc_current/wms?', new geo_1.WMSOptionsMidModel('nmefc_current:9line'));
        _this.southlandWMS = new geo_1.WMSMidModel('http://localhost:8082/geoserver/nmefc_current/wms?', new geo_1.WMSOptionsMidModel('nmefc_current:southsea_land'));
        // 20-07-29 新加入的东中海的区域
        _this.ecsLineWMS = {
            url: 'http://localhost:8082/geoserver/nmefc_current/wms?',
            options: new geo_1.WMSOptionsMidModel('nmefc_current:ecs_shp')
        };
        _this.ecsLineWMSUrl = 'http://localhost:8082/geoserver/nmefc_current/wms?';
        _this.ecsLineWMSOptions = {
            layers: 'nmefc_current:ecs_shp',
            format: 'image/png',
            transparent: true
        };
        _this.windWMS = {
            url: 'http://localhost:8082/geoserver//wms?TIME=2020-06-18T10:00:00.000Z',
            options: new geo_1.WMSOptionsMidModel('nmefc_wind:nmefc_wrf_2020061800')
        };
        // TODO:[-] 20-07-31 新加入的台湾区域的land 多边形 现改为 china
        _this.landTwPoygonsWMS = new geo_1.WMSMidModel('http://localhost:8082/geoserver/nmefc_common/wms?', new geo_1.WMSOptionsMidModel('nmefc_common:new_china_land', 1500));
        // TODO:[-] 20-08-26 新加入的全球国境线
        _this.worldLineWMS = new geo_1.WMSMidModel('http://localhost:8082/geoserver/nmefc_common/wms?', new geo_1.WMSOptionsMidModel('nmefc_common:world_map_line', 1500));
        // TODO:[-] 20-08-26 使用本地 nginx 映射的文件系统
        // http://localhost:8080/content/localhost/images/map/tdt-8level/5/31/11.png
        _this.url = 'http://localhost:82/images/map/tdt-8level/{z}/{x}/{y}.png';
        return _this;
    }
    WMSMixin = __decorate([
        vue_property_decorator_1.Component
    ], WMSMixin);
    return WMSMixin;
}(vue_property_decorator_1.Vue));
exports.WMSMixin = WMSMixin;
