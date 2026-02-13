import { CmsAuthProvider } from "@/context";

export const metadata = {
  title: "CMS",
  description: "CMS admin area",
};

export default function CmsLayout({ children }) {
  return <CmsAuthProvider>{children}</CmsAuthProvider>;
}
