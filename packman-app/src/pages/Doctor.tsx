import { usePackman } from "../hooks/use-packman";
import { Button } from "../ui/Button";
import { PageLayout } from "../ui/layout/PageLayout";

interface DoctorProps {
  onBack: () => void;
}

export function Doctor({ onBack }: DoctorProps) {
  const { isBusy, runDoctor, lastOutput, error } = usePackman();

  return (
    <PageLayout
      title="System Doctor"
      subtitle="Run environment diagnostics before importing or installing packs."
    >
      <div className="space-y-6" data-testid="doctor-page">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            data-testid="doctor-back-home"
          >
            ← Back to Home
          </Button>
          <Button
            onClick={runDoctor}
            isLoading={isBusy}
            data-testid="doctor-run-check"
          >
            Run Doctor Check
          </Button>
        </div>

        {error && (
          <div className="p-4 border border-status-error/40 bg-status-error/10 text-status-error rounded-lg text-sm">
            {error}
          </div>
        )}

        <div
          className="p-8 border border-dashed border-border-subtle rounded-lg text-center text-text-secondary"
          data-testid="doctor-placeholder"
        >
          {lastOutput ? (
            <pre className="text-left text-xs overflow-auto max-h-80 whitespace-pre-wrap text-text-primary">
              {JSON.stringify(lastOutput, null, 2)}
            </pre>
          ) : (
            "No report yet. Run Doctor Check to view diagnostics."
          )}
        </div>
      </div>
    </PageLayout>
  );
}
