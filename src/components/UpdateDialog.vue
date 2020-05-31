<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-icon @click="copy" v-on="on">mdi-pencil</v-icon>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">スコアの更新</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row v-for="[key, value, disabled] in kvPairs" :key="key">
            <v-col>
              <v-text-field
                :label="key"
                v-model="tempData[key]"
                v-if="value === 'string'"
                :disabled="disabled"
                required
              ></v-text-field>
              <v-select
                :label="key"
                v-model="tempData[key]"
                v-if="value === 'boolean'"
                :disabled="disabled"
                required
              ></v-select>
              <v-text-field
                :label="key"
                v-model="tempData[key]"
                type="number"
                v-if="value === 'number'"
                :disabled="disabled"
                required
              ></v-text-field>
              <v-date-picker-date-table
                :label="key"
                v-model="tempData[key]"
                v-if="value === 'date'"
                :disabled="disabled"
                required
              ></v-date-picker-date-table>
            </v-col>
          </v-row>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">キャンセル</v-btn>
        <v-btn color="blue darken-1" text @click="dialog = false, updateRequest()">登録</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { ResponseTypeSample, DBEntry, ResponseTypeKey } from "@/lib/DB";

@Component
export default class UpdateDialog<
  Key extends DBEntry,
  Value extends DBEntry
> extends Vue {
  @Prop()
  sample!: ResponseTypeSample;

  @Prop()
  private data!: Key & Value;

  private tempData: Key & Value = this.copy();

  private dialog: boolean = false;

  copy() {
    return (this.tempData = Object.assign({}, this.data));
  }

  get kvPairs(): [string, ResponseTypeKey, boolean][] {
    const ret: [string, ResponseTypeKey, boolean][] = [];
    for (let key in this.sample.key) {
      ret.push([key, this.sample.key[key], true]);
    }

    for (let key in this.sample.value) {
      ret.push([key, this.sample.value[key], false]);
    }

    return ret;
  }

  updateRequest() {
    this.$emit("updateRequested", this.tempData);
  }
}
</script>
