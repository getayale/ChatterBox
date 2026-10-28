
import "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      isMember: boolean;
      isAdmin: boolean;
    }
  }
}

export {};
