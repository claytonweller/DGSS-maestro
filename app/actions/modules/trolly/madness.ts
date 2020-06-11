import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function trollyMadnessAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id }: { performance_id: number } = body.params;

  // First it does the lockedMadnessQuestions in order
  // Once those are complete it does the randomMadnessQuestions... randomly
  // If it makes it through all questions it should activate the finish function

  // NOTE: It doesn't send out any messages of its own at the end.

  const payload: IMessagePayload = {
    action: 'trolly-choice-made',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
