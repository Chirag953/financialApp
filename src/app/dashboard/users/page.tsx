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
  const deletableUsers = users.filter((u: any) => u.id !== currentUser?.id);
  const viewerCount = users.filter((u: any) => u.role === 'VIEWER').length;

  const handleSelectAll = () => {
    if (selectedIds.length === deletableUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletableUsers.map((u: any) => u.id));
    }
  };

  const handleSelectOne = (user: any) => {
    if (user.id === currentUser?.id) return;
    
    setSelectedIds(prev => 
      prev.includes(user.id) ? prev.filter(i => i !== user.id) : [...prev, user.id]
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
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Failed to delete user";
      toast.error(errorMessage);
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
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Failed to delete users";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              User Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system users and their roles.</p>
          </div>
          {isAdmin && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700 shadow-sm">
              <span className="text-sm text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap bg-white dark:bg-slate-700 px-2.5 py-0.5 rounded-full border dark:border-slate-600 shadow-sm">
                {selectedIds.length} selected
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && deletableUsers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none items-center h-10 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold shadow-sm"
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                  Bulk Actions
                  <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem 
                  className="text-slate-600 focus:text-slate-700 cursor-pointer font-medium"
                  onClick={handleSelectAll}
                >
                  {selectedIds.length === deletableUsers.length && deletableUsers.length > 0 ? <CheckSquare className="w-4 h-4 mr-2 text-emerald-500" /> : <Square className="w-4 h-4 mr-2" />}
                  {selectedIds.length === deletableUsers.length && deletableUsers.length > 0 ? 'Deselect All' : 'Select All'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 cursor-pointer font-bold"
                  disabled={selectedIds.length === 0}
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                {viewerCount > 0 && (
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700 cursor-pointer font-bold"
                    onClick={() => setIsDeleteAllDialogOpen(true)}
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Delete All Viewers
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center w-full sm:w-auto justify-center h-10 font-bold active:scale-[0.98] transition-all" 
            onClick={handleAdd}
          >
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

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <Table>
              <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                      {isAdmin && (
                        <TableHead className="w-[50px] px-4">
                          <Checkbox 
                            checked={selectedIds.length === deletableUsers.length && deletableUsers.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="border-slate-300 dark:border-slate-600"
                          />
                        </TableHead>
                      )}
                      <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] py-4 px-4">User Details</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] py-4">Role</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] py-4">Created At</TableHead>
                  <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-100 dark:border-slate-800">
                      {isAdmin && <TableCell className="px-4"><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell className="px-4"><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell className="text-right px-6"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user: any) => (
                    <TableRow 
                      key={user.id}
                      className={`group transition-colors border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${selectedIds.includes(user.id) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                    >
                      {isAdmin && (
                        <TableCell className="px-4">
                          <Checkbox 
                            checked={selectedIds.includes(user.id)}
                            onCheckedChange={() => handleSelectOne(user)}
                            disabled={user.id === currentUser?.id}
                            className="border-slate-300 dark:border-slate-600"
                          />
                        </TableCell>
                      )}
                      <TableCell className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{user.name || '---'}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1.5 opacity-60" />
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                          className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                            user.role === 'ADMIN' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 mr-2 opacity-60" />
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.id !== currentUser?.id ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => setUserToDelete(user)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <div className="w-8 h-8" /> // Spacer for non-deletable users
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-4 space-y-3 border-slate-200 dark:border-slate-800 shadow-sm">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </Card>
              ))
            ) : users.length > 0 ? (
              users.map((user: any) => (
                <Card 
                  key={user.id} 
                  className={`overflow-hidden transition-all duration-200 border-slate-200 dark:border-slate-800 active:scale-[0.99] ${
                    selectedIds.includes(user.id) 
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' 
                      : 'hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm bg-white dark:bg-slate-900'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0 ${
                              user.role === 'ADMIN' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {user.role}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-base">
                          {user.name || '---'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 opacity-60" />
                          {user.email}
                        </p>
                      </div>
                      {isAdmin && (
                        <Checkbox 
                          checked={selectedIds.includes(user.id)}
                          onCheckedChange={() => handleSelectOne(user)}
                          disabled={user.id === currentUser?.id}
                          className="mt-1 border-slate-300 dark:border-slate-600"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-9 text-xs font-bold gap-2 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit User
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-700"
                          onClick={() => setUserToDelete(user)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Users2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No users found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

