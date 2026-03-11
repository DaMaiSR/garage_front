<template>
  <el-header class="header">
    <div class="left">车辆管理系统</div>
    <div class="right">
      <span class="role">{{ roleLabel }}</span>
      <span class="user">{{ userName }}</span>
      <el-button v-if="showProfile" type="primary" link @click="goProfile">个人中心</el-button>
      <el-button type="primary" link @click="handleLogout">退出登录</el-button>
    </div>
  </el-header>
</template>

<script>
import { getSessionStorage, removeSessionStorage } from "@/utils/common.js";
import { logout } from "@/api/userApi.js";

export default {
  name: "HeaderCom",
  computed: {
    userName() {
      const user = getSessionStorage("user");
      return user && user.username ? user.username : "访客";
    },
    roleLabel() {
      const user = getSessionStorage("user");
      return user && user.role === "admin" ? "管理员" : "用户";
    },
    showProfile() {
      const user = getSessionStorage("user");
      return user && user.role === "user";
    }
  },
  methods: {
    goProfile() {
      this.$router.push("/garage/profileCenter");
    },
    clearLoginState() {
      sessionStorage.removeItem("token");
      removeSessionStorage("user");
      removeSessionStorage("menuList");
      this.$store.commit("clearMenus");
      this.$store.commit("clearTab", []);
    },
    handleLogout() {
      logout()
        .finally(() => {
          this.clearLoginState();
          this.$router.push("/login");
        });
    }
  }
};
</script>

<style scoped>
.header {
  height: 60px;
  border-bottom: 1px solid #e8edf3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role {
  display: inline-block;
  background-color: #edf5ff;
  color: #2f6db8;
  border: 1px solid #caddf7;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
}

.user {
  color: #333;
}
</style>
