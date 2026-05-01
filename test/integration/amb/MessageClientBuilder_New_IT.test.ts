// import amb from "./amb.js"
// import { adapt } from "cometd-nodejs-client";
// import Logger from "../../../build/src/sn/amb/Logger.js"
// const LOGGER = new Logger('index');

import { AMBClient } from "../../../src/sn/amb/AMBClient.js";
import { MessageClientBuilder } from "../../../src/sn/amb/MessageClientBuilder.js"



describe.skip('MessageClientBuilder', () => {
   
    describe('execute test', () => {
       

        xit('should return client', async () => {
            let builder:MessageClientBuilder = new MessageClientBuilder();
            let client:AMBClient = builder.createClient();
        })
    })
})