import React from 'react';
import styled from 'styled-components';
import { AlertCircle } from 'lucide-react';

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 20px;
  padding: 16px 20px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ErrorIcon = styled(AlertCircle)`
  color: #d32f2f;
  flex-shrink: 0;
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 14px;
  line-height: 1.4;
`;

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <ErrorContainer>
      <ErrorIcon size={20} />
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
}

export default ErrorMessage;
