class JacksonPrettyPrintStream {
  constructor() {
    this.space = "  ";
    this.newline = "\n";
    this.output = "";
    this.indent = 0;
  }

  write(value) {
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

  writeRaw(raw) {
    this.output += raw;
  }

  writeIndent() {
    this.writeRaw(this.newline);
    this.writeRaw(this.space.repeat(this.indent));
  }

  writeNull() {
    this.writeRaw("null");
  }

  writeBoolean(boolean) {
    this.writeRaw(boolean ? "true" : "false");
  }

  writeString(string) {
    this.writeRaw(JSON.stringify(string));
  }

  writeNumber(number) {
    this.writeRaw(JSON.stringify(number));
  }

  writeArray(array) {
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

  writeObject(object) {
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

export default function jacksonPrettyPrint(value) {
  const stream = new JacksonPrettyPrintStream();
  stream.write(value);
  return stream.output;
};
