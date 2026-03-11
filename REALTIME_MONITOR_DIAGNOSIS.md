# 实时监控页面问题诊断

## 问题现象
✗ 实时监控页面进不去  
✓ 其他页面（车位、车辆、档案、记录）都能正常访问

## 根本原因分析

### 代码检查结果
- [src/api/monitorApi.js](src/api/monitorApi.js) ✅ **正确** - 调用 `GET /garageMonitor/realtime`
- [src/views/garage/RealtimeMonitor.vue](src/views/garage/RealtimeMonitor.vue) ✅ **正确** - 正确处理API响应

### 问题定位
**后端API端点问题**

现象：其他API页面能进去，但监控页面不行  
原因：**后端 `/garageMonitor/realtime` 端点可能：**
1. ❌ 还没实现
2. ❌ 实现了但返回的数据结构不符合前端期望
3. ❌ 返回了错误的HTTP状态码或flag值

---

## 🔍 自助诊断步骤

### 步骤1：查看浏览器错误信息
1. 打开浏览器DevTools (`F12`)
2. 点击 **Network** 标签
3. 重新进入实时监控页面
4. 找到 `/garageMonitor/realtime` 请求

**检查内容：**
- ✓ 请求状态码是否为 200
- ✓ 响应内容是什么（如下图标记处）

![Network诊断位置](如果状态码不是200或响应为空，说明后端端点未实现或出错)

### 步骤2：到浏览器Console检查错误
点击 **Console** 标签，查看是否有红色错误信息：
```
❌ 如果显示：ERR_NAME_NOT_RESOLVED 或 404 →  后端端点不存在
❌ 如果显示：ERR_NETWORK_CHANGED → 后端服务停止
```

### 步骤3：手动测试API（PowerShell）
```powershell
# 测试后端服务是否运行
curl -Uri "http://localhost:9999/garage/garageMonitor/realtime" `
     -Headers @{"token"="test-token-123"} | ConvertFrom-Json | ConvertTo-Json
```

**预期响应格式：**
```json
{
  "flag": true,
  "data": {
    "overview": {
      "totalSpaceCount": 8,
      "freeSpaceCount": 3,
      "occupiedSpaceCount": 2,
      "maintenanceSpaceCount": 1,
      "disabledSpaceCount": 1,
      "activeParkingCount": 2,
      "inTodayCount": 5,
      "outTodayCount": 3
    },
    "activeRecords": [
      {
        "plateNo": "沪A12345",
        "spaceNo": "A-001",
        "inTime": "2026-03-09 10:30:00",
        "durationMinutes": 45,
        "remark": ""
      }
    ],
    "spaceRows": [
      {
        "areaName": "A区",
        "floorNo": "B1",
        "spaceNo": "A-001",
        "status": "1",
        "currentPlateNo": "沪A12345",
        "remark": ""
      }
    ],
    "serverTime": "2026-03-09 11:15:30"
  }
}
```

---

## 🔧 解决方案

### 情况1：后端没实现 `/garageMonitor/realtime` 端点

**临时修复** - 在前端添加Mock数据（开发用，仅用于测试UI）：

编辑 [src/api/monitorApi.js](src/api/monitorApi.js)：
```javascript
import http from "@/request/request.js";

function getRealtimeMonitorData() {
  return http.get("/garageMonitor/realtime")
    .catch(() => {
      // 临时Mock数据，仅用于开发调试
      return {
        flag: true,
        data: {
          overview: {
            totalSpaceCount: 8,
            freeSpaceCount: 3,
            occupiedSpaceCount: 2,
            maintenanceSpaceCount: 1,
            disabledSpaceCount: 1,
            activeParkingCount: 2,
            inTodayCount: 5,
            outTodayCount: 3
          },
          activeRecords: [
            {
              plateNo: "沪A12345",
              spaceNo: "A-001",
              inTime: "2026-03-09 10:30:00",
              durationMinutes: 45,
              remark: ""
            }
          ],
          spaceRows: [
            {
              areaName: "A区",
              floorNo: "B1",
              spaceNo: "A-001",
              status: "1",
              currentPlateNo: "沪A12345",
              remark: ""
            }
          ],
          serverTime: new Date().toLocaleString('zh-CN')
        }
      };
    });
}

export { getRealtimeMonitorData };
```

### 情况2：后端已实现但某些字段缺失

检查后端返回的具体数据，与上述预期格式对比。主要检查这些字段是否存在：
- `flag` - 必须为 `true`
- `data.overview.*` - 统计数据
- `data.activeRecords` - 当前在场车辆记录
- `data.spaceRows` - 车位占用情况
- `data.serverTime` - 服务器时间

### 情况3：后端服务未启动

确保后端Java应用已启动，监听端口 9999：
```powershell
# Windows检查端口占用
netstat -ano | findstr "9999"

# 如果有进程，记下PID后查看
tasklist | findstr "PID"
```

---

## ✅ 完整修复清单

- [ ] 打开浏览器F12查看Network中的 `/garageMonitor/realtime` 请求状态
- [ ] 检查Console是否有错误信息
- [ ] 用PowerShell手动测试API返回内容
- [ ] 确认后端实现了 `/garageMonitor/realtime` 端点
- [ ] 确认返回数据包含 `flag` 和 `data` 字段
- [ ] 如果后端未实现，先用上述Mock方案临时让页面可用
- [ ] 后端实现完成后，移除Mock代码

---

**快速排查：请告诉我以下信息，我能更快帮你解决：**
1. Network中 `/garageMonitor/realtime` 请求的状态码是多少？
2. 响应体是空的吗？还是有返回但格式不对？
3. Console有什么错误信息吗？(复制粘贴完整的红色错误)
