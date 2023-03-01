import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const HOST_URL = {
  development: 'http://192.168.5.198:9233/', // 'http://192.168.5.199:8056/',
  test: 'http://192.168.5.201:8056/',
  production: process.env.REACT_APP_HOST_URL || 'http://192.168.5.198:22339/',
}

export function runLoading(config: AxiosRequestConfig = {}) {
  return {
    ...config,
    params: {
      __loading: true,
      ...config.params,
    },
  };
}

const instance = axios.create({
  baseURL: HOST_URL[process.env.NODE_ENV as keyof typeof HOST_URL],
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  timeout: 10000,
});

class ServerError extends Error {
  not_toast = false;

  constructor(data?: any) {
    super((data && (data.msg || data.msgContent)) || '');
    if (!data)
      this.not_toast = true;
  }
}


instance.interceptors.response.use(
  (value: { data?: any; config?: any }) => {
    const { config } = value;
    if (value.data.code !== 200) {
      return Promise.reject(
        new ServerError({
          ...value.data,
          url: config.url,
        })
      );
    }
    return { ...value.data, __old: value };
  },
  (err: any) => {
    return Promise.reject(err);
  }
);

instance.interceptors.request.use((value) => {
  // if (value.headers['Content-Type'].includes('application/x-www-form-urlencoded')) {
  //   value.data = JsonToUrlParams(value.data)
  // }
  return value;
});

export function setBaseURL(baseURL: string) {
  instance.defaults.baseURL = baseURL;
}

const reqwest = {
  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: { [ key: string ]: any },
    config?: AxiosRequestConfig
  ) {
    return instance.post<T, R>(url, data, config);
  },
  get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig) {
    return instance.get<T, R>(url, config);
  },
};

export default reqwest;
