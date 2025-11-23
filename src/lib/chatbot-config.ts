import { env } from '@/config/env';

// ✅ Define the type directly instead of deriving it from the component
export type ChatbotBusinessType = 
  | 'ecommerce' 
  | 'saas' 
  | 'realestate' 
  | 'healthcare' 
  | 'education' 
  | 'hospitality' 
  | 'finance' 
  | 'support';

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
