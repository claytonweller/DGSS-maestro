import { trollyTitleAction } from './title';
import { trollyQuestionAction } from './question';
import { trollyChoiceAction } from './choice';
import { trollyMadnessAction } from './madness';
import { trollyEndMadnessAction } from './end-madness';
import { trollyGridAction } from './grid';

export const trollyActionHash = {
  'trolly-title': trollyTitleAction, // Control
  'trolly-question': trollyQuestionAction, // Control + Internal
  'trolly-madness': trollyMadnessAction, // Control
  'trolly-choice': trollyChoiceAction, // Crowd
  'trolly-grid': trollyGridAction, // Control
  'trolly-end-madness': trollyEndMadnessAction, // Control + Internal
};
