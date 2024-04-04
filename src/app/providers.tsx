'use client';

import {
  MantineColorsTuple,
  MantineProvider,
  createTheme,
} from '@mantine/core';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const black: MantineColorsTuple = [
  '#f8f9fa',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd',
  '#868e96',
  '#495057',
  '#343a40',
  '#212529',
  '#121519',
];

const theme = createTheme({
  black: '#000',
  colors: {
    black,
  },
  fontFamily: 'Helvetica Neue, sans-serif',
});

const Providers = ({ children }: Props): JSX.Element => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  );
};

export default Providers;
