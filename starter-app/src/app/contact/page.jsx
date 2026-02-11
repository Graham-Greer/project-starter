import styles from "../static-page.module.css";

export const metadata = {
  title: "Contact",
  description: "Get in touch with our team.",
};

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <h1>Contact</h1>
      <p className={styles.lead}>
        Reach out with project questions, collaboration requests, or support
        needs.
      </p>
    </main>
  );
}
