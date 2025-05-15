export const parseData = (data: string) => {
  try {
    if (data === '') return;
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Invalid data: ${(err as Error).message}`);
  }
};
