import "dotenv/config";
import { seed } from "./index";

const result = await seed();
console.log(result);
if (!result.success) {
  process.exitCode = 1;
}
