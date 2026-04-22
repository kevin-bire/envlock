import { pivotEnv, flattenPivot, PivotResult } from "../envPivot";

describe("pivotEnv", () => {
  const env = {
    DB_HOST: "localhost",
    DB_PORT: "5432",
    DB_NAME: "mydb",
    REDIS_HOST: "127.0.0.1",
    REDIS_PORT: "6379",
    APP_NAME: "envlock",
    SECRET: "abc123",
  };

  it("groups keys by prefix", () => {
    const result = pivotEnv(env, ["DB", "REDIS"]);
    expect(result.groups).toHaveLength(2);

    const db = result.groups.find((g) => g.prefix === "DB");
    expect(db).toBeDefined();
    expect(db!.entries).toEqual({ HOST: "localhost", PORT: "5432", NAME: "mydb" });

    const redis = result.groups.find((g) => g.prefix === "REDIS");
    expect(redis).toBeDefined();
    expect(redis!.entries).toEqual({ HOST: "127.0.0.1", PORT: "6379" });
  });

  it("places unmatched keys in unprefixed", () => {
    const result = pivotEnv(env, ["DB", "REDIS"]);
    expect(result.unprefixed).toEqual({ APP_NAME: "envlock", SECRET: "abc123" });
  });

  it("reports correct totalKeys", () => {
    const result = pivotEnv(env, ["DB", "REDIS"]);
    expect(result.totalKeys).toBe(7);
  });

  it("returns empty group for prefix with no matching keys", () => {
    const result = pivotEnv(env, ["CACHE"]);
    const cache = result.groups.find((g) => g.prefix === "CACHE");
    expect(cache!.entries).toEqual({});
    expect(Object.keys(result.unprefixed)).toHaveLength(7);
  });

  it("handles empty env", () => {
    const result = pivotEnv({}, ["DB"]);
    expect(result.groups[0].entries).toEqual({});
    expect(result.unprefixed).toEqual({});
    expect(result.totalKeys).toBe(0);
  });

  it("handles empty prefixes list", () => {
    const result = pivotEnv(env, []);
    expect(result.groups).toHaveLength(0);
    expect(result.unprefixed).toEqual(env);
  });
});

describe("flattenPivot", () => {
  it("reconstructs the original flat env from pivot result", () => {
    const env = {
      DB_HOST: "localhost",
      DB_PORT: "5432",
      SECRET: "abc123",
    };
    const pivoted = pivotEnv(env, ["DB"]);
    const flat = flattenPivot(pivoted);
    expect(flat).toEqual(env);
  });

  it("handles multiple groups and unprefixed together", () => {
    const pivoted: PivotResult = {
      groups: [
        { prefix: "DB", entries: { HOST: "localhost" } },
        { prefix: "REDIS", entries: { PORT: "6379" } },
      ],
      unprefixed: { NODE_ENV: "production" },
      totalKeys: 3,
    };
    const flat = flattenPivot(pivoted);
    expect(flat).toEqual({
      DB_HOST: "localhost",
      REDIS_PORT: "6379",
      NODE_ENV: "production",
    });
  });

  it("returns empty object for empty pivot result", () => {
    const pivoted: PivotResult = { groups: [], unprefixed: {}, totalKeys: 0 };
    expect(flattenPivot(pivoted)).toEqual({});
  });
});
