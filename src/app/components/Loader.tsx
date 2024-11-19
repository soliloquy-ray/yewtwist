import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { Modal, Spin } from 'antd';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
`;

const Message = styled.div`
  margin-top: 16px;
  text-align: center;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
`;

const Loader = () => {
  const { isLoading, message } = useSelector((state: RootState) => state.loader);

  return (
    <StyledModal
      open={isLoading}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={300}
    >
      <LoaderContainer>
        <Spin size="large" />
        {message && <Message>{message}</Message>}
      </LoaderContainer>
    </StyledModal>
  );
};

export default Loader;