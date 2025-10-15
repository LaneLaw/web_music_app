<template>
  <!-- <ICursor></ICursor> -->
  <!-- <div class="bg"></div>
  <div class="mask"></div> -->
  <IBackGround>
    <IInput
      v-model="searchKeyword"
      id="input"
      placeholder="搜歌歌~"
      container-class="w-full max-w-sm input_cls"
      @focus="handleInputFocus(true)"
      @blur="handleInputFocus(false)"
    ></IInput>
    <Songs ref="songsRef"></Songs>
    <div class="layout">
      <div class="music_effect_area">
        <AudioVisual ref="visualRef"></AudioVisual>
        <div class="song_list">
          <div
            v-for="item in songs"
            :class="{
              song_name: true,
              song_active: !item.isCurrent,
            }"
            @mouseenter="handleMouseEnter(item)"
            @mouseleave="handleMouseLeave(item)"
            @click="handleClick(item)"
          >
            {{ item.song }}
            <IBorder
              v-if="item.isCurrent"
              :color="['#A07CFE', '#FE8FB5', '#FFBE7B']"
              :border-radius="10"
            ></IBorder>
          </div>
        </div>
      </div>
      <audio
        ref="audio"
        crossorigin="anonymous"
        :autoplay="true"
        :src="songUrl"
      ></audio>
      <div class="play_area">
        <div
          class="play_area_card"
          @mouseenter="handleCardEnter"
          @mouseleave="handleCardLeave"
        >
          <div class="play_area_card_left">
            <div class="play_area_card_left_title">{{ currentSong.name }}</div>
            <div
              ref="cdRef"
              :class="{
                play_area_card_left_cd: true,
                play_area_card_left_cd_pause: !playing,
              }"
            ></div>
          </div>
          <div class="play_area_card_right">
            <div
              class="play_area_card_right_lyric"
              @scroll="handleManualScroll"
            >
              <div class="lyrics_top_placeholder"></div>
              <div
                v-for="lyric in lyrics"
                :key="lyric"
                :class="{
                  lyric: true,
                  lyric_show: lyric.show,
                  ['lyric_key_' + lyric.key]: true,
                }"
                @click="handleLyricClick(lyric)"
              >
                {{ lyric.text }}
              </div>
              <div class="lyrics_bottom_placeholder"></div>
              <div
                v-show="loadingShow"
                :class="{ loading: true, loading_show: loading }"
              >
                <icon
                  icon="svg-spinners:bars-scale-middle"
                  width="30"
                  height="30"
                ></icon>
              </div>
            </div>
          </div>
          <AudioPlayer
            ref="audioPlayerRef"
            v-model:duration="songDuration"
            class="audio_player"
            :volume="volume"
            :playing="playing"
            :current-time="songCurrentTime"
            @jump="handleCurTimeChange"
            @switch="handleBtnSwitch"
            @volume="handleVolChange"
          ></AudioPlayer>
        </div>
      </div>
    </div>
  </IBackGround>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import IBorder from "@/components/effects/IBorder.vue";
import { get } from "@/utils/utils";
import AudioPlayer from "./audioPlayer.vue";
import AudioVisual from "./audioVisual.vue";
import Songs from "./songs.vue";
import IInput from "@/components/form/IInput.vue";
import IBackGround from "@/components/effects/IBackGround.vue";

const audio = ref();
const visualRef = ref();
const audioPlayerRef = ref();
const cdRef = ref();
const songsRef = ref();

const loading = ref(false);
const loadingShow = ref(false);
const searchKeyword = ref("");
const songUrl = ref("");
const lyricInterval = ref(null);
const playing = ref(false);
const volume = ref(0);
const isManualScroll = ref(null);
const highlightLyric = ref(null);
const songs = ref([]);
const lyrics = ref([]);
const currentSong = ref({ name: "默认" });

const songDuration = ref(0);
const songCurrentTime = ref(0);

const isSearchFocus = ref(false);
function handleInputFocus(val) {
  isSearchFocus.value = val;
}
function setupEventListener() {
  document.addEventListener("keyup", function (e) {
    if (e.key === "Enter" && isSearchFocus.value && searchKeyword.value) {
      handleMusicSearch(searchKeyword.value);
    }
  });
}

async function handleMusicSearch(word) {
  const { data } = await get("https://api.vkeys.cn/v2/music/netease", { word });
  songs.value = data.data.map((item) => ({
    ...item,
    isActive: false,
    isCurrent: false,
  }));
  songsRef.value.initSongs(songs.value)
}

