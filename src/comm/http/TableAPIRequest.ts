import { Join } from "ts-toolbelt/out/String/Join.js";
import { ServiceNowInstance } from "../../sn/ServiceNowInstance.js";
import { getURLSearchParams, isEmpty, isNotEmpty } from "../../util/utils.js";
import { HTTPRequest } from "./HTTPRequest.js";
import { IHttpResponse } from "./IHttpResponse.js";
import { SessionManager } from "./SessionManager.js";
import { Split } from "ts-toolbelt/out/String/Split.js";
import { Cast } from "ts-toolbelt/out/Any/Cast.js";

type TableHttpMethod = "get" | "post" | "put" | "patch";
type TableQuery = Record<string, string | number | boolean>;
type TableBody = Record<string, unknown>;

/**
 * Lightweight wrapper for ServiceNow Table API operations.
 *
 * Responsibilities:
 * - Build consistent table/record paths
 * - Apply JSON headers for table API calls
 * - Delegate request execution through SessionManager/ServiceNowRequest
 */
export class TableAPIRequest {

	private readonly _headers: Readonly<Record<string, string>> = {
		"Content-Type": "application/json",
		"Accept": "application/json"
	};

	private _snInstance: ServiceNowInstance;
	public get snInstance(): ServiceNowInstance {
		return this._snInstance;
	}
	public set snInstance(value: ServiceNowInstance) {
		this._snInstance = value;
	}

	public constructor(instance: ServiceNowInstance) {
		this._snInstance = instance;
	}

	/**
	 * Query records from a table.
	 */
	public async get<T, C extends TableApiGetQuery = TableApiGetQuery>(tableName: string, query: C) {
		const uri = this._buildTablePath(tableName);
		return await this._doRequest<DefaultType<T, { result: TableApiGetRecord<C>[] }>>(uri, "get", query, null);
	}

	/**
	 * Create a record in a table.
	 */
	public async post<T>(tableName: string, query: TableApiGetQuery, body: TableBody): Promise<IHttpResponse<T>> {
		const uri = this._buildTablePath(tableName);
		return await this._doRequest<T>(uri, "post", query, body);
	}

	/**
	 * Replace a record by sys_id.
	 */
	public async put<T>(tableName: string, sysId: string, body: TableBody): Promise<IHttpResponse<T>> {
		const uri = this._buildRecordPath(tableName, sysId);
		return await this._doRequest<T>(uri, "put", null, body);
	}

	/**
	 * Partially update a record by sys_id.
	 *
	 * Note: downstream execution support for PATCH depends on ServiceNowRequest.executeRequest.
	 */
	public async patch<T>(tableName: string, sysId: string, body: TableBody): Promise<IHttpResponse<T>> {
		const uri = this._buildRecordPath(tableName, sysId);
		return await this._doRequest<T>(uri, "patch", null, body);
	}

	private async _doRequest<T>(uri: string, httpMethod: TableHttpMethod, query: TableApiGetQuery | null, bodyData: TableBody | null): Promise<IHttpResponse<T>> {
		const req = SessionManager.getInstance().getRequest(this.snInstance);
		const request: HTTPRequest = {
			path: uri,
			method: httpMethod,
			headers: this._headers,
			query: getURLSearchParams({ ...query }),
			body: null,
			json: bodyData
		};
		return await req.executeRequest<T>(request);
	}

	private _buildTablePath<T extends string>(tableName: T) {
		return `/api/now/table/${tableName}` as const;
	}

	private _buildRecordPath<T extends string, S extends string>(tableName: T, sysId: S) {
		return `/api/now/table/${tableName}/${sysId}` as const;
	}
}

export type DisplayType = boolean | "all" | undefined | `${boolean}` | `${undefined}`;

export type DefaultType<T, D> = T extends {} ? T : D

type StringIsh = ArrayIsh<string, ",">

type AsArray<T, S = string> = T extends Array<S> | ReadonlyArray<S> ? T : Cast<Split<Cast<T, string>, ",">, Array<S>>

type ArrayValues<T, V = string> = AsArray<T> extends infer R ? Cast<R[Extract<keyof R, number>], V> : never;

type ArrayString<T, S extends string = ","> = string & {
	[Symbol.toPrimitive]<U>(this: U, hint: "string" | "default"): U;
	toString<U>(this: U): U;
} & SplitString<T, S>;

type _SplitFn<T> = <S1 extends string>(this: T, separator: S1) => T extends Join<infer R, S1> ? R : [T]
/** String split signatures tied to a specific separator and output tuple shape. */
type SplitString<T, S extends string> = {
	split: _SplitFn<T>
	[Symbol.split]: _SplitFn<T>
}

type Stringable = string | NumberLike | BooleanLike;

type ArrayIsh<T, S extends string = ","> = Array<T> | ReadonlyArray<T> | T;
type StatFieldMap<T, V = string> = Partial<Record<ArrayValues<AsArray<T>>, V>>;

type NumberLike = number | `${number}`;

