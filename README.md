# garage_front

车辆管理系统前端（Vue 3 + Vue Router + Vuex + Element Plus）。

## 1. 安装与启动
```bash
npm install
npm run serve
```

构建：
```bash
npm run build
```

默认后端地址：`http://localhost:9999/garage`

可通过环境变量覆盖：
- `VUE_APP_BASE_URL`

## 2. 角色与页面

### 普通用户
- 登录/注册
- 车位查询
- 停车预约（创建/取消）
- 我的车位
- 停车记录（入库/出库）
- 车辆信息管理
- 驾驶档案管理
- 个人中心

### 管理员
- 登录/注销
- 车位管理
- 预约管理（含预约转入库）
- 驾驶档案管理
- 车辆信息管理
- 实时监控（WebSocket + REST）

## 3. 默认账号
- 管理员：`admin / 123456`
- 用户：`user1 / 123456`

## 4. 联调说明
1. 先启动后端并完成数据库初始化/迁移。
2. 登录后前端自动加载后端返回菜单。
3. 实时监控页会优先走 WebSocket，失败时使用 REST 刷新兜底。

## 5. 扩展能力（答辩可讲）
- 已预留移动支付编排接口：
  - `POST /payment/createCheckoutOrder`
  - `GET /payment/queryCheckoutOrder`
  - `POST /payment/completeCheckout`
- 已预留车牌识别开放集成接口：
  - `POST /open/integration/plate/analyze`
  - `POST /open/integration/payment/mock/paid`
- 集成接口使用 `X-Integration-Key`，与用户 JWT 鉴权分离，便于后续接入硬件与第三方平台。
