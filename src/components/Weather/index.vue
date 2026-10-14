<template>
  <div
    class="weather"
    v-if="weatherData.adCode.city && weatherData.weather.weather"
  >
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">&nbsp;{{ weatherData.weather.winddirection }}风&nbsp;</span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { onMounted, reactive, h } from "vue";
import { getAdcode, getWeather } from "@/api";
import { Error } from "@icon-park/vue-next";
import { ElMessage } from "element-plus";

// 高德开发者 Key
let mainKey = import.meta.env.VITE_WEATHER_KEY;

// 默认兜底城市 adcode（临沂），IP 定位失败时使用
const DEFAULT_ADCODE = "371300";

// 天气数据
let weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 获取天气数据
const getWeatherData = () => {
  if (!mainKey) return onError("请配置天气 Key");

  getAdcode(mainKey)
    .then((res) => {
      // IPv4 且定位成功时用返回的 adcode，否则用默认城市兜底
      const adcode =
        res.status === "1" && typeof res.adcode === "string" && res.adcode !== ""
          ? res.adcode
          : DEFAULT_ADCODE;

      getWeather(mainKey, adcode)
        .then((weatherRes) => {
          if (
            weatherRes.status === "1" &&
            weatherRes.lives &&
            weatherRes.lives[0]
          ) {
            const live = weatherRes.lives[0];
            weatherData.adCode = {
              city: live.city,
              adcode: adcode,
            };
            weatherData.weather = {
              weather: live.weather,
              temperature: live.temperature,
              winddirection: live.winddirection,
              windpower: live.windpower,
            };
          } else {
            onError("天气信息获取失败");
          }
        })
        .catch(() => onError("天气信息获取失败"));
    })
    .catch(() => onError("地理位置获取失败"));
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message: message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>
