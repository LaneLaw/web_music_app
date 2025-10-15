<template>
  <div class="liquid-glass-container">
    <!-- SVG滤镜定义，用于创建液态扭曲效果 -->
    <svg style="display: none">
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="turbulenceFrequency"
          numOctaves="1"
          seed="17"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lighting-color="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          :scale="displacementScale"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <!-- 液态玻璃卡片主体 -->
    <div
      class="liquid-glass-card"
      :style="{
        borderRadius: borderRadius,
        width: width,
        height: height,
      }"
      @mouseenter="startHover"
      @mouseleave="endHover"
    >
      <!-- 效果层：模糊与滤镜 -->
      <div class="glass-effect-layer"></div>
      <!-- 色调层 -->
      <div class="glass-tint-layer"></div>
      <!-- 高光层 -->
      <div class="glass-shine-layer"></div>
      <!-- 内容插槽 -->
      <div class="glass-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 定义组件属性
const props = defineProps({
  // 圆角半径
  borderRadius: {
    type: String,
    default: "24px",
  },
  // 卡片宽度
  width: {
    type: String,
    default: "400px",
  },
  // 卡片高度
  height: {
    type: String,
    default: "auto",
  },
  // 模糊强度
  blurStrength: {
    type: Number,
    default: 5,
  },
  // 悬停时的放大比例
  hoverScale: {
    type: Number,
    default: 1.03,
  },
  // 动画持续时间（毫秒）
  transitionDuration: {
    type: Number,
    default: 400,
  },
  // 湍流频率，影响液态扭曲程度
  turbulenceFrequency: {
    type: String,
    default: "0.001 0.005",
  },
  // 位移缩放，影响扭曲强度
  displacementScale: {
    type: Number,
    default: 200,
  },
});

// 响应式变量控制悬停状态
const isHovered = ref(false);

// 鼠标悬停效果
const startHover = () => {
  isHovered.value = true;
};

const endHover = () => {
  isHovered.value = false;
};
</script>

<style scoped>
.liquid-glass-container {
  display: inline-block;
}

.liquid-glass-card {
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1), 0 1.5px 6px rgba(0, 0, 0, 0.08);
  background: transparent;
  /* 使用CSS自定义属性控制变换 */
  --hover-scale: v-bind("isHovered ? props.hoverScale : 1");
  transform: scale(var(--hover-scale));
  transition: all v-bind('props.transitionDuration + "ms"')
    cubic-bezier(0.175, 0.885, 0.32, 1.6);
  cursor: pointer;
}

/* 玻璃效果层 */
.glass-effect-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  backdrop-filter: blur(v-bind('props.blurStrength + "px"'));
  -webkit-backdrop-filter: blur(v-bind('props.blurStrength + "px"'));
  filter: url(#glass-distortion);
  isolation: isolate;
  border-radius: inherit;
}

/* 色调层 */
.glass-tint-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: inherit;
}

/* 高光层 */
.glass-shine-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: inherit;
  box-shadow: inset 1px 1px 8px rgba(255, 255, 255, 0.18),
    inset -1px -1px 8px rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

/* 内容区域 */
.glass-content {
  position: relative;
  z-index: 3;
  padding: 1px;
  transform: scale(var(1 / --hover-scale));
  color: white;
}
</style>
