import type { UserRole } from "./UserRole";

export interface NavLink{
    label:string,
    path:string
}

export type NavigationConfig = Record<UserRole, NavLink[]>;