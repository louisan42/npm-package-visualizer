import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows, typography, breakpoints } from '../../theme/constants';

// Container components
export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${spacing.xl};
`;

export const Panel = styled.div`
  background: ${colors.white};
  border-radius: ${borderRadius.xl};
  padding: ${spacing.xl};
  box-shadow: ${shadows.medium};
  ${props => props.height && `height: ${props.height};`}
  ${props => props.minHeight && `min-height: ${props.minHeight};`}
`;

export const Card = styled.div`
  background: ${colors.white};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  box-shadow: ${shadows.light};
  margin-bottom: ${spacing.lg};
`;

// Typography components
export const Title = styled.h1`
  color: ${colors.white};
  font-size: ${typography.fontSizes.xxxl};
  margin-bottom: ${spacing.sm};
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  text-align: center;
`;

export const Subtitle = styled.p`
  color: rgba(255,255,255,0.8);
  font-size: ${typography.fontSizes.xl};
  margin: 0;
  text-align: center;
`;

export const SectionTitle = styled.h3`
  color: ${colors.dark};
  font-size: ${typography.fontSizes.lg};
  margin-bottom: ${spacing.sm};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

export const Label = styled.span`
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.muted};
`;

export const Value = styled.span`
  color: ${colors.dark};
  text-align: right;
  flex: 1;
  margin-left: ${spacing.sm};
`;

// Layout components
export const Grid = styled.div`
  display: grid;
  gap: ${props => props.gap || spacing.lg};
  ${props => props.columns && `grid-template-columns: ${props.columns};`}
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  ${props => props.direction && `flex-direction: ${props.direction};`}
  ${props => props.align && `align-items: ${props.align};`}
  ${props => props.justify && `justify-content: ${props.justify};`}
  ${props => props.gap && `gap: ${props.gap};`}
  ${props => props.wrap && `flex-wrap: ${props.wrap};`}
`;

// Interactive components
export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => {
    switch (props.variant) {
      case 'danger': return colors.danger;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  }};
  color: ${colors.white};
  text-decoration: none;
  border: none;
  border-radius: ${borderRadius.sm};
  font-size: ${typography.fontSizes.sm};
  font-weight: ${typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'danger': return '#c82333';
        case 'success': return '#218838';
        case 'warning': return '#e0a800';
        default: return colors.primaryDark;
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.primary};
  color: ${colors.white};
  text-decoration: none;
  border-radius: ${borderRadius.sm};
  font-size: ${typography.fontSizes.sm};
  font-weight: ${typography.fontWeights.medium};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${colors.primaryDark};
  }
`;

// Form components
export const Input = styled.input`
  width: 100%;
  padding: ${spacing.lg} ${spacing.xl};
  font-size: ${typography.fontSizes.lg};
  border: none;
  border-radius: ${borderRadius.xl};
  background: ${colors.white};
  box-shadow: ${shadows.light};
  outline: none;
  transition: box-shadow 0.3s ease;

  &:focus {
    box-shadow: ${shadows.heavy};
  }

  &::placeholder {
    color: ${colors.muted};
  }
`;

// Status components
export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: ${typography.fontSizes.sm};
  color: ${props => {
    switch (props.status) {
      case 'compatible': return colors.compatible;
      case 'incompatible': return colors.incompatible;
      case 'warning': return colors.warning;
      default: return colors.unknown;
    }
  }};
`;

export const Badge = styled.span`
  display: inline-block;
  background: ${props => {
    switch (props.variant) {
      case 'danger': return colors.danger;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.light;
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'danger':
      case 'success':
      case 'info': return colors.white;
      default: return colors.dark;
    }
  }};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSizes.sm};
  font-weight: ${typography.fontWeights.medium};
  margin: ${spacing.xs};
`;

export const Tag = styled.span`
  display: inline-block;
  background: ${colors.light};
  color: ${colors.dark};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSizes.sm};
  margin: ${spacing.xs};
`;

// Info components
export const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.light};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.md};
  ${props => props.borderLeft && `border-left: 4px solid ${props.borderLeft};`}
`;

export const CountItem = styled.div`
  text-align: center;
  padding: ${spacing.md};
  background: ${colors.light};
  border-radius: ${borderRadius.md};
`;

export const CountNumber = styled.div`
  font-size: ${typography.fontSizes.xxl};
  font-weight: ${typography.fontWeights.bold};
  color: ${colors.primary};
`;

export const CountLabel = styled.div`
  font-size: ${typography.fontSizes.sm};
  color: ${colors.muted};
  margin-top: ${spacing.xs};
`;

// Loading and error states
export const LoadingMessage = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.muted};
`;

export const ErrorMessage = styled.div`
  background: ${colors.danger};
  color: ${colors.white};
  padding: ${spacing.lg};
  border-radius: ${borderRadius.lg};
  margin: ${spacing.lg} 0;
  text-align: center;
`;

// Utility components
export const Divider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: ${spacing.lg} 0;
`;

export const Spacer = styled.div`
  ${props => props.height && `height: ${props.height};`}
  ${props => props.width && `width: ${props.width};`}
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
