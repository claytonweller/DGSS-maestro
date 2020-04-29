interface IQuestion {
  core?: boolean;
  text: string;
  responseType: string;
  buttonText?: string;
  choices?: string[];
  min?: number;
  max?: number;
}

interface ICoreQuestion extends IQuestion {
  column: string;
}

export const coreQuestions: ICoreQuestion[] = [
  {
    // TODO maybe some parsing logic to change this to datetime?
    column: "time_constraint",
    text:
      "Are you on a time constraint? What's the longest you'd like this to run?",
    responseType: "multiple-choice",
    choices: ["1 Hour", "1.5 Hours", "2 Hours", "All night!"],
  },
  {
    column: "expectations",
    text: "What do you expect to get out of this evening?",
    responseType: "text",
    buttonText: "Interesting",
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
    column: "new_people",
    text: "How do you feel about meeting new people?",
    responseType: "multiple-choice",
    choices: ["Great", "Good", "Fine", "No thanks"],
  },
  {
    column: "new_things",
    text: "How do you feel about trying new things?",
    responseType: "multiple-choice",
    choices: ["Bring it on", "Good", "Fine", "No thanks"],
  },
  {
    column: "center_of_attention",
    text: "How do you feel about being the center of attention?",
    responseType: "multiple-choice",
    choices: ["Great", "Good", "Fine", "Don't even look at me"],
  },
  {
    column: "tech_savvy",
    text: "How comfortable with technology are you?",
    responseType: "multiple-choice",
    choices: ["Very", "Some", "A Little", "Can I send a letter?"],
  },
];

export const trivialQuestions: IQuestion[] = [
  {
    text: "Where were you born?",
    responseType: "text",
    buttonText: "More or less",
  },
  {
    text: "What's your spirit animal?",
    responseType: "text",
    buttonText: "Release",
  },
  {
    text: "What's your sign?",
    responseType: "text",
    buttonText: "Yup",
  },
  {
    text: "Favorite Book?",
    responseType: "text",
    buttonText: "So Good",
  },
  {
    text: "Favorite Movie?",
    responseType: "text",
    buttonText: "Classic",
  },
  {
    text: "Favorite Flavor of icecream?",
    responseType: "text",
    buttonText: "Delish",
  },
  {
    text: "How many siblings do you have?",
    responseType: "number",
    min: 0,
    max: 12,
  },
  {
    text: "Number of living grandparents?",
    responseType: "number",
    min: 0,
    max: 8,
  },
  {
    text: "Number of living grandparents?",
    responseType: "number",
    min: 0,
    max: 8,
  },
  {
    text: "Number of children?",
    responseType: "number",
    min: 0,
    max: 12,
  },
  {
    text: "How many years have you been alive?",
    responseType: "number",
    min: 0,
    max: 120,
  },
  {
    text: "What's your job? (Or what do you spend your days doing?)",
    responseType: "text",
  },
  {
    text: "Name of a pet?",
    responseType: "text",
    buttonText: "Good Name",
  },
  {
    text: "Last place you went on vacation?",
    responseType: "text",
    buttonText: "Classic",
  },
  {
    text: "Where the furthest you've ever traveled?",
    responseType: "text",
    buttonText: "So Exotic",
  },
  {
    text: "Name of your first crush?",
    responseType: "text",
    buttonText: "Cute",
  },
  {
    text: "Favorite food?",
    responseType: "text",
    buttonText: "Yum",
  },
  {
    text: "Favorite Holiday?",
    responseType: "text",
    buttonText: "Fun",
  },
  {
    text: "Which of these is most appealing to you?",
    responseType: "multiple-choice",
    choices: ["Salty", "Sweet", "Sour", "Savory"],
  },
  {
    text: "What's on your mind?",
    responseType: "text",
    buttonText: "Thanks for telling",
  },
  {
    text: "What's something you're proud of?",
    responseType: "text",
    buttonText: "Congrats",
  },
  {
    text: "Any advice?",
    responseType: "text",
    buttonText: "Nice",
  },
  {
    text: "Would you rather be:",
    responseType: "multiple-choice",
    choices: ["Too Hot?", "Too Cold?"],
  },
  {
    text: "How did you get here?",
    responseType: "multiple-choice",
    choices: ["Car", "Bike", "Walk", "Boat?"],
  },
  {
    text: "What do you do well?",
    responseType: "text",
  },
  {
    text: "What do you do when you have free time?",
    responseType: "text",
  },
  {
    text: "What's something special you do for yourself?",
    responseType: "text",
    buttonText: "decadent",
  },
];
