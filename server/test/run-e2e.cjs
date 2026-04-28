const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function readDatabaseUrlFromEnvFiles() {
  const candidateFiles = [".env.local", ".env"];

  for (const fileName of candidateFiles) {
    const fullPath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const raw = fs.readFileSync(fullPath, "utf8");
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.startsWith("DATABASE_URL=")) {
        continue;
      }

      const value = trimmed.slice("DATABASE_URL=".length).trim();
      const unquoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
          ? value.slice(1, -1)
          : value;

      if (unquoted.length > 0) {
        return unquoted;
      }
    }
  }

  return undefined;
}

function extractDatabaseName(urlString) {
  try {
    const parsed = new URL(urlString);
    const rawPath = parsed.pathname.replace(/^\/+/, "");
    if (!rawPath) {
      return undefined;
    }

    return decodeURIComponent(rawPath.split("?")[0]);
  } catch {
    return undefined;
  }
}

function runCommand(command, args, env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
  });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }

  if (result.error) {
    throw result.error;
  }
}

const databaseUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFiles();
const allowUnsafeReset = process.env.ALLOW_E2E_DB_RESET === "true";

if (!databaseUrl) {
  console.error("DATABASE_URL is required for e2e test preparation.");
  process.exit(1);
}

const databaseName = extractDatabaseName(databaseUrl);
const looksLikeTestDatabase = databaseName
  ? /(?:^|[_-])test(?:$|[_-])/i.test(databaseName)
  : /(?:^|[_-])test(?:$|[_-])/i.test(databaseUrl);

if (!looksLikeTestDatabase && !allowUnsafeReset) {
  console.error(
    [
      `Refusing to run e2e against a non-test DATABASE_URL (resolved db: ${databaseName ?? "unknown"}).`,
      "Use a *_test database name or set ALLOW_E2E_DB_RESET=true to override intentionally.",
    ].join(" "),
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const prepareOnly = args.includes("--prepare-only");
const jestArgs = args.filter((arg) => arg !== "--prepare-only");

const commandEnv = {
  ...process.env,
  NODE_ENV: "test",
  DATABASE_URL: databaseUrl,
};

runCommand("npx", ["prisma", "generate"], commandEnv);
runCommand("npx", ["prisma", "db", "push"], commandEnv);
runCommand("npx", ["prisma", "db", "seed"], commandEnv);

if (!prepareOnly) {
  runCommand(
    "npx",
    ["jest", "--config", "./test/jest-e2e.config.cjs", "--runInBand", ...jestArgs],
    commandEnv,
  );
}
