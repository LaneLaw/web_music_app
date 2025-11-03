<template>
  <div ref="container" class="container">
    <canvas ref="visualCanvasRef" class="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";

const visualCanvasRef = ref();
const container = ref();
const audioContext = ref(null);
const analyser = ref(null);
const dataArray = ref(null);
const animationFrameId = ref(null);
const fftSize = ref(32);
const position = ref([]);
function setupAnalysis() {
  analyser.value.fftSize = fftSize.value;
  const bufferLength = analyser.value.frequencyBinCount;
  dataArray.value = new Uint8Array(bufferLength);
  AnimateVisual();
}

function getRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function getSplitLight(i, width, height) {
  const centerX = Math.random() * width; // 圆心x坐标
  const centerY = Math.random() * height; // 圆心y坐标
  const flag = position.value.every((item) => {
    const xDiff = Math.abs(item[0] - centerX);
    const yDiff = Math.abs(item[1] - centerY);
    if (xDiff + yDiff < 100) {
      return false;
    }
    return true;
  });
  if (!flag) {
    getSplitLight(i);
    return;
  }
  position.value.push([centerX, centerY, getRandomColor()]);
}

function drawCircularSpectrum(data, width, height, ctx) {
  const bars = data.length;
  // 遍历每个频率数据点
  for (let i = 0; i < bars; i++) {
    if (!position.value[i]) {
      getSplitLight(i, width, height);
    }
    const value = data[i];
    const radius = (value / 255) * 120;
    const gradient = ctx.createRadialGradient(
      position.value[i][0],
      position.value[i][1],
      0, // 内圆（起点），半径通常为0
      position.value[i][0],
      position.value[i][1],
      radius // 外圆（终点），半径为圆的半径
    );
    gradient.addColorStop(0, position.value[i][2]);
    gradient.addColorStop(1, "#00000000");
    ctx.beginPath();
    ctx.arc(position.value[i][0], position.value[i][1], radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function AnimateVisual() {
  const ctx = visualCanvasRef.value.getContext("2d");
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  visualCanvasRef.value.width = width;
  visualCanvasRef.value.height = height;
  const draw = () => {
    animationFrameId.value = requestAnimationFrame(draw);
    analyser.value.getByteFrequencyData(dataArray.value);
    ctx.clearRect(0, 0, width, height);
    drawCircularSpectrum(dataArray.value, width, height, ctx);
  };
  draw();
}
function initVisual(ana) {
  position.value = [];
  analyser.value = ana.value;
  setupAnalysis();
}
onMounted(() => {});
defineExpose({
  initVisual,
});
</script>
<style scoped>
.container {
  position: absolute;
  max-width: unset;
  height: 100%;
  width: 100%;
}
.canvas {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
