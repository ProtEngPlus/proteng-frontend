//can be add from admin later (edit later)
export type Role = "admin" | "user" | "staff";

export type UserRole =
  "researcher" | "researcher_assistant" | "lab_manager" | "lab_technician";

export const userRoleMapper: Record<UserRole, string> = {
  researcher: "Researcher",
  researcher_assistant: "Researcher Assistant",
  lab_manager: "Lab Manager",
  lab_technician: "Lab Technician",
};

export interface User {
  current_role: string;
  email: string;
  id: string;
  name: string;
  surname: string;
  user_role?: UserRole;
}

export interface UserRegister {
  email: string;
  password: string;
  name: string;
  surname: string;
  user_role: string;
  role: Role[];
}
