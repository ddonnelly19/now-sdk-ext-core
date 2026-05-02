/// <reference 
/**
 * Shared ambient utility types for string/array transformations, branded primitives,
 * object helpers, and JSON typing used across the project.
 *
 * Notes:
 * - Keep declarations behavior-compatible because these augment global built-ins.
 * - Prefer adding aliases over renaming existing public utility types.
 */

/** Extract only string keys from an object type. */
type StringKeys<T> = Extract<keyof T, string>;

/**
 * Generic branded-string shape used for nominal typing.
 * D can be used to include an additional fallback type.
 */
type BrandedStringBase<Brand, D = never> = (string & { __brand: Brand }) | `${string & { __brand: Brand }}` | D;

/** Primitive types accepted by this declaration file's conversion helpers. */
type ValuePrimitive = string | number | bigint | boolean | null | undefined;

// -----------------------------
// String and array composition
// -----------------------------

interface ReadonlyArray<T> {
	[Symbol.toPrimitive]<This extends ReadonlyArray<T>>(this: This, hint: "string" | "default"): Join<This, ",">;
	join<This extends ReadonlyArray<T>, S extends string = ",">(separator?: S): Join<This, S>;
	toString<This extends ReadonlyArray<T>>(this: This): Join<This, ",">;
}

interface Array<T> {
	[Symbol.toPrimitive](hint: "string" | "default"): ArrayString<T, ",">;
	join<This extends Array<T>, S extends string = ",">(this: This, separator?: S): Join<This, S>;
	toString<S extends Array<T>>(this: S): Join<S, ",">;
}

/** Splits a string-like value once by a separator. */
type SplitOnce<A, S extends string = "="> = A extends `${infer A1}${S}${infer A2}` ? readonly [
	A1, A2
] : [ToString<A>, null];

/** Converts a two-item tuple into a single-property record. */
type ArrayToRecord<T extends [A1, A2] | readonly [A1, A2], A1 extends string = T[0], A2 extends string = T[1]> = { [P in A1]: A2 }

/** Converts a delimited key-value string into a record type. */
type StringToRecord<T extends string, S1 extends string = ",", S2 extends string = "="> = ArrayToRecord<SplitOnce<ArrayValues<Split<T, S1>>, S2>>

/** Converts a record type into a delimited key-value string type. */
type RecordToString<T = Record<string, any>, D extends string = "=", S extends string = ","> = Join<ReadonlyArray<{ [P in StringKeys<T>]: `${P}${D}${ToString<T[P]>}` }[StringKeys<T>]
>, S>

/** Splits a string-like value into a tuple using separator S. */
type Split<A, S extends string = ","> =
	A extends null | undefined | never ? [] :
	//A extends ArrayString<infer T, S> ? T[] :
	A extends `${infer A1}${S}${infer A2}` ? [ToString<A1>, ...Split<A2, S>] :
	A extends `${infer A1}` ? [ToString<A1>] :
	A extends ArrayString<infer T, S> ? ToString<T>[] :
	Array<ToString<A>>;

/** A branded string that carries information about an underlying array element type. */
type ArrayString<T, S extends string = ","> = string & {
	[Symbol.toPrimitive]<U>(this: U, hint: "string" | "default"): U;
	toString<U>(this: U): U;
	//split<TS extends string, S1 extends string>(this: TS, separator: S1): S1 extends S ? readonly ToString<T>[] : [TS]
	//[Symbol.split]<TS extends string, S1 extends string>(this: TS, separator: S1): S1 extends S ? readonly ToString<T>[] : [TS];
} & SplitString<ToString<T>, S, readonly ToString<T>[]>;

/** String split signatures tied to a specific separator and output tuple shape. */
type SplitString<T extends string, S extends string, TS = ReadonlyArray<string>> = {
	split<S1 extends string>(this: T, separator: S1): S1 extends S ? TS : [T]
	[Symbol.split]<S1 extends string>(this: T, separator: S1): S1 extends S ? TS : [T]
}

