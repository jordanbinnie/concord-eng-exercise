import {
  ChartNoAxesCombined,
  ClipboardCheck,
  FolderOpen,
  LayoutDashboard,
} from "lucide-react";
export const workspacePages = [
  { icon: LayoutDashboard, label: "Overview", slug: "overview" },
  { icon: FolderOpen, label: "My cases", slug: "my-cases" },
  { icon: ClipboardCheck, label: "Pre-assessments", slug: "pre-assessments" },
  {
    icon: ChartNoAxesCombined,
    label: "Analytics",
    slug: "reporting-analytics",
  },
] as const;

export type WorkspaceSlug = (typeof workspacePages)[number]["slug"];
export type WorkspacePage = Omit<(typeof workspacePages)[number], "label"> & {
  label: string;
};

export function getWorkspacePage(route: string): WorkspacePage {
  return (
    workspacePages.find((page) => page.slug === route) ?? workspacePages[0]
  );
}
