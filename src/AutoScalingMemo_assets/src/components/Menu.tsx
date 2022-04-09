import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Text,
  HStack,
  List,
  ListItem,
  useDisclosure,
} from '@chakra-ui/react';
import { InlineIcon as InlineIconIconify } from '@iconify/react';
import menuIcon from '@iconify/icons-bx/menu';
import addPage from '@iconify/icons-iconoir/add-page';
import bookStack from '@iconify/icons-iconoir/book-stack';
import logoutCircleRLine from '@iconify/icons-ri/logout-circle-r-line';
import loginCircleLine from '@iconify/icons-ri/login-circle-line';

import { useAuthentication } from '../hooks/useAuthentication';

export const Menu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleLogoutClick, handleLoginClick, isLogin } = useAuthentication();
  const navigate = useNavigate();

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
            <List alignItems='left' spacing='20px'>
              {isLogin ? (
                <>
                  <ListItem>
                    <Link to='/new'>
                      <HStack mt='10px'>
                        <InlineIconIconify icon={addPage} height='24' />
                        <Text>New Memo</Text>
                      </HStack>
                    </Link>
                  </ListItem>
                  <ListItem>
                    <Link to='/'>
                      <HStack>
                        <InlineIconIconify icon={bookStack} height='24' />
                        <Text>Your Memos</Text>
                      </HStack>
                    </Link>
                  </ListItem>
                  <ListItem>
                    <HStack
                      as='button'
                      onClick={async () => {
                        await handleLogoutClick();
                        navigate('/');
                        onClose();
                      }}
                    >
                      <InlineIconIconify icon={logoutCircleRLine} height='24' />
                      <Text>Logout</Text>
                    </HStack>
                  </ListItem>
                </>
              ) : (
                <ListItem>
                  <HStack
                    as='button'
                    onClick={async () => {
                      await handleLoginClick();
                      onClose();
                    }}
                  >
                    <InlineIconIconify icon={loginCircleLine} height='24' />
                    <Text>Login</Text>
                  </HStack>
                </ListItem>
              )}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