/** Joins tuple/array elements into a separator-delimited string type. */
type Join<A, S extends string = ","> =
	A extends [infer A1] | readonly [infer A1] ? ToString<A1> & SplitString<ToString<A>, S, readonly [ToString<A>]> :
	A extends [infer A1, ...infer A2] | readonly [infer A1, ...infer A2] ? `${ToString<A1>}${S}${Join<A2, S>}` & SplitString<ToString<A>, S, readonly [A1, ...A2]> :
	A extends ArrayLike<infer U> ? ArrayString<U, S> :
	"";

/** Coerces a value type into its best-effort string representation type. */
type ToString<V> = V extends string ? `${V}` :
	V extends number | bigint ? `${V}` :
	V extends boolean ? "true" | "false" :
	V extends {
		[Symbol.toPrimitive](hint?: "string" | "default"): infer R;
	} ? ToString<R> :
	V extends {
		toString(): infer R;
	} ? ToString<R> :
	V extends {
		valueOf(): infer R;
	} ? ToString<R> :
	string;

interface ConcatArray<T> {
	join<T1, S extends string = ",">(this: T1, separator?: S): Join<T1, S>;
}

interface String {
	[Symbol.split]<T, S extends string>(this: T, separator: S): T extends Join<infer R, S> ? Split<R, S> : Split<T, S>
	split<T, S extends string>(this: T, separator: S): T extends Join<infer R, S> ? Split<R, S> : Split<T, S>
	concat<T extends string, T1, T2 = "">(this: T, obj: T1, obj2?: T2): `${T}${ToString<T1>}${ToString<T2>}`;

	/**
	 * Replace all instances of a substring in a string, using a regular expression or search string.
	 * @param searchValue A string to search for.
	 * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
	 */
	replaceAll<T extends string, S extends string, R extends string>(this: T, searchValue: S, replaceValue: R): Replace<T, S, R>;

