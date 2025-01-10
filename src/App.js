
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, X, CheckSquare, Square, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BearIcon } from './bear-icon.tsx';
import { Pomodoro } from './pomodoro.tsx';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/localStorage.ts';
import { Analytics } from "@vercel/analytics/react"


const TaskBoard = () => {
  const [tasks, setTasks] = useState(loadFromLocalStorage('tasks', {
    habits: [
      { id: 1, title: 'Ejercicio diario', time: '07:00', completed: false },
      { id: 2, title: 'Meditación', time: '08:00', completed: false }
    ],
    todos: [
      { id: 3, title: 'Reunión de trabajo', time: '10:00', completed: false },
      { id: 4, title: 'Comprar víveres', time: '16:00', completed: false }
    ],
    inProgress: []
  }));

  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('todos');
  const [actions, setActions] = useState(loadFromLocalStorage('actions', [
    { id: 1, text: 'Llamar al cliente', completed: false },
    { id: 2, text: 'Enviar informe', completed: false }
  ]));
  const [columns, setColumns] = useState(loadFromLocalStorage('columns', [
    { id: 'habits', title: 'Hábitos' },
    { id: 'todos', title: 'Pendientes' },
    { id: 'inProgress', title: 'En Progreso' }
  ]));
  const [newColumnTitle, setNewColumnTitle] = useState('');

  useEffect(() => {
    saveToLocalStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToLocalStorage('actions', actions);
  }, [actions]);

  useEffect(() => {
    saveToLocalStorage('columns', columns);
  }, [columns]);

  const moveTask = (taskId, sourceCol, targetCol) => {
    setTasks(prev => {
      const taskToMove = prev[sourceCol].find(task => task.id === taskId);
      return {
        ...prev,
        [sourceCol]: prev[sourceCol].filter(task => task.id !== taskId),
        [targetCol]: [...(prev[targetCol] || []), taskToMove]
      };
    });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const newTaskObj = {
      id: Date.now(),
      title: newTask,
      time: newTime || '00:00',
      completed: false
    };

    setTasks(prev => ({
      ...prev,
      [selectedColumn]: [...(prev[selectedColumn] || []), newTaskObj]
    }));

    setNewTask('');
    setNewTime('');
  };

  const deleteTask = (taskId, columnId) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(task => task.id !== taskId)
    }));
  };

  const toggleTaskCompletion = (taskId, columnId) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const addAction = (newAction) => {
    if (!newAction.trim()) return;
    setActions(prev => [...prev, { id: Date.now(), text: newAction, completed: false }]);
  };

  const toggleActionCompletion = (actionId) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, completed: !action.completed } : action
    ));
  };

  const deleteAction = (actionId) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColumn = {
      id: `column-${Date.now()}`,
      title: newColumnTitle
    };
    setColumns(prev => [...prev, newColumn]);
    setTasks(prev => ({ ...prev, [newColumn.id]: [] }));
    setNewColumnTitle('');
  };

  const updateColumnTitle = (columnId, newTitle) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
  };

  const deleteColumn = (columnId) => {
    if (['habits', 'todos', 'inProgress', 'actions', 'pomodoro'].includes(columnId)) {
      return; // Don't delete default columns
    }
    setColumns(prev => prev.filter(col => col.id !== columnId));
    setTasks(prev => {
      const { [columnId]: deletedColumn, ...rest } = prev;
      return rest;
    });
  };

  const Task = React.memo(({ task, columnId }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`p-4 mb-2 rounded-lg shadow-lg ${
          task.completed ? 'bg-customCard bg-opacity-80' : 'bg-customCard'
        }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('taskId', task.id.toString());
          e.dataTransfer.setData('sourceColumn', columnId);
        }}
      >
        <div className="flex justify-between items-center">
          <div className={`font-medium ${
            task.completed ? 'text-gray-500' : 'text-gray-900'
          }`}>{task.title}</div>
          <div className="flex items-center">
            <button 
              onClick={() => toggleTaskCompletion(task.id, columnId)} 
              className="mr-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <button 
              onClick={() => deleteTask(task.id, columnId)} 
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-700">{task.time}</div>
      </motion.div>
    );
  });

  const Column = React.memo(({ columnId, tasks }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const column = columns.find(col => col.id === columnId);
    const isDefaultColumn = ['habits', 'todos', 'inProgress', 'actions', 'pomodoro'].includes(columnId);

    const handleEditClick = () => {
      setIsEditing(true);
      setEditedTitle(column.title);
    };

    const handleSaveClick = () => {
      if (editedTitle.trim()) {
        updateColumnTitle(columnId, editedTitle);
      }
      setIsEditing(false);
    };

    return (
      <div
        className="w-full md:w-72 bg-customCard p-4 rounded-lg shadow-xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const taskId = parseInt(e.dataTransfer.getData('taskId'));
          const sourceColumn = e.dataTransfer.getData('sourceColumn');
          if (sourceColumn !== columnId) {
            moveTask(taskId, sourceColumn, columnId);
          }
        }}
      >
        <div className="flex justify-between items-center mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="bg-white text-gray-900 p-1 rounded"
              autoFocus
            />
          ) : (
            <h2 className="text-lg font-bold text-gray-900">{column.title}</h2>
          )}
          <div className="flex items-center">
            {!isDefaultColumn && (
              <button
                onClick={() => deleteColumn(columnId)}
                className="text-red-500 hover:text-red-700 transition-colors mr-2"
              >
                <X size={20} />
              </button>
            )}
            {columnId !== 'pomodoro' && (
              <button
                onClick={isEditing ? handleSaveClick : handleEditClick}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {tasks.map(task => (
            <Task key={task.id} task={task} columnId={columnId} />
          ))}
        </AnimatePresence>
      </div>
    );
  });

  const ActionBoard = React.memo(() => {
    const [localNewAction, setLocalNewAction] = useState('');

    const handleAddAction = () => {
      addAction(localNewAction);
      setLocalNewAction('');
    };

    return (
      <div className="w-full md:w-72 bg-customCard p-4 rounded-lg shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Acciones</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={localNewAction}
            onChange={(e) => setLocalNewAction(e.target.value)}
            placeholder="Nueva acción"
            className="p-2 rounded-md border flex-grow mr-2 bg-white text-gray-900 border-customCard placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddAction}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <AnimatePresence>
          {actions.map(action => (
            <motion.div
              key={action.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between bg-customCard p-3 rounded-md mb-2"
            >
              <div className={`flex items-center ${
                action.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                <button 
                  onClick={() => toggleActionCompletion(action.id)} 
                  className="mr-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {action.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                {action.text}
              </div>
              <button 
                onClick={() => deleteAction(action.id)} 
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-customBg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nueva tarea"
              className="p-2 rounded-md border bg-white text-gray-900 border-customCard placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="p-2 rounded-md border bg-white text-gray-900 border-customCard focus:outline-none focus:border-blue-500"
            />
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="p-2 rounded-md border bg-white text-gray-900 border-customCard focus:outline-none focus:border-blue-500"
            >
              {columns.map(column => (
                <option key={column.id} value={column.id}>{column.title}</option>
              ))}
            </select>
            <button
              onClick={addTask}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Agregar
            </button>
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Nuevo título de columna"
              className="p-2 rounded-md border bg-white text-gray-900 border-customCard placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addColumn}
 className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Agregar Columna
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 justify-items-center">
          {columns.map(column => (
            <Column key={column.id} columnId={column.id} tasks={tasks[column.id] || []} />
          ))}
          <ActionBoard />
          <Pomodoro />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <TaskBoard />
    </DndProvider>
  );
};

export default App;