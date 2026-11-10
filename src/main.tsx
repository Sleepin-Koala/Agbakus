import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./app.css"
import App from "./app"


async function main() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

}

main();


