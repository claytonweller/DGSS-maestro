import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, ModuleInstance, Interaction, Audience } from '../../../../db';

export async function trollyQuestionAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const {
    performance_id,
    options,
    currentModule,
  }: { performance_id: number; options: IQuestionOptions; currentModule } = body.params;

  const [connections, audiences] = await Promise.all([
    Connection.getAll(performance_id),
    Audience.getByParam({ performance_id }),
    ModuleInstance.update(currentModule.instance.id, { state: JSON.stringify({ currentQuestion: options }) }),
  ]);

  const { allAwsConnectionIds, attendeeIds } = connections.reduce(
    (ids, c) => {
      if (c.attendee_id) {
        ids.attendeeIds.push(c.attendee_id);
      }
      ids.allAwsConnectionIds.push(c.aws_connection_id);
      return ids;
    },
    { allAwsConnectionIds: [], attendeeIds: [] }
  );

  if (options.openForChoices) {
    await openQuestion(attendeeIds, allAwsConnectionIds, audiences, actionElements);
  }

  if (options.timer) {
    await new Promise((resolve) => setTimeout(resolve, options.timer));
    const newOptions = { ...options, openForChoices: false };

    await ModuleInstance.update(currentModule.instance.id, {
      state: JSON.stringify({ currentQuestion: newOptions }),
    });

    const payload: IMessagePayload = {
      action: 'trolly-closed-question',
      params: newOptions,
    };

    await messager.sendToIds({ ids: allAwsConnectionIds, event, payload }, sockets);
  }
  // if timer
  // Wait until timer is done
  // send message ending responses to everyone

  // Check module instance for finish state
  // If finish returns a flag saying there should be no more questions
  // if not finish returns flag saying we should move to the next question.

  const payload: IMessagePayload = {
    action: 'trolly-show-question',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}

/////

async function openQuestion(
  attendeeIds: number[],
  allAwsConnectionIds: string[],
  audiences,
  actionElements: IActionElements
) {
  const { body, event, messager, sockets } = actionElements;
  const {
    performance_id,
    options,
    currentModule,
  }: { performance_id: number; options: IQuestionOptions; currentModule } = body.params;

  const payload: IMessagePayload = {
    action: 'trolly-open-question',
    params: options,
  };

  const interactionParams = {
    module_instance_id: currentModule.instance.id,
    performance_id,
    audience_id: audiences[0].id,
    module_id: currentModule.instance.module_id,
    response: options.question.default.text,
    prompt: `${options.question.default.text} or ${options.question.alternative.text}?`,
  };

  await Promise.all([
    Interaction.createMany(attendeeIds, interactionParams),
    messager.sendToIds({ event, payload, ids: allAwsConnectionIds }, sockets),
  ]);
}

interface IQuestionOptions {
  question: ITrollyQuestion;
  timer?: number; //miliseconds
  openForChoices?: boolean;
}

export interface ITrollyQuestion {
  default: ITrollyOption;
  alternative: ITrollyOption;
}

export interface ITrollyOption {
  text: string;
  imageUrl?: string;
  cannotSelect?: boolean;
}
