import { bootcampFactAction } from './fact';
import { bootcampLogoAction } from './logo';
import { bootcampMetricAction } from './metric';
import { bootcampStartTestAction } from './startTest';
import { bootcampEndTestAction } from './endTest';

export const bootcampActionHash = {
  'bootcamp-start-test': bootcampStartTestAction,
  'bootcamp-get-fact': bootcampFactAction,
  'bootcamp-get-metric': bootcampMetricAction,
  'bootcamp-to-logo': bootcampLogoAction,
  'bootcamp-end-test': bootcampEndTestAction,
};
