import { dbConnection } from '../../db'
import { manageEvent } from '../actions';
import { AWSMessager } from "../actions/messager";

export const handler = async event => {
  await dbConnection()
  await manageEvent(event, AWSMessager)

  return {
    statusCode: 200,
  };
}

