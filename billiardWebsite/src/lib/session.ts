// lib/session.ts
import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'my-next-app-cookie',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// This is where we specify the types of the data we save in the session.
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number;
      username: string;
    };
  }
}