import { Box, Card, Flex, Text, Transition } from '@mantine/core';
import { Loader } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

type Props = {
  message?: string;
  loading?: boolean;
};

const ChatEvent = ({ message, loading }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Transition
      mounted={mounted}
      transition="fade"
      duration={1000}
      timingFunction="ease-in-out"
    >
      {(styles) => (
        <Flex justify="left" align="center" style={styles}>
          <Box mr="sm">
            {loading ? (
              <Loader size={20} />
            ) : (
              <IconCheck size={20} color="green" />
            )}
          </Box>
          <Text size="md" fw="bold">
            {message}
          </Text>
        </Flex>
      )}
    </Transition>
  );
};

export default ChatEvent;
