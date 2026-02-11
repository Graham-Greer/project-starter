import styles from "../static-page.module.css";

export const metadata = {
  title: "About Us",
  description: "Learn more about our team and mission.",
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <h1>About Us</h1>
      <p className={styles.lead}>
        We build modern web products with a focus on usability, performance,
        and maintainable design systems.
      </p>
    </main>
  );
}
