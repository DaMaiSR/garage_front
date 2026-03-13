<template>
  <div class="login-bg">
    <div class="login-card">
      <h2 class="title">车辆管理系统</h2>
      <el-form :model="loginForm" label-position="top" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-button type="primary" class="full" @click="submitLogin">登录</el-button>
      </el-form>

      <div class="tips">
        <span>体验账号：admin/123456 或 user1/123456</span>
      </div>

      <div class="actions">
        <span>没有账号？</span>
        <el-button type="primary" link @click="openRegister">立即注册</el-button>
      </div>
    </div>

    <el-dialog
      v-model="registerDialogVisible"
      title="用户注册"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form :model="registerForm" label-position="top" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username" placeholder="至少3个字符" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="registerForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="显示名称">
          <el-input v-model="registerForm.displayName" placeholder="选填" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="registerForm.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="证件号">
          <el-input v-model="registerForm.licenseNo" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRegister">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { login, register } from "@/api/userApi.js";
import { setSessionStorage } from "@/utils/common.js";
import { getMenusByRole, ROLE_USER } from "@/api/dbConfig.js";

export default {
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      },
      registerDialogVisible: false,
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        phone: "",
        licenseNo: ""
      }
    };
  },
  methods: {
    resolveFirstPath(menuList) {
      if (!Array.isArray(menuList) || menuList.length === 0) {
        return "/garage/spaceManage";
      }
      for (const menu of menuList) {
        if (!menu || !Array.isArray(menu.children)) {
          continue;
        }
        const child = menu.children.find((item) => item && item.path);
        if (child) {
          return child.path;
        }
      }
      return "/garage/spaceManage";
    },
    goNext(menuList) {
      this.$store.commit("addMenus", menuList);
      this.$store.commit("clearTab", []);
      this.$router.push(this.resolveFirstPath(menuList));
    },
    submitLogin() {
      login(this.loginForm)
        .then((res) => {
          if (!res || !res.flag) {
            this.$message.error((res && res.message) || "登录失败");
            return;
          }

          const token = res.message || `token-${Date.now()}`;
          const payload = res.data || {};
          const backendUser = payload.user || payload;
          const user =
            (backendUser && backendUser.username && {
              ...backendUser,
              role: backendUser.role || ROLE_USER
            }) || {
              username: this.loginForm.username,
              role: ROLE_USER
            };
          const menuList =
            (Array.isArray(payload.menuList) && payload.menuList.length > 0
              ? payload.menuList
              : Array.isArray(user.menuList) && user.menuList.length > 0
                ? user.menuList
                : getMenusByRole(user.role));

          sessionStorage.setItem("token", token);
          setSessionStorage("user", user);
          this.goNext(menuList);
        })
        .catch(() => {
          this.$message.error("登录失败");
        });
    },
    openRegister() {
      this.registerDialogVisible = true;
      this.registerForm.username = "";
      this.registerForm.password = "";
      this.registerForm.confirmPassword = "";
      this.registerForm.displayName = "";
      this.registerForm.phone = "";
      this.registerForm.licenseNo = "";
    },
    submitRegister() {
      const payload = {
        username: (this.registerForm.username || "").trim(),
        password: (this.registerForm.password || "").trim(),
        displayName: (this.registerForm.displayName || "").trim(),
        phone: (this.registerForm.phone || "").trim(),
        licenseNo: (this.registerForm.licenseNo || "").trim()
      };

      if (!payload.username || payload.username.length < 3) {
        this.$message.warning("用户名至少3位");
        return;
      }
      if (!payload.password || payload.password.length < 6) {
        this.$message.warning("密码至少6位");
        return;
      }
      if (payload.password !== this.registerForm.confirmPassword) {
        this.$message.warning("两次输入密码不一致");
        return;
      }

      register(payload)
        .then((res) => {
          if (res && res.flag) {
            this.$message.success(res.message || "注册成功");
            this.registerDialogVisible = false;
            this.loginForm.username = payload.username;
            this.loginForm.password = payload.password;
          } else {
            this.$message.error((res && res.message) || "注册失败");
          }
        })
        .catch(() => {
          this.$message.error("注册失败");
        });
    }
  }
};
</script>

<style scoped>
.login-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    radial-gradient(circle at 14% 14%, rgba(66, 124, 255, 0.22), transparent 40%),
    radial-gradient(circle at 88% 2%, rgba(73, 176, 255, 0.18), transparent 40%),
    linear-gradient(180deg, #08102d 0%, #060b1c 100%);
}

.login-card {
  width: 420px;
  background: linear-gradient(180deg, rgba(18, 33, 82, 0.96), rgba(11, 21, 54, 0.96));
  border-radius: 14px;
  border: 1px solid rgba(89, 141, 255, 0.32);
  padding: 28px;
  box-shadow: 0 24px 42px rgba(2, 8, 25, 0.42);
}

.title {
  margin-bottom: 20px;
  color: #deebff;
  letter-spacing: 0.8px;
}

.full {
  width: 100%;
  margin-top: 6px;
}

.tips {
  margin-top: 14px;
  color: #8ea7d8;
  font-size: 12px;
}

.actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  color: #9eb8e8;
}

.login-bg :deep(.el-form-item__label) {
  color: #a8c2ee;
}
</style>
