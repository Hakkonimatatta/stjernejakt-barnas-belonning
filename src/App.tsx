import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loadData, saveData, getDefaultTasks, getDefaultRewards } from "@/lib/storage";
import { autoResetExpiredItems } from "@/lib/autoReset";
import { loadLanguage, saveLanguage, Language } from "@/lib/i18n";
import { AppData, Child, Task, Reward } from "@/types";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Shop from "./pages/Shop";
import ParentMode from "./pages/ParentMode";
import SyncDevices from "./pages/SyncDevices";
import NotFound from "./pages/NotFound";

const App = () => {
  const initialLanguage = loadLanguage();
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [appData, setAppData] = useState<AppData>(() => {
    const data = loadData(initialLanguage);
    return autoResetExpiredItems(data);
  });
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    saveData(appData);
  }, [appData]);

  // Sjekk for auto-reset hvert 100ms for umiddelbar reset
  useEffect(() => {
    const interval = setInterval(() => {
      setAppData((prevData) => autoResetExpiredItems(prevData));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const selectedChild = appData.children.find((c) => c.id === selectedChildId);

  const handleCompleteTask = (taskId: string) => {
    if (!selectedChildId) return;
    
    setAppData((prevData) => {
      const child = prevData.children.find((c) => c.id === selectedChildId);
      if (!child) return prevData;
      
      const task = child.tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return prevData;

      return {
        ...prevData,
        children: prevData.children.map((c) =>
          c.id === selectedChildId
            ? {
                ...c,
                points: c.points + task.points,
                tasks: c.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: true, completedAt: Date.now() } : t
                ),
              }
            : c
        ),
      };
    });
  };

  const handlePurchaseReward = (rewardId: string) => {
    if (!selectedChildId) return;
    
    setAppData((prevData) => {
      const child = prevData.children.find((c) => c.id === selectedChildId);
      if (!child) return prevData;
      
      const reward = child.rewards.find((r) => r.id === rewardId);
      if (!reward || reward.purchased || child.points < reward.cost) return prevData;

      return {
        ...prevData,
        children: prevData.children.map((c) =>
          c.id === selectedChildId
            ? {
                ...c,
                points: c.points - reward.cost,
                rewards: c.rewards.map((r) =>
                  r.id === rewardId ? { ...r, purchased: true, purchasedAt: Date.now() } : r
                ),
              }
            : c
        ),
      };
    });
  };

  const handleResetTasks = (childId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId
          ? { ...c, tasks: c.tasks.map((t) => ({ ...t, completed: false, completedAt: undefined })) }
          : c
      ),
    }));
  };

  const handleResetTask = (childId: string, taskId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: false, completedAt: undefined } : t
              ),
            }
          : c
      ),
    }));
  };

  const handleResetReward = (childId: string, rewardId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              rewards: c.rewards.map((r) =>
                r.id === rewardId ? { ...r, purchased: false, purchasedAt: undefined } : r
              ),
            }
          : c
      ),
    }));
  };

  const handleResetRewards = (childId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId
          ? { ...c, rewards: c.rewards.map((r) => ({ ...r, purchased: false, purchasedAt: undefined })) }
          : c
      ),
    }));
  };

  const handleAddTask = (childId: string, newTask: Omit<Task, "id" | "completed">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId ? { ...c, tasks: [...c.tasks, task] } : c
      ),
    }));
  };

  const handleDeleteTask = (childId: string, taskId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c
      ),
    }));
  };

  const handleAddChild = (newChild: Omit<Child, "id" | "points" | "tasks" | "rewards">) => {
    const child: Child = {
      ...newChild,
      id: Date.now().toString(),
      points: 0,
      tasks: getDefaultTasks(language),
      rewards: getDefaultRewards(language),
    };
    setAppData((prevData) => ({
      ...prevData,
      children: [...prevData.children, child],
    }));
  };

  const handleDeleteChild = (childId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.filter((c) => c.id !== childId),
    }));
  };

  const handleAddReward = (childId: string, newReward: Omit<Reward, "id" | "purchased">) => {
    const reward: Reward = {
      ...newReward,
      id: Date.now().toString(),
      purchased: false,
    };
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId ? { ...c, rewards: [...c.rewards, reward] } : c
      ),
    }));
  };

  const handleDeleteReward = (childId: string, rewardId: string) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId ? { ...c, rewards: c.rewards.filter((r) => r.id !== rewardId) } : c
      ),
    }));
  };

  const handleUpdatePin = (newPin: string) => {
    setAppData((prevData) => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        parentPin: newPin,
      },
    }));
  };

  const handleResetAllData = () => {
    try {
      localStorage.removeItem("stjernejakt_data");
    } catch {}
    setSelectedChildId(null);
    const fresh = loadData(language);
    setAppData(fresh);
  };

  const handleAdjustPoints = (childId: string, points: number) => {
    setAppData((prevData) => ({
      ...prevData,
      children: prevData.children.map((c) =>
        c.id === childId ? { ...c, points: Math.max(0, c.points + points) } : c
      ),
    }));
  };

  const handleImportData = (data: AppData) => {
    setAppData(data);
    setSelectedChildId(null);
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                children={appData.children}
                onSelectChild={setSelectedChildId}
                onAddChild={handleAddChild}
                language={language}
                onChangeLanguage={setLanguage}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <Tasks 
                tasks={selectedChild?.tasks || []} 
                onCompleteTask={handleCompleteTask} 
                language={language}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <Shop
                rewards={selectedChild?.rewards || []}
                currentPoints={selectedChild?.points || 0}
                onPurchaseReward={handlePurchaseReward}
                language={language}
              />
            }
          />
          <Route
            path="/parent"
            element={
              <ParentMode
                onResetTasks={handleResetTasks}
                onResetTask={handleResetTask}
                onResetReward={handleResetReward}
                onResetRewards={handleResetRewards}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onDeleteChild={handleDeleteChild}
                onAddReward={handleAddReward}
                onDeleteReward={handleDeleteReward}
                onAdjustPoints={handleAdjustPoints}
                children={appData.children}
                currentPin={appData.settings?.parentPin || "1234"}
                onUpdatePin={handleUpdatePin}
                onResetAllData={handleResetAllData}
                language={language}
                onChangeLanguage={setLanguage}
              />
            }
          />
          <Route
            path="/sync"
            element={
              <SyncDevices
                appData={appData}
                onImportData={handleImportData}
                language={language}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
