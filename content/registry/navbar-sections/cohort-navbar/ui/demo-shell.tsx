import type { ReactNode } from "react";

import "./cohort-navbar.css";

export function DemoShell({ children }: { children: ReactNode }) {
  return <div className="cohort-navbar-demo">{children}</div>;
}
