<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/tou2.png" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button @click="resetForm('loginFormRef')" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      /* 这是登录表单数据绑定的对象 */
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      /* 这是表单的验证对象 */
      loginRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /* 重置表单的方法 */
    resetForm (formName) {
      this.$refs[formName].resetFields()
      // 重置后把用户名和密码干掉
      this.loginForm.username = ''
      this.loginForm.password = ''
    },
    /* 点击登录的时候也校验一次 valid=true则校验通过，发起登录请求 */
    login () {
      this.$refs.loginFormRef.validate((valid) => {
        if (valid) {
          // 发起登录请求 接收返回值
          this.$http.post('login', this.loginForm).then(res => {
            if (res.data.meta.status === 200) {
              this.$notify({
                title: '登录成功',
                message: res.data.meta.msg,
                type: 'success'
              })
              // 1.将登录成功之后的 token，保存到客户端的sessionStorage中
              //  1.1项目中出了登录之外的其他API接口，必须在登录之后才能访问
              //  1.2 token 只应在当前网站打开期间生效，所以将token保存在sessionStorage中
              window.sessionStorage.setItem('token', res.data.data.token)
              // 2.通过编程式导航跳转到后台主页，路由地址是/home
              this.$router.push('/home')
            } else {
              this.$notify.error({
                title: '登录失败',
                message: res.data.meta.msg
              })
            }
          })
        }
      })
    }
  },
  created () {
    // 按下回车执行登录按钮点击事件
    var _self = this
    document.onkeydown = function (e) {
      var key = window.event.keyCode
      if (key === 13) {
        _self.login()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}

.login_container {
  background-color: #a9eabe;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}

.avatar_box{
  height: 130px;
  width: 130px;
  border: 1px solid #ecebeb;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: #ffffff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
</style>
