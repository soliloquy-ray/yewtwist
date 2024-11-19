// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import loaderReducer from './loaderSlice';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    // ... other reducers
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
