import { Stringified } from '@/types/utility';

/**
 * Dedents a template literal string.
 */
export const dedent = (
  strings: TemplateStringsArray,
  ...values: any[]
): string => {
  let fullString = strings.reduce(
    (result, string, i) => `${result}${values[i - 1]}${string}`
  );

  // match all leading white space that's common to all lines
  let match = fullString.match(/^[ \t]*(?=\S)/gm);
  let indent = match && Math.min(...match.map((el) => el.length));

  if (indent) {
    let regexp = new RegExp(`^ {${indent}}`, 'gm');
    fullString = fullString.replace(regexp, '');
  }

  return fullString.trim();
};

/**
 * Generates a UUIDv4.
 */
export const uuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Strongly-typed JSON.stringify.
 */
export const stringify = <T>(t: T): Stringified<T> => {
  return JSON.stringify(t) as Stringified<T>;
};
