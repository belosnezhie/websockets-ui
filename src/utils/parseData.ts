export const parseData = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Invalid data: ${(err as Error).message}`);
  }
};
