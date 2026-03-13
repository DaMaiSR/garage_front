<template>
  <el-aside id="asideNav" width="220px">
    <div class="logo-name">
      <p>车辆管理系统</p>
    </div>

    <el-menu
      class="garage-menu"
      active-text-color="#dff0ff"
      background-color="transparent"
      :default-active="$route.path"
      :router="true"
      unique-opened
      text-color="#98b5e9"
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
  border: 1px solid rgba(89, 141, 255, 0.3);
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(13, 26, 66, 0.96), rgba(9, 18, 49, 0.96));
  box-shadow: 0 20px 40px rgba(2, 8, 25, 0.35);
}

#asideNav .logo-name {
  width: 100%;
  height: 90px;
  background: linear-gradient(180deg, rgba(36, 103, 214, 0.9), rgba(25, 79, 170, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(114, 166, 255, 0.38);
}

#asideNav .logo-name p {
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 1px;
  color: #e8f2ff;
}

#asideNav .el-menu {
  flex: 1;
  border-right: none;
  padding: 10px 8px;
}

#asideNav :deep(.el-menu-item),
#asideNav :deep(.el-sub-menu__title) {
  margin-bottom: 6px;
  border-radius: 8px;
  height: 42px;
  line-height: 42px;
  color: #9cb9ec;
}

#asideNav :deep(.el-menu-item:hover),
#asideNav :deep(.el-sub-menu__title:hover) {
  background-color: rgba(47, 108, 223, 0.28) !important;
  color: #e3efff !important;
}

#asideNav :deep(.el-menu-item.is-active) {
  background: linear-gradient(180deg, rgba(46, 135, 246, 0.95), rgba(32, 96, 201, 0.95)) !important;
  color: #ffffff !important;
}

#asideNav :deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  margin-bottom: 4px;
  padding-left: 44px !important;
}

#asideNav :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background-color: rgba(47, 108, 223, 0.22);
  color: #d8e8ff;
}
</style>
