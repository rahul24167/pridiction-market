import { auth, signIn, signOut } from "@/auth";
import Link from "next/dist/client/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Pridiction Market</h1>
      {!session?.user && <>
          <p>You are not signed in.</p>
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button type="submit" className="rounded border px-4 py-2">
              Sign in with Google
            </button>
          </form>
        </>}
      {session?.user &&
        <>
          <p>Signed in as {session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="rounded border px-4 py-2">
              Sign out
            </button>
          </form>
        </>
      }
      {session?.user && <>
      <ul>
      <li><Link href="/transactions"> Transactions </Link> </li>
      <li><Link href="/markets"> Markets</Link></li>
      <li><Link href="/bets">Bets</Link></li>
      </ul>
      </>}
    </main>
  );
}
