import { useState, DragEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask, ITask } from '../hooks/useTasks';
import { Plus, CheckCircle2, Clock, PlayCircle, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/axios';

const columns: { id: ITask['status']; title: string; icon: any; color: string }[] = [
  { id: 'To Do', title: 'To Do', icon: Clock, color: 'text-slate-500' },
  { id: 'In Progress', title: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
  { id: 'In Review', title: 'In Review', icon: AlertCircle, color: 'text-amber-500' },
  { id: 'Completed', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' }
];

export const Tasks = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role !== 'Employee';
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', assignee: '' });

  // Get users for assignment
  const { data: users } = useQuery({
    queryKey: ['usersList'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
    enabled: isAdmin
  });

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: ITask['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTask.mutate({ id: taskId, data: { status } });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(newTask as any, {
      onSuccess: () => {
        setCreateModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'Medium', assignee: '' });
      }
    });
  };

  if (isLoading) return <div className="p-8">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Task Board</h2>
          <p className="text-muted-foreground mt-1">Manage and track ongoing work</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Assign New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map(col => (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            className="bg-muted/30 rounded-xl p-4 min-h-[500px] border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <col.icon className={`w-5 h-5 ${col.color}`} />
                <h3 className="font-semibold text-foreground">{col.title}</h3>
              </div>
              <span className="text-xs font-medium bg-background px-2 py-1 rounded-full text-muted-foreground shadow-sm">
                {tasks?.filter(t => t.status === col.id).length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {tasks?.filter(t => t.status === col.id).map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  className="bg-card p-4 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority}
                    </span>
                    {isAdmin && (
                       <button onClick={() => deleteTask.mutate(task._id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">{task.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {task.assignee?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs text-muted-foreground">{task.assignee?.name?.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(task.createdAt), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}
              {tasks?.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Assign New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" className="w-full p-2 rounded-md border border-border bg-background" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required className="w-full p-2 rounded-md border border-border bg-background" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select className="w-full p-2 rounded-md border border-border bg-background" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To</label>
                  <select required className="w-full p-2 rounded-md border border-border bg-background" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                    <option value="">Select Employee</option>
                    {users?.filter((u: any) => u.role === 'Employee').map((u: any) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
                <button type="submit" disabled={createTask.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90">
                  {createTask.isPending ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
