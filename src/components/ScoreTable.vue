<template>
  <v-container>
    <v-subheader class="title">
      {{ name }} Score Board
      <v-spacer></v-spacer>
      <create-dialog :sample="sample" @createRequested="createItem" />
    </v-subheader>

    <v-divider></v-divider>

    <div v-if="!!extraInfo" class="font-weight-light">
      <v-row v-for="key in Object.keys(extraInfo)" :key="key">
        <v-col>{{ key }}: {{ extraInfo[key] }}</v-col>
      </v-row>
    </div>

    <v-divider></v-divider>

    <v-card>
      <v-data-table
        dense
        class="my-2"
        :footer-props="pagenationOption"
        :items="scores"
        :headers="headers.concat([{text: '更新/削除', value: 'actions', sortable: false}])"
      >
        <template v-slot:top></template>
        <template v-slot:item.actions="{ item }">
          <delete-dialog @deleteRequested="deleteItem(item)" />
          <update-dialog :sample="sample" :data="item" @updateRequested="updateItem" />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import DB, { ResponseTypeSample } from '@/lib/DB';
import type { DBEntry } from '@/lib/DB';
import DeleteDialog from './DeleteDialog.vue';
import CreateDialog from './CreateDialog.vue';
import UpdateDialog from './UpdateDialog.vue';

interface ScoreHeader {
  text: string;
  value: string;
};

export type ScoreHeaders = ScoreHeader[];

@Component({components: {DeleteDialog, CreateDialog, UpdateDialog}})
export default class ScoreTable<Key extends DBEntry, Value extends DBEntry, Marker extends DBEntry, ScoreEntry extends Key & Value> extends Vue {
  @Prop()
  name!: string;

  @Prop()
  dbname!: string;

  @Prop()
  sample!: ResponseTypeSample;

  @Prop()
  scores!: ScoreEntry;

  @Prop()
  headers!: ScoreHeaders;

  @Prop({default: null})
  extraInfo?: {[index: string]: unknown} | null;

  private pagenationOption = {'items-per-page-options': [10, 30, 50, -1]};
  private deleteDialog: boolean = false;
  private createDialog: boolean = false;

  private db: DB<Key, Value, Marker> | null = null;

  private items: [Key, Value,  Marker][] = [];

  async mounted() {
    try {
      this.db = new DB<Key, Value, Marker>(this.dbname, this.sample);
      this.items = await this.db.getAll();
      this.$emit("updated", this.items);
    } catch (e) {
      console.error(e);
    }
  }

  async createItem(item: Key & Value) {
    await this.db!.register(item);
    this.items = await this.db!.getAll();
    this.$emit("updated", this.items);
  }

  async updateItem(item: Key & Value) {
    let keyObj: any = {};
    let valueObj: any = {};
    for(let key in this.sample.key) {
      keyObj[key] = item[key];
    }

    for(let key in this.sample.value) {
      valueObj[key] = item[key];
    }
    await this.db!.edit(keyObj, valueObj);
    this.items = await this.db!.getAll();
    this.$emit("updated", this.items);
  }

  async deleteItem(item: ScoreEntry) {
    let obj: any = {};
    for(let key in this.sample.key) {
      obj[key] = item[key]
    }
    await this.db!.delete(obj);
    this.items = await this.db!.getAll();
    this.$emit("updated", this.items);
  }
}
</script>
