<template>
  <score-table
    name="Chunithm"
    :scores="scores"
    :headers="scoreHeaders"
    dbname="chunithm"
    :sample="responseTypeSample"
    @updated="onScoreUpdated"
    :extraInfo="extraInfo"
    :onConstantRequested="onConstantRequested"
  />
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import RawScoreTable, { ScoreHeaders } from "@/components/ScoreTable.vue";
import { mixins } from "vue-class-component";
import type { ResponseTypeSample } from "@/lib/DB";

enum Difficulty {
  Basic,
  Advanced,
  Expert,
  Master,
}

type DBKey = { name: string; difficulty: 0 | 1 | 2 | 3 };
type DBValue = { score: number; constant: number };
type DBMarker = { updated_at: Date };

interface ExtraInfo {
  Rate: number;
}

interface ScoreEntry {
  name: string;
  difficulty: 0 | 1 | 2 | 3;
  difficultyName: string;
  rank: string;
  score: number;
  constant: number;
  rate: number;
  rateFixed: string;
  updated_at: string;
}

@Component
class ScoreTable extends mixins<
  RawScoreTable<DBKey, DBValue, DBMarker, ScoreEntry>
>(RawScoreTable) {}

@Component({ components: { ScoreTable } })
export default class Chunithm extends Vue {
  private scores: ScoreEntry[] = [];
  private rate: number = 0.0;

  private extraInfo: ExtraInfo = { Rate: 0.0 };

  private scoreHeaders: ScoreHeaders = [
    { text: "曲名", value: "name" },
    { text: "難易度", value: "difficultyName" },
    { text: "ランク", value: "rank" },
    { text: "スコア", value: "score" },
    { text: "譜面定数", value: "constant" },
    { text: "レート", value: "rateFixed" },
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

  private getRank(score: number): [string, string] {
    return score <= 499999
      ? ["D", "#0068B7"]
      : score <= 599999
      ? ["C", "#0068B7"]
      : score <= 699999
      ? ["B", "#0068B7"]
      : score <= 799999
      ? ["BB", "#0068B7"]
      : score <= 899999
      ? ["BBB", "#00A0E9"]
      : score <= 924999
      ? ["A", "#009E96"]
      : score <= 949999
      ? ["AA", "#009944"]
      : score <= 974999
      ? ["AAA", "#8FC31F"]
      : score <= 999999
      ? ["S", "#8FC31F"]
      : score <= 1004999
      ? ["SS", "#FFF100"]
      : score <= 1007499
      ? ["SS+", "#F39800"]
      : score <= 1010000
      ? ["SSS", "#E60012"]
      : ["?", "#000000"];
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

  private getRate(score: number, constant: number): number {
    const rate =
      score >= 1007500
        ? constant + 2.0
        : score >= 1005000
        ? constant + 1.5 + ((score - 1005000) * 10) / 50000
        : score >= 1000000
        ? constant + 1.0 + ((score - 1000000) * 5) / 50000
        : score >= 975000
        ? constant + 0.0 + ((score - 975000) * 2) / 50000
        : score >= 950000
        ? constant - 1.5 + ((score - 950000) * 3) / 50000
        : score >= 925000
        ? constant - 3.0 + ((score - 925000) * 3) / 50000
        : score >= 900000
        ? constant - 5.0 + ((score - 900000) * 4) / 50000
        : 0;
    return Math.floor(rate * 10000) / 10000;
  }

  private getRateBest(data: { rate: number }[]) {
    const scores30 = data
      .map((e) => e.rate)
      .sort((l: number, r: number) => {
        if (l > r) return -1;
        else if (l < r) return 1;
        else return 0;
      })
      .slice(0, 30);
    const data_cnt = Math.min(30, scores30.length);

    const rate = scores30.reduce((acc, v) => acc + v) / data_cnt;
    return Math.floor(rate * 10000) / 10000;
  }

  onScoreUpdated(data: [DBKey, DBValue, DBMarker][]) {
    this.scores = data.map(([key, value, marker]) => {
      const score = value.score;
      const date = marker.updated_at;
      const constant = value.constant;

      const [rank, _] = this.getRank(score);
      const rate = this.getRate(score, constant);
      const rateFixed = rate.toFixed(3);
      const updated_at = this.formatDate(date);
      const difficultyName = Difficulty[key.difficulty];
      return {
        ...key,
        ...value,
        ...marker,
        rate,
        rateFixed,
        rank,
        updated_at,
        difficultyName,
      };
    });

    this.extraInfo.Rate = this.getRateBest(this.scores);
  }

  async onConstantRequested() {
    return 1.0;
  }
}
</script>
