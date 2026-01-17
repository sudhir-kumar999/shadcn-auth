"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Pencil, Trash2, Check, X, ListTodo, Bug, Code, FileText, ArrowUp, ArrowDown, Circle, ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import {
  addTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "./action";

type TaskType = "Bug" | "Feature" | "Documentation";
type TaskStatus = "Todo" | "Backlog" | "In Progress" | "Done";
type TaskPriority = "Low" | "Medium" | "High";

type Todo = {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
};

const taskTypeConfig = {
  Bug: { icon: Bug, color: "bg-red-100 text-red-700 border-red-200" },
  Feature: { icon: Code, color: "bg-blue-100 text-blue-700 border-blue-200" },
  Documentation: { icon: FileText, color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const priorityConfig = {
  Low: { icon: ArrowDown, color: "text-gray-500" },
  Medium: { icon: Circle, color: "text-yellow-500" },
  High: { icon: ArrowUp, color: "text-red-500" },
};

const statusConfig = {
  Todo: { color: "bg-gray-100 text-gray-700", icon: "○" },
  Backlog: { color: "bg-slate-100 text-slate-700", icon: "◐" },
  "In Progress": { color: "bg-blue-100 text-blue-700", icon: "◑" },
  Done: { color: "bg-green-100 text-green-700", icon: "✓" },
};

const ITEMS_PER_PAGE = 10;

export default function TodoClient({
  initialTodos,
}: {
  initialTodos: Todo[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("Feature");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Todo>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [statusSort, setStatusSort] = useState<"asc" | "desc" | null>(null);
  const [prioritySort, setPrioritySort] = useState<"asc" | "desc" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  // Priority order for sorting
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  const statusOrder = { Todo: 1, Backlog: 2, "In Progress": 3, Done: 4 };

  // Filter todos
  let filteredTodos = initialTodos.filter(todo => {
    if (filterStatus !== "all" && todo.status !== filterStatus) return false;
    if (filterPriority !== "all" && todo.priority !== filterPriority) return false;
    return true;
  });

  // Sort todos
  if (statusSort) {
    filteredTodos = [...filteredTodos].sort((a, b) => {
      const comparison = statusOrder[a.status] - statusOrder[b.status];
      return statusSort === "asc" ? comparison : -comparison;
    });
  }

  if (prioritySort) {
    filteredTodos = [...filteredTodos].sort((a, b) => {
      const comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      return prioritySort === "asc" ? comparison : -comparison;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (type: "status" | "priority", value: string) => {
    if (type === "status") {
      setFilterStatus(value);
    } else {
      setFilterPriority(value);
    }
    setCurrentPage(1);
  };

  const completedCount = initialTodos.filter((t) => t.completed).length;
  const totalCount = initialTodos.length;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType("Feature");
    setPriority("Medium");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <Card className="shadow-xl border-2">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              <CardTitle className="text-2xl sm:text-3xl">Task Manager</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {completedCount}/{totalCount}
            </Badge>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Track bugs, features, and documentation tasks
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ➕ Add Todo Form */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5 rounded-lg border-2 border-blue-200">
            <form
              action={async () => {
                if (title.trim()) {
                  await addTodoAction({
                    title,
                    description,
                    task_type: taskType,
                    priority,
                  });
                  resetForm();
                  router.refresh();
                }
              }}
              className="space-y-3"
            >
              <Input
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 text-sm sm:text-base"
              />
              
              <Textarea
                placeholder="Description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm sm:text-base resize-none"
                rows={2}
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                  <SelectTrigger className="h-11 sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">🐛 Bug</SelectItem>
                    <SelectItem value="Feature">✨ Feature</SelectItem>
                    <SelectItem value="Documentation">📄 Documentation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger className="h-11 sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">⬇️ Low</SelectItem>
                    <SelectItem value="Medium">➖ Medium</SelectItem>
                    <SelectItem value="High">⬆️ High</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  type="submit" 
                  size="lg"
                  className="h-11 sm:flex-1"
                  disabled={!title.trim()}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </form>
          </div>

          {/* 🔍 Filters */}
          <div className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-lg">
            <Select value={filterStatus} onValueChange={(v) => handleFilterChange("status", v)}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="Backlog">Backlog</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(v) => handleFilterChange("priority", v)}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>

            {(filterStatus !== "all" || filterPriority !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus("all");
                  setFilterPriority("all");
                  setCurrentPage(1);
                }}
                className="sm:ml-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* 📋 Todo List */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm sm:text-base">
                  {initialTodos.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your filters"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 text-sm font-semibold">Task ID</th>
                        <th className="text-left p-3 text-sm font-semibold">Title</th>
                        <th className="text-left p-3 text-sm font-semibold hidden sm:table-cell">Type</th>
                        <th className="text-left p-3 text-sm font-semibold">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3">
                                Status
                                {statusSort ? (
                                  statusSort === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                                ) : (
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => setStatusSort("asc")}>
                                <ArrowUp className="mr-2 h-4 w-4" />
                                Asc
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusSort("desc")}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Desc
                              </DropdownMenuItem>
                              {statusSort && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setStatusSort(null)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Sort
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3">
                                Priority
                                {prioritySort ? (
                                  prioritySort === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                                ) : (
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => setPrioritySort("asc")}>
                                <ArrowUp className="mr-2 h-4 w-4" />
                                Asc
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPrioritySort("desc")}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Desc
                              </DropdownMenuItem>
                              {prioritySort && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setPrioritySort(null)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Sort
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                        <th className="text-right p-3 text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTodos.map((todo) => (
                        <tr
                          key={todo.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            todo.completed ? "opacity-60" : ""
                          }`}
                        >
                          {editingId === todo.id ? (
                            /* ✏️ Edit Mode */
                            <>
                              <td colSpan={6} className="p-3">
                                <form
                                  action={async () => {
                                    if (editData.title?.trim()) {
                                      await updateTodoAction(todo.id, {
                                        title: editData.title,
                                        description: editData.description,
                                        task_type: editData.task_type,
                                        status: editData.status,
                                        priority: editData.priority,
                                      });
                                      setEditingId(null);
                                      setEditData({});
                                      router.refresh();
                                    }
                                  }}
                                  className="space-y-3"
                                >
                                  <Input
                                    value={editData.title || ""}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="text-sm"
                                    placeholder="Title"
                                  />
                                  
                                  <Textarea
                                    value={editData.description || ""}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="text-sm resize-none"
                                    placeholder="Description"
                                    rows={2}
                                  />

                                  <div className="flex flex-wrap gap-2">
                                    <Select 
                                      value={editData.task_type} 
                                      onValueChange={(v) => setEditData({ ...editData, task_type: v as TaskType })}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Bug">🐛 Bug</SelectItem>
                                        <SelectItem value="Feature">✨ Feature</SelectItem>
                                        <SelectItem value="Documentation">📄 Docs</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select 
                                      value={editData.status} 
                                      onValueChange={(v) => setEditData({ ...editData, status: v as TaskStatus })}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Todo">Todo</SelectItem>
                                        <SelectItem value="Backlog">Backlog</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Done">Done</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select 
                                      value={editData.priority} 
                                      onValueChange={(v) => setEditData({ ...editData, priority: v as TaskPriority })}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Low">⬇️ Low</SelectItem>
                                        <SelectItem value="Medium">➖ Medium</SelectItem>
                                        <SelectItem value="High">⬆️ High</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <div className="flex gap-2 ml-auto">
                                      <Button size="sm" type="submit">
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        type="button"
                                        onClick={() => {
                                          setEditingId(null);
                                          setEditData({});
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </form>
                              </td>
                            </>
                          ) : (
                            /* 👀 View Mode */
                            <>
                              <td className="p-3">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {todo.task_id}
                                </Badge>
                              </td>
                              
                              <td className="p-3">
                                <div className="space-y-1">
                                  <p className={`text-sm font-medium ${todo.completed ? "line-through text-gray-500" : ""}`}>
                                    {todo.title}
                                  </p>
                                  {todo.description && (
                                    <p className="text-xs text-gray-500 line-clamp-1">{todo.description}</p>
                                  )}
                                </div>
                              </td>
                              
                              <td className="p-3 hidden sm:table-cell">
                                <Badge className={`${taskTypeConfig[todo.task_type].color} text-xs`}>
                                  {todo.task_type}
                                </Badge>
                              </td>
                              
                              <td className="p-3">
                                <Badge className={`${statusConfig[todo.status].color} text-xs`}>
                                  {statusConfig[todo.status].icon} {todo.status}
                                </Badge>
                              </td>
                              
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  {priorityConfig[todo.priority].icon === ArrowUp ? (
                                    <ArrowUp className={`w-4 h-4 ${priorityConfig[todo.priority].color}`} />
                                  ) : priorityConfig[todo.priority].icon === Circle ? (
                                    <Circle className={`w-4 h-4 ${priorityConfig[todo.priority].color}`} />
                                  ) : (
                                    <ArrowDown className={`w-4 h-4 ${priorityConfig[todo.priority].color}`} />
                                  )}
                                  <span className="text-xs hidden sm:inline">{todo.priority}</span>
                                </div>
                              </td>
                              
                              <td className="p-3">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingId(todo.id);
                                      setEditData({
                                        title: todo.title,
                                        description: todo.description,
                                        task_type: todo.task_type,
                                        status: todo.status,
                                        priority: todo.priority,
                                      });
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>

                                  <form
                                    action={async () => {
                                      await deleteTodoAction(todo.id);
                                      router.refresh();
                                    }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      type="submit"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </form>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredTodos.length)} of {filteredTodos.length} tasks
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-9"
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-1">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats Footer */}
          {totalCount > 0 && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-lg">{totalCount}</p>
                  <p className="text-gray-600">Total</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="font-semibold text-lg">{initialTodos.filter(t => t.status === "In Progress").length}</p>
                  <p className="text-gray-600">In Progress</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="font-semibold text-lg">{completedCount}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="font-semibold text-lg">{initialTodos.filter(t => t.priority === "High").length}</p>
                  <p className="text-gray-600">High Priority</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}