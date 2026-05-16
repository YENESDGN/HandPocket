import api from '../lib/api';
import type { DeliveryRequest } from '../types';

export const getOpenTasks = () =>
  api.get<DeliveryRequest[]>('/tasks/open').then((r) => r.data);

export const getMyTasks = () =>
  api.get<DeliveryRequest[]>('/tasks/my').then((r) => r.data);

export const getTaskById = (id: string) =>
  api.get<DeliveryRequest>(`/tasks/${id}`).then((r) => r.data);

export const createTask = (payload: {
  package_description: string;
  pickup_address: string;
  delivery_address: string;
  weight_kg: number;
  open_time_multiplier: number;
  distance_km: number;
  estimated_time_mins: number;
  calculated_price: number;
  package_photo_url?: string;
}) => api.post<DeliveryRequest>('/tasks/', payload).then((r) => r.data);

export const acceptTask = (id: string) =>
  api.patch<DeliveryRequest>(`/tasks/${id}/accept`).then((r) => r.data);

export const updateTaskStatus = (id: string, status: 'picked_up' | 'delivered' | 'cancelled') =>
  api.patch<DeliveryRequest>(`/tasks/${id}/status`, { status }).then((r) => r.data);

export const setProofPhoto = (id: string, proofUrl: string) =>
  api.patch<DeliveryRequest>(`/tasks/${id}/proof`, { proof_url: proofUrl }).then((r) => r.data);

export const verifyTask = (id: string) =>
  api.patch<DeliveryRequest>(`/tasks/${id}/verify`).then((r) => r.data);
