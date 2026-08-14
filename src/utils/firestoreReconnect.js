const reconnectListeners = new Set();

export function subscribeFirestoreReconnect(listener) {
  reconnectListeners.add(listener);
  return () => reconnectListeners.delete(listener);
}

export function notifyFirestoreReconnect() {
  reconnectListeners.forEach((listener) => {
    listener();
  });
}
