# 模拟小程序Page

<h3>模拟小程序请求之token刷新机制</h3>
``` bash
示例：
myApp({
  subscribers: [],
  onAccessTokenRequst: function() {
    // 订阅事件
    this.subscribers.forEach((callback) => {
      callback();
    });
    // 重置事件
    this.subscribers = [];
  },
  addSubscriber: function(callback) {
    // 发布事件
    this.subscribers.push(callback)
  },
  isRefreshing: true,
  // 发送请求加载数据
  request: function(options) {
    var _this = this;
    return new Promise((resolve, reject) => {
    // 模拟网络1s请求
    let timer = setTimeout(() => {
      console.log('resolve(data) => ', options)
      resolve(options);
      if (timer) clearTimeout(timer);
    }, 1000);
    }).then((response) => {
    // 检查状态 401 登陆失效
    if (response.data === 401) {
      if (this.isRefreshing) {
        // 防止多次请求token
        this.refreshTokenRequst();
      }
      // 标记为false 防止重复获取token
      this.isRefreshing = false;
      // 使用new promise重新包装一层
      var retryRequest = new Promise((resolve, reject) => {
        this.addSubscriber(() => {
          resolve(_this.request({
            data: 200, 
            token: sessionStorage.getItem('token')
          }))
        })
      }).catch((error) => {
        // 向外抛出错误异常
        return Promise.reject(error);
      });
        return retryRequest;
      } else {
        return response;
      }
    }).catch((error) => {
      // 向外抛出错误异常
      return Promise.reject(error);
    });
  },
  // 刷新token
  refreshTokenRequst: function () {
    console.log('refreshTokenRequst => 刷新token')
    // 模拟2s请求token
    let timer = setTimeout(() => {
      console.log('token => 获取到token')
      // 设置token
      this.storage.set('token', (+this.storage.get('token')) + 1);
      // 释放请求
      this.onAccessTokenRequst();
      this.isRefreshing = true;
      if (timer) clearTimeout(timer);
    }, 2000)
  },
  // 类似axios spread
  spread: function(cb) {
    return function (args) {
      cb.call(null, ...args)
    } 
  },
  // 处理前端并发请求
  all: function(args) {
    return Promise.all(args);
  },
  // 设置缓存
  storage: {
    set: function(key, value) {
      sessionStorage.setItem(key, value)
    },
    get: function(key) {
      return sessionStorage.getItem(key)
    },
    clear: function() {
      sessionStorage.clear();
    }
  },
  onLoad() {
    // 判断是否存在token
    if (this.storage.get('token')) {
      console.log('token => 存在');
      this.initLoading();
    } else {
      console.log('token => 不存在');
      // this.storage.clear();
      new Promise((resolve, reject) => {
        console.log('token => 开始获取token');  
        setTimeout(() => {
          this.storage.set('token', 1);
          resolve();
        }, 1000)
      }).then(() => {
        this.initLoading(); 
      });
    }
  },
  onReady() {
    console.log('onReady')
  },
  initLoading() {
        // 网络请求
    var data1 = this.request({ 
      data: 401,
      token: this.storage.get('token')
    })
    var data2 = this.request({ 
      data: 401,
      token: this.storage.get('token')
    })
    this.all([data1, data2]).then(this.spread((a, b) => {
      console.log('a => ', a);
      console.log('b => ', b);
    })).catch(err => {
      console.log('catch => ', err)
    })  
  }
})
```

<h3>表单用法说明</h3>

``` bash
用法一、
myApp.validate({
  form: form,  // 表单对象  
  rules: {},    // 校验规则集合
  messages: {}, // 错误消息集合
  errorHandler: function(errors) {
    // 错误规则集合
  },
  submitHandler: function(forms, result, validate) {
  	//校验通过回调函数
  }
})

用法二、
https://github.com/skyvow/wx-extend/blob/master/docs/components/validate.md

let validate = myApp.validate({
  form: form,  // 表单对象  
  rules: {},    // 校验规则集合
  messages: {}, // 错误消息集合
})

//验证所有字段的规则，返回验证是否通过。 retrun true/false
validate.checkForm()

//返回验证是否通过 return true/false
validate.valid()

//返回错误信息的个数 return number
validate.size = ()

// 返回错误消息集合
validate.validationErrors() 

```

<h3>第一步：引入文件</h3>

``` bash
在 app.js 中引入
const { myApps } = require('./static/libs/myApp/myApp.js');

```

<h3>第二步：全局注册表单校验</h3>

``` bash

function checkPhone(value, param) {
  var length = value.length;
  var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  return this.optional(value) || (length == 11 && mobile.test(value));
}
//同时验证手机号码和固话
function checkTel(value, param) {
  var length = value.length;
  var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  return this.optional(value) || mobile.test(value);
}
//获取用户信息
// 联系电话(手机/电话皆可)验证 
myApps.validator.addMethod("mobile", checkPhone, "请填写正确的电话号码");
myApps.validator.addMethod("mobPhone", checkTel, "请填写正确的电话号码");

// 联系电话(手机/电话皆可)验证 
myApps.validator.addMethod("phone", checkPhone, "请填写正确的电话号码");

```

<h3>第三步：页面中使用</h3>

<h4>html代码</h4>

``` bash

<form class="" id="addAddress" bindsubmit="formSubmit">
  <view class="" id="">
    <view class="white p-l-32 p-r-32">
      <input type="text" class="form-input" id="trueName" name="trueName" placeholder="请输入收货人姓名" />
    </view>

    <view class="p-l-32 p-r-32">
      <button formType="submit" type="warn" class="m-b-25 submit">保存</button>
    </view>
  </view>
</form>

```


<h4>js代码</h4>

``` bash

const myApp = require('./myApp.js');

Page({
  formSubmit: function (form) {
    let _this = this;
    myApp.validate({
      form: form,
      rules: {
        'trueName': {
          required: true,
        }
      },
      messages: {
        'trueName': {
          required: '请输入姓名'
        }
      },
      submitHandler: function (forms, result, validate) {
        console.log(forms,'forms') 
      }
    });
  }
})

```