'use client';

import ChatEventComponent from '@/components/chat/ChatEvent';
import ChatMessage from '@/components/chat/ChatMessage';
import SearchResultComponent from '@/components/chat/SearchResult';
import useReadableChat from '@/hooks/useReadableChat';
import { ChatEvent, SearchResult } from '@/types/types';
import '@/styles/modules/input.module.css';

import {
  Button,
  Container,
  Flex,
  TextInput,
  Stack,
  Text,
  Box,
  Switch,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const Page = () => {
  const [useSearchContext, setSearchContext] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, events, input, handleInputChange, sendMessage } =
    useReadableChat({ useSearchContext });

  // Scroll the ScrollArea to bottom when messages is updated
  useEffect(() => {
    if (!scrollAreaRef.current) return;

    const scrollToBottom = () =>
      scrollAreaRef.current?.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });

    scrollToBottom();
  }, [messages]);

  return (
    <Container size="xl" h="100%">
      <Flex direction="column" p="md" justify="space-between" h="100%">
        <Box ref={scrollAreaRef} style={{ overflow: 'auto', flex: 1 }} mb={5}>
          <Stack mb={5}>
            {/* 
              Messages and events are displayed in the chat area
              They are displayed in the order they are received (using the createdAt field)
              To do this, we need to combine messages and events into a single array and sort them by createdAt
            */}
            {[
              ...messages.map((message) => ({
                ...message,
                type: 'message',
              })),
              ...events,
            ]
              .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
              .map((item, index) => {
                if (item.type === 'message') {
                  return (
                    <ChatMessage
                      key={item.id}
                      role={item.role}
                      content={item.content}
                    />
                  );
                }

                if ((item as ChatEvent).type === 'search_results') {
                  const searchResults = JSON.parse(
                    (item as ChatEvent).message || '[]'
                  ) as SearchResult[];

                  return (
                    <>
                      <Box
                        p="lg"
                        mb={20}
                        style={(theme) => ({
                          backgroundColor: theme.colors.dark[8],
                          borderRadius: theme.radius.lg,
                        })}
                      >
                        <Text size="xl" fw="bold" mb={20} c="white">
                          Search results used as context
                        </Text>
                        <Flex
                          direction="row"
                          gap="md"
                          mb={20}
                          py={20}
                          style={{ overflowX: 'scroll' }}
                        >
                          {searchResults.map(
                            ({ title, description, url }, index) => (
                              <SearchResultComponent
                                index={index}
                                key={title}
                                url={url}
                                title={title}
                                description={description}
                              />
                            )
                          )}
                        </Flex>
                      </Box>
                    </>
                  );
                }

                return (
                  <ChatEventComponent
                    key={index}
                    message={(item as ChatEvent).message}
                    loading={(item as ChatEvent).loading}
                  />
                );
              })}
          </Stack>
        </Box>
        <form onSubmit={sendMessage}>
          <Box>
            <Box
              w="100%"
              p="xs"
              bg="dark.8"
              style={(theme) => ({
                borderTopRightRadius: theme.radius.md,
                borderTopLeftRadius: theme.radius.md,
              })}
            >
              <Switch
                color="indigo"
                label="Use search results as context"
                checked={useSearchContext}
                onChange={() => setSearchContext((state) => !state)}
              />
            </Box>
            <TextInput
              color="indigo"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message"
              rightSectionWidth={60}
              rightSection={
                <Button type="submit" color="indigo">
                  <IconSend />
                </Button>
              }
            />
          </Box>
        </form>
      </Flex>
    </Container>
  );
};

export default Page;
