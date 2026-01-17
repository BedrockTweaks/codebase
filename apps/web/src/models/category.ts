import { Message } from './common';
import type { Pack } from './pack';

export interface Category {
  id: string;
  name: string;
  packs: Pack[];
  message?: Message;
}
