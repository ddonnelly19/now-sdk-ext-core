import { Creds } from "@servicenow/sdk-cli-core/dist/auth/index.js";
import { IServiceNowInstance } from "./IServiceNowInstance.js";

/** Configuration bag passed to the {@link ServiceNowInstance} constructor. */
export interface ServiceNowSettingsInstance {
	/** Fully-qualified hostname (e.g. `https://myinstance.service-now.com`). */
	host?: string;
	/** Authenticated username. */
	username?: string;
	/** Short CLI alias for this instance. */
	alias?: string;
	/** Mark this instance as the default/active target. */
	isDefault?: boolean;
	/** Plain-text password. Prefer `credential` when available. */
	password?: string;
	/** SDK credential resolved from the CLI credential store. */
	credential?: Creds;
}

/**
 * Represents a single ServiceNow connection target.
 *
 * Construct with a {@link ServiceNowSettingsInstance} settings object and pass
 * the result to any manager class that requires an {@link IServiceNowInstance}.
 *
 * @example
 * ```ts
 * const instance = new ServiceNowInstance({ host: 'https://dev.service-now.com', alias: 'dev' });
 * const apps = new ApplicationManager(instance);
 * ```
 */
export class ServiceNowInstance implements IServiceNowInstance {
	private readonly _host: string;
	private readonly _username: string;
	private readonly _alias: string;
	private readonly _isDefault: boolean;
	private readonly _password: string;
	private readonly _credential: Creds;

	constructor(settings?: ServiceNowSettingsInstance | null) {
		const s = settings ?? {};
		this._host = s.host ?? '';
		this._username = s.username ?? '';
		this._alias = s.alias ?? '';
		this._isDefault = s.isDefault ?? false;
		this._password = s.password ?? '';
		this._credential = s.credential!;
	}

	/** Returns `true` when this is the default/active instance. */
	isDefault(): boolean {
		return this._isDefault;
	}

	/** Fully-qualified hostname of the ServiceNow instance. */
	getHost(): string {
		return this._host;
	}

	/** Authenticated username for this instance. */
	getUserName(): string {
		return this._username;
	}

	/** Short alias used to identify this instance in the CLI credential store. */
	getAlias(): string {
		return this._alias;
	}

	/** Plain-text password. Prefer {@link credential} when available. */
	getPassword(): string {
		return this._password;
	}

	/** SDK credential object resolved from the CLI credential store. */
	get credential(): Creds {
		return this._credential;
	}
}