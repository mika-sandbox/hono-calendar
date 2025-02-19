import { Style } from "hono/css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createElement } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";

export default jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Script src="/app/client.ts" />
        <Link href="/app/style.css" rel="stylesheet" />
        <Style />
      </head>
      <body>{children}</body>
    </html>
  );
});
