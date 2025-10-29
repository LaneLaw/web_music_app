<template>
  <div class="container">
    <canvas
      width="200"
      height="200"
      ref="visualCanvasRef"
      class="canvas"
    ></canvas>
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
  const centerX = width / 2; // 圆心x坐标
  const centerY = height / 2; // 圆心y坐标
  console.log(centerX, centerY);
  const radius = Math.min(centerX, centerY) * 0.7; // 基础半径，留出边缘空间
  const bars = data.length; // 条形数量，等于频率数据点数

  // 遍历每个频率数据点
  for (let i = 0; i < bars; i++) {
    // 当前数据值（0-255）
    const value = data[i];
    // 将值归一化（映射到0-1范围），并乘以一个系数来控制条形最大长度
    const barLength = (value / 255) * 80;

    // 计算当前条形在圆上的角度（将360度平均分给每个条形）
    const angle = (i / bars) * Math.PI * 2;
    // 计算条形终点的坐标
    const x = centerX + Math.cos(angle) * barLength;
    const y = centerY + Math.sin(angle) * barLength;
    // 计算条形起点的坐标（在基础半径的圆上）
    const startX = centerX + Math.cos(angle) * 20;
    const startY = centerY + Math.sin(angle) * 20;

    if (barLength <= 20) {
      return;
    }

    // 设置线条样式，颜色可以根据数值动态变化
    ctx.strokeStyle = `#dbd8cf`;
    ctx.lineWidth = 2;

    // 开始绘制条形
    ctx.beginPath();
    ctx.moveTo(startX, startY); // 移动到起点
    ctx.lineTo(x, y); // 画线到终点
    ctx.stroke(); // 描边
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
    // ctx.fillStyle = "rgb(200, 200, 200, 0)"; // 画布背景色
    // ctx.fillRect(0, 0, width, height);
    // const barWidth = (width / dataArray.value.length) * 0.5; // 条形宽度
    // const barSpacing = barWidth * 0.5; // 条形间距
    // let x = 0;

    // for (let i = 0; i < dataArray.value.length; i++) {
    //   const barHeight = (dataArray.value[i] / 255) * height; // 根据数据计算条形高度

    //   // 选择颜色，可以根据数据动态变化
    //   ctx.fillStyle = `rgb(65, ${barHeight + 100}, 130)`;

    //   // 绘制对称的条形图（从画布中间向两边绘制）
    //   const x1 = width / 2 + x + barSpacing;
    //   const x2 = width / 2 - x - barWidth - barSpacing;
    //   const y = height - barHeight;

    //   ctx.fillRect(x1, y, barWidth, barHeight); // 右边
    //   ctx.fillRect(x2, y, barWidth, barHeight); // 左边

    //   x += barWidth + barSpacing;
    // }
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
  height: 100%;
  width: 100%;
}
.canvas {
  position: absolute;
  height: 200px;
  width: 200px;
  top: -100px;
  left: -100px;
  clip-path: polygon(0 0, 49% 0, 49% 51%, 100% 51%, 100% 100%, 0 100%);
  transform: rotate(90deg);
}
</style>
