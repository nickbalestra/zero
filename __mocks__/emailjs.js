const mockSend = jest.fn((message, callback) => callback(null, message));
const mockConnect = jest.fn(smtpConfig => ({
  send: mockSend
}));

module.exports = {
  server: {
    connect: mockConnect
  },
  __spy: {
    send: mockSend,
    connect: mockConnect
  }
};
