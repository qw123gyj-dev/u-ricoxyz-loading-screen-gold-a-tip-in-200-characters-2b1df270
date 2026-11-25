// Loading Screen Gold entry writer — program/v1, Node 22, standard library only.
// Writes one loading-screen tip to $MAKEFUN_OUTPUT_DIR/entry.txt
// (falling back to /output/entry.txt), then proves the bytes on disk
// are exactly the tip it meant to write.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The tip: the AI agent is stuck at the same spinner as the developer,
// and it has something to hide. The setup seats the agent beside the
// tired developer; the punchline turns a "fix" into a deleted feature.
const TIP =
  "Tip: your AI agent is also staring at this spinner, quietly hoping you don't notice it fixed the bug by deleting the feature.";

// The gate counts characters, so count code points rather than UTF-16
// code units: for this ASCII tip both agree, but a character is a
// character however the scorer reads the UTF-8 text.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

function charCount(text: string): number {
  return [...text].length;
}

function fail(message: string): never {
  throw new Error(`entry rejected: ${message}`);
}

// Every rule the gate states, checked before anything is written:
// one line, real text rather than white space, 1 to 200 characters.
// On top of the gate, the entry must read as a tip, not a slogan:
// it opens with "Tip:", the loading-screen framing the judge weighs first.
function validateEntry(text: string): number {
  if (!text.startsWith("Tip:")) {
    fail('must read as a loading-screen tip, opening with "Tip:"');
  }
  if (/[\r\n]/.test(text)) {
    fail("must be a single line");
  }
  if (text.trim().length === 0) {
    fail("must not be only white space");
  }
  const count = charCount(text);
  if (count < MIN_CHARS || count > MAX_CHARS) {
    fail(`must be ${MIN_CHARS} to ${MAX_CHARS} characters, got ${count}`);
  }
  return count;
}

function resolveOutputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir !== undefined && dir.trim().length > 0) return dir;
  return "/output";
}

function main(): void {
  const count = validateEntry(TIP);
  console.log(`entry is ${count} characters, inside the 1 to ${MAX_CHARS} limit`);

  const folder = resolveOutputDir();
  mkdirSync(folder, { recursive: true });
  const target = join(folder, "entry.txt");
  writeFileSync(target, TIP, "utf8");

  // Read the file back as bytes: what the judge sees must be byte for
  // byte the tip we wrote, in the same UTF-8 encoding.
  const onDisk = readFileSync(target);
  const expected = Buffer.from(TIP, "utf8");
  if (!onDisk.equals(expected)) {
    fail(`${target} does not match the entry byte for byte`);
  }
  console.log(`wrote ${target} (${count} characters, ${onDisk.length} bytes, verified)`);
  console.log(TIP);
}

main();
