'use client';

import { useState } from 'react';
import { 
  useGetUsersQuery, 
  useAddUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation 
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Edit, Trash2, Mail, Shield, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserDialog } from '@/components/users/UserDialog';

export default function UsersPage() {
  const t = useTranslations('Users');
  const { data, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const users = data?.users || [];

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <Button className="flex items-center" onClick={handleAdd}>
          <UserPlus className="w-4 h-4 mr-2" />
          {t('addUser')}
        </Button>
      </div>

      <UserDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        editingUser={editingUser} 
      />

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
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
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
                <Card key={user.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">{user.name || '---'}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role === 'ADMIN' ? t('admin') : t('viewer')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t text-[10px] text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="space-x-1">
                      <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleEdit(user)}>
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        {t('editUser')}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        {t('deleteUser')}
                      </Button>
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
