export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const register = () => {
    const serviceWorkerUrl = new URL("sw.js", document.baseURI).pathname;
    const scope = new URL("./", document.baseURI).pathname;
    navigator.serviceWorker.register(serviceWorkerUrl, { scope }).catch((error) => {
      if (process.env.NODE_ENV !== "production") console.warn("ListenLoop PWA registration failed", error);
    });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
