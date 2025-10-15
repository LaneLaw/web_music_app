<template>
  <!-- <div class="container">
    <canvas ref="visualCanvasRef"></canvas>
  </div> -->
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";

// const visualCanvasRef = ref();
// const audioContext = ref(null);
// const analyser = ref(null);
// const dataArray = ref(null);
// const animationFrameId = ref(null);
// function setupAnalysis(analyser) {
//   analyser.value.fftSize = 256;
//   const bufferLength = analyser.value.frequencyBinCount;
//   dataArray.value = new Uint8Array(bufferLength);
//   AnimateVisual();
// }
// function AnimateVisual() {
//   const ctx = visualCanvasRef.value.getContext("2d");
//   const width = visualCanvasRef.value.width;
//   const height = visualCanvasRef.value.height;
//   const draw = () => {
//     animationFrameId.value = requestAnimationFrame(draw);
//     analyser.value.getByteFrequencyData(dataArray.value);
//     ctx.clearRect(0, 0, width, height);
//     ctx.fillStyle = "rgb(200, 200, 200)"; // 画布背景色
//     ctx.fillRect(0, 0, width, height);
//     const barWidth = (width / dataArray.value.length) * 0.5; // 条形宽度
//     const barSpacing = barWidth * 0.5; // 条形间距
//     let x = 0;

//     for (let i = 0; i < dataArray.value.length; i++) {
//       const barHeight = (dataArray.value[i] / 255) * height; // 根据数据计算条形高度

//       // 选择颜色，可以根据数据动态变化
//       ctx.fillStyle = `rgb(65, ${barHeight + 100}, 130)`;

//       // 绘制对称的条形图（从画布中间向两边绘制）
//       const x1 = width / 2 + x + barSpacing;
//       const x2 = width / 2 - x - barWidth - barSpacing;
//       const y = height - barHeight;

//       ctx.fillRect(x1, y, barWidth, barHeight); // 右边
//       ctx.fillRect(x2, y, barWidth, barHeight); // 左边

//       x += barWidth + barSpacing;
//     }
//   };
// }
// function initVisual(audioRef) {
//   audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
//   const sourceNode = audioContext.value.createMediaElementSource(
//     audioRef.value
//   );
//   analyser.value = audioContext.value.createAnalyser();
//   sourceNode.connect(analyser.value);
//   analyser.value.connect(audioContext.value.destination);
//   setupAnalysis(analyser);
// }
// onMounted(() => {
//   nextTick(() => {
//     // initVisual();
//   });
// });
// defineExpose({
//   initVisual,
// });
</script>
<style scoped></style>
