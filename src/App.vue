<template>
  <div>
    <div id="mars3dContainer" class="mars3d-container"></div>
  </div>
</template>

<script setup lang="ts">
import * as mars3d from "mars3d";
import * as Cesium from "mars3d-cesium";
import { onMounted } from 'vue';
// import * as Cesium from '@cesium/engine';
// import '@cesium/engine/'
import "mars3d/mars3d.css";

import { LabelLayerManager, LabelMassiveWSLayer,LabelGeojsonWSLayer } from 'xgis-label3d';
// LabelGeojsonWSLayer,



// 定义全局地图变量
let map: mars3d.Map | null = null;
onMounted(() => {  
   map =new mars3d.Map('mars3dContainer' as any, {
  basemaps: [{ name: "天地图", type: "tdt", layer: "img_d", show: true }]
});

  if (map) 
  {

    const viewer=map.viewer as any;
    
    const labelLayerManager=new LabelLayerManager(viewer);

    const  labelStyleObject:any={
    show:false,
    near: 500000,
    far: 5000000,
    weight:2,
    offset:-15,
    fontColor:"#EEEEEE",
    fontFamily: "黑体",
    fontSize:16,
    labelField:"tsmc",
    filterField:"tsmc",
    excludeValue:"北京,北京市,中华人民共和国",
    outlineColor:"#000000",
    outlineWidth:2,
    imgUrl:'img/style/city2.png',
    imgWidth:20,
    imgHeight:20,
    children:[
      {
        weight:5,
        offset:-15,
        fontColor:"#ff0000",
        fontSize:16,
        filterField:"tsmc",
        includeValue:'北京',
        excludeValue:undefined,
        imgUrl:'img/style/star.png',
        imgWidth:20,
        imgHeight:20,
      },
      {
        weight:3,
        offset:-15,
        fontColor:"#EEEEEE",
        fontSize:16,
        fontFamily: "黑体",
        filterField:"tsmc",
        includeValue:'北京市',
        excludeValue:undefined,
        imgUrl:'img/style/city1.png',
        imgWidth:20,
        imgHeight:20,
      },
      {
        weight:5,
        offset:-15,
        fontColor:"#EEEEEE",
        fontSize:16,
        fontFamily: "黑体",
        filterField:"tsmc",
        includeValue:'中华人民共和国',
        excludeValue:undefined,
        imgUrl:'',
      },
      {
        weight:3,
        offset:-15,
        fontColor:"#EEEEEE",
        fontSize:18,
        fontFamily: "黑体",
        filterField:"tsmc",
        includeValue:'北京市',
        excludeValue:undefined,
        imgUrl:'img/style/city1.png',
        imgWidth:20,
        imgHeight:20,
      },
    ]
  };
      //用于国家和省、市地名
   const labelLayer = new LabelGeojsonWSLayer('chinaPlaces1', 'http://localhost:8080/chinaProvince.json',labelStyleObject);
    labelLayer.attr = {
      type: '注记',
      layerID: 'chinaPlaces1',
      layerName: '中国地名',
      kind: 'geojson'
    }
    labelLayerManager.addLabelLayer(labelLayer);

    //加载中国省级行政区矢量注记'https://zorrowm.github.io/data/poi/chinaProvince.json'
   //用于大级别字段比较密的数据
    // const labelLayer = new LabelMassiveWSLayer('chinaPlaces2','http://localhost:8080/chinaProvince.json' );
    // labelLayer.attr = {
    //   type: '注记',
    //   layerID: 'chinaPlaces2',
    //   layerName: '中国地名',
    //   kind: 'geojson'
    // }
    // labelLayerManager.addLabelLayer(labelLayer);

    // 调整相机视角到中国北京附近 (经度,纬度,高度)
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(116.3974, 39.9093, 1000000.0),
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90.0),
            roll: 0.0
        }
    });
    // 创建一个 PointPrimitiveCollection 并添加到场景的 primitives 中
    // 这是 Cesium 中高效绘制点图元的推荐方式，属于 primitive 体系
    const pointsCollection = new Cesium.PointPrimitiveCollection();
    viewer.scene.primitives.add(pointsCollection);

    // ---------- 方法1：添加单个点，自定义样式 ----------
    pointsCollection.add({
        position: Cesium.Cartesian3.fromDegrees(116.3974, 39.9093, 0.0),  // 北京天安门附近
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        pixelSize: 18,
        show: true,
        id: "beijing_point"   // 可选：自定义标识
    });

  }

})


</script>

<style scoped>
.mars3d-container {
  width: 100%;
  height: 100vh;
}
</style>
