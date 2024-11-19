// store/loaderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoaderState {
  isLoading: boolean;
  message?: string;
}

const initialState: LoaderState = {
  isLoading: false,
  message: undefined
};

export const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state, action: PayloadAction<string | undefined>) => {
      state.isLoading = true;
      state.message = action.payload;
    },
    hideLoader: (state) => {
      state.isLoading = false;
      state.message = undefined;
    }
  }
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
