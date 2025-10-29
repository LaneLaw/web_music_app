<template>
  <div class="container">
    <canvas ref="visualCanvasRef" class="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";

const visualCanvasRef = ref();
const audioContext = ref(null);
const analyser = ref(null);
const dataArray = ref(null);
const animationFrameId = ref(null);
function setupAnalysis(analyser) {
  analyser.value.fftSize = 32;
  const bufferLength = analyser.value.frequencyBinCount;
  dataArray.value = new Uint8Array(bufferLength);
  AnimateVisual();
}

function drawCircularSpectrum(data, width, height, ctx) {
  // 遍历每个频率数据点
  for (let i = 0; i < bars; i++) {
    const centerX = Math.random() * 1920; // 圆心x坐标
    const centerY = Math.random() * 1080; // 圆心y坐标
    const value = data[i];
    const radius = (value / 255) * 100;
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0, // 内圆（起点），半径通常为0
      centerX,
      centerY,
      radius // 外圆（终点），半径为圆的半径
    );
    gradient.addColorStop(0, getRandomHexColor()); // 圆心处为白色
    gradient.addColorStop(1, getRandomHexColor()); // 圆边缘处为蓝色
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function AnimateVisual() {
  const ctx = visualCanvasRef.value.getContext("2d");
  const width = visualCanvasRef.value.width;
  const height = visualCanvasRef.value.height;
  const draw = () => {
    animationFrameId.value = requestAnimationFrame(draw);
    analyser.value.getByteFrequencyData(dataArray.value);
    ctx.clearRect(0, 0, width, height);
    drawCircularSpectrum(dataArray.value, width, height, ctx);
  };
  draw();
}
function initVisual(audioRef) {
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  const sourceNode = audioContext.value.createMediaElementSource(
    audioRef.value
  );
  analyser.value = audioContext.value.createAnalyser();
  sourceNode.connect(analyser.value);
  analyser.value.connect(audioContext.value.destination);
  setupAnalysis(analyser);
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
