/** Vite resolves the Worker import to the URL of its bundled asset. */
declare module "*?worker&url" {
  const workerURL: string;
  export default workerURL;
}
