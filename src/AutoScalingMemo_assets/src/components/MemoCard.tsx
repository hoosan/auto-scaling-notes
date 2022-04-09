import React from 'react';
import dayjs from 'dayjs';
import { Box, Text } from '@chakra-ui/react';

export interface Props {
  title: string;
  updatedAt: bigint;
  content: string;
}

export const MemoCard: React.VFC<Props> = ({ title, updatedAt, content }) => {
  return (
    <Box>
      <Text
        p='10px 20px'
        textOverflow='ellipsis'
        overflow='hidden'
        whiteSpace='nowrap'
        fontSize='xl'
      >
        {title}
      </Text>
      <Text
        p='0px 20px 10px 20px'
        textOverflow='ellipsis'
        overflow='hidden'
        whiteSpace='nowrap'
        fontSize='sm'
        color='gray.500'
      >
        {content}
      </Text>
      <Text px='20px' pb='10px' fontSize='sm'>
        {dayjs(Number(updatedAt) / 1000000).format('YYYY-MM-DD')}
      </Text>
    </Box>
  );
};
