import api from '../lib/api';
import type { Dispute } from '../types';

export const createDispute = (payload: { request_id: string; reason: string }) =>
  api.post<Dispute>('/disputes/', payload).then((r) => r.data);

export const getAllDisputes = () =>
  api.get<Dispute[]>('/disputes/').then((r) => r.data);

export const resolveDispute = (id: string) =>
  api.patch<Dispute>(`/disputes/${id}/resolve`).then((r) => r.data);
