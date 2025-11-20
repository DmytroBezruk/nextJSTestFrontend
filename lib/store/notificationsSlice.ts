import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info';
export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: number; // epoch ms
  durationMs: number; // how long to show
}

interface NotificationsState {
  queue: NotificationItem[]; // includes current and pending
  currentId: string | null; // id of currently displayed
}

const initialState: NotificationsState = {
  queue: [],
  currentId: null,
};

// We will rotate currentId when its duration expires (handled by component timer)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    pushNotification: {
      prepare: (message: string, type: NotificationType = 'info', durationMs: number = 10000) => ({
        payload: { id: nanoid(), message, type, createdAt: Date.now(), durationMs } as NotificationItem,
      }),
      reducer: (state, action: PayloadAction<NotificationItem>) => {
        state.queue.push(action.payload);
        if (!state.currentId) {
          state.currentId = action.payload.id;
        }
      },
    },
    dismissCurrent: (state) => {
      if (!state.currentId) return;
      // remove current from queue
      state.queue = state.queue.filter(n => n.id !== state.currentId);
      // set next if exists
      state.currentId = state.queue.length ? state.queue[0].id : null;
    },
    dismissById: (state, action: PayloadAction<string>) => {
      const wasCurrent = action.payload === state.currentId;
      state.queue = state.queue.filter(n => n.id !== action.payload);
      if (wasCurrent) {
        state.currentId = state.queue.length ? state.queue[0].id : null;
      }
    },
    clearAll: (state) => {
      state.queue = [];
      state.currentId = null;
    },
  },
});

export const { pushNotification, dismissCurrent, dismissById, clearAll } = notificationsSlice.actions;
export default notificationsSlice.reducer;

