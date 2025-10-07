/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility type to get nested keys as dotted paths (e.g. "photos.height")
 */
export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T & string]:
          T[K] extends object
            ? | K
              | `${K}.${DotNestedKeys<T[K]>}`
              | `${K}.keyword`
              | `${K}.raw`
              | `${K}.text`
            : | K
              | `${K}.keyword`
              | `${K}.raw`
              | `${K}.text`
      }[keyof T & string]
    : never
);

/**
 * Base structure for range operators
 */
export type RangeValue = {
  gte?: any;
  lte?: any;
  gt?: any;
  lt?: any;
  format?: string;
};

/**
 * Query clauses
 */
export type Must<TSource> =
  | { match?: Partial<Record<DotNestedKeys<TSource>, string | number | boolean>> }
  | { term?: Partial<Record<DotNestedKeys<TSource>, string | number | boolean>> }
  | { terms?: Partial<Record<DotNestedKeys<TSource>, Array<string | number | boolean>>> }
  | { range?: Partial<Record<DotNestedKeys<TSource>, RangeValue>> }
  | { wildcard?: Partial<Record<DotNestedKeys<TSource>, string>> }
  | { prefix?: Partial<Record<DotNestedKeys<TSource>, string>> }
  | { multi_match?: { query: string; fields: Array<DotNestedKeys<TSource>>; type?: string } }
  | { nested?: { path: string; query: ElasticsearchQuery<TSource>["query"] } }
  | { exists?: { field: DotNestedKeys<TSource> } };

export type MustNot<TSource> = Must<TSource>;
export type Should<TSource> = Must<TSource>;
export type Filter<TSource> = Must<TSource>;

/**
 * Sort options
 */
export type SortOrder = 'asc' | 'desc';
export type SortOption<TSource> = Record<
  DotNestedKeys<TSource> | string,
  { order?: SortOrder; unmapped_type?: string; missing?: '_first' | '_last' }
>;

/**
 * Aggregation options
 */
export type Aggregation<TSource> =
  | { terms: { field: DotNestedKeys<TSource>; size?: number; order?: Record<string, SortOrder> } }
  | { avg: { field: DotNestedKeys<TSource> } }
  | { sum: { field: DotNestedKeys<TSource> } }
  | { min: { field: DotNestedKeys<TSource> } }
  | { max: { field: DotNestedKeys<TSource> } }
  | { cardinality: { field: DotNestedKeys<TSource> } }
  | { date_histogram: { field: DotNestedKeys<TSource>; calendar_interval?: string; fixed_interval?: string; format?: string } }
  | { range: { field: DotNestedKeys<TSource>; ranges: Array<{ from?: number; to?: number }> } };

/**
 * Elasticsearch query typing with deep field inference
 */
export interface ElasticsearchQuery<TSource = any> {
  /**
   * _source: control included/excluded fields
   */
  _source?:
    | {
        includes?: Array<DotNestedKeys<TSource>>;
        excludes?: Array<DotNestedKeys<TSource>>;
      }
    | Array<DotNestedKeys<TSource>>
    | boolean;

  /**
   * Query section
   */
  query?: {
    bool?: {
      must?: Array<Must<TSource>> | Must<TSource>;
      filter?: Array<Filter<TSource>> | Filter<TSource>;
      must_not?: Array<MustNot<TSource>> | MustNot<TSource>;
      should?: Array<Should<TSource>> | Should<TSource>;
      minimum_should_match?: number | string;
    };
  };

  /**
   * Sorting
   */
  sort?: Array<SortOption<TSource>>;

  /**
   * Aggregations
   */
  aggs?: Record<string, Aggregation<TSource>>;

  /**
   * Pagination
   */
  from?: number;
  size?: number;

  /**
   * Highlighting
   */
  highlight?: {
    fields: Record<DotNestedKeys<TSource>, Record<string, any>>;
    pre_tags?: string[];
    post_tags?: string[];
    fragment_size?: number;
    number_of_fragments?: number;
  };

  /**
   * Collapse field (for deduplication)
   */
  collapse?: {
    field: DotNestedKeys<TSource>;
    inner_hits?: Record<string, any>;
  };

  /**
   * Track total hits
   */
  track_total_hits?: boolean | number;

  /**
   * Script fields
   */
  script_fields?: Record<
    string,
    { script: { source: string; lang?: string; params?: Record<string, any> } }
  >;

  /**
   * Stored fields
   */
  stored_fields?: Array<DotNestedKeys<TSource>>;
}
