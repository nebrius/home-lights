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
const path_1 = require("path");
const rvl_node_1 = require("rvl-node");
const express = require("express");
const body_parser_1 = require("body-parser");
const WEB_SERVER_PORT = 80;
const RAVER_LIGHTS_INTERFACE = 'Loopback Pseudo-Interface 1';
const RAVER_LIGHTS_CHANNEL = 0;
var AnimationType;
(function (AnimationType) {
    AnimationType[AnimationType["Solid"] = 0] = "Solid";
    AnimationType[AnimationType["Cycle"] = 1] = "Cycle";
})(AnimationType || (AnimationType = {}));
const rvl = new rvl_node_1.RVL({
    networkInterface: RAVER_LIGHTS_INTERFACE,
    port: 4978,
    mode: 'controller',
    logLevel: 'debug',
    channel: RAVER_LIGHTS_CHANNEL
});
rvl.on('initialized', () => {
    rvl.start();
    const app = express();
    app.use(express.static(path_1.join(__dirname, '..', '..', 'public')));
    app.use(body_parser_1.json());
    let power = true;
    let brightness = 8;
    let type = AnimationType.Solid;
    let hue = 0;
    let saturation = 255;
    let rate = 1;
    function updateAnimation() {
        switch (type) {
            case AnimationType.Solid:
                console.log(`Updating solid animation with hue=${hue} and saturation=${saturation}`);
                break;
            case AnimationType.Cycle:
                console.log(`Updating cycle animation with rate=${rate}`);
                break;
        }
    }
    app.post('/api/power', (req, res) => {
        power = req.body.power;
        console.log(`Setting power to ${power ? 'on' : 'off'}`);
        updateAnimation();
        res.send({ status: 'ok' });
    });
    app.post('/api/brightness', (req, res) => {
        brightness = req.body.brightness;
        console.log(`Setting brightness to ${brightness}`);
        updateAnimation();
        res.send({ status: 'ok' });
    });
    app.post('/api/solid-animation', (req, res) => {
        type = AnimationType.Solid;
        hue = req.body.hue;
        saturation = req.body.saturation;
        console.log(`Setting solid animation to ${brightness}`);
        updateAnimation();
        res.send({ status: 'ok' });
    });
    app.post('/api/cycle-animation', (req, res) => {
        type = AnimationType.Cycle;
        rate = req.body.rate;
        console.log(`Setting cycle animation to ${brightness}`);
        updateAnimation();
        res.send({ status: 'ok' });
    });
    app.listen(WEB_SERVER_PORT, () => {
        console.log(`Home Lights server running on port ${WEB_SERVER_PORT}!`);
    });
});
//# sourceMappingURL=index.js.map