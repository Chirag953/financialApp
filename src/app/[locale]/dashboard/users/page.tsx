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
import { UserPlus, Edit, Mail, Shield, Calendar, Trash2, Users2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserDialog } from '@/components/users/UserDialog';
import { toast } from 'sonner';

export default function UsersPage() {
  const t = useTranslations('Users');
  const tCommon = useTranslations('Departments');
  const { data, isLoading } = useGetUsersQuery();
  const { data: meData } = useGetMeQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [bulkDeleteUsers, { isLoading: isBulkDeleting }] = useBulkDeleteUsersMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const users = data?.users || [];
  const currentUser = meData?.user;

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
      toast.success(t('deleteSuccess'));
      setUserToDelete(null);
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteUsers({ mode: 'all_viewers' }).unwrap();
      toast.success(t('bulkDeleteSuccess'));
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error(t('bulkDeleteError'));
    }
  };

  const viewerCount = users.filter((u: any) => u.role === 'VIEWER').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {viewerCount > 0 && (
            <Button 
              variant="destructive" 
              className="flex items-center w-full sm:w-auto justify-center h-10"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              disabled={isBulkDeleting}
            >
              <Users2 className="w-4 h-4 mr-2" />
              {t('deleteAllViewers')}
            </Button>
          )}
          <Button className="flex items-center w-full sm:w-auto justify-center h-10" onClick={handleAdd}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('addUser')}
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
            <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription', { name: userToDelete?.name || userToDelete?.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? tCommon('deleting') : tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmBulkDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmBulkDeleteDescription', { count: viewerCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? tCommon('deleting') : tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || '---'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role === 'ADMIN' ? t('admin') : t('viewer')}
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
                <Card key={user.id} className="p-4 space-y-3 dark:bg-slate-900 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold dark:text-slate-200">{user.name || '---'}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role === 'ADMIN' ? t('admin') : t('viewer')}
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
                        {t('editUser')}
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
                          {tCommon('delete')}
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
