import { Card, TypographyStylesProvider, Badge } from '@mantine/core';
import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import Link from './Link';

type Props = {
  role: string;
  content: string;
  createdAt?: string;
};

const ChatMessage = ({ role, content, createdAt }: Props) => {
  return (
    <Card
      p="sm"
      my="sm"
      style={{ textAlign: role === 'user' ? 'right' : 'left' }}
      shadow="md"
      radius="md"
    >
      <TypographyStylesProvider>
        {/* Replace link with badge */}
        <Markdown
          components={{
            code: CodeBlock,
            a: ({ href, children }) => <Link href={href}>{children}</Link>,
          }}
        >
          {content}
        </Markdown>
      </TypographyStylesProvider>
    </Card>
  );
};

export default ChatMessage;
