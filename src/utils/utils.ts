import axios from "axios";

const instance = axios.create({
  baseURL: "",
  timeout: 10000, // 超时时间（毫秒）
  headers: {},
});

export async function post(url, param) {
  return new Promise((resolve, reject) => {
    instance
      .post(url, param)
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });
}

export async function get(url, param) {
  let queryStr = "";
  if (param) {
    Object.keys(param).forEach((key) => {
      queryStr += `${key}=${param[key]}`;
    });
  }

  return new Promise((resolve, reject) => {
    instance
      .get(url + (param ? `?` + queryStr : ""))
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });
}
