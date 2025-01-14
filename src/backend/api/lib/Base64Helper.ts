export function base64UrlDecode(input: string): string {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, "+").replace(/_/g, "/");

  return atob(input);
}

export function base64UrlEncode(input: string): string {
  input = input.replace(/\+/g, "-").replace(/\//g, "_");

  return btoa(input);
}
