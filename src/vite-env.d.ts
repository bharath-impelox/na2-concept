/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AGENT_ENV_1: string
  readonly VITE_AGENT_ENV_1_WS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
