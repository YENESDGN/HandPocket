import api from '../lib/api';
import type { WalletSummary } from '../types';

export const getWalletSummary = () =>
  api.get<WalletSummary>('/wallet/').then((r) => r.data);

export const deposit = (amount: number) =>
  api.post<{ balance: number }>('/wallet/deposit', { amount }).then((r) => r.data);

export const withdraw = (amount: number) =>
  api.post<{ balance: number }>('/wallet/withdraw', { amount }).then((r) => r.data);
