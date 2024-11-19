import { useDispatch } from 'react-redux';
import { showLoader, hideLoader } from '@/app/store/loaderSlice';

export const useLoader = () => {
  const dispatch = useDispatch();

  const show = (message?: string) => {
    dispatch(showLoader(message));
  };

  const hide = () => {
    dispatch(hideLoader());
  };

  return { show, hide };
};