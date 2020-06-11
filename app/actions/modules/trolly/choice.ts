import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function trollyChoiceAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, choice }: { performance_id: number; choice: ITrollyChoice } = body.params;
  console.warn(choice);

  // Get the display connection
  // Create an interaction
  // update the moduleSate with the new value
  // Send updated moduleState to display
  // Send confirmation to chooser

  const payload: IMessagePayload = {
    action: 'trolly-choice-made',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}

interface ITrollyChoice {
  defaut: { text: string; chosen: boolean };
  alternative: { text: string; chosen: boolean };
  intentional: boolean; // Whether the choice is intentional or by them not selecting anything
}
