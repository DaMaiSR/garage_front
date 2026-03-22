export const ROLE_ADMIN = "admin";
export const ROLE_USER = "user";

export const SPACE_STATUS_FREE = "0";
export const SPACE_STATUS_OCCUPIED = "1";
export const SPACE_STATUS_MAINTENANCE = "2";
export const SPACE_STATUS_DISABLED = "3";
export const SPACE_STATUS_RESERVED = "4";

export const PAGE_SIZE = 6;

export const adminMenus = [
  {
    menusIndex: "1",
    title: "车库管理",
    icon: "Van",
    children: [
      {
        title: "车位管理",
        path: "/garage/spaceManage",
        icon: "SetUp"
      },
      {
        title: "预约管理",
        path: "/garage/reservationManage",
        icon: "Calendar"
      },
      {
        title: "实时监控",
        path: "/garage/realtimeMonitor",
        icon: "Monitor"
      },
      {
        title: "车牌识别",
        path: "/garage/plateRecognition",
        icon: "Camera"
      }
    ]
  },
  {
    menusIndex: "2",
    title: "档案管理",
    icon: "User",
    children: [
      {
        title: "驾驶档案管理",
        path: "/garage/driverProfile",
        icon: "Tickets"
      },
      {
        title: "车辆信息管理",
        path: "/garage/vehicleManage",
        icon: "Management"
      }
    ]
  }
];

export const userMenus = [
  {
    menusIndex: "1",
    title: "车库服务",
    icon: "Van",
    children: [
      {
        title: "车位查询",
        path: "/garage/spaceManage",
        icon: "SetUp"
      },
      {
        title: "停车预约",
        path: "/garage/reservationManage",
        icon: "Calendar"
      },
      {
        title: "我的车位",
        path: "/garage/mySpace",
        icon: "House"
      },
      {
        title: "停车出库",
        path: "/garage/parkingRecord",
        icon: "List"
      }
    ]
  },
  {
    menusIndex: "2",
    title: "我的档案",
    icon: "User",
    children: [
      {
        title: "驾驶档案管理",
        path: "/garage/driverProfile",
        icon: "Tickets"
      },
      {
        title: "车辆信息管理",
        path: "/garage/vehicleManage",
        icon: "Management"
      },
      {
        title: "个人中心",
        path: "/garage/profileCenter",
        icon: "Avatar"
      }
    ]
  }
];

export function getMenusByRole(role) {
  if (role === ROLE_USER) {
    return JSON.parse(JSON.stringify(userMenus));
  }
  return JSON.parse(JSON.stringify(adminMenus));
}

export function padNumber(value) {
  return String(value).padStart(2, "0");
}

export function formatDateTime(dateObj) {
  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    return "";
  }
  const yyyy = dateObj.getFullYear();
  const mm = padNumber(dateObj.getMonth() + 1);
  const dd = padNumber(dateObj.getDate());
  const hh = padNumber(dateObj.getHours());
  const mi = padNumber(dateObj.getMinutes());
  const ss = padNumber(dateObj.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function nowDateTime() {
  return formatDateTime(new Date());
}

export function toDate(value) {
  if (!value) {
    return null;
  }
  const dateValue = new Date(value);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
}

export function diffMinutes(startTime, endTime) {
  const start = toDate(startTime);
  const end = toDate(endTime);
  if (!start || !end) {
    return "";
  }
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) {
    return "0";
  }
  return String(Math.ceil(diff / 60000));
}

export function calcFeeByMinutes(minutesText) {
  const minutes = Number(minutesText || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0";
  }
  return String(Math.ceil(minutes / 60) * 5);
}
