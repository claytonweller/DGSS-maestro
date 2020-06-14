import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, ModuleInstance, Interaction, Audience } from '../../../../db';

export async function trollyQuestionAction(actionElements: IActionElements) {
  const {
    performance_id,
    options,
    currentModule,
  }: { performance_id: number; options: IQuestionOptions; currentModule } = actionElements.body.params;

  const [connections, audiences, moduleInstances] = await Promise.all([
    Connection.getAll(performance_id),
    Audience.getByParam({ performance_id }),
    ModuleInstance.getByParam({ id: currentModule.instance.id }),
  ]);

  const baseInstance: { state: ITrollyModuleState; id: number } = moduleInstances[0];
  const ids = separateIds(connections);
  const { timer } = options;
  const matchedQuestion = findMatchedQuestion(baseInstance, options);

  if (baseInstance.state.timer) {
    await closeQuestion(baseInstance, ids.allAwsConnectionIds, actionElements);
  }

  if (timer && !matchedQuestion) {
    await updateCurrentQuestion(ids, options, baseInstance, actionElements, audiences);
    const finalInsatnce: { id: number; state: ITrollyModuleState } = (
      await ModuleInstance.getByParam({ id: currentModule.instance.id })
    )[0];

    if (finalInsatnce.state.timer && timer < 10000) {
      await closeQuestion(finalInsatnce, ids.allAwsConnectionIds, actionElements, true);
    }

    // TODO these will apply with Trolly-Madness
    // Check module instance for finish state
    // If finish returns a flag saying there should be no more questions
    // if not finish returns flag saying we should move to the next question.
  } else {
    await displayClosedQuestion(matchedQuestion, baseInstance, actionElements, ids.allAwsConnectionIds);
  }
}

/////

function separateIds(connections): { allAwsConnectionIds: string[]; attendeeIds: number[] } {
  return connections.reduce(
    (ids, c) => {
      if (c.attendee_id) {
        ids.attendeeIds.push(c.attendee_id);
      }
      ids.allAwsConnectionIds.push(c.aws_connection_id);
      return ids;
    },
    { allAwsConnectionIds: [], attendeeIds: [] }
  );
}

function findMatchedQuestion(baseInstance, options): ICurrentQuestion {
  return baseInstance.state.pastQuestions.filter((q) => {
    const compared = q.default.text + q.alternative.text;
    const selected = options.question.default.text + options.question.alternative.text;
    return compared === selected;
  })[0];
}

async function updateCurrentQuestion(ids, options, baseInstance, actionElements, audiences) {
  const { messager, sockets, event, body } = actionElements;
  const { id: instanceId } = body.params.currentModule.instance;
  const { timer } = options;
  const { attendeeIds, allAwsConnectionIds } = ids;

  const currentQuestion = {
    default: { ...options.question.default, count: attendeeIds.length },
    alternative: { ...options.question.alternative, count: 0 },
  };
  const state = { ...baseInstance.state, currentQuestion, timer };
  const showPayload: IMessagePayload = {
    action: 'trolly-show-question',
    params: state,
  };

  const timerPromise = timer < 10000 ? new Promise((resolve) => setTimeout(resolve, timer)) : null;
  await messager.sendToIds({ ids: allAwsConnectionIds, event, payload: showPayload }, sockets);
  await Promise.all([
    ModuleInstance.update(instanceId, { state }),
    createDefaultChoices(attendeeIds, audiences, actionElements),
    timerPromise,
  ]);
}

async function createDefaultChoices(attendeeIds: number[], audiences, actionElements: IActionElements) {
  const { body } = actionElements;
  const {
    performance_id,
    options,
    currentModule,
  }: { performance_id: number; options: IQuestionOptions; currentModule } = body.params;

  const interactionParams = {
    module_instance_id: currentModule.instance.id,
    performance_id,
    audience_id: audiences[0].id,
    module_id: currentModule.instance.module_id,
    response: options.question.default.text,
    prompt: `${options.question.default.text} or ${options.question.alternative.text}?`,
  };

  await Promise.all([Interaction.createMany(attendeeIds, interactionParams)]);
}

async function closeQuestion(
  moduleInstance: { id: number; state: ITrollyModuleState },
  allAwsConnectionIds: string[],
  actionElements: IActionElements,
  shouldSendMessage?: boolean
) {
  const { messager, sockets, event } = actionElements;
  const { state } = moduleInstance;
  state.timer = null;
  state.pastQuestions.push(state.currentQuestion);
  const payload: IMessagePayload = {
    action: 'trolly-close-question',
    params: state,
  };

  const messagePromise = shouldSendMessage
    ? messager.sendToIds({ ids: allAwsConnectionIds, event, payload }, sockets)
    : null;

  await Promise.all([ModuleInstance.update(moduleInstance.id, { state: JSON.stringify(state) }), messagePromise]);
}

async function displayClosedQuestion(
  matchedQuestion: ICurrentQuestion,
  baseInstance,
  actionElements: IActionElements,
  allAwsConnectionIds: string[]
) {
  const { messager, sockets, event, body } = actionElements;
  const { id: instanceId } = body.params.currentModule.instance;
  baseInstance.state.currentQuestion = matchedQuestion;
  const payload: IMessagePayload = {
    action: 'trolly-show-question',
    params: baseInstance.state,
  };
  await Promise.all([
    messager.sendToIds({ ids: allAwsConnectionIds, event, payload }, sockets),
    ModuleInstance.update(instanceId, {
      state: JSON.stringify(baseInstance.state),
    }),
  ]);
}

interface IQuestionOptions {
  question: ITrollyQuestion;
  timer?: number; //miliseconds
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

export interface ICurrentQuestion {
  default: ICurrentOption;
  alternative: ICurrentOption;
}

export interface ICurrentOption extends ITrollyOption {
  count: number;
}

export interface ITrollyModuleState {
  pastQuestions: ICurrentQuestion[];
  currentQuestion: ICurrentQuestion;
  timer?: number | null;
}
