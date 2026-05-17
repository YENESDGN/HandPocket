import api from '../lib/api';

export interface LocationPin {
  id: string;
  task_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const postLocation = (task_id: string, latitude: number, longitude: number) =>
  api.post<LocationPin>('/locations/', { task_id, latitude, longitude }).then((r) => r.data);

export const getLatestLocation = (task_id: string) =>
  api.get<LocationPin>(`/locations/${task_id}/latest`).then((r) => r.data);
