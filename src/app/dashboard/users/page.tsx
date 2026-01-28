'use client';

import { useState } from 'react';
import { 
  useGetUsersQuery, 
  useAddUserMutation, 
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkDeleteUsersMutation,
  useGetMeQuery
} from '@/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Edit, Mail, Shield, Calendar, Trash2, Users2, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { UserDialog } from '@/components/users/UserDialog';
import { toast } from 'sonner';

export default function UsersPage() {
  const { data, isLoading } = useGetUsersQuery();
  const { data: meData } = useGetMeQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [bulkDeleteUsers, { isLoading: isBulkDeleting }] = useBulkDeleteUsersMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const users = data?.users || [];
  const currentUser = meData?.user;
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u: any) => u.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success("User deleted successfully");
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (isDeleteAllDialogOpen) {
        await bulkDeleteUsers({ mode: 'all_viewers' }).unwrap();
        toast.success("All viewers deleted successfully");
      } else {
        await bulkDeleteUsers({ ids: selectedIds }).unwrap();
        toast.success("Selected users deleted successfully");
      }
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete users");
    }
  };

  const viewerCount = users.filter((u: any) => u.role === 'VIEWER').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage system users and their roles.</p>
          </div>
          {isAdmin && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border dark:border-slate-600 shadow-sm">
                {selectedIds.length} selected
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && users.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none items-center h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Bulk Actions
                  <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="text-slate-600 focus:text-slate-700 cursor-pointer"
                  onClick={handleSelectAll}
                >
                  {selectedIds.length === users.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                  {selectedIds.length === users.length ? 'Deselect All' : 'Select All'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 cursor-pointer"
                  disabled={selectedIds.length === 0}
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                {viewerCount > 0 && (
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700 cursor-pointer font-medium"
                    onClick={() => setIsDeleteAllDialogOpen(true)}
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Delete All Viewers
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button className="flex items-center w-full sm:w-auto justify-center h-10" onClick={handleAdd}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <UserDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        editingUser={editingUser} 
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the selected users? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Viewers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {viewerCount} viewer users? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">System Users</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  {isAdmin && (
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedIds.length === users.length && users.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id} className={selectedIds.includes(user.id) ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}>
                      {isAdmin && (
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(user.id)}
                            onCheckedChange={() => handleSelectOne(user.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{user.name || '---'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role === 'ADMIN' ? "Admin" : "Viewer"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          {user.role === 'VIEWER' && user.id !== currentUser?.id && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setUserToDelete(user)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))
            ) : (
              users.map((user: any) => (
                <Card key={user.id} className={`p-4 space-y-3 dark:bg-slate-900 dark:border-slate-800 ${selectedIds.includes(user.id) ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      {isAdmin && (
                        <Checkbox 
                          checked={selectedIds.includes(user.id)}
                          onCheckedChange={() => handleSelectOne(user.id)}
                          className="mt-1"
                        />
                      )}
                      <div>
                        <div className="font-bold dark:text-slate-200">{user.name || '---'}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role === 'ADMIN' ? "Admin" : "Viewer"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800 text-[10px] text-gray-400 dark:text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-2 dark:hover:bg-slate-800" onClick={() => handleEdit(user)}>
                        <Edit className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Edit
                      </Button>
                      {user.role === 'VIEWER' && user.id !== currentUser?.id && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" 
                          onClick={() => setUserToDelete(user)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 text-red-600" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

