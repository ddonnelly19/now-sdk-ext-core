import qs from "querystring"

export const isUndefined = (value: any): value is undefined => value === undefined;
export const isNull = (value: any): value is null => value === null;
export const isNil = isEmpty;
export const isObject = (x: any): x is NonNullable<object> => x != null && typeof x === 'object';
export const isEmptyObject = (obj: any): obj is Record<never, never> => isObject(obj) && Object.keys(obj).length === 0;


export function isEmpty(obj: any): obj is null | undefined | never {
	return !isNotEmpty(obj);
}


export function isIterable(x: any): x is Iterable<unknown> {
	// Check that x is not null or undefined, as these will throw an error when accessing properties.
	if (x === null || typeof x !== 'object') {
		return false;
	}
	// Check if the Symbol.iterator property is present and is a function.
	return typeof x[Symbol.iterator] === 'function';
}


/**
 * Type guard that checks whether a value is neither null nor undefined.
 */
export function isNotNull<T>(
	value: T | null | undefined
): value is NonNullable<T> {
	return value != null;
}

/**
 * Checks whether a value, when treated as a string,
 * is non-blank and not the literal strings "null" or "undefined".
 *
 * Intended primarily for user / form input.
 */
export function isNotBlank(value: unknown): boolean {
	if (typeof value !== "string") return true;

	const normalized = value.trim().toLowerCase();

	return (
		normalized !== "" &&
		normalized !== "null" &&
		normalized !== "undefined"
	);
}


/**
 * Determines whether an object has at least one non-empty property value.
 * Uses isNotNull, isNotBlank, and itself recursively.
 */
export function hasNonEmptyProps(value: unknown): boolean {
	if (typeof value !== "object" || value === null) return true;

	return Object.values(value).some(
		v =>
			isNotNull(v) &&
			isNotBlank(v) &&
			hasNonEmptyProps(v)
	);
}

/**
 * Determines whether a value is meaningfully non‑empty.
 *
 * Truthy conditions:
 * - Not null or undefined
 * - Not an empty string (after trimming)
 * - Not the literal strings "null" or "undefined"
 * - For objects: has at least one non‑empty property value
 *
 * @example
 * isNotEmpty("foo")            // true
 * isNotEmpty("   ")            // false
 * isNotEmpty({ a: "x" })       // true
 * isNotEmpty({ a: null })      // false
 * isNotEmpty(undefined)        // false
 */

export function isNotEmpty<T>(
	value: T | null | undefined
): value is NonNullable<T> {
	return (
		isNotNull(value) &&
		isNotBlank(value) &&
		hasNonEmptyProps(value)
	);
}

export function normalizeQueryParams(params: qs.ParsedUrlQueryInput | undefined): Record<string, string> {
	const normalized: Record<string, string> = {};

	if (!params) {
		return normalized;
	}

	for (const [key, rawValue] of Object.entries(params)) {
		if (rawValue == null) {
			continue;
		}

		if (Array.isArray(rawValue)) {
			const values = rawValue
				.filter((value) => value != null)
				.map((value) => String(value));

			if (values.length > 0) {
				normalized[key] = values.join(",");
			}
			continue;
		}

		normalized[key] = String(rawValue);
	}

	return normalized;
}

export function getURLSearchParams(params?: qs.ParsedUrlQueryInput | undefined) {
	return new URLSearchParams(normalizeQueryParams(params));
}
