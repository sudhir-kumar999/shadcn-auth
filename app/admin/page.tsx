"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, X, Check, Loader2, Shield, User } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  };
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, todosRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/todos"),
      ]);

      if (!usersRes.ok || !todosRes.ok) {
        router.push("/todo");
        return;
      }

      const usersData = await usersRes.json();
      const todosData = await todosRes.json();

      setUsers(usersData.users || []);
      setTodos(todosData.todos || []);

      // Get current user role
      const currentUser = usersData.users.find((u: User) => u.id === usersData.currentUserId);
      setCurrentUserRole(currentUser?.role || "");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (user: User) => {
    // Prevent editing superadmin
    if (user.role === "superadmin") {
      alert("SuperAdmin cannot be edited");
      return;
    }
    setEditingUserId(user.id);
    setEditName(user.name);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
  };

  // Update user name
  const updateUserName = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: editName }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, name: editName } : u)));
        cancelEdit();
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      alert("Error updating user");
    }
  };

  // Toggle user role (only superadmin can do this)
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    if (!confirm(`Change role to ${newRole}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users/toggle-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to change role");
      }
    } catch (error) {
      alert("Error changing role");
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setTodos(todos.filter((t) => t.user_id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      alert("Error deleting user");
    }
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoId }),
      });

      if (res.ok) {
        setTodos(todos.filter((t) => t.id !== todoId));
      } else {
        alert("Failed to delete todo");
      }
    } catch (error) {
      alert("Error deleting todo");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isSuperAdmin = currentUserRole === "superadmin";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          {isSuperAdmin && (
            <Badge variant="destructive" className="text-sm">
              <Shield className="w-4 h-4 mr-1" />
              SuperAdmin
            </Badge>
          )}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="todos">All Todos ({todos.length})</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        {editingUserId === user.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="max-w-xs"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => updateUserName(user.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{user.name}</p>
                              <Badge
                                variant={
                                  user.role === "superadmin"
                                    ? "destructive"
                                    : user.role === "admin"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>

                      {editingUserId !== user.id && user.role !== "superadmin" && (
                        <div className="flex gap-2">
                          {/* Role Toggle - Only for SuperAdmin */}
                          {isSuperAdmin && (
                            <Button
                              size="sm"
                              variant={user.role === "admin" ? "outline" : "default"}
                              onClick={() => toggleUserRole(user.id, user.role)}
                            >
                              {user.role === "admin" ? (
                                <>
                                  <User className="w-4 h-4 mr-1" />
                                  Make User
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-1" />
                                  Make Admin
                                </>
                              )}
                            </Button>
                          )}

                          <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}

                      {/* SuperAdmin badge - no actions */}
                      {user.role === "superadmin" && editingUserId !== user.id && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          🔒 Protected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Todos Tab */}
          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>All User Todos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{todo.title}</p>
                        <p className="text-sm text-gray-600">
                          by {todo.profiles.name} ({todo.profiles.email})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {todo.completed ? "✅ Completed" : "⏳ Pending"} •{" "}
                          {new Date(todo.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ))}

                  {todos.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No todos found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}