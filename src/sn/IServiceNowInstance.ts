import { Creds } from "@servicenow/sdk-cli-core/dist/auth/index.js";

/** Contract for a ServiceNow connection target. */
export interface IServiceNowInstance {
	/** Returns `true` when this is the default/active instance. */
	isDefault(): boolean;

	/** Fully-qualified hostname of the ServiceNow instance (e.g. `https://myinstance.service-now.com`). */
	getHost(): string;

	/** Authenticated username for this instance. */
	getUserName(): string;

	/** Short alias used to identify this instance in the CLI credential store. */
	getAlias(): string;

	/** Plain-text password. Prefer {@link credential} when available. */
	getPassword(): string;

	/** SDK credential object resolved from the CLI credential store. */
	get credential(): Creds;
}