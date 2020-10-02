"use strict";
/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of Home Lights.

Home Lights is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Home Lights is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Home Lights.  If not, see <http://www.gnu.org/licenses/>.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const node_hue_api_1 = require("node-hue-api");
const config_1 = require("../common/config");
let authenticatedApi;
async function init() {
    const bridgeIP = await discoverBridge();
    if (bridgeIP) {
        const username = await discoverOrCreateUser(bridgeIP);
        authenticatedApi = await node_hue_api_1.v3.api.createLocal(bridgeIP).connect(username);
        console.log(authenticatedApi);
        console.log('Phillips Hue devices initialized');
    }
    else {
        console.log('No Philips Hue bridges found, calls to set state on Philips Hue lights will be ignored');
    }
}
exports.init = init;
async function discoverBridge() {
    const bridges = await node_hue_api_1.v3.discovery.nupnpSearch();
    if (bridges.length === 0) {
        return null;
    }
    else {
        return bridges[0].ipaddress;
    }
}
async function discoverOrCreateUser(bridgeIP) {
    // Create an unauthenticated instance of the Hue API so that we can create a new user
    const unauthenticatedApi = await node_hue_api_1.v3.api.createLocal(bridgeIP).connect();
    // Check if the user has been created already, and if so return it
    const users = await unauthenticatedApi.users.getUserByName(config_1.PHILIPS_HUE_APP_NAME, config_1.PHILIPS_HUE_DEVICE_NAME);
    if (users.length) {
        return users[0].username;
    }
    // Otherwise we need to create the user
    console.log(`Philips Hue user "${config_1.PHILIPS_HUE_DEVICE_NAME}" not found, creating...`);
    let createdUser;
    try {
        createdUser = await unauthenticatedApi.users.createUser(config_1.PHILIPS_HUE_APP_NAME, config_1.PHILIPS_HUE_DEVICE_NAME);
    }
    catch (e) {
        if (e.getHueErrorType() === 101) {
            console.error('The Link button on the bridge was not pressed. Please press the Link button and try again.');
        }
        else {
            throw e;
        }
    }
    return createdUser.username;
}
//# sourceMappingURL=phillipsHue.js.map