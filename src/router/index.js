import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import Layout from "@/views/layout/Layout.vue";
import Login from "@/views/Login.vue";
import { getSessionStorage } from "@/utils/common.js";
import { ROLE_ADMIN, ROLE_USER } from "@/api/dbConfig.js";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/",
    name: "layout",
    component: Layout,
    redirect: "/garage/spaceManage",
    children: [
      {
        path: "/garage/spaceManage",
        name: "spaceManage",
        meta: { roles: [ROLE_ADMIN, ROLE_USER] },
        component: () => import("@/views/garage/SpaceManage.vue")
      },
      {
        path: "/garage/reservationManage",
        name: "reservationManage",
        meta: { roles: [ROLE_ADMIN, ROLE_USER] },
        component: () => import("@/views/garage/ReservationManage.vue")
      },
      {
        path: "/garage/mySpace",
        name: "mySpace",
        meta: { roles: [ROLE_USER] },
        component: () => import("@/views/garage/MySpace.vue")
      },
      {
        path: "/garage/driverProfile",
        name: "driverProfile",
        meta: { roles: [ROLE_ADMIN, ROLE_USER] },
        component: () => import("@/views/garage/DriverProfile.vue")
      },
      {
        path: "/garage/vehicleManage",
        name: "vehicleManage",
        meta: { roles: [ROLE_ADMIN, ROLE_USER] },
        component: () => import("@/views/garage/VehicleManage.vue")
      },
      {
        path: "/garage/parkingRecord",
        name: "parkingRecord",
        meta: { roles: [ROLE_USER] },
        component: () => import("@/views/garage/ParkingRecord.vue")
      },
      {
        path: "/garage/profileCenter",
        name: "profileCenter",
        meta: { roles: [ROLE_USER] },
        component: () => import("@/views/garage/ProfileCenter.vue")
      },
      {
        path: "/garage/realtimeMonitor",
        name: "realtimeMonitor",
        meta: { roles: [ROLE_ADMIN] },
        component: () => import("@/views/garage/RealtimeMonitor.vue")
      }
    ]
  },
  {
    path: "/:catchAll(.*)",
    name: "notFound",
    component: () => import("@/views/error/404.vue")
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

function resolveRole() {
  const user = getSessionStorage("user");
  return (user && user.role) || ROLE_USER;
}

function resolveFirstMenuPath() {
  return store.getters.firstMenuPath || "/garage/spaceManage";
}

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("token");

  if (to.path !== "/login" && (!token || token === "")) {
    next("/login");
    return;
  }

  if (to.path === "/login" && token) {
    next(resolveFirstMenuPath());
    return;
  }

  if (to.meta && Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
    const role = resolveRole();
    if (!to.meta.roles.includes(role)) {
      next(resolveFirstMenuPath());
      return;
    }
  }

  const menuName = store.getters.getMenuNameByUrl(to.path);
  if (menuName) {
    store.commit("addTab", {
      title: menuName,
      path: to.path
    });
  }
  next();
});

export default router;
