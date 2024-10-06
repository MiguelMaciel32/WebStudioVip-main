// src/types/micro-cors.d.ts
declare module 'micro-cors' {
    import { IncomingMessage, ServerResponse } from 'http';
  
    interface CorsOptions {
      allowMethods?: string[];
      allowHeaders?: string[];
      exposeHeaders?: string[];
      allowCredentials?: boolean;
      maxAge?: number;
    }
  
    export default function microCors(options?: CorsOptions): (
      req: IncomingMessage,
      res: ServerResponse,
      next: () => void
    ) => void;
  }
  