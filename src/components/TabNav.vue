<template>
  <div class="container_tab">
    <ul class="tab_nav_box">
      <li
        v-for="(item, index) in $store.getters.tabs"
        :key="item.path"
        :class="{ active: $route.path === item.path }"
      >
        <router-link :to="item.path">{{ item.title }}</router-link>
        <el-icon v-if="index !== 0">
          <CloseBold @click="onCloseTabIndex(index)" />
        </el-icon>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "TabNav",
  methods: {
    onCloseTabIndex(index) {
      this.$store.commit("deleteTabByIndex", index);
      const tabs = this.$store.getters.tabs;
      if (tabs.length > 0) {
        const path = tabs[tabs.length - 1].path;
        this.$router.push(path);
      } else {
        this.$router.push(this.$store.getters.firstMenuPath || "/garage/spaceManage");
      }
    }
  }
};
</script>

<style scoped>
.container_tab {
  padding: 10px 14px 8px;
  border-bottom: 1px solid rgba(89, 141, 255, 0.24);
  background: rgba(11, 21, 54, 0.58);
}

.tab_nav_box {
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
}

.tab_nav_box li {
  min-height: 30px;
  line-height: 30px;
  display: flex;
  align-items: center;
  margin-right: 8px;
  border: 1px solid rgba(89, 141, 255, 0.28);
  border-radius: 8px;
  background: rgba(20, 35, 84, 0.84);
  color: #9ab8e8;
  transition: all 0.2s ease;
}

.tab_nav_box li:hover {
  border-color: rgba(89, 141, 255, 0.45);
  color: #d8e8ff;
}

.tab_nav_box li a {
  padding: 0 10px;
  display: inline-block;
}

.tab_nav_box li:nth-child(n + 2) a {
  padding-right: 14px;
}

.tab_nav_box li.active {
  background: linear-gradient(180deg, #2e87f6, #2060c9);
  border-color: rgba(120, 169, 255, 0.6);
  color: #ffffff;
}

.tab_nav_box li.active a {
  color: #ffffff;
}

.tab_nav_box li :deep(.el-icon) {
  margin-right: 8px;
  cursor: pointer;
  color: inherit;
}
</style>
