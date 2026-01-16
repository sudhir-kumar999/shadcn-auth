"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>My Todo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ➕ Add Todo */}
        <form
          action={async () => {
            await addTodoAction(title);
            setTitle("");
            router.refresh();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="New todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>

        {/* 📋 Todo List */}
        <ul className="space-y-2">
          {initialTodos.map((todo) => (
            <li
              key={todo.id}
              className="rounded border px-3 py-2"
            >
              {editingId === todo.id ? (
                /* ✏️ Edit Mode */
                <form
                  action={async () => {
                    await updateTodoAction(todo.id, editTitle);
                    setEditingId(null);
                    setEditTitle("");
                    router.refresh();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                /* 👀 View Mode */
                <div className="flex items-center justify-between">
                  <span>{todo.title}</span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditTitle(todo.title);
                      }}
                    >
                      Edit
                    </Button>

                    <form
                      action={async () => {
                        await deleteTodoAction(todo.id);
                        router.refresh();
                      }}
                    >
                      <Button
                        variant="destructive"
                        size="sm"
                        type="submit"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
