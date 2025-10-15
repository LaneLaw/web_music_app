<template>
  <div class="song-search">
    <!-- 1. 搜索输入区域 -->
    <div class="search-input-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="请输入歌曲名或歌手名"
        class="search-input"
      />
      <div v-if="loading" class="loading">搜索中...</div>
    </div>

    <!-- 2. 搜索结果列表 -->
    <ul v-if="searchResults.length > 0" class="results-list">
      <li
        v-for="song in searchResults"
        :key="song.id"
        class="result-item"
        @click="playSong(song)"
      >
        <span class="song-name">{{ song.name }}</span> -
        <span class="artist">{{ song.artists[0]?.name }}</span>
        <span
          v-if="song.mvid !== 0"
          class="mv-tag"
          @click.stop="playMv(song.mvid)"
          >MV</span
        >
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 响应式数据
const searchQuery = ref(""); // 搜索关键词
const searchResults = ref([]); // 搜索结果列表
const loading = ref(false); // 加载状态
const errorMessage = ref(""); // 错误信息
const currentSongUrl = ref(""); // 当前播放歌曲的URL
const audioPlayer = ref(null); // 音频播放器实例

// 处理搜索输入（使用防抖优化）
let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    errorMessage.value = "";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  searchTimeout = setTimeout(async () => {
    try {
      // 调用搜索API（此处需要替换为真实的API端点）
      const response = await fetch(
        `https://api.example.com/search?keywords=${encodeURIComponent(
          searchQuery.value
        )}`
      );
      if (!response.ok) throw new Error("网络响应异常");

      const data = await response.json();
      searchResults.value = data.result?.songs || [];
    } catch (error) {
      console.error("搜索失败:", error);
      errorMessage.value = "搜索失败，请检查网络连接或稍后重试";
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  }, 300); // 防抖延迟300毫秒
};

// 播放歌曲
const playSong = async (song) => {
  try {
    // 获取歌曲播放URL（此处需要替换为真实的API端点）
    const response = await fetch(
      `https://api.example.com/song/url?id=${song.id}`
    );
    const data = await response.json();

    if (data.data && data.data[0]?.url) {
      currentSongUrl.value = data.data[0].url;
      // 确保音频元素已加载并播放
      setTimeout(() => {
        if (audioPlayer.value) {
          audioPlayer.value.play().catch((e) => console.error("播放失败:", e));
        }
      }, 0);
    }
  } catch (error) {
    console.error("获取歌曲URL失败:", error);
    errorMessage.value = "歌曲暂时无法播放";
  }
};

// 播放MV（示例函数）
const playMv = (mvid) => {
  console.log("播放MV，ID:", mvid);
  // 实际项目中可在此处打开MV播放模态框或新页面
};
</script>

<style scoped>
.song-search {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #4caf50; /* 聚焦时边框变为绿色 */
}

.loading {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-item:hover {
  background-color: #f8f9fa;
}

.song-name {
  font-weight: bold;
  color: #333;
}

.artist {
  color: #666;
  margin-left: 8px;
}

.mv-tag {
  background-color: #ff4757;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.mv-tag:hover {
  background-color: #ff3742;
}

.empty-state,
.error-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  color: #e74c3c;
}

.audio-player {
  display: none; /* 隐藏原生音频控件，可通过自定义UI控制 */
}
</style>
