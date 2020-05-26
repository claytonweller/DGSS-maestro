import { crudify } from './index';

const TABLE_NAME = 'interactions';

export const Interaction = crudify(TABLE_NAME);

export interface IInteractionParams {
  module_instance_id: number;
  attendee_id: number;
  attendee_name: string;
  performance_id: number;
  audience_id: number;
  module_id: number;
  data: string;
  response: string;
  prompt: string;
}
