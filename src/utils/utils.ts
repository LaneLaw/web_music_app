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
  let i = 0;
  function retryGet() {
    return new Promise((resolve, reject) => {
      instance
        .get(url + (param ? `?` + queryStr : ""))
        .then((response) => {
          if (response.data.code !== 200) {
            if (i < 4) {
              i++;
              resolve(retryGet());
            } else {
              i = 0;
              reject(response.data.message);
            }
          } else {
            resolve(response);
          }
        })
        .catch((e) => {
          if (i < 4) {
            i++;
            retryGet();
          } else {
            i = 0;
            reject(e);
          }
        });
    });
  }

  return await retryGet();
}
