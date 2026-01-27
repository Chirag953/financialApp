import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Department', 'Scheme', 'Category', 'Mapping', 'User', 'Setting'],
  endpoints: (builder) => ({
    getSettings: builder.query<any, void>({
      query: () => 'settings',
      providesTags: ['Setting'],
    }),
    getMe: builder.query<{ user: any }, void>({
      query: () => 'auth/me',
    }),
    updateSettings: builder.mutation<any, { settings: Record<string, string> }>({
      query: (body) => ({
        url: 'settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Setting'],
    }),
    getUsers: builder.query<any, void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    addUser: builder.mutation<any, any>({
      query: (body) => ({
        url: 'users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    bulkDeleteUsers: builder.mutation<any, { mode: 'all_viewers' }>({
      query: ({ mode }) => ({
        url: `users?mode=${mode}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getDepartments: builder.query<any, { q?: string; page?: number; limit?: number }>({
      query: ({ q = '', page = 1, limit = 25 }) => 
        `departments?q=${q}&page=${page}&limit=${limit}`,
      providesTags: ['Department'],
    }),
    getDepartmentById: builder.query<any, string>({
      query: (id) => `departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),
    addDepartment: builder.mutation<any, any>({
      query: (body) => ({
        url: 'departments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `departments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ['Department', { type: 'Department', id }],
    }),
    deleteDepartment: builder.mutation<any, string>({
      query: (id) => ({
        url: `departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
    bulkDeleteDepartments: builder.mutation<any, { ids?: string[]; mode?: 'all'; q?: string }>({
      query: ({ ids, mode, q }) => {
        let url = 'departments?';
        if (mode === 'all') {
          url += `mode=all&q=${encodeURIComponent(q || '')}`;
        } else if (ids && ids.length > 0) {
          url += `ids=${ids.join(',')}`;
        }
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Department'],
    }),
    getSchemes: builder.query<any, { q?: string; deptId?: string; categoryId?: string; page?: number; limit?: number }>({
      query: ({ q = '', deptId = '', categoryId = '', page = 1, limit = 25 }) => 
        `schemes?q=${q}&deptId=${deptId}&categoryId=${categoryId}&page=${page}&limit=${limit}`,
      providesTags: ['Scheme'],
    }),
    addScheme: builder.mutation<any, any>({
      query: (body) => ({
        url: 'schemes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Scheme'],
    }),
    updateScheme: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `schemes/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Scheme'],
    }),
    deleteScheme: builder.mutation<any, string>({
      query: (id) => ({
        url: `schemes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scheme'],
    }),
    bulkDeleteSchemes: builder.mutation<any, { ids?: string[]; mode?: 'all'; q?: string; deptId?: string }>({
      query: ({ ids, mode, q, deptId }) => {
        let url = 'schemes?';
        if (mode === 'all') {
          url += `mode=all&q=${encodeURIComponent(q || '')}&deptId=${deptId || ''}`;
        } else if (ids && ids.length > 0) {
          url += `ids=${ids.join(',')}`;
        }
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Scheme'],
    }),
    importSchemes: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'schemes/bulk-import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Scheme'],
    }),
    getCategories: builder.query<any, { q?: string; page?: number; limit?: number }>({
      query: ({ q = '', page = 1, limit = 25 }) => 
        `categories?q=${q}&page=${page}&limit=${limit}`,
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation<any, any>({
      query: (body) => ({
        url: 'categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    bulkDeleteCategories: builder.mutation<any, { ids?: string[]; mode?: 'all' }>({
      query: ({ ids, mode }) => {
        let url = 'categories?';
        if (mode === 'all') {
          url += `mode=all`;
        } else if (ids && ids.length > 0) {
          url += `ids=${ids.join(',')}`;
        }
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Category'],
    }),
    getMappings: builder.query<any, { schemeId: string }>({
      query: ({ schemeId }) => `mappings?schemeId=${schemeId}`,
      providesTags: ['Mapping'],
    }),
    addMapping: builder.mutation<any, any>({
      query: (body) => ({
        url: 'mappings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Mapping'],
    }),
    deleteMapping: builder.mutation<any, string>({
      query: (id) => ({
        url: `mappings?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Mapping'],
    }),
    getStats: builder.query<any, void>({
      query: () => 'dashboard/stats',
    }),
    getAuditLogs: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 25 }) => `audit-logs?page=${page}&limit=${limit}`,
    }),
  }),
});

export const { 
  useGetMeQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetDepartmentsQuery, 
  useGetDepartmentByIdQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useBulkDeleteDepartmentsMutation,
  useGetSchemesQuery,
  useAddSchemeMutation,
  useUpdateSchemeMutation,
  useDeleteSchemeMutation,
  useBulkDeleteSchemesMutation,
  useImportSchemesMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useBulkDeleteCategoriesMutation,
  useGetMappingsQuery,
  useAddMappingMutation,
  useDeleteMappingMutation,
  useGetStatsQuery,
  useGetAuditLogsQuery,
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkDeleteUsersMutation,
} = api;
