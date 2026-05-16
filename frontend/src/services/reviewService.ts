import api from '../lib/api';
import type { Review } from '../types';

export const createReview = (payload: {
  request_id: string;
  reviewee_id: string;
  score: number;
  comment?: string;
}) => api.post<Review>('/reviews/', payload).then((r) => r.data);

export const getReviewsForUser = (user_id: string) =>
  api.get<Review[]>(`/reviews/user/${user_id}`).then((r) => r.data);
