type argType =
  | "function"
  | "signature"
  | "if"
  | "else"
  | "condition"
  | "body"
  | "text"
  | number;

export class Scope {
  private args: argType[];

  constructor(...args: argType[]) {
    this.args = args;

    this.resolve = this.resolve.bind(this);
    this.update = this.update.bind(this);
  }

  get() {
    return this.args.join(".");
  }

  resolve(obj: any): any {
    return this.args.reduce((acc, arg) => acc[arg], obj);
  }

  update(obj: any, value: any) {
    const last = this.args.at(-1)!;
    const argsClone = [...this.args];
    argsClone.length--;
    const toChange = argsClone.reduce((acc, arg) => acc[arg], obj);
    toChange[last] = value;
    return obj;
  }
}
