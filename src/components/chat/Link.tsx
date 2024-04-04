import { Badge, TypographyStylesProvider } from '@mantine/core';
import React, { ReactNode } from 'react';

type Props = {
  href?: string;
  children?: ReactNode;
};

const Link = ({ href, children }: Props) => {
  return (
    <Badge
      component="a"
      href={href}
      target="_blank"
      variant="outline"
      color="indigo"
      style={{ color: 'white', cursor: 'pointer' }}
    >
      <TypographyStylesProvider>{children}</TypographyStylesProvider>
    </Badge>
  );
};

export default Link;
