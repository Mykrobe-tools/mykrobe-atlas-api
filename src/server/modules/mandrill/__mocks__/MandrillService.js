const MandrillService = {
  sendTemplate: jest.fn().mockImplementation(location => {
    return true;
  })
};

export default MandrillService;
