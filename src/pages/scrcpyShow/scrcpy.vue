<template>
  <el-row :gutter="25">
    <el-col :span="12">
      <el-space>
        <div>
          <RenderContainer
              ref="renderRef"
              :classes="classes"
              :container-style="containerStyle"
              @pointerdown="handlePointerDown"
              @pointermove="handlePointerMove"
              @pointerup="handlePointerUp"
              @pointercancel="handlePointerUp"
              @pointerleave="handlePointerLeave"
              @contextmenu="handleContextMenu"
          />
          <DeviceOperateButton :style="{width: calcWidthAndHeight[0] + 'px'}" :press-key="pressKey" class="mt-1"/>
        </div>
        <el-space direction="vertical" style="z-index: 999;">
          <el-button :type="openInput ? 'primary' : 'info'" :icon="EditPen"
                     @click="openKeyInput(openInput ? 'cancel' : 'open')"/>
          <DeviceFunctionButton :calc-width-and-height="calcWidthAndHeight" :press-key="pressKey"/>
        </el-space>
      </el-space>
    </el-col>
    <el-col :span="12">
    </el-col>
  </el-row>
</template>

<script setup>
import {onMounted, onBeforeUnmount} from 'vue';
import {EditPen} from "@element-plus/icons-vue";
import RenderContainer from './components/RenderContainer.vue';
import {useScrcpy} from './ScrcpyLogic.js';
import DeviceOperateButton from "@/pages/scrcpyShow/components/DeviceOperateButton.vue";
import DeviceFunctionButton from "@/pages/scrcpyShow/components/DeviceFunctionButton.vue";
import {AndroidKeyCode} from "@yume-chan/scrcpy";

const renderRef = ref();
const calcWidthAndHeight = computed(() => {
  const [calcWidth, calcHeight] = swapWidthHeight(width.value, height.value)
  return [calcWidth, calcHeight]
})
const pressKey = (event, type) => {
  console.log('Event:', event);  // 原生事件
  console.log('Type:', type, AndroidKeyCode[type]);     // 自定义参数
  handleKeyEvent(event, AndroidKeyCode[type]);
};
const {
  width,
  height,
  windowWidth,
  windowHeight,
  openInput,
  containerStyle,
  classes,
  changeStyle,
  openKeyInput,
  swapWidthHeight,
  handleKeyEvent,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerLeave,
  handleContextMenu,
  scrcpyStart,
  destroyClient
} = useScrcpy();

// 监听 width 和 height 的变化
watch([windowWidth, windowHeight], ([newWidth, newHeight]) => {
  console.log("监听到窗口变化了")
  if (width.value !== 0 || height.value !== 0) {
    console.log("渲染完成后才能触发")
    console.log("width or height changed", newWidth, newHeight)
    changeStyle()
  }

});
onMounted(() => {
  scrcpyStart(renderRef.value);
});

onBeforeUnmount(() => {
  console.log("销毁 scrcpy");
  destroyClient()
});
</script>

<style lang="scss" scoped>
.video {
  border: 3px solid #303133;
  background-color: #303133;
  cursor: url("/src/assets/img/pointer.png") 2 0, crosshair;
}
</style>
