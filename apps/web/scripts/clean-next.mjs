import { rm } from "node:fs/promises";
import { join } from "node:path";

const target = join(process.cwd(), ".next");

for (let attempt = 1; attempt <= 5; attempt += 1) {
  try {
    await rm(target, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    if (attempt === 5) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
}
