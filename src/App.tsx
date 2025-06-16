/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { TitleForm } from './components/TitleForm';
import { TodoList } from './components/TodoList';
import { ClearCompletedButton } from './components/ClearCompletedButton';
import { useTodosFilter } from './hooks/useTodosFilter';
import { useTodo } from './hooks/useTodo';
import { Error } from './components/Error';
import { TodoFilter } from './components/TodoFilter';
import { ToggleAllButton } from './components/ToggleAllButton';
import { useRef } from 'react';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: todos,
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
  } = useTodo();

  const { visibleTodos, filter, setFilter, countOfActiveTodos } =
    useTodosFilter(todos);

  const isTodoListNotEmpty = todos.length > 0;
  const isTodoInProgressNotEmpty = todosInProgress.length > 0;

  const handleDeleteTodo = (todoId: number) => {
    return deleteTodo(todoId).then(() => {
      inputRef.current?.focus();
    });
  };

  const handleUpdateTodo = (updatedTodo: Todo, shouldRefocus = false) => {
    return updateTodo(updatedTodo).then(() => {
      if (shouldRefocus) {
        inputRef.current?.focus();
      }
    });
  };

  const handleDeleteCompletedTodos = () => {
    return deleteCompletedTodos().then(() => {
      inputRef.current?.focus();
    });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {isTodoListNotEmpty && !isLoading && (
            <ToggleAllButton
              toggleTodos={toggleTodos}
              hasActiveTodos={hasActiveTodos}
              isTodoInProgressNotEmpty={isTodoInProgressNotEmpty}
            />
          )}

          <TitleForm
            ref={inputRef}
            onSubmit={addTodo}
            setErrorMessage={setErrorMessage}
          />
        </header>

        {!isLoading && (
          <TodoList
            todos={visibleTodos}
            deleteTodo={handleDeleteTodo}
            tempTodo={tempTodo}
            onSubmit={handleUpdateTodo}
            todosInProgress={todosInProgress}
            setErrorMessage={setErrorMessage}
          />
        )}

        {isTodoListNotEmpty && !isLoading && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {countOfActiveTodos} items left
            </span>

            <TodoFilter setFilter={setFilter} filter={filter} />

            <ClearCompletedButton
              countOfActiveTodos={countOfActiveTodos}
              deleteCompletedTodos={handleDeleteCompletedTodos}
              hasCompletedTodos={hasCompletedTodos}
            />
          </footer>
        )}
      </div>

      <Error errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
    </div>
  );
};
