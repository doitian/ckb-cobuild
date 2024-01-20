export function formatCodecError(path: (string | number)[], message: string) {
  return `//${path.join("/")}: ${message}`;
}
export type CodecErrorFormatter = typeof formatCodecError;

export const PARSE_ROOT_PATH = "//";

export class CodecIssue {
  readonly message?: string = undefined;
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

export type CodecErrorSource = "parse" | "unpack" | "schema";

export class CodecError extends Error {
  readonly source: CodecErrorSource;
  readonly issue: CodecIssue;

  constructor(
    source: CodecErrorSource,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.source = source;
    this.issue = CodecIssue.create(message);
    this.name = `CodecError(${source})`;
  }

  static create(
    source: CodecErrorSource,
    message?: string,
    options?: ErrorOptions,
  ): CodecError {
    return new CodecError(source, message, options);
  }

  addChild(key: string | number, issue: CodecIssue): CodecError {
    this.issue.addChild(key, issue);
    return this;
  }

  addChildren(children: Iterable<[string | number, CodecIssue]>): CodecError {
    this.issue.addChildren(children);
    return this;
  }

  static expectByteLength(
    expectedLength: number,
    actualLength: number,
    options?: ErrorOptions,
  ): CodecError {
    return unpackError(
      `Expected bytes length ${expectedLength}, found ${actualLength}`,
      options,
    );
  }

  static expectMinimalByteLength(
    expectedMinimalLength: number,
    actualLength: number,
    options?: ErrorOptions,
  ): CodecError {
    return unpackError(
      `Expected bytes length at least ${expectedMinimalLength}, found ${actualLength}`,
      options,
    );
  }

  collectMessages(formatter?: CodecErrorFormatter): string[] {
    return this.issue.collectMessages(formatter);
  }
}

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

export function parseSuccess<T>(data: T): SafeParseReturnSuccess<T> {
  return {
    success: true,
    data,
  };
}

export function parseError(
  error?: string,
  options?: ErrorOptions,
): SafeParseReturnError {
  return {
    success: false,
    error: CodecError.create("parse", error, options),
  };
}

export function unpackError(
  error?: string,
  options?: ErrorOptions,
): CodecError {
  return CodecError.create("unpack", error, options);
}

export function createSafeParse<TIn, TOut>(
  parse: (input: TIn) => TOut,
): (input: TIn) => SafeParseReturnType<TOut> {
  return (input) => {
    try {
      return parseSuccess(parse(input));
    } catch (error: unknown) {
      if (error instanceof CodecError) {
        return {
          success: false,
          error,
        };
      } else if (error instanceof Error) {
        return parseError(error.message);
      } else {
        return parseError(String(error));
      }
    }
  };
}

export function parseSuccessThen<TIn, TOut = TIn>(
  result: SafeParseReturnType<TIn>,
  mapper: (input: TIn) => SafeParseReturnType<TOut>,
): SafeParseReturnType<TOut> {
  if (result.success) {
    return mapper(result.data);
  }
  return result;
}
