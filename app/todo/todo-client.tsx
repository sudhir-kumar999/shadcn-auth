"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Pencil, Trash2, Check, X, ListTodo } from "lucide-react";

import {
  addTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "./action";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function TodoClient({
  initialTodos,
}: {
  initialTodos: Todo[];
}) {
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const router = useRouter();

  const completedCount = initialTodos.filter((t) => t.completed).length;
  const totalCount = initialTodos.length;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <Card className="shadow-xl border-2">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              <CardTitle className="text-2xl sm:text-3xl">My Todos</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {completedCount}/{totalCount}
            </Badge>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Keep track of your daily tasks
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ➕ Add Todo Form */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5 rounded-lg border-2 border-blue-200">
            <form
              action={async () => {
                if (title.trim()) {
                  await addTodoAction(title);
                  setTitle("");
                  router.refresh();
                }
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 h-11 text-sm sm:text-base"
              />
              <Button 
                type="submit" 
                size="lg"
                className="h-11 sm:w-auto w-full"
                disabled={!title.trim()}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </form>
          </div>

          {/* 📋 Todo List */}
          <div className="space-y-3">
            {initialTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm sm:text-base">No todos yet. Add one above!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {initialTodos.map((todo, index) => (
                  <li
                    key={todo.id}
                    className={`rounded-lg border-2 transition-all ${
                      todo.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    {editingId === todo.id ? (
                      /* ✏️ Edit Mode */
                      <div className="p-3 sm:p-4">
                        <form
                          action={async () => {
                            if (editTitle.trim()) {
                              await updateTodoAction(todo.id, editTitle);
                              setEditingId(null);
                              setEditTitle("");
                              router.refresh();
                            }
                          }}
                          className="flex flex-col sm:flex-row gap-2"
                        >
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 text-sm sm:text-base"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" type="submit" className="flex-1 sm:flex-none">
                              <Check className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Save</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditTitle("");
                              }}
                              className="flex-1 sm:flex-none"
                            >
                              <X className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Cancel</span>
                            </Button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* 👀 View Mode */
                      <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span
                            className={`text-sm sm:text-base break-words ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900 font-medium"
                            }`}
                          >
                            {todo.title}
                          </span>
                          {todo.completed && (
                            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                              Done
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(todo.id);
                              setEditTitle(todo.title);
                            }}
                            className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Edit</span>
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
                              className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                          </form>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Stats Footer */}
          {totalCount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{totalCount} total {totalCount === 1 ? 'task' : 'tasks'}</span>
                <span>{completedCount} completed</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}