<template>
  <div class="container">
    <Transition name="fade">
      <div v-show="showCtrl" class="play_button">
        <icon
          :class="{ icon: true, icon_active: !playing }"
          icon="solar:play-bold"
          width="30"
          height="30"
          @click="handleCtrClick"
        ></icon>
        <icon
          :class="{ icon: true, icon_active: playing }"
          icon="solar:pause-bold"
          width="30"
          height="30"
          @click="handleCtrClick"
        ></icon>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-show="showProgress" class="progress_area">
        <div
          ref="progressRef"
          class="progress"
          @click="handleProgClick"
          @mousedown.prevent="handleDragBefore"
        >
          <div class="progress_mask_1"></div>
          <div class="progress_mask_2"></div>
          <div ref="progressBallRef" class="progress_ball"></div>
        </div>
        <div class="duration">{{ transCurTime }} / {{ transDuration }}</div>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-show="showVol" class="volume">
        <div
          v-show="eleVolProShow"
          ref="volProgRef"
          :class="{ vol_progress: true, vol_progress_show: showVolume }"
          @click="handleVolProgClick"
          @mousedown.prevent="handleVolDragBefore"
        >
          <div ref="volEventAreaRef" class="vol_event_area"></div>
          <div class="vol_progress_mask_1"></div>
          <div class="vol_progress_mask_2"></div>
          <div ref="volProgBallRef" class="vol_progress_ball"></div>
        </div>
        <div
          v-show="Number(volume) < 0.5 && Number(volume) > 0"
          ref="vol1Ref"
          :class="{
            vol_icon: true,
            volume1: Number(volume) < 0.5 && Number(volume) > 0,
          }"
        >
          <icon
            icon="lucide:volume-1"
            width="30"
            height="30"
            @click="handleVolClick"
          ></icon>
        </div>
        <div
          v-show="Number(volume) >= 0.5 && Number(volume) <= 1"
          ref="vol2Ref"
          :class="{
            vol_icon: true,
            volume2: Number(volume) >= 0.5 && Number(volume) <= 1,
          }"
        >
          <icon
            icon="lucide:volume-2"
            width="30"
            height="30"
            @click="handleVolClick"
          ></icon>
        </div>
        <div
          v-show="volume == 0"
          ref="volxRef"
          :class="{ vol_icon: true, volumex: volume == 0 }"
        >
          <icon
            icon="lucide:volume-x"
            width="30"
            height="30"
            @click="handleVolClick"
          ></icon>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
const props = defineProps({
  playing: {
    type: Boolean,
    required: true,
  },
  currentTime: {
    type: [String, Number],
    default: 0,
  },
  duration: {
    type: [String, Number],
    default: 0,
  },
  volume: {
    type: [String, Number],
    default: 0,
  },
});

const transCurTime = ref("00:00");
const transDuration = ref("00:00");

watch(
  () => props.currentTime,
  (val) => {
    transCurTime.value = secondsToMMSS(val);
    handleProgressGo(val);
  }
);

watch(
  () => props.duration,
  (val) => {
    transDuration.value = secondsToMMSS(val);
  }
);

const emit = defineEmits(["switch", "jump", "volume", "update:duration"]);

const progressRef = ref();
const progressBallRef = ref();
const volProgRef = ref();
const volProgBallRef = ref();
const vol1Ref = ref();
const vol2Ref = ref();
const volxRef = ref();
const volEventAreaRef = ref();

const showVolume = ref(false);

const showCtrl = ref(false);
const showProgress = ref(false);
const showVol = ref(false);

const isDragging = ref(false);
const isVolDragging = ref(false);

const eleVolProShow = ref(false);

