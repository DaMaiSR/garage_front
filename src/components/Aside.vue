<template>
  <el-aside id="asideNav" width="220px">
    <div class="logo-name">
      <p>车辆管理系统</p>
    </div>

    <el-menu
      active-text-color="#ffd04b"
      background-color="#1f6eb3"
      :default-active="$route.path"
      :router="true"
      unique-opened
      text-color="#fff"
    >
      <template v-for="menu in $store.getters.menus" :key="menu.title">
        <el-sub-menu :index="menu.menusIndex">
          <template #title>
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <template v-for="child in menu.children" :key="child.path">
            <el-menu-item :index="child.path">
              <el-icon><component :is="child.icon" /></el-icon>
              {{ child.title }}
            </el-menu-item>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </el-aside>
</template>

<style scoped>
#asideNav {
  display: flex;
  flex-direction: column;
}

#asideNav .logo-name {
  width: 100%;
  height: 90px;
  background-color: #1f6eb3;
  display: flex;
  align-items: center;
  justify-content: center;
}

#asideNav .logo-name p {
  font-weight: 700;
  font-size: 22px;
  color: #fff;
}

#asideNav .el-menu {
  flex: 1;
  border-right: none;
}
</style>