function handleMouseEnter(item) {
  item.isActive = true;
}
function handleMouseLeave(item) {
  item.isActive = false;
}
function handleClick(item) {
  songs.value.forEach((song) => {
    song.isCurrent = false;
  });
  item.isCurrent = true;
  currentSong.value.name = item.name;
  handleSongOn();
}
function resetPlayer() {
  const top = document.querySelector(".lyrics_top_placeholder");
  top.style = "height: 0;";
  lyrics.value.forEach((item) => (item.show = false));
}
async function handleSongOn() {
  loadingShow.value = true;
  loading.value = true;
  resetPlayer();
  const { data } = await get("https://api.vkeys.cn/v2/music/netease", {
    id: "1345872140",
  });
  setCover(data.data.cover);
  await getLyric("1345872140");
  songUrl.value = data.data.url;
  setupAudio();
}

function setCover(url) {
  if (cdRef.value) {
    cdRef.value.style.background = `url('${url}')`;
  }
}

function setupAudio() {
  audio.value.addEventListener("canplaythrough", function () {
    songDuration.value = audio.value.duration;
  });
  audio.value.addEventListener("timeupdate", function (e) {
    songCurrentTime.value = e.target.currentTime;
    if (!isManualScroll.value) {
      handleLyricScroll(e.target);
    }
  });
  audio.value.addEventListener("play", function () {
    const top = document.querySelector(".lyrics_top_placeholder");
    top.style = "height: 50%;";
    playing.value = true;
  });
  audio.value.addEventListener("pause", function () {
    playing.value = false;
  });
}
function handleManualScroll() {
  if (isManualScroll.value) {
    clearTimeout(isManualScroll.value);
    isManualScroll.value = true;
  }
  isManualScroll.value = setTimeout(() => {
    clearTimeout(isManualScroll.value);
    isManualScroll.value = null;
  }, 3000);
}
function handleCurTimeChange(val) {
  audio.value.currentTime = val;
  handleLyricScroll(audio.value);
}
function handleBtnSwitch(val) {
  if (val) {
    audio.value.play();
  } else {
    audio.value.pause();
  }
}
function handleVolChange(val) {
  audio.value.volume = val;
  volume.value = val;
}
const lyricRetry = ref(0);
async function getLyric(id) {
  return new Promise(async (resolve) => {
    const { data } = await get("https://api.vkeys.cn/v2/music/netease/lyric", {
      id,
    }).catch((e) => {
      console.error(e);
      if (lyricRetry.value <= 5) {
        lyricRetry.value++;
        resolve(getLyric(id));
      }
    });
    const lyric = data.data.lrc;
    const conLyc = data.data.yrc;
    const lyricArr = lyric.split("\n");
    const temp = [];
    let j = 0;
    lyricArr.forEach((lyric) => {
      if (lyric) {
        temp.push({
          key: j++,
          time: timeToSeconds(lyric.match(/\[.*?\]/)[0].slice(1, -1)),
          text: lyric.replace(/\[.*?\]/, ""),
          show: false,
        });
      }
    });
    lyrics.value = temp;
    let i = 0;
    const len = lyrics.value.length - 1;
    loading.value = false;
    setTimeout(() => {
      loadingShow.value = false;
      let showInterval = setInterval(() => {
        lyrics.value[i].show = true;
        i++;
        if (i >= len) {
          clearInterval(showInterval);
          showInterval = null;
          resolve();
        }
      }, 50);
    }, 250);
    lyricRetry.value = 0;
  });
}
function focusLyric(target) {
  target.style =
    "background: #CFE7FA;background: linear-gradient(to left, #CFE7FA 0%, #6393C1 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;";
  highlightLyric.value = target;
  target.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}
function resetHighlightLyric() {
  if (highlightLyric.value) highlightLyric.value.style = "";
}
function handleLyricClick(item) {
  resetHighlightLyric();
  const target = document.querySelector(`.lyric_key_${item.key}`);
  focusLyric(target);
  audio.value.currentTime = (item.time + "").split(".")[0];
}
function timeToSeconds(timeStr) {
  // 使用正则表达式匹配分钟、秒、小数部分
  const match = timeStr.match(/^(\d{2}):(\d{2})\.(\d{1,3})$/);
  if (!match) {
    throw new Error('无效的时间格式，请使用 "mm:ss.xxx" 格式。');
  }

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const fractionalPart = match[3]; // 小数部分字符串
  const fractionalDigits = fractionalPart.length;

  // 将小数部分转换为秒的小数位
  let fractionalSeconds;
  if (fractionalDigits === 1) {
    // 1位：十分秒，如 .1 表示 0.1 秒
    fractionalSeconds = parseInt(fractionalPart, 10) * 0.1;
  } else if (fractionalDigits === 2) {
    // 2位：百分秒，如 .55 表示 0.55 秒
    fractionalSeconds = parseInt(fractionalPart, 10) * 0.01;
  } else {
    // 3位：毫秒，如 .132 表示 0.132 秒
    fractionalSeconds = parseInt(fractionalPart, 10) * 0.001;
  }

  // 计算总秒数：分钟转秒 + 整秒 + 小数秒
  const totalSeconds = minutes * 60 + seconds + fractionalSeconds;
  return totalSeconds;
}

