<template>
  <v-app>
    <v-app-bar color="primary" clipped-left dark app>
      <v-app-bar-nav-icon @click="miniVariant = !miniVariant"></v-app-bar-nav-icon>
      <div class="title px-2">Score Board</div>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer absolute clipped :permanent="true" :mini-variant="miniVariant" app>
      <v-list nav>
        <v-list-item to="/" exact>
          <v-list-item-icon class="mr-6">
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Home</v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-for="(game, key) of gamesInfo"
          :key="key"
          :to="game.link"
          class="px-0 mx-0 my-2"
          active-class
        >
          <v-list-item-avatar>
            <v-img :src="game.logo"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>{{ game.name }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

interface GameInfo {
  name: string;
  link: string;
  logo: NodeModule;
}

@Component({})
export default class App extends Vue {
  private name: string = "App";
  private miniVariant: boolean = false;

  private gamesInfo: GameInfo[] = [
    {
      name: "Arcaea",
      link: "arcaea",
      logo: require("@/assets/arcaea-logo.png")
    },
    {
      name: "Chunithm",
      link: "chunithm",
      logo: require("@/assets/chunithm-logo.png")
    }
  ];
}
</script>
