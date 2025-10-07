/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility type to get nested keys as dotted paths (e.g. "photos.height")
 */
export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T & string]:
          T[K] extends (infer U)[]
            ? U extends object
              ? | K | `${K}.${DotNestedKeys<U>}`
              : | K | `${K}.keyword` | `${K}.raw` | `${K}.text`
            : T[K] extends object
              ? | K | `${K}.${DotNestedKeys<T[K]>}`
              : | K | `${K}.keyword` | `${K}.raw` | `${K}.text`
      }[keyof T & string]
    : never
);

/**
 * Type-safe RangeValue
 * Infers range type (number, string, Date, etc.)
 */
export type RangeValue<T> = T extends number
  ? { gte?: number; lte?: number; gt?: number; lt?: number }
  : T extends string
    ? { gte?: string; lte?: string; gt?: string; lt?: string; format?: string }
    : T extends Date
      ? { gte?: string | Date; lte?: string | Date; gt?: string | Date; lt?: string | Date; format?: string }
      : { gte?: T; lte?: T; gt?: T; lt?: T; format?: string };

/** Detect literal unions inside arrays */
export type ExtractArrayLiteral<T, K extends keyof T> =
  T[K] extends ReadonlyArray<infer U>
    ? U extends string | number | boolean ? U : never
    : never;

/** Must clause with type inference */
export type Must<TSource> =
  | {
      [K in keyof TSource & string]?: TSource[K] extends (infer U)[]
        ? U extends string | number | boolean
          ? { term?: Record<K, U> }
          : never
        : never
    }[keyof TSource & string]
  | { match?: Partial<Record<DotNestedKeys<TSource>, string | number | boolean>> }
  | { term?: Partial<Record<DotNestedKeys<TSource>, string | number | boolean>> }
  | { terms?: Partial<Record<DotNestedKeys<TSource>, Array<string | number | boolean>>> }
  | {
      range?: {
        [K in DotNestedKeys<TSource>]?: RangeValue<any>
      }
    }
  | { wildcard?: Partial<Record<DotNestedKeys<TSource>, string>> }
  | { prefix?: Partial<Record<DotNestedKeys<TSource>, string>> }
  | { multi_match?: { query: string; fields: Array<DotNestedKeys<TSource>>; type?: string } }
  | { nested?: { path: string; query: ElasticsearchQuery<TSource>["query"] } }
  | { exists?: { field: DotNestedKeys<TSource> } };

export type SortOrder = 'asc' | 'desc';

export type SortOption<TSource> = Record<
  DotNestedKeys<TSource> | string,
  { order?: SortOrder; unmapped_type?: string; missing?: '_first' | '_last' }
>;

export type Aggregation<TSource> =
  | { terms: { field: DotNestedKeys<TSource>; size?: number; order?: Record<string, SortOrder> } }
  | { avg: { field: DotNestedKeys<TSource> } }
  | { sum: { field: DotNestedKeys<TSource> } }
  | { min: { field: DotNestedKeys<TSource> } }
  | { max: { field: DotNestedKeys<TSource> } }
  | { cardinality: { field: DotNestedKeys<TSource> } }
  | { date_histogram: { field: DotNestedKeys<TSource>; calendar_interval?: string; fixed_interval?: string; format?: string } }
  | { range: { field: DotNestedKeys<TSource>; ranges: Array<{ from?: number; to?: number }> } };

export interface ElasticsearchQuery<TSource = any> {
  _source?:
    | { includes?: Array<DotNestedKeys<TSource>>; excludes?: Array<DotNestedKeys<TSource>> }
    | Array<DotNestedKeys<TSource>>
    | boolean;

  query?: {
    bool?: {
      must?: Array<Must<TSource>> | Must<TSource>;
      filter?: Array<Must<TSource>> | Must<TSource>;
      must_not?: Array<Must<TSource>> | Must<TSource>;
      should?: Array<Must<TSource>> | Must<TSource>;
      minimum_should_match?: number | string;
    };
  };

  sort?: Array<SortOption<TSource>>;
  aggs?: Record<string, Aggregation<TSource>>;
  from?: number;
  size?: number;
  stored_fields?: Array<DotNestedKeys<TSource>>;
}
