// Mock Express request object
const mockRequest = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  };
  return req;
};

// Mock Express response object
const mockResponse = () => {
  const res = {};
  
  // Add JSON method
  res.json = jest.fn().mockImplementation(data => {
    res.body = data;
    return res;
  });
  
  // Add status method
  res.status = jest.fn().mockImplementation(statusCode => {
    res.statusCode = statusCode;
    return res;
  });
  
  // Add sendFile method
  res.sendFile = jest.fn().mockImplementation(path => {
    res.filePath = path;
    return res;
  });
  
  // Add send method
  res.send = jest.fn().mockImplementation(data => {
    res.body = data;
    return res;
  });
  
  // Add redirect method
  res.redirect = jest.fn().mockImplementation(url => {
    res.redirectUrl = url;
    return res;
  });
  
  return res;
};

// Mock Express next function
const mockNext = jest.fn();

module.exports = {
  mockRequest,
  mockResponse,
  mockNext
};
