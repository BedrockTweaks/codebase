import { Message } from './common';

export interface Pack {
  id: string;
  name: string;
  description: string;
  message?: Message;
  version: string;
  incompatibilities: string[];
  disabled?: boolean;
}
