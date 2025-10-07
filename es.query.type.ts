/* eslint-disable @typescript-eslint/no-explicit-any */

export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T & string]:
          // handle array
          T[K] extends (infer U)[]
            ? U extends object
              ? | K | `${K}.${DotNestedKeys<U>}`
              : | K | `${K}.keyword` | `${K}.raw` | `${K}.text`
            // handle object
            : T[K] extends object
              ? | K | `${K}.${DotNestedKeys<T[K]>}`
              : | K | `${K}.keyword` | `${K}.raw` | `${K}.text`
      }[keyof T & string]
    : never
);

/** Detect literal unions inside arrays */
export type ExtractArrayLiteral<T, K extends keyof T> =
  T[K] extends ReadonlyArray<infer U>
    ? U extends string | number | boolean ? U : never
    : never;

/** Range operator */
export type RangeValue = { gte?: any; lte?: any; gt?: any; lt?: any; format?: string };

/** Base query */
export type Must<TSource> =
  | {
      /** if key is union array like `types`, only allow those literals as value */
      [K in keyof TSource & string]?: TSource[K] extends (infer U)[]
        ? U extends string | number | boolean
          ? { term?: Record<K, U> }
          : never
        : never
    }[keyof TSource & string]
  | { match?: Partial<Record<DotNestedKeys<TSource>, string | number | boolean>> }
  | { term?: Partial<Record<DotNestedKeys<TSource>, string | number | boolean>> }
  | { terms?: Partial<Record<DotNestedKeys<TSource>, Array<string | number | boolean>>> }
  | { range?: Partial<Record<DotNestedKeys<TSource>, RangeValue>> }
  | { wildcard?: Partial<Record<DotNestedKeys<TSource>, string>> }
  | { prefix?: Partial<Record<DotNestedKeys<TSource>, string>> }
  | { multi_match?: { query: string; fields: Array<DotNestedKeys<TSource>>; type?: string } }
  | { nested?: { path: string; query: ElasticsearchQuery<TSource>["query"] } }
  | { exists?: { field: DotNestedKeys<TSource> } };

export interface ElasticsearchQuery<TSource = any> {
  _source?: {
    includes?: Array<DotNestedKeys<TSource>>;
    excludes?: Array<DotNestedKeys<TSource>>;
  } | Array<DotNestedKeys<TSource>> | boolean;

  query?: {
    bool?: {
      must?: Array<Must<TSource>> | Must<TSource>;
      filter?: Array<Must<TSource>> | Must<TSource>;
      must_not?: Array<Must<TSource>> | Must<TSource>;
      should?: Array<Must<TSource>> | Must<TSource>;
      minimum_should_match?: number | string;
    };
  };
}
