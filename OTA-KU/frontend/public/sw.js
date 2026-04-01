self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (!data) return;

  const { title, body, icon } = data;
  const notificationOptions = {
    body: body,
    icon: icon,
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions),
  );
});

self.addEventListener("notificationclick", async (event) => {
  event.notification.close();

  const rootUrl = new URL("/", location.href);
  if (event.notification.data && event.notification.data.url) {
    rootUrl.pathname = event.notification.data.url;
  }

  const url = rootUrl.href;

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      for (const client of clients) {
        if (
          client.url === url &&
          "focus" in client &&
          typeof client.focus === "function"
        ) {
          return client.focus();
        }
      }

      return self.clients.openWindow(url);
    }),
  );
});
