// utils/jwtUtils.ts
export const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(atob(base64Url).replace(/\+/g, ' '));
    const jsonPayload = JSON.parse(base64);
    return jsonPayload;
  };
  