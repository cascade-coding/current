import type { Task } from "./types";

export function generate_task_id(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}


export function clear_tasks_storage(): Task[] {
  const initial_tasks: Task[] = [
    {
      id: generate_task_id(),
      text: "",
      status: "pending",
      color: "#3EFF0E"
    }
  ];

  localStorage.setItem('tasks', JSON.stringify(initial_tasks));

  return initial_tasks;
}


export function check_task_type(current_stored_tasks: any) {

  if (current_stored_tasks !== null) {
    try {
      const parsed_tasked = JSON.parse(current_stored_tasks);

      if (Array.isArray(parsed_tasked)) {

        const current_tasks = parsed_tasked.filter((task): task is Task =>
          typeof task.text === 'string' &&
          (task.status === 'ongoing' || task.status === 'completed' || task.status === 'pending') &&
          typeof task.color === 'string' &&
          typeof task.id === 'string' &&
          task.id.length === 8,
        );

        return current_tasks;
      }
    } catch (e) {
      console.error("Failed to parse tasks from localStorage", e);

      return clear_tasks_storage();
    }
  }

  return clear_tasks_storage();
}




export function update_tasks_storage(tasks: Task[]) {

  localStorage.setItem('tasks', JSON.stringify(tasks));

}



export function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
