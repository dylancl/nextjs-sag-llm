import React, { ReactNode } from 'react';
import { CodeHighlight } from '@mantine/code-highlight';
import '@mantine/code-highlight/styles.css';

type Props = {
  children?: ReactNode;
  className?: string;
  node?: unknown;
};

const CodeBlock = ({ className, node, children }: Props): JSX.Element => {
  const match = /language-(\w+)/.exec(className || '');

  if (!match) {
    return <code>{children}</code>;
  }

  return <CodeHighlight language={match[1]} code={String(children)} w="100%" />;
};

export default CodeBlock;
