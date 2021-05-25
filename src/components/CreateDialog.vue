<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn fab small depressed>
        <v-icon v-on="on">mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">登録</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row v-for="[key, value] in kvPairs" :key="key">
            <template v-if="key === 'constant'">
              <v-col cols="10">
                <v-text-field
                  :label="key"
                  v-model="data[key]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-btn
                  @click="
                    onClickUpdateConstant(
                      data['name'],
                      data['difficulty']
                    ).then((v) => {
                      if (v) {
                        data[key] = v;
                      }
                    })
                  "
                  >取得</v-btn
                >
              </v-col>
            </template>

            <v-col v-else>
              <v-text-field
                :label="key"
                v-model="data[key]"
                v-if="value === 'string'"
                required
              ></v-text-field>
              <v-select
                :label="key"
                v-model="data[key]"
                v-if="value === 'boolean'"
                required
              ></v-select>
              <v-text-field
                :label="key"
                v-model="data[key]"
                type="number"
                v-if="value === 'number'"
                required
              ></v-text-field>
              <v-date-picker-date-table
                :label="key"
                v-model="data[key]"
                v-if="value === 'date'"
                required
              ></v-date-picker-date-table>
            </v-col>
          </v-row>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false"
          >キャンセル</v-btn
        >
        <v-btn
          color="blue darken-1"
          text
          @click="(dialog = false), createRequest()"
          >登録</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { ResponseTypeSample, DBEntry, ResponseTypeKey } from "@/lib/DB";

@Component
export default class CreateDialog<
  Key extends DBEntry,
  Value extends DBEntry
> extends Vue {
  @Prop()
  sample!: ResponseTypeSample;

  private data: Partial<Key & Value> = this.initData();

  @Prop()
  onConstantRequested!: (
    name: string,
    difficulty: number
  ) => Promise<number | undefined>;

  private dialog: boolean = false;

  get kvPairs(): [string, ResponseTypeKey][] {
    const ret: [string, ResponseTypeKey][] = [];
    for (let key in this.sample.key) {
      ret.push([key, this.sample.key[key]]);
    }

    for (let key in this.sample.value) {
      ret.push([key, this.sample.value[key]]);
    }

    return ret;
  }

  initData(): Partial<Key & Value> {
    const obj: any = {};

    for (let key in this.sample.key) {
      obj[key] = null;
    }

    for (let key in this.sample.value) {
      obj[key] = null;
    }

    return obj;
  }

  createRequest() {
    this.$emit("createRequested", this.data);
    this.data = this.initData();
  }

  async onClickUpdateConstant(
    name: string,
    difficulty: number
  ): Promise<number | undefined> {
    const constant = await this.onConstantRequested(name, difficulty);
    if (constant === undefined) {
      console.error(
        `failed to fetch constant: name: ${name}, difficulty: ${difficulty}`
      );
    }
    return constant;
  }
}
</script>
