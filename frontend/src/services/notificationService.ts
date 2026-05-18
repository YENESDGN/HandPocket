import api from '../lib/api';
import type { AppNotification } from '../types';

export const getNotifications = (limit = 50) =>
  api.get<AppNotification[]>('/notifications/', { params: { limit } }).then((r) => r.data);

export const getUnreadCount = () =>
  api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count);

export const markRead = (id: string) =>
  api.patch<AppNotification>(`/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () =>
  api.post<{ updated: number }>('/notifications/read-all').then((r) => r.data);
