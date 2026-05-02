import { NowSDKAuthenticationHandler } from "../../../src/auth/NowSDKAuthenticationHandler.js";
import { IAuthenticationHandler } from "../../../src/auth/IAuthenticationHandler.js";
import { ServiceNowInstance, ServiceNowSettingsInstance } from "../../../src/sn/ServiceNowInstance.js";
import { getCredentials } from "@servicenow/sdk-cli/dist/auth/index.js";
import { SN_INSTANCE_ALIAS } from '../../test_utils/test_config.js';



describe("NowSDKAuthenticationHandler", () => {

	let instance: ServiceNowInstance;
	let credential: any;

	beforeEach(async () => {

		credential = await getCredentials(SN_INSTANCE_ALIAS);

		if (credential) {
			const snSettings: ServiceNowSettingsInstance = {
				alias: SN_INSTANCE_ALIAS,
				credential: credential
			}
			instance = new ServiceNowInstance(snSettings);
		}
	});



	it("login should return session", async () => {
		const auth: IAuthenticationHandler = new NowSDKAuthenticationHandler(instance);
		const session = await auth.doLogin();

		expect(session).not.toBeNull();
		expect(session?.cookie).not.toBeNull();
		expect((await session?.cookie?.getCookies(credential.instanceUrl))?.length).toBeGreaterThan(0);

	}, 30000);

});
