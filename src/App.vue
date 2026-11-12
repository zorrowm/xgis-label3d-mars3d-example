<script setup lang="ts">
import * as mars3d from "mars3d";
import * as Cesium from "mars3d-cesium";
import { onBeforeUnmount, onMounted } from "vue";
import {
  LabelLayerManager,
  LabelMassiveWSLayer,
  LabelGeojsonWSLayer,
  type IVtAnnoStyle,
  type LabelLayer,
} from "xgis-label3d";

interface PoiConfig {
  id: string;
  url: string;
  styleOptions: IVtAnnoStyle;
}

// 湖南市县注记配置。
const poiList: PoiConfig[] = [
  {
    id: "city_poi",
    url: "/poi/cityPOI.json",
    styleOptions: {
      show: true,
      near: 400000,
      far: 900000,
      weight: 3,
      offset: -15,
      fontColor: "#FFD9D9",
      fontFamily: "黑体",
      fontSize: 16,
      labelField: "市",
      filterField: "市",
      outlineColor: "#ff0000",
      outlineWidth: 2,
      imgUrl: "/img/style/city1.png",
      imgWidth: 20,
      imgHeight: 20,
    },
  },
  {
    id: "county_poi",
    url: "/poi/coutyPOI.json",
    styleOptions: {
      show: true,
      near: 40000,
      far: 500000,
      weight: 2,
      offset: -15,
      fontColor: "#EEE",
      fontFamily: "黑体",
      fontSize: 14,
      labelField: "NAME",
      outlineColor: "#000000",
      outlineWidth: 2,
    },
  },
];

// SDK 实例保持非响应式，由当前组件管理生命周期。
let map: mars3d.Map | undefined;
let labelLayerManager: LabelLayerManager | undefined;
const labelLayers: LabelLayer[] = [];

onMounted(() => {
  map = new mars3d.Map("mars3dContainer", {
    basemaps: [{ name: "天地图", type: "tdt", layer: "img_d", show: true }],
  });

  const viewer = map.viewer;
  const manager = new LabelLayerManager(viewer);
  labelLayerManager = manager;

  const defaultStyleObject: IVtAnnoStyle = {
    show: false,
    near: 500000,
    far: 5000000,
    weight: 2,
    offset: -15,
    fontColor: "#EEEEEE",
    fontAlpha: 1,
    fontFamily: "黑体",
    fontSize: 16,
    labelField: "tsmc",
    filterField: "tsmc",
    excludeValue: "北京,北京市,中华人民共和国",
    outlineColor: "#000000",
    outlineWidth: 2,
    imgUrl: "/img/style/city2.png",
    imgWidth: 20,
    imgHeight: 20,
    children: [
      {
        weight: 3,
        offset: -15,
        fontColor: "#eee",
        fontSize: 16,
        fontAlpha: 1,
        fontFamily: "黑体",
        filterField: "tsmc",
        includeValue: "北京市",
        excludeValue: undefined,
        imgUrl: "/img/style/city1.png",
        imgWidth: 20,
        imgHeight: 20,
      },
      {
        near: 5000000,
        far: 10000000,
        weight: 5,
        offset: -15,
        fontColor: "#ff0000",
        fontSize: 18,
        filterField: "tsmc",
        includeValue: "北京",
        excludeValue: undefined,
        imgUrl: "/img/style/star.png",
        imgWidth: 20,
        imgHeight: 20,
      },
      {
        near: 5000000,
        far: 30000000,
        weight: 5,
        offset: -15,
        fontColor: "#eee",
        fontSize: 20,
        fontFamily: "黑体",
        filterField: "tsmc",
        includeValue: "中华人民共和国",
        excludeValue: undefined,
        imgUrl: "",
      },
    ],
  };

  const chinaLabelLayer = new LabelGeojsonWSLayer(
    "chinaPlaces1",
    "/poi/chinaData.json",
    defaultStyleObject,
  );
  labelLayers.push(chinaLabelLayer);
  manager.addLabelLayer(chinaLabelLayer);

  for (const item of poiList) {
    const layer = new LabelMassiveWSLayer(item.id, item.url, item.styleOptions);
    labelLayers.push(layer);
    manager.addLabelLayer(layer);
  }

  // 初始视角位于湖南长沙上空。
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(113.153, 28.226, 1000000),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });
});

onBeforeUnmount(() => {
  const manager = labelLayerManager;
  for (const layer of labelLayers) {
    manager?.removeLabelLayer(layer);
  }
  labelLayers.length = 0;
  labelLayerManager = undefined;
  map?.destroy();
  map = undefined;
});
</script>

<template>
  <div id="mars3dContainer" class="mars3d-container"></div>
</template>

<style scoped>
.mars3d-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
}
</style>
