import { corsHandler } from '../extension/utils/cors-handler';

describe('CORS Handler', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      headers: {
        origin: 'https://docs.google.com',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type'
      },
      method: 'OPTIONS'
    };

    mockResponse = {
      setHeader: jest.fn(),
      end: jest.fn()
    };
  });

  test('should allow Google Docs origin', () => {
    corsHandler(mockRequest, mockResponse);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'https://docs.google.com'
    );
  });

  test('should handle preflight requests', () => {
    corsHandler(mockRequest, mockResponse);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS'
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  });

  test('should reject unauthorized origins', () => {
    mockRequest.headers.origin = 'https://malicious-site.com';
    corsHandler(mockRequest, mockResponse);
    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });
}); 