function setupProgress() {
  document.addEventListener("mousemove", function (e) {
    if (isDragging.value) {
      handleProgClick(e);
    }
    if (isVolDragging.value) {
      handleVolProgClick(e);
    }
    const refArrs = [volxRef, vol1Ref, vol2Ref];
    if (isMouseInElement(e, volEventAreaRef.value) && showVolume.value) {
      return;
    }
    showVolume.value = refArrs.some((i) => isMouseInElement(e, i.value));
    if (!showVolume) {
      setTimeout(() => {
        eleVolProShow.value = false;
      }, 300);
    } else {
      eleVolProShow.value = true;
    }
  });
  document.addEventListener("mouseup", function () {
    isDragging.value = false;
    isVolDragging.value = false;
  });
}
function handleProgressGo(val) {
  const percentage = (val / props.duration) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  progressBallRef.value.style.left = `${clampedPercentage}%`;
}
function handleCtrClick() {
  emit("switch", !props.playing);
}
function handleDragBefore() {
  isDragging.value = true;
}
function handleVolDragBefore() {
  isVolDragging.value = true;
}
function handleProgClick(e) {
  const clickPos = e.clientX - progressRef.value.getBoundingClientRect().left;
  const progressWidth = progressRef.value.offsetWidth;
  const clickPercentage = (clickPos / progressWidth) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, clickPercentage));
  progressBallRef.value.style.left = `${clampedPercentage}%`;
  if (props.duration) {
    const currentTime = Math.floor((props.duration * clampedPercentage) / 100);
    emit("jump", currentTime);
  }
}
function handleVolProgClick(e) {
  const clickPos = volProgRef.value.getBoundingClientRect().bottom - e.clientY;
  const progressHeight = volProgRef.value.offsetHeight;
  const clickPercentage = (clickPos / progressHeight) * 100;
  const clampedPercentage = Math.floor(
    Math.max(0, Math.min(100, clickPercentage))
  );
  volProgBallRef.value.style.top = `${100 - clampedPercentage}%`;
  emit("volume", clampedPercentage / 100);
}

const recordVolume = ref(0);

function handleVolClick() {
  if (props.volume > 0) {
    recordVolume.value = props.volume;
    emit("volume", 0);
    volProgBallRef.value.style.top = `100%`;
  } else {
    if (recordVolume.value) {
      emit("volume", recordVolume.value);
      volProgBallRef.value.style.top = `${
        100 - Math.round(recordVolume.value * 100)
      }%`;
    } else {
      emit("volume", 0.5);
      volProgBallRef.value.style.top = `50%`;
    }
  }
}

function secondsToMMSS(totalSeconds) {
  if (totalSeconds < 0 || isNaN(totalSeconds)) {
    return "00:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().split(".")[0].padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function isMouseInElement(event, element) {
  if (!element || !element.getBoundingClientRect) return false;
  const rect = element.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}
const timeoutFunc = ref(null);
function showPanel(flag) {
  if (timeoutFunc.value) {
    clearTimeout(timeoutFunc.value);
    timeoutFunc.value = null;
  }
  const showArr = [showCtrl, showProgress, showVol];
  showArr[0].value = flag;
  timeoutFunc.value = setTimeout(() => {
    showArr[1].value = flag;
    timeoutFunc.value = setTimeout(() => {
      showArr[2].value = flag;
    }, 50);
  }, 50);
}

function initVolume(val) {
  volProgBallRef.value.style.top = `${val * 100}%`;
}

onMounted(() => {
  nextTick(() => {
    setupProgress();
  });
});
defineExpose({
  showPanel,
  initVolume,
});
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
.container {
  display: flex;
  align-items: center;
}
.play_button {
  height: 30px;
  width: 30px;
  position: relative;
  margin: 0 16px;
}
.icon {
  position: absolute;
  color: #dbd8cf;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}
.icon_active {
  opacity: 1;
}
.progress_area {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  width: calc(100% - 124px);
}
.progress {
  position: absolute;
  height: 2px;
  width: 100%;
  background: #dbd8cf;
  cursor: pointer;
  transform: translateY(8px);
}
.progress_mask_1 {
  position: absolute;
  height: 10px;
  width: 100%;
  cursor: pointer;
  transform: translateY(8px);
}
.progress_mask_2 {
  position: absolute;
  margin-top: -10px;
  height: 10px;
  width: 100%;
  cursor: pointer;
  transform: translateY(8px);
}
.progress_ball {
  position: absolute;
  left: 0;
  top: -5px;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: #dbd8cf;
}
.vol_progress {
  position: absolute;
  left: 14px;
  top: -116px;
  width: 2px;
  height: 100px;
  background: #dbd8cf;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s;
}
.vol_progress_show {
  opacity: 1;
}
.vol_progress_mask_1 {
  position: absolute;
  height: 100px;
  width: 10px;
  cursor: pointer;
}
.vol_progress_mask_2 {
  position: absolute;
  height: 100px;
  width: 10px;
  left: -10px;
  cursor: pointer;
}
.vol_event_area {
  position: absolute;
  height: 150px;
  width: 30px;
  bottom: -45px;
  right: -15px;
}
.vol_progress_ball {
  position: absolute;
  left: -4px;
  top: 100px;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: #dbd8cf;
}
.volume {
  height: 30px;
  width: 30px;
  position: relative;
  margin: 0 16px;
}
.vol_icon {
  position: absolute;
  color: #dbd8cf;
  cursor: pointer;
}
.duration {
  position: absolute;
  margin-top: -20px;
  color: #dbd8cf;
}
</style>
