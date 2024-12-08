export interface Capability<T> {
  process(message: T): Response | null;
}

export interface Response {
  message: string;
}
