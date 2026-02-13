import { useState } from "react";
import { Home } from "./pages/Home";
import { ImportWizard } from "./pages/ImportWizard";
import { Doctor } from "./pages/Doctor";
import { WorkspaceManager } from "./pages/WorkspaceManager";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/Button";
import { cn } from "./lib/utils";

type Page = "home" | "import" | "doctor" | "workspaces";

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

function App() {
  const [page, setPage] = useState<Page>("home");
  const [, setHistory] = useState<Page[]>([]);
  const navItems: Array<{ key: Page; label: string }> = [
    { key: "home", label: "Home" },
    { key: "import", label: "Import" },
    { key: "workspaces", label: "Workspaces" },
    { key: "doctor", label: "Doctor" },
  ];

  const navigateTo = (nextPage: Page) => {
    if (nextPage === page) {
      return;
    }

    setHistory((previous) => [...previous, page]);
    setPage(nextPage);
  };

  const navigateBack = () => {
    setHistory((previous) => {
      if (previous.length === 0) {
        return previous;
      }

      const nextHistory = [...previous];
      const previousPage = nextHistory.pop();
      if (previousPage) {
        setPage(previousPage);
      }
      return nextHistory;
    });
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary overflow-hidden">
      <div className="px-8 py-4 border-b border-border-subtle bg-bg-surface/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          {page !== "home" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={navigateBack}
              data-testid="app-nav-back"
            >
              ← Back
            </Button>
          )}
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={page === item.key ? "primary" : "ghost"}
              size="sm"
              className={cn("min-w-24")}
              onClick={() => navigateTo(item.key)}
              data-testid={`app-nav-${item.key}`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.div
            key="home"
            className="h-full w-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Home onNavigate={(p) => navigateTo(p as Page)} />
          </motion.div>
        )}

        {page === "import" && (
          <motion.div
            key="import"
            className="h-full w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={pageTransition}
          >
            <ImportWizard onBack={() => navigateTo("home")} />
          </motion.div>
        )}

        {page === "doctor" && (
          <motion.div
            key="doctor"
            className="h-full w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={pageTransition}
          >
            <Doctor onBack={() => navigateTo("home")} />
          </motion.div>
        )}

        {page === "workspaces" && (
          <motion.div
            key="workspaces"
            className="h-full w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={pageTransition}
          >
            <WorkspaceManager
              onBack={() => navigateTo("home")}
              onNavigateImport={() => navigateTo("import")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