	/**
	 * Replace all instances of a substring in a string, using a regular expression or search string.
	 * @param searchValue A string to search for.
	 * @param replacer A function that returns the replacement text.
	 */
	replaceAll(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;

	equals<T extends string>(val: T): this is T;
	/** Returns a `<tt>` HTML element */

	/**
	 * Returns true if searchString appears as a substring of the result of converting this
	 * object to a String, at one or more positions that are
	 * greater than or equal to position; otherwise, returns false.
	 * @param searchString search string
	 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
	 */
	includes<T extends string, T2 extends string>(this: T, searchString: T2): this is `${string}${T2}${string}`;
	includes(searchString: string, position?: number): boolean;
	replace(searchValue: RegExp, replaceValue: string): string;
	replace<T1 extends string, T2 extends string, T3 extends string>(this: T1, searchValue: T2, replaceValue: T3): Replace<T1, T2, T3>;
	/**
	 * Replaces text in a string, using a regular expression or search string.
	 * @param searchValue A string to search for.
	 * @param replacer A function that returns the replacement text.
	 */
	replace(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;
	/**
	 * Finds the first substring match in a regular expression search.
	 * @param regexp The regular expression pattern and applicable flags.
	 */
	toLowerCase<T extends string>(this: T): Lowercase<T>;
	/** Returns a string representation of a string. */
	toString(): string;
	/** Converts all the alphabetic characters in a string to uppercase. */
	toUpperCase<T extends string>(this: T): Uppercase<T>;
	/** Removes the leading and trailing white space and line terminator characters from a string. */
	trim<T extends string>(this: T): Trim<T>;
	/** Returns the primitive value of the specified object. */
	valueOf(): this;
}

interface IJSONString<T> extends IStringType<T, string> {
	readonly _value: T;
}

/** A strongly typed JSON-encoded string wrapper for T. */
type JSONString<T> = StringType<T, string, IJSONString<T>>;

/** Values accepted where boolean-ish input is expected. */
type BooleanLike = boolean | 1 | 0 | `${boolean | 1 | 0}`

// -----------------------------
// JSON runtime typings
// -----------------------------

interface JSON {

	/**
	 * Converts a JavaScript Object Notation (JSON) string into an object.
	 * @param text A valid JSON string.
	 * @param reviver A function that transforms the results. This function is called for each member of the object.
	 * If a member contains nested objects, the nested objects are transformed before the parent object is.
	 */
	parse<T = any>(text: JSONString<T>): T;
	parse<T, U>(text: JSONString<T>, reviver: (this: any, key: string, value: T) => U): U;
	/**
	 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
	 * @param value A JavaScript value, usually an object or array, to be converted.
	 * @param replacer A function that transforms the results, or an array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
	 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
	 */
	stringify<T>(value: T, replacer?: null | "", space?: string | number): T extends {
		toJSON(key?: any): infer R extends object;
	} ? JSONString<R> : JSONString<T>;
	stringify(value: any, replacer: (this: any, key: string, value: any) => any | (number | string)[] | null, space?: string | number): string;
}

/** Produces dot-path keys for recursively nested objects. */
type Recursion<T> = keyof {
	[Property in keyof T as T[Property] extends { [x: string]: { [x: string]: unknown; }; }
	? `${string & Property}.${string & Recursion<T[Property]>}`
	: Property
	]: true };

interface IFunctionString<F extends Function> extends String {
	readonly $?: F;
	toString(): this & ReturnType<F["toString"]>;
	valueOf(): this & ReturnType<F["toString"]>;
}
/** String representation of a function that preserves its call signature type. */
type FunctionString<F extends (...args: any[]) => any> = IFunctionString<F> & string;
declare function eval<F extends (...args: any[]) => any>(x: FunctionString<F>): ReturnType<F>;


interface ObjectConstructor {
	entries<T>(o: T): [Extract<KeysOfUnion<T>, string>, ValuesOfUnion<T>][]
	/**
	 * Returns an object created by key-value entries for properties and methods.
	 * @param entries An iterable object that contains key-value entries for properties and methods.
	 */
	fromEntries<T = any, P extends string = string>(entries: Iterable<[P, T] | readonly [P, T]>): { [K in P]: T; };
	toArray<T, P1 extends string = "name", P2 extends string = "value">(obj: T, propName?: P1, valName?: P2): ({
		[P in P1]: StringKeys<T>;
	} & {
		[P in P2]: T[keyof T];
	})[];
}

interface ArrayConstructor {
	/**
	 * Creates an array from an iterable object.
	 * @param iterable An iterable object to convert to an array.
	 */
	from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
	/**
	 * Creates an array from an iterable object.
	 * @param iterable An iterable object to convert to an array.
	 * @param mapfn A mapping function to call on every element of the array.
	 * @param thisArg Value of 'this' used to invoke the mapfn.
	 */
	from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
}

// -----------------------------
// Primitive conversion helpers
// -----------------------------

/** Backward-compatible alias for the canonical primitive union used in conversions. */
type ValuePrimative2 = ValuePrimitive;

/** Recursively extracts primitive-like value shapes from complex structures. */
type ValueOf<V> = V extends ValuePrimative2 ? V : V extends (...args: any) => any ? never : V extends object ? {
	[P in keyof V as ValueOf<V[P]> extends {} ? P : never]: ValueOf<V[P]>;
} : V extends {
	[Symbol.toPrimitive](hint?: string): infer R;
} ? ValueOf<R> : V extends {
	valueOf(): infer R;
} ? ValueOf<R> : ToPrimitive<V, ValuePrimative2>;

/** Converts V into primitive subset P using toPrimitive/valueOf rules. */
type ToPrimitive<V, P extends ValuePrimative2 = ValuePrimative2> = V extends P ? V : V extends {
	[Symbol.toPrimitive](hint?: string): infer R;
} ? Extract<R, P> : V extends {
	valueOf(): infer R;
} ? ToPrimitive<R, P> : V extends JSONString<infer R extends P> ? R : P extends string ? Extract<ToString<V>, P> : never;

/** Uses T when it already extends U, otherwise falls back to U. */
type DefaultType<T, U> = T extends U ? T : U;

/** Decimal digit characters represented as numeric literals. */
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/** Lowercase ASCII alphabet characters. */
type Letter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
/** Lowercase hexadecimal character union. */
type ValidHex = `${Digit}` | "a" | "b" | "c" | "d" | "e" | "f";
/** Trims leading/trailing occurrences of S2 from a string-like input S. */
type Trim<S, S2 extends Exclude<string, ""> = " "> = ToString<S> extends `${S2}${infer A extends string}` | `${S2}${infer A extends string}${S2}` | `${infer A extends string}${S2}` ? Trim<A, S2> : ToString<S>;
/** Builds a readonly array-like type with an exact length N. */
type FixedSizeArray<N extends number, T> = {
	readonly [k in Enumerate<N>]: T;
} & {
	length: N;
} & Readonly<T[]>;
/** 32-character hexadecimal tuple for GUID-like values. */
type GuidArr = FixedSizeArray<32, ValidHex>;
/** String form of GuidArr with no separator. */
type GuidString = ArrayString<GuidArr, "">;
/** Prepends the next numeric index to a tuple-like array. */
type PrependNextNum<A extends Array<unknown>> = A['length'] extends infer T ? ((t: T, ...a: A) => void) extends ((...x: infer X) => void) ? X : never : never;
/** Internal recursion helper used to build number ranges. */
type EnumerateInternal<A extends Array<unknown>, N extends number> = {
	0: A;
	1: EnumerateInternal<PrependNextNum<A>, N>;
}[N extends A['length'] ? 0 : 1];
/** Produces a numeric literal union from 0 up to N - 1. */
type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E extends number)[] ? E : never;
/** Produces numeric literal union in [FROM, TO). */
type NumRange<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>;

// -----------------------------
// Object and utility mappers
// -----------------------------

/** Union of object keys and object values for enum-like objects. */
type Enum<T> = T[keyof T] | keyof T;
/**
 * From T, pick a set of properties whose values do not extend V
 */
type ExcludeType<T, V> = {
	[P in keyof T as T[P] extends V ? never : P]: T[P];
};

/** Compares two types for exact equality and returns A or B. */
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

/**
 * Return a set of properties from T where T[property] extends V
 */
type PickKeys<T, V> = Extract<keyof PickType<T, V>, keyof T>;

/** Returns keys from T whose property types can accept V. */
type PickKeys2<T, V> = Extract<keyof PickType2<T, V>, keyof T>;

/**
 * From T, pick a set of properties whose values extend V
 */
type PickType<T, V> = {
	[P in keyof T as T[P] extends NonNullable<V> ? P : never]: Extract<T[P], NonNullable<V>>;
};

/** Returns properties of T where V is assignable to the property type. */
type PickType2<T, V> = {
	[P in keyof T as V extends T[P] ? P : never]: NonNullable<T[P]>;
};

/** Replaces all occurrences of S in T with D at the type level. */
type Replace<T extends string, S extends string, D extends string, A extends string = ""> = T extends `${infer L}${S}${infer R}` ? Replace<R, S, D, `${A}${L}${D}`> : `${A}${T}`;

/** Extracts only required fields from T. */
type RequiredFieldsOnly<T> = {
	[K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};
type Require<T, K extends keyof T> = Omit<T, Exclude<keyof T, K>> & Required<Pick<T, K>>

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> =
	Partial<T> & U[keyof U];

/** Accepts either the original type or its stringified form. */
type StringLike<T> = T | ToString<T>;

/** Narrows to T when T and U are mutually assignable, otherwise keeps T. */
type TypeOf<T, U> = T extends U ? U extends T ? U : T : never;

/** Extracts writable keys from T. */
type WritableKeysOf<T> = {
	[P in keyof T]: IfEquals<{
		[Q in P]: T[P];
	}, {
			-readonly [Q in P]: T[P];
		}, P, never>;
}[keyof T];

/** Selects only writable properties from T. */
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

/** String wrapper type used for XML payload typing. */
type XMLString<T> = StringType<T>;

interface IStringType<T, V extends string = ToString<T>> extends String {
	readonly _type: T;
	[Symbol.toPrimitive](hint?: string): V;
	toString(): V;
}

/** Generic string branding utility that preserves underlying source type metadata. */
type StringType<T, V extends string = ToString<T>, I extends String = IStringType<T, V>> = (V & I) | V;


interface Object {
	/**
	 * Determines whether an object has a property with the specified name.
	 * @param v A property name.
	 */
	hasOwnProperty<T>(this: T, v: any): v is keyof T;
}

type MapKey<T, U, V = any> = { [P in keyof T as T[P] extends keyof U ? U[T[P]] extends V ? P : never : never]: T[P] extends keyof U ? Extract<U[T[P]], V> : never }
type PickProperty<T, E extends PropertyKey, V = {}> = { [P in keyof T as T[P] extends { [Q in E]: V } ? P : never]: T[P] extends { [Q in E]: infer R extends V } ? R : never }

/** Infers the asserted value type from a predicate-like function type. */
type AssertType<T extends (value: any) => boolean | PromiseLike<boolean>> = T extends (value: any) => value is infer R ? R : T extends (value: infer V) => Awaited<boolean> ? V : undefined;

/** Extracts element types from readonly arrays and tuples. */
type ArrayValues<T extends ReadonlyArray<any>> = T[Extract<keyof T, number>];

/** Canonical lowercase boolean string literals. */
type BooleanString = "true" | "false";

/** Public branded string helper for nominally typed strings. */
//type BrandedString<T extends string, D = never> = BrandedStringBase<T, D>;


declare const brand: unique symbol;

type _BrandedObject<T> = {
	readonly [brand]: T;
}

type BrandedString<Name extends string, T = string, D = T> = (T & _BrandedObject<Name>) | D;


/** Accepts both readonly arrays and separator-aware array strings. */
type LikeArray<T, S extends string = ","> = ReadonlyArray<T> | ArrayString<T, S>;

/** Accepts both numeric literals and their string literal forms. */
type NumberLike<N extends number = number> = N | NumberString<N>;

/** Numeric values represented as template-literal strings. */
type NumberString<N extends number = number> = `${N}`;

/** Nullable helper alias. */
declare type Nullable<T> = T | undefined | null;

/** Retrieves property type P from T when present. */
type RecordKey<T, P extends PropertyKey> = P extends keyof T ? T[P] : never;

/** Builds a record from keys of T constrained to key type K. */
type RecordOf<T, K extends PropertyKey = string> = {
	[P in Extract<keyof T, K> as T[P] extends never ? never : P]: T[P] extends never ? never : T[P];
};

/** Optional record helper over key set K. */
declare type RecordType<K, T> = {
	[P in Extract<K, string>]?: T;
};

/** Branded string constrained by a regex pattern or pattern-like identifier. */
type RegexMatchedString<Pattern extends string | RegExp> = BrandedStringBase<Pattern>;

/** Marks selected keys K as required while preserving other keys. */
type RequireFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Return type of method/property P on T, with fallback default D. */
type ReturnMethodType<T, P extends PropertyKey, D = any> = RecordKey<T, P> extends ((...args: any[]) => infer F extends D) ? F : D;

/** Inverts a string-valued record so values become keys. */
type ReverseRecord<T extends Record<K, string>, K extends string = Extract<keyof T, string>> = {
	[P in K as T[P]]: P;
};

interface Boolean {
	toString(): `${boolean}`;
	/** Returns the primitive value of the specified object. */
	valueOf(): boolean;
}


type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void)
    ? I
    : never

type KeysOfUnion<U> = keyof UnionToIntersection<U>


type ValuesOfUnion<U> =
  U extends U ? U[keyof U] : never

type AllowOnly<T, K extends keyof T> = Pick<T, K> & { [P in keyof Omit<T, K>]?: never }
type OneOf<T, K = keyof T> = K extends keyof T ? AllowOnly<T, K> : never