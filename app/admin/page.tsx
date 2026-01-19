"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, X, Check, Loader2, Shield, User, Ban, Unlock } from "lucide-react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_banned: boolean;
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
        axios.get("/api/admin/users"),
        axios.get("/api/admin/todos"),
      ]);

      setUsers(usersRes.data.users || []);
      setTodos(todosRes.data.todos || []);

      // Get current user role
      const currentUser = usersRes.data.users.find((u: User) => u.id === usersRes.data.currentUserId);
      setCurrentUserRole(currentUser?.role || "");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        router.push("/todo");
      }
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (user: User) => {
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
      await axios.patch("/api/admin/users", { userId, name: editName });
      setUsers(users.map((u) => (u.id === userId ? { ...u, name: editName } : u)));
      cancelEdit();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to update user");
      } else {
        alert("Error updating user");
      }
    }
  };

  // Toggle user role
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    if (!confirm(`Change role to ${newRole}?`)) {
      return;
    }

    try {
      await axios.post("/api/admin/users/toggle-role", { userId, newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to change role");
      } else {
        alert("Error changing role");
      }
    }
  };

  // Toggle ban status
  const toggleBanUser = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? "unban" : "ban";
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await axios.post("/api/admin/users/toggle-ban", { 
        userId, 
        isBanned: !currentBanStatus 
      });
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_banned: !currentBanStatus } : u)));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || `Failed to ${action} user`);
      } else {
        alert(`Error ${action}ning user`);
      }
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete("/api/admin/users", { data: { userId } });
      setUsers(users.filter((u) => u.id !== userId));
      setTodos(todos.filter((t) => t.user_id !== userId));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to delete user");
      } else {
        alert("Error deleting user");
      }
    }
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    try {
      await axios.delete("/api/admin/todos", { data: { todoId } });
      setTodos(todos.filter((t) => t.id !== todoId));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to delete todo");
      } else {
        alert("Error deleting todo");
      }
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
            <TabsTrigger value="todos"><Link href="/todo">Go to My Todos</Link></TabsTrigger>
            <TabsTrigger value=""><Link href="/dashboard/documents">Extract Text</Link></TabsTrigger>

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
                      className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition ${
                        user.is_banned ? "bg-red-50" : "bg-white"
                      }`}
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
                              {user.is_banned && (
                                <Badge variant="destructive">
                                  <Ban className="w-3 h-3 mr-1" />
                                  Banned
                                </Badge>
                              )}
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

                          <Button
                            size="sm"
                            variant={user.is_banned ? "default" : "outline"}
                            onClick={() => toggleBanUser(user.id, user.is_banned)}
                          >
                            {user.is_banned ? (
                              <>
                                <Unlock className="w-4 h-4 mr-1" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Ban
                              </>
                            )}
                          </Button>

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