import Taro from '@tarojs/taro';
import App from './app';

// H5 启动入口
Taro.initPxTransform({
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
});

const app = new App();
Taro._setApp(app);
