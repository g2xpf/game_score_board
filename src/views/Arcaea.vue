<template>
  <score-table
    name="Arcaea"
    :scores="scores"
    :headers="scoreHeaders"
    dbname="arcaea"
    :sample="responseTypeSample"
    @updated="onScoreUpdated"
    :onConstantRequested="onConstantRequested"
    :extraInfo="extraInfo"
  />
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import RawScoreTable, { ScoreHeaders } from "@/components/ScoreTable.vue";
import { mixins } from "vue-class-component";
import type { ResponseTypeSample } from "@/lib/DB";

enum Difficulty {
  Past,
  Present,
  Future,
  Beyond,
}

type DBKey = { name: string; difficulty: 0 | 1 | 2 | 3 };
type DBValue = { score: number; constant: number };
type DBMarker = { updated_at: Date };

interface ScoreEntry {
  name: string;
  difficulty: 0 | 1 | 2 | 3;
  difficultyName: string;
  rank: string;
  score: number;
  constant: number;
  potential: number;
  potentialFixed: string;
  updated_at: string;
}

interface ExtraInfo {
  Potential: number;
}

@Component
class ScoreTable extends mixins<
  RawScoreTable<DBKey, DBValue, DBMarker, ScoreEntry>
>(RawScoreTable) {}

@Component({ components: { ScoreTable } })
export default class Arcaea extends Vue {
  private scores: ScoreEntry[] = [];
  private extraInfo: ExtraInfo = { Potential: 0.0 };

  private domCache: Document | null = null;

  private scoreHeaders: ScoreHeaders = [
    { text: "曲名", value: "name" },
    { text: "難易度", value: "difficultyName" },
    { text: "ランク", value: "rank" },
    { text: "スコア", value: "score" },
    { text: "譜面定数", value: "constant" },
    { text: "ポテンシャル", value: "potentialFixed" },
    { text: "更新日時", value: "updated_at" },
  ];

  private responseTypeSample: ResponseTypeSample = {
    key: {
      name: "string",
      difficulty: "number",
    },
    value: {
      score: "number",
      constant: "number",
    },
    marker: {
      updated_at: "Date",
    },
  };

  private timeFmt(str: string) {
    for (let i = 0; i < 2 - str.length; ++i) {
      str = "0" + str;
    }
    return str;
  }

  private getRank(score: number): string {
    return score <= 8599999
      ? "D"
      : score <= 8899999
      ? "C"
      : score <= 9199999
      ? "B"
      : score <= 9499999
      ? "A"
      : score <= 9799999
      ? "AA"
      : score <= 9899999
      ? "EX"
      : score <= 9999999
      ? "EX+"
      : "PM";
  }

  private formatDate(date: Date): string {
    return (
      date.getFullYear() +
      "/" +
      (1 + date.getMonth()) +
      "/" +
      date.getDate() +
      " " +
      this.timeFmt("" + date.getHours()) +
      ":" +
      this.timeFmt("" + date.getMinutes()) +
      ":" +
      this.timeFmt("" + date.getSeconds())
    );
  }

  private getPotential(score: number, constant: number): number {
    return score <= 9800000
      ? Math.max(0, constant + (score - 9500000) / 300000)
      : score <= 10000000
      ? constant + 1.0 + (score - 9800000) / 200000
      : constant + 2.0;
  }

  private getPotentialBest(data: { potential: number }[]) {
    const potential =
      data
        .map((e) => e.potential)
        .sort((l, r) => {
          if (l > r) return -1;
          else if (l < r) return 1;
          else return 0;
        })
        .slice(0, 30)
        .reduce((acc, v) => acc + v) / Math.min(30, data.length);

    return Math.floor(potential * 100000) / 100000;
  }

  onScoreUpdated(data: [DBKey, DBValue, DBMarker][]) {
    this.scores = data.map(([key, value, marker]) => {
      const score = value.score;
      const date = marker.updated_at;
      const constant = value.constant;

      const rank = this.getRank(score);
      const potential = this.getPotential(score, constant);
      const potentialFixed = potential.toFixed(3);
      const updated_at = this.formatDate(date);
      const difficultyName = Difficulty[key.difficulty];
      return {
        ...key,
        ...value,
        ...marker,
        potential,
        potentialFixed,
        rank,
        updated_at,
        difficultyName,
      };
    });

    this.extraInfo.Potential = this.getPotentialBest(this.scores);
  }

  async onConstantRequested(name: string, difficulty: Difficulty) {
    if (this.domCache === null) {
      const response = await fetch(
        "https://wikiwiki.jp/arcaea/%E3%83%9D%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A3%E3%83%AB%E7%A0%94%E7%A9%B6%E6%89%80"
      );
      const text = await response.text();
      const parser = new DOMParser();
      const dom = parser.parseFromString(text, "text/html");
      if (!!text) {
        this.domCache = dom;
      }
    }
    if (this.domCache === null) return undefined;

    return Number(
      Array.from(this.domCache.getElementsByTagName("tr"))
        .map((v) => v.children)
        .filter((v) => {
          const tr = <HTMLTableRowElement>v[0].children[0];
          if (!tr) return undefined;
          return tr.title === name;
        })
        .map((v) => {
          const td = <HTMLTableDataCellElement>v[4];
          if (!td) return undefined;
          return td.innerText;
        })[difficulty]
    );
  }
}
</script>
