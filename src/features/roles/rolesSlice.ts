import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface RolesState {
  roles: Role[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  status: 'idle',
  error: null,
};

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async () => {
  // ここにAPIコールのロジックを実装します
  // 今はダミーデータを返します
  return [
    { id: 1, name: '管理者', description: 'システム全体の管理権限を持つ' },
    { id: 2, name: 'スタッフ', description: '日常的な業務操作権限を持つ' },
    { id: 3, name: '閲覧者', description: '情報の閲覧のみ可能' },
  ];
});

export const addRole = createAsyncThunk('roles/addRole', async (role: Omit<Role, 'id'>) => {
  // ここにAPIコールのロジックを実装します
  // 今はダミーの実装を返します
  return { id: Date.now(), ...role };
});

export const updateRole = createAsyncThunk('roles/updateRole', async (role: Role) => {
  // ここにAPIコールのロジックを実装します
  // 今は単に更新されたロールを返します
  return role;
});

export const deleteRole = createAsyncThunk('roles/deleteRole', async (id: number) => {
  // ここにAPIコールのロジックを実装します
  // 今は削除されたIDを返します
  return id;
});

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.status = 'succeeded';
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.roles = state.roles.filter(role => role.id !== action.payload);
      });
  },
});

export default rolesSlice.reducer;
