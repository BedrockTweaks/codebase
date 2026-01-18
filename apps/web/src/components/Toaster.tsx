'use client';

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react';
import { JSX } from 'react';

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

export const Toaster = (): JSX.Element => (
  <Portal>
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
      {toast => (
        <Toast.Root width={{ md: 'sm' }}>
          {toast.type === 'loading'
            ? (
                <Spinner size={'sm'} color={'primary.500'} />
              )
            : (
                <Toast.Indicator />
              )}
          <Stack gap={'1'} flex={'1'} maxWidth={'100%'}>
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
          </Stack>
          {toast.action && (
            <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
          )}
          {toast.closable && <Toast.CloseTrigger />}
        </Toast.Root>
      )}
    </ChakraToaster>
  </Portal>
);
