import { useEffect, useState } from "react";
import { usePackman } from "../hooks/use-packman";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PageLayout } from "../ui/layout/PageLayout";
import {
  FolderOpen,
  FolderPlus,
  RefreshCcw,
  Trash2,
  Target,
} from "lucide-react";

interface WorkspaceManagerProps {
  onBack: () => void;
  onNavigateImport: () => void;
}

function getWorkspaceUid(workspacePath: string): string {
  const normalized = workspacePath.replace(/\\/g, "/");
  const leaf = normalized.split("/").filter(Boolean).pop() ?? workspacePath;
  const match = /^packman-trial-(.+)$/.exec(leaf);
  return match?.[1] ?? leaf;
}

export function WorkspaceManager({
  onBack,
  onNavigateImport,
}: WorkspaceManagerProps) {
  const [pendingCleanupPath, setPendingCleanupPath] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const {
    isBusy,
    error,
    workspaceParentPath,
    targetPath,
    recentTrialWorkspaces,
    pickWorkspaceParent,
    createTrialWorkspace,
    setTargetWorkspace,
    openWorkspaceInFinder,
    cleanupTrialWorkspace,
    refreshRecentTrialWorkspaces,
  } = usePackman();

  useEffect(() => {
    void refreshRecentTrialWorkspaces();
  }, [refreshRecentTrialWorkspaces]);

  const handleCreateTrialWorkspace = async (navigateToImport = false) => {
    const created = await createTrialWorkspace();
    if (created) {
      setNotice("Trial workspace created and selected as install target.");
      if (navigateToImport) {
        onNavigateImport();
      }
    }
  };

  const handleCleanupTrialWorkspace = async () => {
    if (!pendingCleanupPath) {
      return;
    }

    const ok = await cleanupTrialWorkspace(pendingCleanupPath);
    if (ok) {
      setNotice("Trial workspace cleaned up successfully.");
    }
    setPendingCleanupPath(null);
  };

  return (
    <PageLayout
      title="Workspace Manager"
      subtitle="Create isolated trial workspaces and keep your main projects intact."
    >
      <div className="space-y-6" data-testid="workspace-manager-page">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} size="sm">
            ← Back to Home
          </Button>
          <Button variant="secondary" onClick={onNavigateImport} size="sm">
            Go to Import
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void refreshRecentTrialWorkspaces();
            }}
            size="sm"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border border-border-subtle p-4 bg-bg-panel space-y-3">
          <h3 className="text-lg font-medium">Create Trial Workspace</h3>
          <div className="flex gap-2">
            <Input value={workspaceParentPath ?? ""} readOnly />
            <Button
              variant="secondary"
              onClick={pickWorkspaceParent}
              data-testid="workspace-pick-parent"
              aria-label="Select trial workspace parent folder"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Parent Folder
            </Button>
            <Button
              onClick={() => {
                void handleCreateTrialWorkspace(false);
              }}
              isLoading={isBusy}
              data-testid="workspace-create-trial"
              aria-label="Create trial workspace"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void handleCreateTrialWorkspace(true);
              }}
              isLoading={isBusy}
              data-testid="workspace-create-trial-import"
              aria-label="Create trial workspace and open import view"
            >
              Create & Go to Import
            </Button>
          </div>
          <p className="text-xs text-text-tertiary">
            New trial folders are named with the `packman-trial-*` prefix and
            are safe to clean up from this page.
          </p>
        </div>

        {error && (
          <div
            className="p-4 border border-status-error/40 bg-status-error/10 text-status-error rounded-lg text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            className="p-4 border border-status-success/40 bg-status-success/10 text-status-success rounded-lg text-sm flex items-center justify-between gap-3"
            role="status"
            aria-live="polite"
          >
            <span>{notice}</span>
            <Button size="sm" variant="ghost" onClick={() => setNotice(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {pendingCleanupPath && (
          <div className="p-4 border border-status-warning/40 bg-status-warning/10 rounded-lg text-sm space-y-3">
            <p className="text-text-primary">
              Confirm cleanup for this trial workspace?
            </p>
            <p className="text-text-tertiary break-all">{pendingCleanupPath}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleCleanupTrialWorkspace}
                isLoading={isBusy}
                data-testid="workspace-confirm-cleanup"
              >
                Confirm Cleanup
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPendingCleanupPath(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border-subtle p-4 bg-bg-panel space-y-3">
          <h3 className="text-lg font-medium">Recent Trial Workspaces</h3>
          {recentTrialWorkspaces.length === 0 ? (
            <p className="text-sm text-text-tertiary">
              No trial workspaces yet. Create one to test changes without
              touching your main projects.
            </p>
          ) : (
            <div className="space-y-2" data-testid="workspace-recent-list">
              {recentTrialWorkspaces.map((workspacePath) => {
                const selected = targetPath === workspacePath;
                const workspaceUid = getWorkspaceUid(workspacePath);
                return (
                  <div
                    key={workspacePath}
                    className="rounded-md border border-border-subtle p-3 bg-bg-elevated"
                  >
                    <p className="text-xs text-text-tertiary">
                      UID: {workspaceUid}
                    </p>
                    <p className="text-sm text-text-primary break-all">
                      {workspacePath}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={selected ? "primary" : "secondary"}
                        onClick={() => {
                          setTargetWorkspace(workspacePath);
                          setNotice("Workspace selected as import target.");
                        }}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {selected ? "Selected Target" : "Use as Target"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setTargetWorkspace(workspacePath);
                          onNavigateImport();
                        }}
                      >
                        Use & Go to Import
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          void openWorkspaceInFinder(workspacePath);
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setPendingCleanupPath(workspacePath);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cleanup
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
