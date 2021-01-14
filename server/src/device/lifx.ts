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

import { discover, Device, LifxLanColorHSB } from 'node-lifx-lan';
import { MAX_BRIGHTNESS } from '../common/config';
import {
  ColorType,
  LIFXLight,
  LightType,
  PatternType,
  SolidPattern
} from '../common/types';
import { getItem } from '../common/util';
import { createLight, deleteLight, getLights } from '../db/lights';
import { SetLightStateOptions } from './types';

const devices: Device[] = [];

export async function init(): Promise<void> {
  console.log('Searching for LIFX lights...');
  devices.push(...(await discover()));

  console.log('Reconciling registered LIFX lights vs database');
  const dbLights = await getLights();

  // Add lights from LIFX that are not in the DB
  for (const light of devices) {
    if (
      !dbLights.find(
        (dbLight) =>
          dbLight.type === LightType.LIFX &&
          (dbLight as LIFXLight).lifxId === light.mac
      )
    ) {
      console.log(
        `Found LIFX light "${light.deviceInfo.label}" not in database, adding...`
      );
      const newLight: Omit<LIFXLight, 'id'> = {
        lifxId: light.mac,
        type: LightType.LIFX,
        name: light.deviceInfo.label
      };
      await createLight(newLight);
    }
  }

  // Delete lights from DB that are no longer in LIFX
  for (const dbLight of dbLights) {
    if (dbLight.type !== LightType.LIFX) {
      continue;
    }
    if (!devices.find((light) => light.mac === (dbLight as LIFXLight).lifxId)) {
      console.log(
        `LIFX light "${dbLight.name}" is no longer registered with the LIFX service, deleting...`
      );
      await deleteLight({ id: dbLight.id });
    }
  }
}

export async function setLightState({
  zoneState,
  scene,
  lights,
  patterns
}: SetLightStateOptions): Promise<void> {
  const zoneLights = lights.filter(
    (light) => light.zoneId === zoneState.zoneId
  );
  const promises: Promise<void>[] = [];
  for (const light of zoneLights) {
    if (light.type !== LightType.LIFX) {
      continue;
    }

    const device = getItem(
      (light as LIFXLight).lifxId,
      devices,
      (device) => device.mac === (light as LIFXLight).lifxId
    );

    // Handle the case of the light being turned off first and short circuit
    if (scene === undefined || !zoneState.power) {
      promises.push(
        device.turnOff({
          duration: 250
        })
      );
      continue;
    }
    const lightEntry = getItem(light.id, scene.lights, 'lightId');
    if (lightEntry.patternId === undefined) {
      promises.push(
        device.turnOff({
          duration: 250
        })
      );
      continue;
    }

    let color: LifxLanColorHSB = {
      hue: 0,
      saturation: 0,
      brightness: 0
    };
    if (lightEntry.patternId !== undefined) {
      const pattern = getItem(lightEntry.patternId, patterns) as SolidPattern;
      if (pattern.type !== PatternType.Solid) {
        throw new Error(
          `Internal Error: pattern type ${pattern.type} cannot be used with LIFX`
        );
      }
      if (pattern.data.color.type === ColorType.HSV) {
        color = {
          hue: pattern.data.color.hue / 360,
          saturation: pattern.data.color.saturation,
          brightness:
            (lightEntry.brightness / MAX_BRIGHTNESS) *
            (scene.brightness / MAX_BRIGHTNESS)
        };
      } else {
        color = {
          hue: 0,
          saturation: 0,
          kelvin: pattern.data.color.temperature,
          brightness:
            (lightEntry.brightness / MAX_BRIGHTNESS) *
            (scene.brightness / MAX_BRIGHTNESS)
        };
      }
    }
    promises.push(device.turnOn({ color, duration: 250 }));
  }
  await Promise.all(promises);
}
