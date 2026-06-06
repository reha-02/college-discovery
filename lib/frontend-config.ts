export type FieldConfig = {
  id?: string;
  label?: string;
  type?: "text" | "email" | "select" | "textarea" | "number" | "switch";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type MetricConfig = {
  label?: string;
  value?: string;
  delta?: string;
  tone?: "blue" | "green" | "amber" | "rose";
  spark?: number[];
};

export type TableColumnConfig = {
  key?: string;
  label?: string;
  align?: "left" | "right";
};

export type TableRowConfig = Record<string, string | number>;

export type ComponentConfig =
  | {
      id: string;
      type: "hero";
      eyebrow?: string;
      title?: string;
      description?: string;
      actions?: { label: string; href: string; intent?: "primary" | "secondary" }[];
    }
  | {
      id: string;
      type: "metrics";
      title?: string;
      items?: MetricConfig[];
    }
  | {
      id: string;
      type: "table";
      title?: string;
      description?: string;
      columns?: TableColumnConfig[];
      rows?: TableRowConfig[];
      status?: "ready" | "loading" | "error";
      errorMessage?: string;
    }
  | {
      id: string;
      type: "form";
      title?: string;
      description?: string;
      fields?: FieldConfig[];
      submitLabel?: string;
    }
  | {
      id: string;
      type: "workflow";
      title?: string;
      items?: { label?: string; status?: "complete" | "running" | "waiting" | "error" }[];
    }
  | {
      id: string;
      type: "split";
      columns?: ComponentConfig[];
    }
  | {
      id: string;
      type: string;
      [key: string]: unknown;
    };

export type AppConfig = {
  shell: {
    productName: string;
    environment: string;
    nav: string[];
  };
  components: ComponentConfig[];
};

export const frontendSystemConfig: AppConfig = {
  shell: {
    productName: "ConfigForge",
    environment: "Live schema canvas",
    nav: ["Overview", "Forms", "Data", "Reliability"],
  },
  components: [
    {
      id: "hero",
      type: "hero",
      eyebrow: "Configuration driven interface",
      title: "A frontend that renders product surfaces from data, safely.",
      description:
        "Dashboards, forms, tables, workflows, and layouts are assembled from configuration with loading, error, and invalid-config fallbacks built in.",
      actions: [
        { label: "Explore renderer", href: "#renderer", intent: "primary" },
        { label: "View college data", href: "/colleges", intent: "secondary" },
      ],
    },
    {
      id: "metrics",
      type: "metrics",
      title: "Runtime signal",
      items: [
        { label: "Config blocks", value: "12", delta: "+4 today", tone: "blue", spark: [28, 34, 31, 46, 52, 61, 70] },
        { label: "Safe fallbacks", value: "100%", delta: "no hard crashes", tone: "green", spark: [54, 55, 57, 61, 64, 70, 78] },
        { label: "Render latency", value: "128ms", delta: "-38%", tone: "amber", spark: [82, 74, 66, 61, 48, 39, 31] },
        { label: "Invalid fields", value: "2", delta: "contained", tone: "rose", spark: [12, 10, 13, 9, 8, 7, 6] },
      ],
    },
    {
      id: "main-grid",
      type: "split",
      columns: [
        {
          id: "admissions-table",
          type: "table",
          title: "Decision queue",
          description: "Configurable table with typed columns, rows, statuses, and loading/error handling.",
          columns: [
            { key: "college", label: "College" },
            { key: "city", label: "City" },
            { key: "score", label: "Fit score", align: "right" },
            { key: "status", label: "Status" },
          ],
          rows: [
            { college: "IIT Bombay", city: "Mumbai", score: 98, status: "Ready" },
            { college: "IISc Bangalore", city: "Bangalore", score: 97, status: "Review" },
            { college: "BITS Hyderabad", city: "Hyderabad", score: 94, status: "Ready" },
            { college: "COEP Pune", city: "Pune", score: 91, status: "Draft" },
          ],
        },
        {
          id: "request-form",
          type: "form",
          title: "Dynamic intake",
          description: "The form below is generated from field configuration and survives broken fields.",
          submitLabel: "Generate shortlist",
          fields: [
            { id: "student", label: "Student name", type: "text", placeholder: "Aarav Mehta", required: true },
            { id: "email", label: "Email", type: "email", placeholder: "student@example.com", required: true },
            { id: "city", label: "Preferred city", type: "select", options: ["Mumbai", "Bangalore", "Delhi", "Pune"] },
            { id: "budget", label: "Annual budget", type: "number", placeholder: "250000" },
            { id: "notes", label: "Priorities", type: "textarea", placeholder: "Placements, labs, hostel safety..." },
            { id: "legacy", label: "Unsupported legacy field", type: "switch" },
            { id: "broken-field", label: "Broken config field", type: "slider" as FieldConfig["type"] },
          ],
        },
      ],
    },
    {
      id: "ops-workflow",
      type: "workflow",
      title: "Renderer pipeline",
      items: [
        { label: "Validate incoming configuration", status: "complete" },
        { label: "Resolve component registry", status: "complete" },
        { label: "Render supported blocks", status: "running" },
        { label: "Contain invalid fields", status: "waiting" },
      ],
    },
    {
      id: "loading-table",
      type: "table",
      title: "Loading state example",
      status: "loading",
    },
    {
      id: "broken-analytics",
      type: "quantum-chart",
      reason: "This component does not exist in the registry.",
    },
  ],
};
