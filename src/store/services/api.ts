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
    getSchemes: builder.query<any, { q?: string; deptId?: string; page?: number; limit?: number }>({
      query: ({ q = '', deptId = '', page = 1, limit = 25 }) => 
        `schemes?q=${q}&deptId=${deptId}&page=${page}&limit=${limit}`,
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
    getCategories: builder.query<any, void>({
      query: () => 'categories',
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
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetDepartmentsQuery, 
  useGetDepartmentByIdQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetSchemesQuery,
  useAddSchemeMutation,
  useUpdateSchemeMutation,
  useDeleteSchemeMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetMappingsQuery,
  useAddMappingMutation,
  useDeleteMappingMutation,
  useGetStatsQuery,
  useGetAuditLogsQuery,
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = api;
