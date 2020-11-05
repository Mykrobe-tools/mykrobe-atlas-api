export const mockMandrillService = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return { send: mockMandrillService };
});

export default mock;
