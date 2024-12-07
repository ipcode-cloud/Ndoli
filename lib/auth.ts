import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./types";

// Demo users - in production, this would be your database
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        const user = users.find((user) => user.email === credentials.email);
        if (!user) {
          throw new Error("No user found with this email");
        }

        // In production, you would verify the password here
        // For demo, any password works
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export function isAdmin(user: any): boolean {
  return user?.role === "admin";
}

export function isStudent(user: any): boolean {
  return user?.role === "student";
}