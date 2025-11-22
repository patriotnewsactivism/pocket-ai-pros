import { type ComponentProps } from 'react';
import { AIChatbot } from '@/components/AIChatbot';
import { env } from '@/config/env';

export type ChatbotBusinessType = NonNullable<ComponentProps<typeof AIChatbot>['businessType']>;

export const SUPPORTED_BUSINESS_TYPES: ReadonlyArray<ChatbotBusinessType> = [
  'ecommerce',
  'saas',
  'realestate',
  'healthcare',
  'education',
  'hospitality',
  'finance',
  'support',
];

export const DEFAULT_BUSINESS_TYPE: ChatbotBusinessType = 'support';

const isChatbotBusinessType = (value: string): value is ChatbotBusinessType =>
  SUPPORTED_BUSINESS_TYPES.includes(value as ChatbotBusinessType);

export const resolveChatbotBusinessType = (
  value?: string,
  fallbackBusinessType: string = env.businessType,
): ChatbotBusinessType => {
  const candidate = value ?? fallbackBusinessType;
  return isChatbotBusinessType(candidate) ? candidate : DEFAULT_BUSINESS_TYPE;
};
