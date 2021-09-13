export default null
// import { ApiMeResponse, UserRoles } from '@ping-board/common'
// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
// // import { RootState } from './index'

// interface LoginState {
//   loading: boolean
//   isLoggedIn: boolean
//   character: {
//     id: number
//     name: string
//     roles: UserRoles[]
//   } | null
// }

// const initialLoginState: LoginState = {
//   loading: false,
//   isLoggedIn: false,
//   character: null,
// }

// export const checkLoggedIn = createAsyncThunk('login/checkLoggedIn', async (_, { dispatch }) => {
//   const req = await fetch('/api/me', { credentials: 'include' })
//   if (req.status >= 200 && req.status < 300) {
//     const data = await req.json() as ApiMeResponse
//     dispatch(data.isLoggedIn ? loggedIn(data.character) : loggedOut())
//   }
// })

// export const logOut = createAsyncThunk('login/logOut', async (_, { dispatch }) => {
//   console.log('logOut thunk called')
//   const req = await fetch('/auth/logout', {
//     method: 'POST',
//     credentials: 'include',
//   })
//   if (req.status >= 200 && req.status < 300) {
//     dispatch(loggedOut())
//   }
// })

// export const loginSlice = createSlice({
//   name: 'login',
//   initialState: initialLoginState,
//   reducers: {
//     loggedOut: state => {
//       return {
//         ...state,
//         isLoggedIn: false,
//         character: null,
//       }
//     },
//     loggedIn: (state, action: PayloadAction<Exclude<LoginState['character'], null>>) => {
//       return {
//         ...state,
//         isLoggedIn: true,
//         character: action.payload,
//       }
//     },
//   },
//   extraReducers: builder => builder
//     .addCase(checkLoggedIn.pending, (state) => {
//       state.loading = true
//     })
//     .addCase(checkLoggedIn.fulfilled, (state) => {
//       state.loading = false
//     })
//     .addCase(checkLoggedIn.rejected, (state) => {
//       state.loading = false
//     })
//     .addCase(logOut.pending, (state) => {
//       state.loading = true
//     })
//     .addCase(logOut.fulfilled, (state) => {
//       state.loading = false
//     })
//     .addCase(logOut.rejected, (state) => {
//       state.loading = false
//     }),
// })

// export const { loggedOut, loggedIn } = loginSlice.actions

// // export const selectIsLoggedIn = (state: RootState): boolean => state.login.isLoggedIn
// // export const selectLoginIsLoading = (state: RootState): boolean => state.login.loading

// // export const selectUserName = (state: RootState): string | null =>
// //   state.login.character?.name ?? null

// // export const selectUserRoles = (state: RootState): UserRoles[] | null =>
// //   state.login.character?.roles ?? null

// // export const selectHasRoles = (...roles: UserRoles[]) => (state: RootState): boolean =>
// //   roles.every(role => state.login.character?.roles?.includes(role))
