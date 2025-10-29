import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { useNotification } from "@kyvg/vue3-notification";

const notification = useNotification();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ObjectValues<T> = T[keyof T];

const instance = axios.create({
  baseURL: "",
  timeout: 10000, // 超时时间（毫秒）
  headers: {},
});

export async function post(url: string, param: Object) {
  return new Promise((resolve, reject) => {
    instance
      .post(url, param)
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });
}

export async function get(url: string, param: any) {
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
              notification.notify({
                type: "error",
                text: `${response.data.message}, 重试请求第${i}次。`,
              });
              resolve(retryGet());
            } else {
              i = 0;
              notification.notify({
                type: "error",
                text: response.data.message,
              });
              reject(response.data.message);
            }
          } else {
            resolve(response);
          }
        })
        .catch((e) => {
          if (i < 4) {
            i++;
            notification.notify({
              type: "error",
              text: `${e}, 重试请求第${i}次。`,
            });
            retryGet();
          } else {
            i = 0;
            notification.notify({
              type: "error",
              text: `${e}`,
            });
            reject(e);
          }
        });
    });
  }

  return await retryGet();
}
