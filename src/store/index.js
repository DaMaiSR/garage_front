import { createStore } from "vuex";
import { getSessionStorage, setSessionStorage } from "@/utils/common.js";
import { getMenusByRole, ROLE_USER } from "@/api/dbConfig.js";

function resolveInitialMenus() {
  const cachedMenus = getSessionStorage("menuList");
  if (Array.isArray(cachedMenus) && cachedMenus.length > 0) {
    return cachedMenus;
  }
  const user = getSessionStorage("user");
  return getMenusByRole((user && user.role) || ROLE_USER);
}

function getFirstPathFromMenus(menus) {
  if (!Array.isArray(menus) || menus.length === 0) {
    return "";
  }
  for (const menu of menus) {
    if (Array.isArray(menu.children) && menu.children.length > 0) {
      const firstChild = menu.children.find((item) => item && item.path);
      if (firstChild) {
        return firstChild.path;
      }
    }
  }
  return "";
}

export default createStore({
  state: {
    tabs: [],
    menus: resolveInitialMenus()
  },
  getters: {
    tabs(state) {
      return state.tabs;
    },
    menus(state) {
      return state.menus;
    },
    firstMenuPath(state) {
      return getFirstPathFromMenus(state.menus);
    },
    getMenuNameByUrl: (state) => (url) => {
      for (const menu of state.menus) {
        if (!menu || !Array.isArray(menu.children)) {
          continue;
        }
        for (const child of menu.children) {
          if (child.path === url) {
            return child.title;
          }
        }
      }
      return "";
    }
  },
  mutations: {
    addMenus(state, menuList) {
      state.menus = Array.isArray(menuList) ? menuList : [];
      setSessionStorage("menuList", state.menus);
    },
    clearMenus(state) {
      state.menus = [];
      setSessionStorage("menuList", []);
    },
    deleteTabByIndex(state, index) {
      state.tabs.splice(index, 1);
    },
    clearTab(state, tabList) {
      state.tabs = tabList || [];
    },
    addTab(state, payload) {
      const path = payload && payload.path;
      if (!path) {
        return;
      }
      const existed = state.tabs.some((item) => item.path === path);
      if (existed) {
        return;
      }
      if (state.tabs.length === 10) {
        state.tabs.splice(1, 1);
      }
      state.tabs.push({
        title: payload.title,
        path
      });
    }
  },
  actions: {},
  modules: {}
});
