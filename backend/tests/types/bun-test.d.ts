/// <reference types="bun-types" />

// Type declarations for bun:test module
declare module "bun:test" {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  export function test(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  export function expect<T>(actual: T): Matchers<T>;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;

  export namespace it {
    function skip(name: string, fn: () => void | Promise<void>): void;
    function only(name: string, fn: () => void | Promise<void>): void;
    function todo(name: string): void;
  }

  export namespace test {
    function skip(name: string, fn: () => void | Promise<void>): void;
    function only(name: string, fn: () => void | Promise<void>): void;
    function todo(name: string): void;
  }

  export namespace describe {
    function skip(name: string, fn: () => void): void;
    function only(name: string, fn: () => void): void;
    function todo(name: string): void;
  }

  interface Matchers<T> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toStrictEqual(expected: T): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeNaN(): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeCloseTo(expected: number, numDigits?: number): void;
    toContain(expected: any): void;
    toContainEqual(expected: any): void;
    toHaveLength(expected: number): void;
    toHaveProperty(keyPath: string | string[], value?: any): void;
    toMatch(expected: string | RegExp): void;
    toMatchObject(expected: object): void;
    toThrow(expected?: string | RegExp | Error): void;
    toThrowError(expected?: string | RegExp | Error): void;
    toBeInstanceOf(expected: any): void;
    not: Matchers<T>;
  }
}
