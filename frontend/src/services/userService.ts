import api from '../lib/api';
import type { User } from '../types';

export const createUser = (payload: {
  id: string;
  full_name: string;
  email: string;
  role: string;
}) => api.post<User>('/users', payload).then((r) => r.data);

export const getMe = () =>
  api.get<User>('/users/me').then((r) => r.data);

export const updateMe = (payload: { full_name?: string; phone_number?: string }) =>
  api.patch<User>('/users/me', payload).then((r) => r.data);

export const getUserById = (id: string) =>
  api.get<User>(`/users/${id}`).then((r) => r.data);
