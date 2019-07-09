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

import { readFileSync } from 'fs';
import { join } from 'path';
import { RVL } from 'rvl-node';
import {
  createWaveParameters,
  createSolidColorWave,
  createMovingWave,
  createPulsingWave,
  createColorCycleWave,
  createRainbowWave
} from 'rvl-node-animations';
import * as express from 'express';
import { json } from 'body-parser';
import { compile } from 'handlebars';

const WEB_SERVER_PORT = 80;
const RAVER_LIGHTS_INTERFACE = process.argv[2];
const RAVER_LIGHTS_CHANNEL = 0;

if (!RAVER_LIGHTS_INTERFACE) {
  throw new Error('A network interface must be passed as the one and only argument');
}

const indexViewTemplate = compile(readFileSync(join(__dirname, '..', '..', 'views', 'index.handlebars'), 'utf-8'));

const rvl = new RVL({
  networkInterface: RAVER_LIGHTS_INTERFACE,
  port: 4978,
  mode: 'controller',
  logLevel: 'debug',
  channel: RAVER_LIGHTS_CHANNEL
});

interface IStore {
  power: boolean;
  brightness: number;
  animationType: 'Rainbow' | 'Pulse' | 'Wave' | 'Color Cycle' | 'Solid';
  animationParameters: {
    rainbow: {
      rate: number;
    };
    pulse: {
      rate: number;
      hue: number;
      saturation: number;
    };
    wave: {
      rate: number;
      waveHue: number;
      foregroundHue: number;
      backgroundHue: number;
    };
    colorCycle: {
      rate: number;
    };
    solid: {
      hue: number;
      saturation: number;
    };
  };
}

rvl.on('initialized', () => {
  rvl.start();

  const app = express();

  app.use(express.static(join(__dirname, '..', '..', 'public')));
  app.use(json());

  let store: IStore = {
    power: true,
    brightness: 128,
    animationType: 'Wave',
    animationParameters: {
      rainbow: {
        rate: 4
      },
      pulse: {
        rate: 16,
        hue: 120,
        saturation: 255
      },
      wave: {
        rate: 8,
        waveHue: 0,
        foregroundHue: 170,
        backgroundHue: 85
      },
      colorCycle: {
        rate: 4
      },
      solid: {
        hue: 170,
        saturation: 255
      }
    }
  };

  function updateAnimation() {
    // If power is turned off, send a black color
    if (!store.power) {
      rvl.setWaveParameters(createWaveParameters(
        createSolidColorWave(0, 0, 0, 0)
      ));
      return;
    }
    switch (store.animationType) {
      case 'Rainbow':
        console.log(`Updating rainbow animation with rate=${store.animationParameters.colorCycle.rate}`);
        rvl.setWaveParameters(createWaveParameters(
          createRainbowWave(store.brightness, 255, store.animationParameters.rainbow.rate)
        ));
        break;
      case 'Pulse':
        console.log(`Updating pulse animation with rate=${store.animationParameters.colorCycle.rate} ` +
          `hue=${store.animationParameters.pulse.hue} ` +
          `saturation=${store.animationParameters.pulse.saturation}`);
        rvl.setWaveParameters(createWaveParameters(
          createPulsingWave(
            store.brightness,
            store.animationParameters.pulse.hue,
            store.animationParameters.pulse.saturation,
            store.animationParameters.pulse.rate
          )
        ));
        break;
      case 'Wave':
        console.log(`Updating wave animation with rate=${store.animationParameters.colorCycle.rate} ` +
          `waveHue=${store.animationParameters.wave.waveHue} ` +
          `foregroundHue=${store.animationParameters.wave.foregroundHue} ` +
          `backgroundHue=${store.animationParameters.wave.backgroundHue} `);
        rvl.setWaveParameters(createWaveParameters(
          createMovingWave(
            store.brightness,
            store.animationParameters.wave.waveHue,
            255,
            store.animationParameters.wave.rate,
            2
          ),
          createPulsingWave(
            store.brightness,
            store.animationParameters.wave.foregroundHue,
            255,
            store.animationParameters.wave.rate
          ),
          createSolidColorWave(
            store.brightness,
            store.animationParameters.wave.backgroundHue,
            255,
            255
          )
        ));
        break;
      case 'Color Cycle':
        console.log(`Updating color cycle animation with rate=${store.animationParameters.colorCycle.rate}`);
        rvl.setWaveParameters(createWaveParameters(
          createColorCycleWave(store.brightness, store.animationParameters.colorCycle.rate, 255)
        ));
        break;
      case 'Solid': {
        console.log(`Updating solid animation with hue=${store.animationParameters.solid.hue} ` +
          `saturation=${store.animationParameters.solid.saturation}`);
        rvl.setWaveParameters(createWaveParameters(
          createSolidColorWave(
            store.brightness,
            store.animationParameters.solid.hue,
            store.animationParameters.solid.saturation,
            255
          )
        ));
        break;
      }
    }
  }
  updateAnimation();

  app.get('/', (req, res) => {
    res.send(indexViewTemplate(store));
  });

  app.post('/api/animation', (req, res) => {
    store = req.body;
    updateAnimation();
    res.send({ status: 'ok' });
  });

  app.listen(WEB_SERVER_PORT, () => {
    console.log(`Home Lights server running on port ${WEB_SERVER_PORT}!`);
  });
});
