const NOTE_DATA_SIZE = 1000000;

const getBytes = (str: string) => {
  return new Blob([str]).size;
};

export const checkSize = (title: string, content: string) => {
  return getBytes(title + content) < NOTE_DATA_SIZE;
};
