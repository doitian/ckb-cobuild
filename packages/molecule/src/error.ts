export type SafeParseReturnSuccess<T> = {
  success: true;
  data: T;
};
export type SafeParseReturnError = {
  success: false;
  error: CodecError;
};
export type SafeParseReturnType<T> =
  | SafeParseReturnSuccess<T>
  | SafeParseReturnError;

export function formatCodecError(path: (string | number)[], message: string) {
  return `//${path.join("/")}: ${message}`;
}
export type CodecErrorFormatter = typeof formatCodecError;

export const PARSE_ROOT_PATH = "//";

export class CodecIssue {
  message?: string = undefined;
  children?: Map<string | number, CodecIssue> = undefined;

  constructor(message: string | undefined = undefined) {
    this.message = message;
  }

  static create(
    message: string | undefined = undefined,
    children?: Iterable<[string | number, CodecIssue]>,
  ): CodecIssue {
    const issue = new CodecIssue(message);
    if (children) {
      issue.addChildren(children);
    }
    return issue;
  }

  addChild(key: string | number, issue: CodecIssue): CodecIssue {
    if (!this.children) {
      this.children = new Map();
    }
    this.children.set(key, issue);
    return this;
  }

  addChildren(children: Iterable<[string | number, CodecIssue]>): CodecIssue {
    if (!this.children) {
      this.children = new Map();
    }
    for (const [key, issue] of children) {
      this.children.set(key, issue);
    }
    return this;
  }

  collectMessages(formatter?: CodecErrorFormatter) {
    const _formatter = formatter ?? formatCodecError;
    const messages: string[] = [];
    this.collectMessagesIn(messages, [], _formatter);
    return messages;
  }

  collectMessagesIn(
    messages: string[],
    prefix: (string | number)[],
    formatter: CodecErrorFormatter,
  ) {
    if (this.message) {
      messages.push(formatter(prefix, this.message));
    }
    if (this.children && this.children.size > 0) {
      const pathIndex = prefix.length;
      for (const [key, issue] of this.children) {
        prefix[pathIndex] = key;
        issue.collectMessagesIn(messages, prefix, formatter);
      }
      prefix.pop();
    }

    return;
  }
}

export type CodecErrorSource = "parse" | "unpack";

export class CodecError extends Error {
  source: CodecErrorSource;
  issue: CodecIssue;

  constructor(
    source: CodecErrorSource,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.source = source;
    this.issue = CodecIssue.create(message);
    this.name = `CodecError(${source})`;
  }

  static create(
    source: CodecErrorSource,
    message: string,
    options?: ErrorOptions,
  ): CodecError {
    return new CodecError(source, message, options);
  }

  static expectFixedByteLength(
    expectedLength: number,
    actualLength: number,
    options?: ErrorOptions,
  ): CodecError {
    return new CodecError(
      "unpack",
      `Expected bytes length ${expectedLength}, found ${actualLength}`,
      options,
    );
  }

  static expectMinimalByteLength(
    expectedMinimalLength: number,
    actualLength: number,
    options?: ErrorOptions,
  ): CodecError {
    return new CodecError(
      "unpack",
      `Expected bytes length at least ${expectedMinimalLength}, found ${actualLength}`,
      options,
    );
  }

  collectMessages(formatter?: CodecErrorFormatter): string[] {
    return this.issue.collectMessages(formatter);
  }
}
