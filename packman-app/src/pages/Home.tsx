import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { PageLayout } from "../ui/layout/PageLayout";
import { Download, FolderCog, Stethoscope } from "lucide-react";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <PageLayout
      title="Packman"
      subtitle="Manage your dev tools and packs with cyberpunk precision."
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        data-testid="home-actions"
      >
        <Card
          data-testid="home-import-card"
          className="cursor-pointer hover:border-brand-primary/50 transition-colors group"
          onClick={() => onNavigate("import")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-brand-primary transition-colors">
              <Download className="w-5 h-5" />
              Import Pack
            </CardTitle>
            <CardDescription>
              Install a new pack from a local directory or URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-bg-elevated rounded-md flex items-center justify-center border border-dashed border-border-subtle group-hover:border-brand-primary/30">
              <span className="text-sm text-text-tertiary">
                Guided import with validation, planning, and safe trial
                workspaces
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid="home-doctor-card"
          className="cursor-pointer hover:border-brand-info/50 transition-colors group"
          onClick={() => onNavigate("doctor")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-brand-info transition-colors">
              <Stethoscope className="w-5 h-5" />
              System Doctor
            </CardTitle>
            <CardDescription>
              Diagnose and fix environment issues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Node.js</span>
                <span className="text-status-success">✓ v18.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tauri</span>
                <span className="text-status-success">✓ Ready</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Python</span>
                <span className="text-text-tertiary">? Unknown</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid="home-workspaces-card"
          className="cursor-pointer hover:border-brand-secondary/50 transition-colors group"
          onClick={() => onNavigate("workspaces")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-brand-secondary transition-colors">
              <FolderCog className="w-5 h-5" />
              Workspace Manager
            </CardTitle>
            <CardDescription>
              Create, select, open, and clean up trial workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-bg-elevated rounded-md flex items-center justify-center border border-dashed border-border-subtle group-hover:border-brand-secondary/30">
              <span className="text-sm text-text-tertiary">
                Keep real projects intact while trialing pack installs
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
