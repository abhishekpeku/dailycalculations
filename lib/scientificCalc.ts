// A tiny, dependency-free expression evaluator for the scientific-calculator custom widget.
// Never uses eval/new Function: the expression is tokenized and parsed by a hand-written
// recursive-descent parser (standard order of operations), then evaluated directly with Math.*.
// See mdFiles/steps/40-wave-1-math.md, run 6, for the scope decision behind this file.

export type AngleMode = 'deg' | 'rad';

const FUNCS = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'ln', 'log', 'sqrt'] as const;
type FuncName = (typeof FUNCS)[number];

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'bang' }
  | { type: 'func'; name: FuncName }
  | { type: 'const'; name: 'pi' | 'e' };

// Normalizes typographic calculator-button symbols to the ASCII the tokenizer understands.
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–]/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/\s+/g, '');
}

function tokenize(raw: string): Token[] {
  const input = normalize(raw);
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1] ?? ''))) {
      const match = /^\d+(\.\d+)?(e[+-]?\d+)?/.exec(input.slice(i));
      if (!match) throw new Error(`Bad number at position ${i}`);
      tokens.push({ type: 'num', value: Number(match[0]) });
      i += match[0].length;
      continue;
    }
    if (ch === '(') { tokens.push({ type: 'lparen' }); i += 1; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i += 1; continue; }
    if (ch === '!') { tokens.push({ type: 'bang' }); i += 1; continue; }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }
    const rest = input.slice(i);
    const func = FUNCS.find((name) => rest.startsWith(name));
    if (func) { tokens.push({ type: 'func', name: func }); i += func.length; continue; }
    if (rest.startsWith('pi')) { tokens.push({ type: 'const', name: 'pi' }); i += 2; continue; }
    if (ch === 'e') { tokens.push({ type: 'const', name: 'e' }); i += 1; continue; }
    throw new Error(`Unexpected character "${ch}" at position ${i}`);
  }
  return tokens;
}

function isOp(token: Token | undefined, value: string): boolean {
  return !!token && token.type === 'op' && token.value === value;
}

function startsPrimary(token: Token | undefined): boolean {
  return !!token && (token.type === 'num' || token.type === 'const' || token.type === 'func' || token.type === 'lparen');
}

// n! for a nonnegative integer n. 170! is the largest factorial a double can hold (see
// factorial-calculator's own overflow audit, step 40 run 3) — beyond that this honestly
// returns Infinity rather than a rounded, wrong-looking number.
function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

const toRadians = (x: number, mode: AngleMode) => (mode === 'deg' ? (x * Math.PI) / 180 : x);
const fromRadians = (x: number, mode: AngleMode) => (mode === 'deg' ? (x * 180) / Math.PI : x);

function applyFunc(name: FuncName, x: number, mode: AngleMode): number {
  switch (name) {
    case 'sin': return Math.sin(toRadians(x, mode));
    case 'cos': return Math.cos(toRadians(x, mode));
    case 'tan': return Math.tan(toRadians(x, mode));
    case 'asin': return x < -1 || x > 1 ? NaN : fromRadians(Math.asin(x), mode);
    case 'acos': return x < -1 || x > 1 ? NaN : fromRadians(Math.acos(x), mode);
    case 'atan': return fromRadians(Math.atan(x), mode);
    case 'ln': return x > 0 ? Math.log(x) : NaN;
    case 'log': return x > 0 ? Math.log10(x) : NaN;
    case 'sqrt': return x < 0 ? NaN : Math.sqrt(x);
    default: throw new Error('Unknown function');
  }
}

// Recursive descent, lowest to highest precedence: + -, * / (and implicit multiplication),
// unary +/-, ^ (right-associative), postfix !, then primaries (numbers, constants, functions,
// parenthesized groups). Matches the standard "PEMDAS" order of operations.
class Parser {
  private pos = 0;
  private tokens: Token[];
  private angleMode: AngleMode;
  constructor(tokens: Token[], angleMode: AngleMode) {
    this.tokens = tokens;
    this.angleMode = angleMode;
  }

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private take(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new Error('Unexpected end of expression');
    this.pos += 1;
    return token;
  }

  parse(): number {
    const value = this.parseAdd();
    if (this.pos !== this.tokens.length) throw new Error('Unexpected trailing input');
    return value;
  }

  private parseAdd(): number {
    let value = this.parseMul();
    while (isOp(this.peek(), '+') || isOp(this.peek(), '-')) {
      const op = this.take() as { type: 'op'; value: '+' | '-' };
      const rhs = this.parseMul();
      value = op.value === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseMul(): number {
    let value = this.parseUnary();
    for (;;) {
      if (isOp(this.peek(), '*') || isOp(this.peek(), '/')) {
        const op = this.take() as { type: 'op'; value: '*' | '/' };
        const rhs = this.parseUnary();
        value = op.value === '*' ? value * rhs : value / rhs;
      } else if (startsPrimary(this.peek())) {
        // Implicit multiplication: "2pi", "3(4+5)", "(2)(3)" all read as a "*" between them.
        value *= this.parseUnary();
      } else break;
    }
    return value;
  }

  private parseUnary(): number {
    if (isOp(this.peek(), '-')) { this.take(); return -this.parseUnary(); }
    if (isOp(this.peek(), '+')) { this.take(); return this.parseUnary(); }
    return this.parsePow();
  }

  private parsePow(): number {
    const base = this.parsePostfix();
    if (isOp(this.peek(), '^')) {
      this.take();
      const exponent = this.parseUnary(); // right-associative: 2^3^2 = 2^(3^2); allows 2^-2
      return Math.pow(base, exponent);
    }
    return base;
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    while (this.peek()?.type === 'bang') {
      this.take();
      value = factorial(value);
    }
    return value;
  }

  private parsePrimary(): number {
    const token = this.take();
    if (token.type === 'num') return token.value;
    if (token.type === 'const') return token.name === 'pi' ? Math.PI : Math.E;
    if (token.type === 'lparen') {
      const value = this.parseAdd();
      if (this.peek()?.type !== 'rparen') throw new Error('Missing closing parenthesis');
      this.take();
      return value;
    }
    if (token.type === 'func') {
      if (this.peek()?.type === 'lparen') {
        this.take();
        const arg = this.parseAdd();
        if (this.peek()?.type !== 'rparen') throw new Error('Missing closing parenthesis');
        this.take();
        return applyFunc(token.name, arg, this.angleMode);
      }
      // No parentheses typed: apply to just the next primary/postfix, e.g. "√9" or "sin30+1"
      // reads as (√9) or sin(30)+1 — the same "tight binding" a physical calculator's function
      // keys use, not the rest of the addition chain.
      if (!startsPrimary(this.peek())) throw new Error(`Expected an argument after ${token.name}`);
      return applyFunc(token.name, this.parsePostfix(), this.angleMode);
    }
    throw new Error('Unexpected token');
  }
}

// Evaluates a calculator-style expression. Throws on malformed syntax (unmatched parentheses,
// a trailing operator, an unknown character); returns a non-finite number (NaN/Infinity) for
// syntax that parses fine but has no mathematical answer (ln(-1), 0!, 5/0) — never a wrong number.
export function evaluateExpression(raw: string, angleMode: AngleMode = 'deg'): number {
  if (raw.trim() === '') return NaN;
  const tokens = tokenize(raw);
  if (tokens.length === 0) return NaN;
  return new Parser(tokens, angleMode).parse();
}
