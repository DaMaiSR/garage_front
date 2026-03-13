<template>
  <el-container class="layout-shell">
    <Aside />
    <el-container direction="vertical" class="layout-main">
      <HeaderCom />
      <TabNav />
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Aside from "@/components/Aside.vue";
import HeaderCom from "@/components/Header.vue";
import TabNav from "@/components/TabNav.vue";

export default {
  name: "LayoutView",
  components: {
    Aside,
    HeaderCom,
    TabNav
  }
};
</script>

<style>
.layout-shell {
  min-height: 100%;
  padding: 12px;
  gap: 12px;
}

.layout-main {
  border: 1px solid rgba(89, 141, 255, 0.28);
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(13, 26, 66, 0.84), rgba(9, 18, 49, 0.9));
}

@media (max-width: 1024px) {
  .layout-shell {
    padding: 8px;
    gap: 8px;
  }
}
</style>
