<template>
  <div class="container">
    Api提供自<span class="link" @click.stop="handleClick">落月Api</span>
  </div>
</template>

<script setup>
function handleClick() {
  window.open(
    "https://doc.vkeys.cn/api-doc/v2/%E9%9F%B3%E4%B9%90%E6%A8%A1%E5%9D%97/%E7%BD%91%E6%98%93%E4%BA%91%E9%9F%B3%E4%B9%90/2-lyric.html"
  );
}
</script>
<style scoped>
.container {
  position: absolute;
  width: 100%;
  max-width: unset;
  bottom: 8px;
  font-size: 0.8rem;
  text-align: center;
  color: #dbd8cf;
  z-index: 9;
}
.link {
  text-decoration: underline;
  cursor: pointer !important;
  color: #b5baaf;
}
</style>
