<template>
  <v-dialog v-model="deleteDialog" max-width="260">
    <template v-slot:activator="{ on }">
      <v-icon v-on="on">mdi-delete</v-icon>
    </template>
    <v-card>
      <v-card-title class="headline">確認</v-card-title>
      <v-card-text>本当に削除しますか？</v-card-text>
      <v-card-actions>
        <v-btn
          color="green darken-1"
          text
          @click="deleteDialog = false, $emit('deleteRequested')"
        >はい</v-btn>
        <v-btn color="red darken-1" text @click="deleteDialog = false, $emit('deleteCanceled')">いいえ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class DeleteDialog extends Vue {
  private deleteDialog: boolean = false;
}
</script>
