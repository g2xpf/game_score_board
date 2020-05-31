const DB_SETTING = require("dotenv").config().parsed;
const DB_USER = DB_SETTING.DB_USER;
const DB_PASSWORD = DB_SETTING.DB_PASSWORD;

import mysql, { Pool, QueryFunction } from "mysql";
import { promisify } from "util";

// ref: https://gist.github.com/hagemann/30cfee724d047007a031eb12b3a95a23#gistcomment-3069553
interface PromisifiedPool extends Omit<Pool, "query"> {
  query: QueryFunction | Function;
}

type ResponseType = number | string | boolean | Date;
export type ResponseTypeKey = "number" | "string" | "boolean" | "Date";
type ResponseTypePairs = { [index: string]: ResponseTypeKey };
export interface ResponseTypeSample {
  key: ResponseTypePairs;
  value: ResponseTypePairs;
  marker: ResponseTypePairs;
}
export type DBEntry = { [index: string]: ResponseType };
export default class DB<
  Key extends DBEntry,
  Value extends DBEntry,
  Marker extends DBEntry
> {
  private pool: PromisifiedPool;

  constructor(dbname: string, private typeSample: ResponseTypeSample) {
    if (!DB_USER || !DB_PASSWORD) {
      throw new Error("DB_USER or DB_PASSWORD is undefined!!");
    }
    const pool: PromisifiedPool = mysql.createPool({
      host: "127.0.0.1",
      user: `${DB_USER}`,
      password: `${DB_PASSWORD}`,
      timezone: "utc",
      database: dbname,
      timeout: 20000,
    });
    pool.query = promisify(pool.query);
    this.pool = pool;
  }

  private separate(entry: DBEntry): [string[], ResponseType[]] {
    let fields = [];
    let values = [];
    for (let key in entry) {
      fields.push(key);
      values.push(entry[key]);
    }
    return [fields, values];
  }

  private marker2value(typeMarker: string, value: unknown): ResponseType {
    switch (typeMarker) {
      case "number":
        return Number(value);
      case "string":
        return String(value);
      case "boolean":
        return value == 0 ? false : true;
      case "Date":
        return new Date(value as string);
      default:
        throw new Error(`failed to parse value \`${value}\``);
    }
  }

  async getAll(): Promise<[Key, Value, Marker][]> {
    let scores: { [index: string]: unknown }[] = await this.pool.query(
      "SELECT * FROM score"
    );
    return scores.map((score) => {
      let keys: any = {};
      let values: any = {};
      let markers: any = {};
      for (let key in score) {
        {
          let typeMarker: ResponseTypeKey = this.typeSample.key[key];
          if (typeMarker) {
            keys[key] = this.marker2value(typeMarker, score[key]);
            continue;
          }
        }
        {
          let typeMarker: ResponseTypeKey = this.typeSample.value[key];
          if (typeMarker) {
            values[key] = this.marker2value(typeMarker, score[key]);
            continue;
          }
        }
        {
          let typeMarker: ResponseTypeKey = this.typeSample.marker[key];
          if (typeMarker) {
            markers[key] = this.marker2value(typeMarker, score[key]);
            continue;
          }
        }
      }
      return [keys, values, markers] as [Key, Value, Marker];
    });
  }

  async register(entry: Key & Value) {
    let [fields, values] = this.separate(entry);
    const fieldsQuery = fields.join(",");
    const questionQuery = Array(values.length)
      .fill("?")
      .join(",");

    await this.pool.query(
      `INSERT INTO score (${fieldsQuery}) VALUES (${questionQuery})`,
      values
    );
  }

  async delete(key: Key) {
    const [fields, values] = this.separate(key);
    const fieldsQuery = fields.map((field) => (field += "=?")).join(" AND ");

    await this.pool.query(`DELETE FROM score WHERE ${fieldsQuery}`, values);
  }

  async edit(key: Key, value: Value) {
    const [keyKeys, keyValue] = this.separate(key);
    const keysQuery = keyKeys.map((key) => (key += "=?")).join(" AND ");
    const [valueKeys, valueValue] = this.separate(value);
    const valuesQuery = valueKeys.map((key) => (key += "=?")).join(", ");

    await this.pool.query(
      `UPDATE score SET ${valuesQuery}, updated_at = current_timestamp() WHERE ${keysQuery}`,
      valueValue.concat(keyValue)
    );
  }
}
