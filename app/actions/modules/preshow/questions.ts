interface IQuestion {
  core?: boolean;
  text: string;
  responseType: string;
  buttonText?: string;
  choices?: string[];
  min?: number;
  max?: number;
  display: string;
}

interface ICoreQuestion extends IQuestion {
  column: string;
}

export const coreQuestions: ICoreQuestion[] = [
  {
    // TODO maybe some parsing logic to change this to datetime?
    column: 'time_constraint',
    text: "Are you on a time constraint? What's the longest you'd like this to run?",
    responseType: 'multiple-choice',
    choices: ['1 Hour', '1.5 Hours', '2 Hours', 'All night!'],
    display: '_NAME_ would like to this show to last _RESPONSE_',
  },
  {
    column: 'expectations',
    text: 'What do you expect to get out of this evening?',
    responseType: 'text',
    buttonText: 'Interesting',
    display: '_NAME_ is expecting _RESPONSE_',
  },
  // {
  //   // TODO I'll probably have to add in some logic around this.
  //   column: "group_name",
  //   text:
  //     "Did you come with a group? If so, talk to everyone and pick a code name. You all should enter it",
  //   responseType: "text",
  //   buttonText: "Send",
  // },
  {
    column: 'new_people',
    text: 'How do you feel about meeting new people?',
    responseType: 'multiple-choice',
    choices: ['Great', 'Good', 'Fine', 'No thanks'],
    display: 'Meeting new people? _NAME_ says, "_RESPONSE_"',
  },
  {
    column: 'new_things',
    text: 'How do you feel about trying new things?',
    responseType: 'multiple-choice',
    choices: ['Bring it on', 'Good', 'Fine', 'No thanks'],
    display: 'Trying new things? _NAME_ says, "_RESPONSE_"',
  },
  {
    column: 'center_of_attention',
    text: 'How do you feel about being the center of attention?',
    responseType: 'multiple-choice',
    choices: ['Great', 'Good', 'Fine', "Don't even look at me"],
    display: 'Being in the limelight? _NAME_ says, "_RESPONSE_"',
  },
  {
    column: 'tech_savvy',
    text: 'How comfortable with technology are you?',
    responseType: 'multiple-choice',
    choices: ['Very', 'Some', 'A Little', 'Can I send a letter?'],
    display: '_NAME_ is _RESPONSE_ comfortable with techonology',
  },
];

export const trivialQuestions: IQuestion[] = [
  {
    text: 'Where were you born?',
    responseType: 'text',
    buttonText: 'More or less',
    display: '_NAME_ was born in _RESPONSE_',
  },
  {
    text: "What's your spirit animal?",
    responseType: 'text',
    buttonText: 'Release',
    display: 'On the inside, _NAME_ is a _RESPONSE_',
  },
  {
    text: "What's your sign?",
    responseType: 'text',
    buttonText: 'Yup',
    display: '_NAME_ is a _RESPONSE_',
  },
  {
    text: 'What is a great Book?',
    responseType: 'text',
    buttonText: 'So Good',
    display: '_NAME_ recommends you read _RESPONSE_',
  },
  {
    text: 'What is a wonderful Movie?',
    responseType: 'text',
    buttonText: 'Classic',
    display: '_NAME_ thinks you should watch _RESPONSE_',
  },
  {
    text: 'Favorite flavor of icecream?',
    responseType: 'text',
    buttonText: 'Delish',
    display: "_RESPONSE_ is _NAME_'s favorite icecream",
  },
  {
    text: 'How many siblings do you have?',
    responseType: 'number',
    min: 0,
    max: 12,
    display: '_NAME_ has _RESPONSE_ siblings',
  },
  {
    text: 'Number of living grandparents?',
    responseType: 'number',
    min: 0,
    max: 8,
    display: '_NAME_ has _RESPONSE_ living grandparents',
  },
  {
    text: 'Number of children?',
    responseType: 'number',
    min: 0,
    max: 12,
    display: '_NAME_ has _RESPONSE_ kids',
  },
  {
    text: 'How many years have you been alive?',
    responseType: 'number',
    min: 0,
    max: 120,
    display: '_NAME_ has been around _RESPONSE_ years',
  },
  {
    text: "What's your job? (Or what do you spend your days doing?)",
    responseType: 'text',
    display: 'Need a _RESPONSE_? Talk to _NAME_',
  },
  {
    text: 'Name of a pet?',
    responseType: 'text',
    buttonText: 'Good Name',
    display: "_RESPONSE_ is _NAME_'s animal buddy",
  },
  {
    text: 'Last place you went on vacation?',
    responseType: 'text',
    buttonText: 'Classic',
    display: '_NAME_ went to _RESPONSE_ recently',
  },
  {
    text: "Where the furthest you've ever traveled?",
    responseType: 'text',
    buttonText: 'So Exotic',
    display: '_NAME_ has been all the way to _RESPONSE_',
  },
  {
    text: 'Name of your first crush?',
    responseType: 'text',
    buttonText: 'Cute',
    display: 'I wonder if _RESPONSE_ thinks about _NAME_',
  },
  {
    text: 'What is a food you find delicious?',
    responseType: 'text',
    buttonText: 'Yum',
    display: 'Go get some _RESPONSE_ with _NAME_ sometime',
  },
  {
    text: 'What Holiday do you most look forward to?',
    responseType: 'text',
    buttonText: 'Fun',
    display: "_RESPONSE_ can't come soon enough for _NAME_",
  },
  {
    text: 'Which of these is most appealing to you?',
    responseType: 'multiple-choice',
    choices: ['Salty', 'Sweet', 'Sour', 'Savory'],
    display: '_NAME_ prefers _RESPONSE_ food',
  },
  {
    text: "What's on your mind?",
    responseType: 'text',
    buttonText: 'Thanks for telling',
    display: '"_RESPONSE_" - _NAME_',
  },
  {
    text: "What's something you're proud of?",
    responseType: 'text',
    buttonText: 'Congrats',
    display: '_NAME_ should be proud becuse, _RESPONSE_',
  },
  {
    text: 'Any advice?',
    responseType: 'text',
    buttonText: 'Nice',
    display: '"_RESPONSE_" - _NAME_',
  },
  {
    text: 'Would you rather be:',
    responseType: 'multiple-choice',
    choices: ['Too Hot', 'Too Cold'],
    display: '_NAME_ would prefer _RESPONSE_ to the alternative',
  },
  {
    text: 'How did you get here?',
    responseType: 'multiple-choice',
    choices: ['Car', 'Bike', 'Walk', 'Boat?'],
    display: '_NAME_ got here by _RESPONSE_',
  },
  {
    text: 'What do you do well?',
    responseType: 'text',
    display: 'Need someone to _RESPONSE_? Talk to _NAME_',
  },
  {
    text: 'What do you do when you have free time?',
    responseType: 'text',
    display: '_NAME_ likes to _RESPONSE_ in their free time',
  },
  {
    text: "What's something special you do for yourself?",
    responseType: 'text',
    buttonText: 'decadent',
    display: "Don't bother _NAME_ when they are _RESPONSE_",
  },
];
