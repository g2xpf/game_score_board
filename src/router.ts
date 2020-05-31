import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/arcaea",
      name: "arcaea-score-board",
      component: () => import("./views/Arcaea.vue"),
    },
    {
      path: "/chunithm",
      name: "chunithm-score-board",
      component: () => import("./views/Chunithm.vue"),
    },
  ],
});

router.replace({ name: "home" });

export default router;
