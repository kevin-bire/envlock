import {
  formatFlattenResult,
  formatFlattenSummary,
  formatExpandResult,
  formatExpandSummary,
} from "../flattenFormatter";
import type { FlattenResult, ExpandResult } from "../envFlatten";

const mockFlattenResult: FlattenResult = {
  original: { EXISTING: "val" },
  flattened: { EXISTING: "val", DB_HOST: "localhost", DB_PORT: "5432" },
  expandedKeys: ["DB_HOST", "DB_PORT"],
};

const mockExpandResult: ExpandResult = {
  original: { DB_HOST: "localhost", DB_PORT: "5432" },
  expanded: { db: { host: "localhost", port: "5432" } },
  keys: ["DB_HOST", "DB_PORT"],
};

describe("formatFlattenResult", () => {
  it("includes expanded key names", () => {
    const output = formatFlattenResult(mockFlattenResult);
    expect(output).toContain("DB_HOST");
    expect(output).toContain("DB_PORT");
  });

  it("mentions count of flattened keys", () => {
    const output = formatFlattenResult(mockFlattenResult);
    expect(output).toContain("2");
  });

  it("truncates long values", () => {
    const longResult: FlattenResult = {
      original: {},
      flattened: { LONG_KEY: "a".repeat(60) },
      expandedKeys: ["LONG_KEY"],
    };
    const output = formatFlattenResult(longResult);
    expect(output).toContain("...");
  });
});

describe("formatFlattenSummary", () => {
  it("reports added and total counts", () => {
    const output = formatFlattenSummary(mockFlattenResult);
    expect(output).toContain("2 key(s) added");
    expect(output).toContain("3 total");
  });
});

describe("formatExpandResult", () => {
  it("includes expanded key count", () => {
    const output = formatExpandResult(mockExpandResult);
    expect(output).toContain("2");
  });

  it("renders nested keys", () => {
    const output = formatExpandResult(mockExpandResult);
    expect(output).toContain("db");
    expect(output).toContain("host");
  });
});

describe("formatExpandSummary", () => {
  it("reports number of expanded keys", () => {
    const output = formatExpandSummary(mockExpandResult);
    expect(output).toContain("2 key(s)");
  });
});
