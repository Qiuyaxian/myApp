# myApp

<h1>小程序表单校验</h1>

<h1>说明</h1>

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

<form class="" id="addAddress" bindsubmit='formSubmit'>
  <view class='' id="">
    <view class='white p-l-32 p-r-32'>
      <input type="text" class="form-input" id="trueName" name="trueName" placeholder="请输入收货人姓名" />
    </view>

    <view class='p-l-32 p-r-32'>
      <button formType="submit" type='warn' class='m-b-25 submit'>保存</button>
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