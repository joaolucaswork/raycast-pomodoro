import { TimerSession } from "../types/timer";
import { useTimerStore } from "../store/timer-store";

export interface Task {
  id: string;
  name: string;
  project?: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: Date;
  completedAt?: Date;
  priority: "low" | "medium" | "high";
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  completedAt?: Date;
  tasks: string[]; // Task IDs
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  completedProjects: number;
  averagePomodorosPerTask: number;
  mostProductiveProject: string | null;
}

export class TaskService {
  private static instance: TaskService;
  private tasks: Map<string, Task> = new Map();
  private projects: Map<string, Project> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private loadFromStorage(): void {
    // localStorage not available in Raycast environment
    // In a real implementation, this would use Raycast's storage APIs
    console.log("Would load tasks from storage");
  }

  private saveToStorage(): void {
    // localStorage not available in Raycast environment
    // In a real implementation, this would use Raycast's storage APIs
    console.log("Would save tasks to storage");
  }

  // Task Management
  public createTask(
    name: string,
    projectId?: string,
    estimatedPomodoros: number = 1,
    priority: "low" | "medium" | "high" = "medium",
  ): Task {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      project: projectId,
      estimatedPomodoros,
      completedPomodoros: 0,
      createdAt: new Date(),
      priority,
      tags: [],
    };

    this.tasks.set(task.id, task);

    // Add task to project if specified
    if (projectId && this.projects.has(projectId)) {
      const project = this.projects.get(projectId)!;
      project.tasks.push(task.id);
      this.projects.set(projectId, project);
    }

    this.saveToStorage();
    return task;
  }

  public updateTask(taskId: string, updates: Partial<Task>): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(taskId, updatedTask);
    this.saveToStorage();
    return true;
  }

  public deleteTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // Remove from project
    if (task.project && this.projects.has(task.project)) {
      const project = this.projects.get(task.project)!;
      project.tasks = project.tasks.filter((id) => id !== taskId);
      this.projects.set(task.project, project);
    }

    this.tasks.delete(taskId);
    this.saveToStorage();
    return true;
  }

  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getTasksByProject(projectId: string): Task[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.project === projectId,
    );
  }

  public getActiveTasks(): Task[] {
    return Array.from(this.tasks.values()).filter((task) => !task.completedAt);
  }

  public getCompletedTasks(): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.completedAt);
  }

  // Project Management
  public createProject(
    name: string,
    description?: string,
    color: string = "#007AFF",
  ): Project {
    const project: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      color,
      createdAt: new Date(),
      tasks: [],
    };

    this.projects.set(project.id, project);
    this.saveToStorage();
    return project;
  }

  public updateProject(projectId: string, updates: Partial<Project>): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const updatedProject = { ...project, ...updates };
    this.projects.set(projectId, updatedProject);
    this.saveToStorage();
    return true;
  }

  public deleteProject(projectId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    // Remove project reference from tasks
    project.tasks.forEach((taskId) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.project = undefined;
        this.tasks.set(taskId, task);
      }
    });

    this.projects.delete(projectId);
    this.saveToStorage();
    return true;
  }

  public getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  public getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  public getActiveProjects(): Project[] {
    return Array.from(this.projects.values()).filter(
      (project) => !project.completedAt,
    );
  }

  // Session Integration
  public recordPomodoroForTask(taskName: string, projectName?: string): void {
    // Find or create task
    let task = Array.from(this.tasks.values()).find(
      (t) =>
        t.name.toLowerCase() === taskName.toLowerCase() &&
        (!projectName ||
          this.getProject(t.project!)?.name.toLowerCase() ===
            projectName.toLowerCase()),
    );

    if (!task) {
      // Create project if specified and doesn't exist
      let projectId: string | undefined;
      if (projectName) {
        let project = Array.from(this.projects.values()).find(
          (p) => p.name.toLowerCase() === projectName.toLowerCase(),
        );
        if (!project) {
          project = this.createProject(projectName);
        }
        projectId = project.id;
      }

      // Create task
      task = this.createTask(taskName, projectId);
    }

    // Increment completed pomodoros
    task.completedPomodoros++;
    this.tasks.set(task.id, task);

    // Mark as completed if reached estimated pomodoros
    if (
      task.completedPomodoros >= task.estimatedPomodoros &&
      !task.completedAt
    ) {
      task.completedAt = new Date();
      this.tasks.set(task.id, task);
    }

    this.saveToStorage();
  }

  public getTaskStats(): TaskStats {
    const tasks = Array.from(this.tasks.values());
    const projects = Array.from(this.projects.values());

    const completedTasks = tasks.filter((t) => t.completedAt).length;
    const completedProjects = projects.filter((p) => p.completedAt).length;

    const totalPomodoros = tasks.reduce(
      (sum, task) => sum + task.completedPomodoros,
      0,
    );
    const averagePomodorosPerTask =
      tasks.length > 0 ? totalPomodoros / tasks.length : 0;

    // Find most productive project
    const projectPomodoros = new Map<string, number>();
    tasks.forEach((task) => {
      if (task.project) {
        const current = projectPomodoros.get(task.project) || 0;
        projectPomodoros.set(task.project, current + task.completedPomodoros);
      }
    });

    let mostProductiveProject: string | null = null;
    let maxPomodoros = 0;
    projectPomodoros.forEach((pomodoros, projectId) => {
      if (pomodoros > maxPomodoros) {
        maxPomodoros = pomodoros;
        const project = this.projects.get(projectId);
        mostProductiveProject = project?.name || null;
      }
    });

    return {
      totalTasks: tasks.length,
      completedTasks,
      totalProjects: projects.length,
      completedProjects,
      averagePomodorosPerTask,
      mostProductiveProject,
    };
  }

  public getTaskSuggestions(query: string): string[] {
    const tasks = Array.from(this.tasks.values());
    const recentTasks = tasks
      .filter((task) => !task.completedAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    return recentTasks
      .filter((task) => task.name.toLowerCase().includes(query.toLowerCase()))
      .map((task) => task.name);
  }

  public getProjectSuggestions(query: string): string[] {
    const projects = Array.from(this.projects.values());
    const activeProjects = projects.filter((project) => !project.completedAt);

    return activeProjects
      .filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((project) => project.name);
  }

  public getTaskProgress(taskId: string): number {
    const task = this.tasks.get(taskId);
    if (!task) return 0;

    return task.estimatedPomodoros > 0
      ? Math.min(100, (task.completedPomodoros / task.estimatedPomodoros) * 100)
      : 0;
  }

  public getProjectProgress(projectId: string): number {
    const project = this.projects.get(projectId);
    if (!project) return 0;

    const projectTasks = project.tasks
      .map((id) => this.tasks.get(id))
      .filter(Boolean) as Task[];
    if (projectTasks.length === 0) return 0;

    const totalEstimated = projectTasks.reduce(
      (sum, task) => sum + task.estimatedPomodoros,
      0,
    );
    const totalCompleted = projectTasks.reduce(
      (sum, task) => sum + task.completedPomodoros,
      0,
    );

    return totalEstimated > 0
      ? Math.min(100, (totalCompleted / totalEstimated) * 100)
      : 0;
  }
}

// Export singleton instance
export const taskService = TaskService.getInstance();
