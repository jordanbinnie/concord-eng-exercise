import { failure, type Result } from "./result";
export type CsvRow = { fields: string[]; sourceRow: number };

const BOM_PATTERN = /^\uFEFF/;

/**
 * Parses CSV text into fields and source line numbers, supporting quoted commas,
 * escaped quotes and multiline fields. Returns an error object for malformed quoting.
 */
export function parseCsv(text: string): Result<CsvRow[]> {
  const rows: CsvRow[] = [];
  let fields: string[] = [];
  let value = "";
  let quoted = false;
  let closedQuote = false;
  let line = 1;
  let sourceRow = 1;
  /**
   * Saves the current field and resets the field buffer and closing-quote state.
   */
  const finishField = () => {
    fields.push(value);
    value = "";
    closedQuote = false;
  };
  /**
   * Saves the current row with its starting line number, skipping empty lines.
   */
  const finishRow = () => {
    finishField();
    if (fields.length !== 1 || fields[0] !== "") {
      rows.push({ fields, sourceRow });
    }
    fields = [];
  };
  /**
   * Reads a character inside a quoted field, handling escaped quotes and line breaks.
   * Returns the last consumed character index so the caller can continue scanning.
   */
  const readQuoted = (input: string, index: number) => {
    const ch = input[index];
    if (ch === '"') {
      if (input[index + 1] === '"') {
        value += '"';
        return index + 1;
      }
      quoted = false;
      closedQuote = true;
    } else {
      value += ch;
      if (ch === "\n" || (ch === "\r" && input[index + 1] !== "\n")) {
        line++;
      }
    }
    return index;
  };
  /**
   * Saves the final row and returns the parsed rows.
   * Returns an error object if a quoted field was never closed.
   */
  const finishParsing = (): Result<CsvRow[]> => {
    if (quoted) {
      return failure(
        "invalid_csv_quoting",
        `Unclosed CSV quote starting at line ${sourceRow}.`,
        sourceRow
      );
    }
    if (value || fields.length || closedQuote) {
      finishRow();
    }
    return { success: true, data: rows };
  };
  const input = text.replace(BOM_PATTERN, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      i = readQuoted(input, i);
    } else if (ch === ",") {
      finishField();
    } else if (ch === "\n" || ch === "\r") {
      finishRow();
      if (ch === "\r" && input[i + 1] === "\n") {
        i++;
      }
      line++;
      sourceRow = line;
    } else if (ch === '"' && value === "" && !closedQuote) {
      quoted = true;
    } else {
      if (closedQuote || ch === '"') {
        return failure(
          "invalid_csv_quoting",
          `Malformed CSV quoting at line ${line}.`,
          line
        );
      }
      value += ch;
    }
  }
  return finishParsing();
}
