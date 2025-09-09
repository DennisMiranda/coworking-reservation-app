/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    user?: {
      name: string;
      email?: string;
      picture?: string;
    };
  }
}
