"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useCmsAuth } from "@/hooks";
import styles from "./sign-in.module.css";

export default function CmsSignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, signInWithEmail } = useCmsAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/cms");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    await signInWithEmail({ email, password });
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <form className={styles.stack} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Sign in to CMS</h1>
          <p className={styles.description}>
            Authenticate with Firebase and this app will maintain your CMS session automatically.
          </p>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Password</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Checking session..." : "Sign in"}
          </Button>

          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
