<template>
  <el-header class="header">
    <div class="left">
      <div class="title">车辆管理系统</div>
      <div class="subtitle">Garage Operation Console</div>
    </div>
    <div class="right">
      <span class="role">{{ roleLabel }}</span>
      <span class="user">{{ userName }}</span>
      <el-button v-if="showProfile" type="primary" plain @click="goProfile">个人中心</el-button>
      <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
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
  border-bottom: 1px solid rgba(89, 141, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: linear-gradient(180deg, rgba(21, 38, 90, 0.9), rgba(14, 26, 64, 0.9));
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.left .title {
  font-size: 19px;
  font-weight: 700;
  color: #dcecff;
  letter-spacing: 0.8px;
}

.left .subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: #82a6de;
  letter-spacing: 0.3px;
}

.role {
  display: inline-block;
  background-color: rgba(53, 119, 231, 0.24);
  color: #beddff;
  border: 1px solid rgba(89, 141, 255, 0.38);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
}

.user {
  color: #d8e9ff;
  margin-right: 4px;
}
</style>
