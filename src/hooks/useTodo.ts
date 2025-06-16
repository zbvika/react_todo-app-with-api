import { useEffect, useState } from 'react';
import * as todoService from '../api/todos';
import { Todo } from '../types/Todo';
import { TodoServiceErrors } from '../types/Errors';

export function useTodo() {
  const [data, setData] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [todosInProgress, setTodosInProgress] = useState<number[]>([]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }

    return;
  }, [errorMessage]);

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    todoService
      .getTodos()
      .then(setData)
      .catch(() => setErrorMessage(TodoServiceErrors.UnableToLoad))
      .finally(() => setIsLoading(false));
  }, []);

  const deleteTodo = (todoId: number) => {
    setTodosInProgress([todoId]);

    return todoService
      .deleteTodos(todoId)
      .then(() => setData(prev => prev.filter(todo => todo.id !== todoId)))
      .catch(() => {
        setErrorMessage(TodoServiceErrors.UnableToDelete);
        throw new Error(TodoServiceErrors.UnableToDelete);
      })
      .finally(() => setTodosInProgress([]));
  };

  const hasCompletedTodos = data.some(todo => todo.completed);
  const hasActiveTodos = data.some(todo => !todo.completed);

  const deleteCompletedTodos = () => {
    const completedIds = data
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    if (completedIds.length === 0) {
      return Promise.resolve();
    }

    setTodosInProgress(completedIds);

    return Promise.allSettled(
      //передаємо в проміс масив айдішників, кожен з яких пропускаємо через функцію видалення
      //після кожного видалення ми повертаємо ай ді вже із статусом (успішне чи ні)
      //і масив результатів передаємо до промісу)
      completedIds.map(id => todoService.deleteTodos(id).then(() => id)),
    )
      .then(results => {
        const successIds = results
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<number>).value);

        const isSomeFailed = results.some(r => r.status === 'rejected');

        if (isSomeFailed) {
          setErrorMessage(TodoServiceErrors.UnableToDelete);
        }

        setData(prev => prev.filter(todo => !successIds.includes(todo.id)));
      })
      .finally(() => {
        setTodosInProgress([]);
      });
  };

  const updateTodo = (updatedTodo: Todo) => {
    setTodosInProgress(current => [...current, updatedTodo.id]);

    return todoService
      .updateTodos(updatedTodo)
      .then(todo => {
        setData(currentData => {
          const newData = [...currentData];
          const index = newData.findIndex(tod => tod.id === updatedTodo.id);

          newData.splice(index, 1, todo);

          return newData;
        });
      })
      .catch(() => {
        setErrorMessage(TodoServiceErrors.UnableToUpdate);
        throw new Error(TodoServiceErrors.UnableToUpdate);
      })
      .finally(() => {
        setTodosInProgress([]);
      });
  };

  const toggleTodos = () => {
    const todosToToggle = hasActiveTodos
      ? data.filter(todo => !todo.completed)
      : data;

    const toggledIds = todosToToggle.map(todo => todo.id);

    setTodosInProgress(toggledIds);

    return Promise.allSettled(
      todosToToggle.map(
        todo =>
          todoService
            .updateTodos({ ...todo, completed: !todo.completed })
            .then(() => ({ ...todo, completed: !todo.completed })), // <--- тут
      ),
    )
      .then(results => {
        const successTodos = results
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<Todo>).value);

        const isSomeFailed = results.some(r => r.status === 'rejected');

        if (isSomeFailed) {
          setErrorMessage(TodoServiceErrors.UnableToUpdate);
        }

        setData(prev =>
          prev.map(todo => {
            const updated = successTodos.find(t => t.id === todo.id);

            return updated ? updated : todo;
          }),
        );
      })
      .finally(() => {
        setTodosInProgress([]);
      });
  };

  const addTodo = (newTodo: Omit<Todo, 'id'>) => {
    const tTodo: Todo = {
      id: 0,
      userId: todoService.USER_ID,
      title: newTodo.title,
      completed: false,
    };

    setTempTodo(tTodo);
    setTodosInProgress([tTodo.id]);

    return todoService
      .createTodos(newTodo)
      .then(todoFromServer => {
        setData(prev => [...prev, todoFromServer]);
      })
      .finally(() => {
        setTempTodo(null);
        setTodosInProgress([]);
      });
  };

  return {
    data,
    isLoading,
    errorMessage,
    tempTodo,
    todosInProgress,
    hasCompletedTodos,
    hasActiveTodos,
    setErrorMessage,
    deleteTodo,
    addTodo,
    deleteCompletedTodos,
    updateTodo,
    toggleTodos,
  };
}
