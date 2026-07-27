import { Message } from './common';

export interface Pack {
  id: string;
  name: string;
  description: string;
  message?: Message;
  version: string;
  incompatibilities: string[];
  disabled?: boolean;
  /** Resolved server-side from disk; absent when the pack ships no icon. */
  iconExtension?: 'png' | 'gif';
}
