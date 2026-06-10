import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DeliveryRequest } from '../types';

interface TaskCacheState {
  openTasks: DeliveryRequest[];
  myTasks: DeliveryRequest[];
  setOpenTasks: (tasks: DeliveryRequest[]) => void;
  setMyTasks: (tasks: DeliveryRequest[]) => void;
}

export const useTaskCache = create<TaskCacheState>()(
  persist(
    (set) => ({
      openTasks: [],
      myTasks: [],
      setOpenTasks: (tasks) => set({ openTasks: tasks }),
      setMyTasks: (tasks) => set({ myTasks: tasks }),
    }),
    {
      name: 'hp-task-cache',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
