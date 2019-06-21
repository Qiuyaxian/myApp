import Validate from './validate.js';

var myApp = (function () {
  var data = {};
  function myApp () {
    //存储arguments
    var myApp = {};
    var args = arguments[0];
    //判断是否对象
    if (isObject(args)) {
      //返回内部对象，同时挂载数据在上面
      myApp = extend(new App(), args);
      if (myApp.onLoad && isFunction(myApp.onLoad)) myApp.onLoad.call(myApp);
      if (myApp.onReady && isFunction(myApp.onReady)) myApp.onReady.call(myApp);
    }
    /**
     * [App 基础函数]
     */
    function App () {
      //挂载数据
      this.data = extend({}, args.data);
      //设置数据
      this.setData = function (obj, callback) {
        if (obj && isObject(obj)) {
          this.data = extend(data, obj);
          if (callback && isFunction(callback)) callback();
        } else {

        }
      }
      //基础判断数据类型
      this.isFunction = isFunction;
      this.isArray = isArray;
      this.isObject = isObject;
      this.isString = isString;
      this.isNull = isNull;
      this.isNumber = isNumber;
      //扩展函数
      this.extend = extend;
      this.throwError = throwError;
    };
    /**
     * [isFunction 判断是否是函数]
     * @param  {Function} fn [description]
     * @return {Boolean}     [description]
     */
    function isFunction (fn) {
      return typeof (fn) == 'function' && Object.prototype.toString.call(fn) === '[object Function]';
    }
    /**
     * [isArray 判断是否是数组]
     * @param  {[type]}  array [description]
     * @return {Boolean}       [description]
     */
    function isArray (array) {
      return typeof (array) == 'object' && Object.prototype.toString.call(array) === '[object Array]';
    }
    /**
     * [isNumber 判断是否是数字]
     * @param  {[type]}  obj [description]
     * @return {Boolean}     [description]
     */
    function isNumber (obj) {
      return typeof (obj) == 'number' && Object.prototype.toString.call(obj) === '[object Number]';
    }
    /**
     * [isObject 判断是否是对象]
     * @param  {[type]}  obj [description]
     * @return {Boolean}     [description]
     */
    function isObject (obj) {
      return typeof (obj) == 'object' && Object.prototype.toString.call(obj) === '[object Object]';
    }
    /**
     * [isString 判断是否是字符串]
     * @param  {[type]}  str [description]
     * @return {Boolean}     [description]
     */
    function isString (str) {
      return typeof (str) == 'string' && Object.prototype.toString.call(str) === '[object String]';
    }
    /**
     * [isNull 判断是否是null]
     * @param  {[type]}  arg [description]
     * @return {Boolean}     [description]
     */
    function isNull (arg) {
      return typeof (arg) == 'object' && Object.prototype.toString.call(arg) === '[object Null]';
    }
    /**
     * [capture 捕获错误异常]
     * @param  {[type]} args [description]
     * @return {[type]}      [description]
     */
    function capture (args) {
      try {
        if (args && isFunction(args)) args();
      } catch (e) {
        throw new Error(e);
      }
    }
    /**
     * [throwError 抛出异常]
     * @param  {[type]} text [description]
     * @return {[type]}      [description]
     */
    function throwError (text) {
      if (text) throw new Error(text);
      else throw new Error('this is empty');
    }
    /**
     * [prop 合并函数]
     * @param  {[type]} obj [description]
     * @param  {[type]} fun [description]
     * @return {[type]}     [description]
     */
    function prop (obj, fun) {
      for (var p in obj) {
        obj.hasOwnProperty(p) && fun(p);
      }
    }
    //扩展函数
    function extend (des, src) {
      prop(src, function (p) {
        if (src[p]) des[p] = src[p];
      });

      return des;
    }
    return myApp;
  }
  return myApp;
})();

