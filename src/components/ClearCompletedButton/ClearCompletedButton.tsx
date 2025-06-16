import React from 'react';

interface Props {
  countOfActiveTodos: number;
  deleteCompletedTodos: () => void;
  hasCompletedTodos: boolean;
}

export const ClearCompletedButton: React.FC<Props> = ({
  deleteCompletedTodos,
  hasCompletedTodos,
}) => {
  return (
    <button
      type="button"
      className="todoapp__clear-completed"
      data-cy="ClearCompletedButton"
      onClick={() => deleteCompletedTodos()}
      disabled={!hasCompletedTodos}
    >
      Clear completed
    </button>
  );
};
