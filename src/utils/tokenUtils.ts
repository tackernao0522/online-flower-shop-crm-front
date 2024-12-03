export const isTokenExpired = (token: string): boolean => {
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    const expirationTime = decodedPayload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};
