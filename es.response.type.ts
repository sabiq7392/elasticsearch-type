/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ElasticsearchHit<TSource = any> {
    _index: string;
    _type?: string;
    _id: string;
    _score?: number;
    _source: TSource;
}

export interface ElasticsearchHits<TSource = any> {
    total: {
        value: number;
        relation: 'eq' | 'gte';
    } | number; // ES 5.6.16 kadang masih pakai number
    max_score?: number;
    hits: ElasticsearchHit<TSource>[];
}

export interface ElasticsearchAggBucket {
    key: string | number;
    doc_count: number;
    [subAgg: string]: any; // nested aggregation support
}

export interface ElasticsearchAggregations {
    [aggName: string]: {
        buckets?: ElasticsearchAggBucket[];
        value?: number;
        doc_count?: number;
    };
}

export interface ElasticsearchResponse<TSource = any> {
    took: number;
    timed_out: boolean;
    _shards?: {
        total: number;
        successful: number;
        failed: number;
    };
    hits: ElasticsearchHits<TSource>;
    aggregations?: ElasticsearchAggregations;
}
