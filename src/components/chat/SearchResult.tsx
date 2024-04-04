import React, { useEffect, useState } from 'react';
import {
  Card,
  Image,
  Text,
  Group,
  Transition,
  MantineTransition,
} from '@mantine/core';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';

type Props = {
  index: number;
  url: string;
  title: string;
  description: string;
  icon?: string;
};

const delayedFadeIn = (duration: number, delay: number): MantineTransition => ({
  in: { opacity: 1 },
  out: { opacity: 0 },
  transitionProperty: 'opacity',
  common: { animationDuration: `${duration}ms`, animationDelay: `${delay}ms` },
});

const SearchResult = ({ url, title, description, index, icon }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Transition
      mounted={mounted}
      transition={delayedFadeIn(1000, index * 1000)}
      duration={1000}
      timingFunction="ease-in-out"
    >
      {(styles) => (
        <Card
          flex="1 0 30%"
          shadow="lg"
          padding="xs"
          radius="md"
          style={{ cursor: 'pointer', ...styles }}
          component="a"
          href={url}
        >
          <Group
            dir="row"
            gap="xs"
            p="md"
            justify="space-between"
            h="100%"
            style={{ wordBreak: 'break-word' }}
          >
            <div>
              <Text size="md" fw="bold" lineClamp={2}>
                {title}
              </Text>
              <Text size="sm" c="dimmed">
                <Text
                  lineClamp={2}
                  span
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </Text>
            </div>
            <Text size="sm" c="blue" lineClamp={2}>
              {url}
            </Text>
          </Group>
        </Card>
      )}
    </Transition>
  );
};

export default SearchResult;
