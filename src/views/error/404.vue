<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/garage/spaceManage')">返回首页</el-button>
  </div>
</template>

<style scoped>
.not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #d8e8ff;
  background:
    radial-gradient(circle at 14% 14%, rgba(66, 124, 255, 0.22), transparent 40%),
    radial-gradient(circle at 88% 2%, rgba(73, 176, 255, 0.18), transparent 40%),
    linear-gradient(180deg, #08102d 0%, #060b1c 100%);
}

h1 {
  font-size: 64px;
  color: #78b3ff;
  letter-spacing: 2px;
}
</style>
