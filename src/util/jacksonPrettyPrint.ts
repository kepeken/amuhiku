// ZpDIC 内部で使用している Jackson の模倣
// https://github.com/FasterXML/jackson-core/blob/master/src/main/java/com/fasterxml/jackson/core/util/DefaultPrettyPrinter.java

class JacksonPrettyPrintStream {
  private readonly space = "  ";
  private readonly newline = "\n";
  public output = "";
  public indent = 0;

  write(value: any) {
    if (value == null) {
      this.writeNull();
    } else if (typeof value === "boolean") {
      this.writeBoolean(value);
    } else if (typeof value === "number") {
      this.writeNumber(value);
    } else if (typeof value === "string") {
      this.writeString(value);
    } else if (Array.isArray(value)) {
      this.writeArray(value);
    } else if (typeof value === "object") {
      this.writeObject(value);
    } else {
      this.writeNull();
    }
  }

  writeRaw(raw: string) {
    this.output += raw;
  }

  writeIndent() {
    this.writeRaw(this.newline);
    this.writeRaw(this.space.repeat(this.indent));
  }

  writeNull() {
    this.writeRaw("null");
  }

  writeBoolean(boolean: boolean) {
    this.writeRaw(boolean ? "true" : "false");
  }

  writeString(string: string) {
    this.writeRaw(JSON.stringify(string));
  }

  writeNumber(number: number) {
    this.writeRaw(JSON.stringify(number));
  }

  writeArray(array: any[]) {
    this.writeRaw("[");
    let first = true;
    for (const element of array) {
      first ? first = false : this.writeRaw(",");
      this.writeRaw(" ");
      this.write(element);
    }
    this.writeRaw(" ");
    this.writeRaw("]");
  }

  writeObject(object: any) {
    const entries = Object.entries(object);
    this.writeRaw("{");
    if (entries.length === 0) {
      this.writeRaw(" ");
    } else {
      let first = true;
      this.indent++;
      for (const [key, value] of entries) {
        first ? first = false : this.writeRaw(",");
        this.writeIndent();
        this.writeString(key);
        this.writeRaw(" : ");
        this.write(value);
      }
      this.indent--;
      this.writeIndent();
    }
    this.writeRaw("}");
  }
}

export default function jacksonPrettyPrint(value: any) {
  const stream = new JacksonPrettyPrintStream();
  stream.write(value);
  return stream.output;
};
