import { loadEmployees } from "../src/data/load-employees";
import { readEmployeeFile } from "./employee-input";

const path = new URL("../public/concord_employees.csv", import.meta.url);
const result = await loadEmployees(() => readEmployeeFile(path));
console.log(result);
