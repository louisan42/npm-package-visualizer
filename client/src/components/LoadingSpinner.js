import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007acc;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>{message}</LoadingText>
    </SpinnerContainer>
  );
}

export default LoadingSpinner;