type BooleanLike = boolean | `${boolean}`;
export type TableApiGetRecord<C extends TableApiGetQuery> = {
	[P in ArrayValues<AsArray<C["sysparm_fields"]>>]:
	`${C["sysparm_display_value"]}` extends "all" ? {
		value: string | null
		display_value: string;
		link?: string | string[];
	} :
	`${C["sysparm_display_value"]}` extends "true" ? string :
	string | null;
};
/**
 * OpenAPI-aligned query parameters for
 * GET /now/table/{tableName}
 *
 * Generated-style typing (compatible with openapi-typescript
 * and openapi-generator typescript-* targets)
 */
export interface TableApiGetQuery {
	/**
	 * Encoded query used to filter records.
	 * Uses ServiceNow encoded query syntax.
	 */
	sysparm_query?: string;

	/**
	 * Comma-separated list of fields to return.
	 */
	sysparm_fields?: StringIsh;

	/**
	 * Maximum number of records to return.
	 */
	sysparm_limit?: NumberLike;

	/**
	 * Number of records to skip before returning results.
	 */
	sysparm_offset?: NumberLike;

	/**
	 * Controls how reference fields are returned.
	 *
	 * - true  → display values
	 * - false → actual values
	 * - all   → both actual and display values
	 */
	sysparm_display_value?: DisplayType;

	/**
	 * Excludes reference link metadata from reference fields.
	 */
	sysparm_exclude_reference_link?: BooleanLike;

	/**
	 * Suppresses pagination-related response headers.
	 */
	sysparm_suppress_pagination_header?: BooleanLike;

	/**
	 * Database view to use for the query.
	 */
	sysparm_view?: string;

	/**
	 * Additional fields to include in the response.
	 */
	sysparm_additional_fields?: StringIsh; //ArrayString<field_name<T>, ",">;

	/**
	 * When true, omits total row count calculation for performance.
	 */
	sysparm_no_count?: BooleanLike;

	/**
	 * Interprets input reference values as display values
	 * instead of sys_ids.
	 */
	sysparm_input_display_value?: BooleanLike;
};

export type StatsAPIConfig = {
	sysparm_query?: string;
	sysparm_avg_fields?: StringIsh;
	sysparm_count?: BooleanLike;
	sysparm_min_fields?: StringIsh;
	sysparm_max_fields?: StringIsh;
	sysparm_sum_fields?: StringIsh;
	sysparm_group_by?: StringIsh;
	sysparm_order_by?: StringIsh;
	sysparm_having?: string;
	sysparm_display_value?: DisplayType;
	sysparm_limit?: NumberLike;
};



type table_name = string;
type field_name<T extends table_name> = string;
type SysId<T extends table_name> = string;

type GlideStringQuery<T extends table_name> = string;

type StatsAPIGroupByResult<C extends StatsAPIConfig> = {
	field: ArrayValues<AsArray<C["sysparm_group_by"]>>;
} & (
		`${C["sysparm_display_value"]}` extends "all"
		? { value: string | null; display_value: string }
		: `${C["sysparm_display_value"]}` extends "true"
		? { display_value: string }
		: { value: string | null }
	);


export type StatsAPIResult<C extends StatsAPIConfig> = {
	stats: {
		max?: StatFieldMap<C["sysparm_max_fields"]>;
		count?: number;
		avg?: StatFieldMap<C["sysparm_avg_fields"]>;
		sum?: StatFieldMap<C["sysparm_sum_fields"]>;
		min?: StatFieldMap<C["sysparm_min_fields"]>;
	};
	groupby_fields: StatsAPIGroupByResult<C>[];
};

export async function fetchTable<C extends TableApiGetQuery>(client: TableAPIRequest, tableName: string, params: C = {} as C) {
	//var tablePager = new ParallelTablePager(client, tableName);
	//return tablePager.fetchAll<C, F>(params)
	return client.get<{ result: TableApiGetRecord<C>[] }, C>(tableName, params).then(ret => ret.data.result);
}

export async function* streamTable<T extends table_name, C extends TableApiGetQuery>(client: TableAPIRequest, tableName: T, queryParms?: C) {
	//var tableStream = new TableStream(client, tableName);
	//return tableStream.stream(queryParms);

}

export async function getRecord<T extends table_name, C extends TableApiGetQuery>(client: TableAPIRequest, tableName: T, sys_id: SysId<T>, queryParms: C = {} as C) {


	const { data } = await client.get<{ result: TableApiGetRecord<C> }, C>(`/api/now/table/${tableName}/${sys_id}`, queryParms);

	return data.result;
}

export async function getRecordValues<T extends table_name, F extends field_name<T>>(client: TableAPIRequest, tableName: T, sys_id: SysId<T>, ...fields: F[]) {
	return await getRecord(client, tableName, sys_id, {
		sysparm_fields: [...fields],
		sysparm_display_value: false,
		sysparm_exclude_reference_link: true
	} as const)
}

