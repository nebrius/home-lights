/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of Home Patterns.

Home Patterns is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Home Patterns is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Home Patterns.  If not, see <http://www.gnu.org/licenses/>.
*/

import { FastifyInstance } from 'fastify';
import { createPattern, editPattern, deletePattern } from '../db/patterns';
import { post, put, del } from './endpoint';

export function init(app: FastifyInstance): void {
  app.post('/api/patterns', post(createPattern));
  app.put('/api/pattern/:id', put(editPattern));
  app.delete('/api/pattern/:id', del(deletePattern));
}
