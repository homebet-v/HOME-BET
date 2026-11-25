import type { ReactNode } from "react";
import { HomeFrame } from "@/components/home-frame";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <HomeFrame>{children}</HomeFrame>;
}
