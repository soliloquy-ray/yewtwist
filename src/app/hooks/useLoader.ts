'use client';

import { useAppDispatch } from '@/app/store/hooks';
import { showLoader, hideLoader } from '@/app/store/loaderSlice';

export const useLoader = () => {
  const dispatch = useAppDispatch();

  const show = (message?: string) => {
    dispatch(showLoader(message));
  };

  const hide = () => {
    dispatch(hideLoader());
  };

  return { show, hide };
};