var myApps = myApp({
  /**
   * [debug debg调试模式]
   * @type {[type]}
   */
  debug: false,

  /**
   * [data 数据挂载]
   * @type {Object}
   */
  data: {
    userInfo: null,
    addValidatorMethod: {},
    initLoading: false,
    spread: null,
    lock: false,
    timer: null //定时器管理
  },
  /**
   * [onLoad 预加载]
   * @return {[type]} [description]
   */
  onLoad () {
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
  /**
   * [onReady 加载完成]
   * @return {[type]} [description]
   */
  onReady: function () {
    this.console('onReady')
  },
  subscribers: [],
  onAccessTokenRequst: function () {
    // 订阅事件
    this.subscribers.forEach((callback) => {
      callback();
    });
    // 重置事件列表
    this.subscribers = [];
  },
  addSubscriber: function (callback) {
    // 发布事件
    this.subscribers.push(callback)
  },
  isRefreshing: true,
  // 发送请求加载数据
  request: function (options) {
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
  spread: function (cb) {
    return function (args) {
      cb.call(null, ...args)
    }
  },
  // 处理前端并发请求
  all: function (args) {
    return Promise.all(args);
  },
  // 设置缓存
  storage: {
    set: function (key, value) {
      sessionStorage.setItem(key, value)
    },
    get: function (key) {
      return sessionStorage.getItem(key)
    },
    clear: function () {
      sessionStorage.clear();
    }
  },
  // 模拟加载
  initLoading () {
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
  },
  /**
   * [loading js调用加载API]
   * @param  {[type]} option [description]
   * @return {[type]}        [description]
   */

  /**
   * [console 控制台输出，用于调试]
   * @return {[type]} [description]
   */
  console: function () {
    if (this.debug) {
      console.log.apply(this, arguments);
    }
  },
  /**
   * [onError 全局错误输出处理]
   * @param  {[type]} args [description]
   * @return {[type]}      [description]
   */
  onError: function (args) {
    //全局捕获输出错误
    this.throwError(args);
  }
});

/**
 * [stringify 处理json]
 * @param  {[type]}   [description]
 * @return {[type]}   [description]
 */
myApps.extend(myApps, {
  /**
   * [stringify 转为字符串]
   * @param  {[type]} obj [description]
   * @return {[type]}     [description]
   */
  stringify: function (obj) {
    let result = null;
    try {
      result = JSON.stringify(obj);
    } catch (e) {
      throw new Error(e);
    }
    return result;
  },
  /**
   * [parse 转为对象]
   * @param  {[type]} str [description]
   * @return {[type]}     [description]
   */
  parse: function (str) {
    let result = null;
    try {
      result = JSON.parse(str)
    } catch (e) {
      throw new Error(e);
    }
    return result;
  },
  /**
   * [deepClone 深拷贝]
   * @param  {[type]} val [description]
   * @return {[type]}     [description]
   */
  copy (val) {
    return JSON.parse(JSON.stringify(val));
  }
});
/**
 * [validate 表单校验]
 * @param  {[type]}   [description]
 * @return {[type]}   [description]
 */
myApps.extend(myApps, {
  /**
   * [validate 表单校验方法]
   * @param  {[type]} option [description]
   * @return {[type]}        [description]
   */
  validate: function (option) {
    let _this = this,
      _validator = {},
      validatorMethod = _this.data.addValidatorMethod,
      opt = _this.extend({
        form: '',
        rules: {},
        messages: {},
        errorHandler: function (errorList) {
          if (errorList && _this.isArray(errorList) && errorList.length !== 0) {
            let error = _validate.errorList[0];
            _this.message({
              title: error.msg,
              mask: false
            });
          }
        },
        submitHandler: function () { }
      }, option);
    let _validate = new Validate(opt.rules, opt.messages);
    //添加信息
    for (let key in validatorMethod) {
      if (key && opt.rules[key] && validatorMethod[key].method) {
        _validate.addMethod(validatorMethod[key].name, function (value, param) {
          return validatorMethod[key].method.call(_validate, value, param);
        }, validatorMethod[key].message);
      }
    }
    _this.setData({
      validator: _validate
    });
    //返回结果
    if (opt.form == '') return;
    let _checkForm = _validate.checkForm(opt.form);
    //验证所有字段的规则，返回验证是否通过。 retrun true/false
    _validator.checkForm = function () {
      return _checkForm;
    };
    //返回验证是否通过 return true/false
    _validator.valid = function () {
      return _validate.valid();
    };
    //返回错误信息的个数 return number
    _validator.size = function () {
      return _validate.size();
    };
    //返回所有错误信息。return array
    _validator.validationErrors = function () {
      return _validate.validationErrors();
    };
    if (opt.submitHandler && _this.isFunction(opt.submitHandler)) {
      let result = _validate.validationErrors();
      //错误处理
      if (opt.errorHandler && this.isFunction(opt.errorHandler) && !_checkForm) {
        opt.errorHandler && opt.errorHandler(result);
      }
      if (_checkForm) {
        //参数 result结果集，_validate，表单opt.form
        opt.submitHandler && opt.submitHandler(opt.form, result, _validate);
      }
    } else {
      return _validator;
    }
  },
  /**
   * [validator 表单校验对象]
   * @type {Object}
   */
  validator: {
    //添加自定义验证方法。
    addMethod: function (name, method, message) {
      let validatorMethod = myApps.data.addValidatorMethod,
        _validator = {};
      if (name && message && method && myApps.isFunction(method)) {
        _validator['name'] = name;
        _validator['method'] = method;
        _validator['message'] = message;
        validatorMethod[name] = _validator;
        myApps.setData({
          addValidatorMethod: validatorMethod
        });
      }
    }
  }
});

module.exports = {
  myApps: myApps
}