function _hasKey<K extends PropertyKey>(obj: any, key: K): obj is Record<K, unknown> {
	return typeof obj == "object" && obj != null && key in obj;
}

export async function getValue<T extends table_name, F extends field_name<T>, V extends string = string>(client: TableAPIRequest, tableName: T, field: F, query?: GlideStringQuery<T>) {
	return await findRecord(client, tableName, { sysparm_query: query, sysparm_fields: [field] } as const).then(r => _hasKey(r, field) ? r[field] as V | null : undefined)
}

export async function getList<T extends table_name, F extends field_name<T>, V extends string = string>(client: TableAPIRequest, tableName: T, field: F, query?: GlideStringQuery<T>, maxResults?: number): Promise<V[]> {
	if (field == "sys_id")
		return await fetchTable(
			client,
			tableName, {
			sysparm_fields: ["sys_id"] as const,
			sysparm_query: query || "",
			sysparm_limit: maxResults
		})
			.then(ret => ret.map(a => a.sys_id).filter(isNotEmpty)) as V[];

	return ((await getGrouped(client, tableName, [field], query))[field] ?? []) as V[];
};

export async function getStats<T extends table_name, C extends StatsAPIConfig>(client: TableAPIRequest, tableName: T, config: C) {
	return client.get<{ result: StatsAPIResult<C> | StatsAPIResult<C>[] }, C>(`/api/now/stats/${tableName}`, config)
		.then(response => {
			const rawResult = response.data.result;
			const result: StatsAPIResult<C> = Array.isArray(rawResult)
				? rawResult.reduce<StatsAPIResult<C>>((acc, entry) => {
					if (!entry || typeof entry !== "object") {
						return acc;
					}

					if (entry.stats && typeof entry.stats === "object") {
						acc.stats = { ...(acc.stats ?? {}), ...entry.stats };
					}

					if (Array.isArray(entry.groupby_fields)) {
						acc.groupby_fields = [...(acc.groupby_fields ?? []), ...entry.groupby_fields];
					}

					return acc;
				}, { stats: {}, groupby_fields: [] })
				: (rawResult ?? {});
			if (result?.stats?.count != null) {
				const numericCount = Number(result.stats.count);
				if (!Number.isNaN(numericCount)) {
					result.stats.count = numericCount;
				}
			}
			return result;
		})
}

export async function getGrouped<T extends table_name, F extends field_name<T>, D extends DisplayType>(client: TableAPIRequest, tableName: T, field: F[], query?: GlideStringQuery<T>, displayMode: D = false as D): Promise<Record<F, string[]>> {
	var result = await getStats(client, tableName, {
		sysparm_group_by: field,
		sysparm_count: true,
		sysparm_query: query || "" as GlideStringQuery<T>,
		sysparm_display_value: displayMode
	} as const)

	const requestedFields = [...field];
	const groupbyFields: Array<{ field: F; value?: string | null; display_value?: string | null }> = Array.isArray((result).groupby_fields)
		? (result.groupby_fields as Array<{ field: F; value?: string | null; display_value?: string | null }>)
		: Array.isArray(result)
			? result.flatMap((row) => requestedFields.map((groupField) => {
				const rawValue = row[groupField];
				if (rawValue && typeof rawValue === "object") {
					const valueObject = rawValue as { value?: unknown; display_value?: unknown };
					return {
						field: groupField,
						value: valueObject.value == null ? null : String(valueObject.value),
						display_value: valueObject.display_value == null ? null : String(valueObject.display_value)
					};
				}

				return {
					field: groupField,
					value: rawValue == null ? null : String(rawValue)
				};
			}))
			: [];

	var ret = groupbyFields.reduce((state: Record<F, Set<string>>, curr) => {
		state[curr.field] ??= new Set<string>();
		var value = `${displayMode}` == "true" || `${displayMode}` == "all"
			? (curr.display_value ?? curr.value)
			: curr.value;
		if (isNotEmpty(value))
			state[curr.field].add(value);
		return state;
	}, {} as Record<F, Set<string>>)

	return Object.fromEntries(
		Object.entries(ret)
			.map(e => [e[0] as F, (e[1] as Set<string>).values().toArray()] as const)
	) as Record<F, string[]>;
}

async function _resolveSysIdByQuery<T extends table_name>(client: TableAPIRequest, tableName: T, query?: GlideStringQuery<T>): Promise<SysId<T> | undefined> {
	try {
		return await getValue(client, tableName, "sys_id", query)
			.then(sys_id => sys_id as SysId<T>);
	} catch {
		return undefined;
	}
}

export async function findRecord<T extends table_name, C extends TableApiGetQuery>(client: TableAPIRequest, tableName: T, params: C) {

	const sys_id = await _resolveSysIdByQuery(client, tableName, params.sysparm_query);
	if (isEmpty(sys_id)) {
		return undefined;
	}

	try {
		return await getRecord(client, tableName, sys_id, {
			...params,
			sysparm_query: undefined
		});
	} catch {
		return undefined;
	}
}