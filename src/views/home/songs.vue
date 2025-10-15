<template>
  <div class="container">
    <div></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";

const songs = ref([{ song: "默认", isActive: false, isCurrent: true }]);

function initSongs(songs) {
  songs.value = songs;
}
defineExpose({
  initSongs,
});
</script>
<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
