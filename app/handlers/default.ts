import { manageEvent } from '../actions';
import { AWSMessager } from '../actions/messager';

export const handler = async (event) => {
  await manageEvent(event, AWSMessager);
  return {
    statusCode: 200,
  };
};