function handleLyricScroll(audio) {
  const currentTime = audio.currentTime;
  const duration = audio.duration;
  const progressPercent = (currentTime / duration) * 100;
  for (let i = 1; i < lyrics.value.length; i++) {
    const curTimestamp = lyrics.value[i - 1].time;
    const nextTimestamp = lyrics.value[i].time;
    if (currentTime >= curTimestamp && currentTime < nextTimestamp) {
      resetHighlightLyric();
      const target = document.querySelector(
        `.lyric_key_${lyrics.value[i - 1].key}`
      );
      focusLyric(target);
    }
  }
}

function handleCardEnter() {
  audioPlayerRef.value.showPanel(true);
}
function handleCardLeave() {
  audioPlayerRef.value.showPanel(false);
}

onMounted(() => {
  nextTick(() => {
    setupEventListener();
    volume.value = audio.value.muted ? 0 : 0.5;
    audio.value.volume = 0.5;
    audioPlayerRef.value.initVolume(volume.value);
    // visualRef.value.initVisual(audio);
  });
});
</script>
<style scoped lang="less">
.container_css() {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
}

.bg {
  .container_css();
  background: black;
  // background: url("../../assets/image/bg.jpg");
  background-size: cover;
}
.input_cls {
  position: absolute;
  z-index: 20;
  top: 20px;
  left: calc(50% - 192px);
}
// .mask {
//   .container_css();
//   backdrop-filter: blur(10px);
//   background-color: rgba(0, 0, 0, 0.5);
// }
.layout {
  .container_css();
  display: flex;
}
.music_effect_area,
.play_area {
  position: relative;
  display: flex;
  height: 100%;
}
.play_area_left,
.play_area_right {
  flex: 1;
}
.music_effect_area {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.song_label {
  margin-bottom: 6px;
}
.song_label :deep(input) {
  width: 200px;
  height: 25px;
}
.song_list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 300px;
  width: 200px;
  overflow-y: overlay;
  scrollbar-gutter: stable;
}
.song_name {
  position: relative;
  padding: 2px;
  margin-bottom: 4px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 20px;
  color: wheat;
  font-style: italic;
  cursor: pointer;
}
.song_active {
  background: linear-gradient(to right, #ec695c, #61c454) no-repeat right bottom;
  background-size: 0 1px;
  transition: background-size 0.3s;
}
.song_active:hover {
  background-size: 100% 1px;
  background-position-x: left;
}
.play_area {
  align-items: center;
  flex: 2;
}

.play_area_card {
  display: flex;
  width: 90%;
  height: 60vh;
  background-color: rgba(89, 89, 89, 0.45);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: rgba(14, 14, 14, 0.19) 0px 6px 15px 0px;
  -webkit-box-shadow: rgba(14, 14, 14, 0.19) 0px 6px 15px 0px;
  border-radius: 7px;
  -webkit-border-radius: 7px;
  color: rgb(128, 128, 128);
}
.audio_player {
  position: absolute;
  bottom: 0;
  height: 50px;
  width: 100%;
}
.play_area_card_left,
.play_area_card_right {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.play_area_card_left_title {
  text-align: center;
  font-size: 20px;
  width: 200px;
  height: 30px;
  margin-top: 20%;
}

.play_area_card_left_cd {
  position: absolute;
  top: calc(50% - 50px);
  left: calc(50% - 50px);
  border-radius: 100%;
  background-size: 100% 100% !important;
  height: 100px;
  width: 100px;
  animation: rotate 30s infinite linear;
  animation-play-state: running;
}
.play_area_card_left_cd_pause {
  animation-play-state: paused;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.play_area_card_right_lyric {
  height: 60%;
  width: 100%;
  margin-top: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: overlay;
}
.loading {
  position: absolute;
  top: calc(50% - 15px);
  left: calc(50% - 15px);
  height: 30px;
  width: 30px;
  opacity: 0;
  transition: opacity 0.3s;
}
.loading_show {
  opacity: 1;
}

.lyric {
  opacity: 0;
  flex-shrink: 0; // flex布局规则默认设置子元素flex-shrink: 1; 需要手动覆盖
  height: 24px;
  transition: opacity 0.3s;
  cursor: pointer;
}
.lyric_show {
  opacity: 1;
}
.lyrics_top_placeholder,
.lyrics_bottom_placeholder {
  flex-shrink: 0;
  min-height: 0;

  transition: height 0.3s;
}
.lyrics_top_placeholder {
  height: 0;
}
.lyrics_bottom_placeholder {
  height: 50%;
}
</style>
