import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Text,
  VStack,
  HStack,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react';
import { InlineIcon as InlineIconIconify } from '@iconify/react';
import menuIcon from '@iconify/icons-bx/menu';
import addPage from '@iconify/icons-iconoir/add-page';
import bookStack from '@iconify/icons-iconoir/book-stack';
import logoutCircleRLine from '@iconify/icons-ri/logout-circle-r-line';

import { useAuthentication } from '../hooks/useAuthentication';

export const Menu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleLogoutClick } = useAuthentication();
  const navigate = useNavigate();

  const handleClick = async () => {
    await handleLogoutClick();
    navigate('/');
    onClose();
  };

  return (
    <>
      <Box onClick={onOpen} p='10px' as='button'>
        <InlineIconIconify icon={menuIcon} height='32' />
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Auto Scaling Memo</DrawerHeader>
          <DrawerBody fontSize='lg'>
            <VStack alignItems='left' spacing='20px'>
              <HStack mt='10px'>
                <InlineIconIconify icon={addPage} height='24' />
                <Text>New Memo</Text>
              </HStack>
              <HStack>
                <InlineIconIconify icon={bookStack} height='24' />
                <Text>Your Memos</Text>
              </HStack>
              <HStack as='button' onClick={handleClick}>
                <InlineIconIconify icon={logoutCircleRLine} height='24' />
                <Text>Logout</Text>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
