import { flattenObject, expandToNested, flattenEnv, expandEnv } from "../envFlatten";

describe("flattenObject", () => {
  it("flattens a simple nested object", () => {
    const input = { db: { host: "localhost", port: 5432 } };
    const result = flattenObject(input);
    expect(result).toEqual({
      DB_HOST: "localhost",
      DB_PORT: "5432",
    });
  });

  it("flattens deeply nested objects", () => {
    const input = { aws: { s3: { bucket: "my-bucket" } } };
    const result = flattenObject(input);
    expect(result).toEqual({ AWS_S3_BUCKET: "my-bucket" });
  });

  it("converts arrays to comma-separated strings", () => {
    const input = { allowed: { hosts: ["a.com", "b.com"] } };
    const result = flattenObject(input);
    expect(result).toEqual({ ALLOWED_HOSTS: "a.com,b.com" });
  });

  it("handles null values as empty string", () => {
    const input = { key: null };
    const result = flattenObject(input as Record<string, unknown>);
    expect(result).toEqual({ KEY: "" });
  });
});

describe("expandToNested", () => {
  it("expands flat keys into nested object", () => {
    const input = { DB_HOST: "localhost", DB_PORT: "5432" };
    const result = expandToNested(input);
    expect(result).toMatchObject({ db: { host: "localhost", port: "5432" } });
  });

  it("handles single-level keys", () => {
    const input = { NODE: "production" };
    const result = expandToNested(input);
    expect(result).toEqual({ node: "production" });
  });
});

describe("flattenEnv", () => {
  it("merges flattened keys into existing env", () => {
    const env = { EXISTING: "value" };
    const json = { db: { host: "localhost" } };
    const result = flattenEnv(env, json);
    expect(result.flattened).toMatchObject({ EXISTING: "value", DB_HOST: "localhost" });
    expect(result.expandedKeys).toContain("DB_HOST");
  });

  it("returns original env unchanged", () => {
    const env = { FOO: "bar" };
    const result = flattenEnv(env, { x: { y: "z" } });
    expect(result.original).toEqual({ FOO: "bar" });
  });
});

describe("expandEnv", () => {
  it("expands selected keys into nested object", () => {
    const env = { DB_HOST: "localhost", DB_PORT: "5432", OTHER: "ignore" };
    const result = expandEnv(env, ["DB_HOST", "DB_PORT"]);
    expect(result.expanded).toMatchObject({ db: { host: "localhost", port: "5432" } });
    expect(result.keys).toHaveLength(2);
  });

  it("ignores keys not in env", () => {
    const env = { DB_HOST: "localhost" };
    const result = expandEnv(env, ["DB_HOST", "MISSING_KEY"]);
    expect(result.keys).toEqual(["DB_HOST"]);
  });
});
