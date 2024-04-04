import { AIEvent, ChatEvent } from '@/types/types';
import { uuid } from '@/utils/general';
import { Message } from 'ai/react';
import { useState } from 'react';

const useReadableChat = ({
  useSearchContext,
}: {
  useSearchContext: boolean;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [input, setInput] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const updateAssistantMessage = (text: string, id: string) => {
    setMessages((prev) => {
      const lastMessageIndex = prev.length - 1;
      if (prev[lastMessageIndex]?.role === 'assistant') {
        return [
          ...prev.slice(0, lastMessageIndex),
          {
            ...prev[lastMessageIndex],
            content: prev[lastMessageIndex].content + text,
            createdAt: new Date(),
          },
        ];
      } else {
        return [
          ...prev,
          {
            id,
            role: 'assistant',
            content: text,
            createdAt: new Date(),
          },
        ];
      }
    });
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newMessage: Message = {
      id: uuid(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    setInput('');

    const response = await fetch('/api/llm', {
      method: 'POST',
      body: JSON.stringify({
        messages: newMessages,
        conversationId: 1,
        disableContext: !useSearchContext,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return;

    const reader = response.body?.getReader();

    // The ReadableStream sends events. We need to parse these events and update the messages state
    while (true) {
      const { done, value } = (await reader?.read()) ?? {};

      if (done) break;

      const text = new TextDecoder().decode(value);
      console.log(text);
      const event: AIEvent = JSON.parse(text);

      /**
       * The event system is used to be able to display what is happening in the background
       * Simply, if we receive a response_chunk event it means that the assistant has sent a message
       * We can then also receive events indicating asynchronous operations in the background
       * Each event starts with a loading state which is set to false when the next event is received
       */
      if (event.type === 'response_chunk') {
        // Update last event to set loading to false
        setEvents((prev) => {
          const lastEventIndex = prev.length - 1;
          if (prev[lastEventIndex]?.loading) {
            return [
              ...prev.slice(0, lastEventIndex),
              {
                ...prev[lastEventIndex],
                loading: false,
              },
            ];
          } else {
            return prev;
          }
        });

        updateAssistantMessage(event.message || '', uuid());
      } else {
        setEvents((prev) => {
          const lastEventIndex = prev.length - 1;
          if (prev[lastEventIndex]?.loading) {
            return [
              ...prev.slice(0, lastEventIndex),
              {
                ...prev[lastEventIndex],
                loading: false,
              },
              { ...event, createdAt: new Date(), loading: true },
            ];
          } else {
            const newEvent: ChatEvent = {
              ...event,
              createdAt: new Date(),
              loading: true,
            };

            return [...prev, newEvent];
          }
        });
      }
    }
  };

  return { input, messages, events, sendMessage, handleInputChange };
};

export default useReadableChat;
