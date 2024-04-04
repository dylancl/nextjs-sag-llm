import { ChatPrompt } from 'modelfusion';

export const STOP_TOKEN = '<|end_of_turn|>';

export const formatPrompt = (prompt: ChatPrompt): { text: string } => {
  // get content of the first message
  const content = prompt.messages[0].content;

  // Prompt reference: {{ .System }}<|end_of_turn|>GPT4 Correct User: {{ .Prompt }}<|end_of_turn|>GPT4 Correct Assistant:
  let text = `${
    prompt.system !== null ? prompt.system + STOP_TOKEN : ''
  }GPT4 Correct User: ${content}${STOP_TOKEN}GPT4 Correct Assistant: `;

  // process remaining messages
  for (let i = 1; i < prompt.messages.length; i++) {
    const { role, content } = prompt.messages[i];
    switch (role) {
      case 'user': {
        text += `GPT4 Correct User: ${content}${STOP_TOKEN}GPT4 Correct Assistant: `;
        break;
      }
      case 'assistant': {
        text += `${content}${STOP_TOKEN}`;
        break;
      }
    }
  }

  console.log({ text });

  return { text: text };
};
