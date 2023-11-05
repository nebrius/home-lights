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

import { ZonesTab, ZonesTabProps, ZonesTabDispatch } from './zonesTab';
import { ActionType } from '../../common/actions';
import { createContainer } from '../../reduxology';
import { SliceName } from '../../types';

export const ZonesTabContainer = createContainer<
  ZonesTabProps,
  ZonesTabDispatch
>(
  (getSlice) => ({
    zones: getSlice(SliceName.Zones),
    state: getSlice(SliceName.SystemState),
    scenes: getSlice(SliceName.Scenes).scenes
  }),
  (dispatch) => ({
    deleteZone(id) {
      dispatch(ActionType.DeleteZone, { id });
    },
    setZonePower(zoneId, power) {
      dispatch(ActionType.SetZonePower, { zoneId, power });
    },
    setZoneBrightness: (zoneId, sceneId, brightness) => {
      dispatch(ActionType.SetZoneBrightness, { zoneId, sceneId, brightness });
    }
  }),
  ZonesTab
);
