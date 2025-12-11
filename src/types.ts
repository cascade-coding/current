

export type Task = {
    id: string;
    text: string;
    status: 'ongoing' | 'completed' | 'pending';
    color: string;
};



export type AppStore = {
    tasks: Task[] | [];

    setTasks(tasks: Task[]): void;


    duplicateTask(task: Task): void;

    saveStateChanges(task?: Task): void;

    deleteTask(task: Task): void;

    resetAllTaskStatus(): void;


};

