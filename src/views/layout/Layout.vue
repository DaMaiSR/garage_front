<template>
  <el-container style="height: 100%">
    <Aside />
    <el-container direction="vertical">
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
* {
  margin: 0;
  padding: 0;
}

html,
body,
#app,
.el-container,
#asideNav,
ul.el-menu {
  height: 100%;
}

body {
  font-size: 14px;
  color: #333;
}
</style>

