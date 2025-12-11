import Alpine from 'alpinejs';
import Swal from 'sweetalert2';
import Sortable from 'sortablejs';

import { icons } from './icons';
import type { AppStore, Task } from './types';
import { check_task_type, clear_tasks_storage, debounce, generate_task_id, update_tasks_storage } from './services';


declare global {
  interface Window {
    Alpine: typeof Alpine;
    iconComponent: (
      iconName?: string,
      tailwindClasses?: string
    ) => {
      iconName: string;
      tailwindClasses: string;
      readonly icon: string;
    };
  }
}

if (typeof window !== 'undefined') {
  window.Alpine = Alpine;


  const appStore: AppStore = {
    tasks: [],

    setTasks(tasks) {
      this.tasks = tasks;
    },

    duplicateTask(task: Task) {

      console.log({ task })

      const index = this.tasks.findIndex(item => item.id === task.id);

      if (index === -1) return;

      const newTask = { ...task, id: generate_task_id() };

      this.tasks.splice(index + 1, 0, newTask);

      update_tasks_storage(this.tasks)
    },


    saveStateChanges: debounce(function (this: any) {
      // update_tasks_storage(this.tasks)

      const container = document.querySelector<HTMLElement>('#tasks-container');

      if (!container) return;

      const orderedIds = Array.from(container.children)
        .map(el => el.getAttribute('data-id'))
        .filter(id => id !== null);


      const newTasksOrder = orderedIds.map(id =>
        this.tasks.find((task: Task) => task.id === id)!
      );

      update_tasks_storage(newTasksOrder)

    }, 1000),

    deleteTask(task) {
      const index = this.tasks.findIndex(item => item.id === task.id)

      if (index === -1) return;

      if (this.tasks.length === 1) return

      this.tasks.splice(index, 1)

      update_tasks_storage(this.tasks)
    },

    resetAllTaskStatus() {
      this.tasks = this.tasks.map(task => ({
        ...task,
        status: 'pending'
      }));

      update_tasks_storage(this.tasks);
    },

  };

  Alpine.store('app', appStore);


  window.iconComponent = (
    iconName = 'logo',
    tailwindClasses = ''
  ) => ({
    iconName,
    tailwindClasses,


    get icon() {
      const iconFn = icons[this.iconName];
      if (!iconFn) return '';
      return iconFn(this.tailwindClasses);
    }
  });

  Alpine.start();
}


Alpine.nextTick(() => {
  const container = document.querySelector<HTMLElement>('#tasks-container');
  if (!container) return;


  Sortable.create(container, {
    handle: '.task-box',
    animation: 150,
    dataIdAttr: 'data-id',
    onUpdate: () => {
      const store = getAppStore();

      const orderedIds = Array.from(container.children)
        .map(el => el.getAttribute('data-id'))
        .filter(id => id !== null);


      const newTasksOrder = orderedIds.map(id =>
        store.tasks.find(task => task.id === id)!
      );

      // store.setTasks([...newTasksOrder]);

      localStorage.setItem('tasks', JSON.stringify(newTasksOrder));
    }
  });
});



function getAppStore(): AppStore {
  return Alpine.store('app') as AppStore;
}



window.addEventListener("load", () => {
  let current_stored_tasks = localStorage.getItem('tasks');


  const store = getAppStore();


  // set inital tasks if none exists
  if (!current_stored_tasks) {
    store.setTasks(clear_tasks_storage());
  }


  // check task type integrity 
  store.setTasks(check_task_type(current_stored_tasks));

});


const delete_all_task_btn = document.querySelector('.delete-all-task-btn');


delete_all_task_btn?.addEventListener('click', () => {
  const store = getAppStore();

  Swal.fire({
    title: 'Are you sure?',
    text: "This will delete all tasks!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete all'
  }).then((result) => {
    if (result.isConfirmed) {
      store.setTasks(clear_tasks_storage());
    }
  });

});


const reset_tasks_status_btn = document.querySelector('.reset-tasks-status-btn');

reset_tasks_status_btn?.addEventListener('click', () => {
  const store = getAppStore();

  if (store.tasks.length === 0) return;

  Swal.fire({
    title: 'Are you sure?',
    text: 'This will reset the status of all tasks to Pending.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, reset all'
  }).then((result) => {
    if (result.isConfirmed) {

      store.resetAllTaskStatus()


    }
  });

});






if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/conducts/sw.js')
      .then(reg => console.log('Service worker registered:', reg))
      .catch(err => console.warn('Service worker registration failed:', err));
  });
}


window.addEventListener("load", () => {

  const currentInputs = document.querySelectorAll('.current-input')

  currentInputs.forEach((el: any) => {
    resize(el);

    el.addEventListener("input", (e: any) => {
      resize(e.target);
    })

  })

  function resize(el: any) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
})