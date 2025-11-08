export interface ChatActions {
  show(): void;
  hide(): void;
  open(): void;
  setUser(name: string, email: string): void;
  sendMessage?(message: string): void;
}

export interface TawkToConfig {
  propertyId: string;
  widgetId: string;
}

export interface IntercomConfig {
  appId: string;
}

export interface CrispConfig {
  websiteId: string;
}
