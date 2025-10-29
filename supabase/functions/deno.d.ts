// Deno type declarations for Supabase Edge Functions
// This file suppresses TypeScript errors in VSCode for Deno runtime globals

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Suppress specific import errors for Deno runtime modules
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/stripe@18.5.0" {
  import Stripe from "stripe";
  export default Stripe;
}

declare module "https://esm.sh/@supabase/supabase-js@2.57.2" {
  export { createClient } from "@supabase/supabase-js";
}