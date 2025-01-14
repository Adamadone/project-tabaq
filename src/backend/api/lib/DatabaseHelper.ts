import { TRole } from "../types/Database";

export function assertIsRole(role: string): asserts role is TRole {
  if (role !== "Admin" && role !== "User") throw new Error("Role is not valid");
}

export function getRoleIdForTRole(role: TRole): number {
  switch (role) {
    case "Admin":
      return 2;
    case "User":
      return 1;
    default:
      throw new Error("Unknown role");
  }
}

export function getTRoleForRoleId(roleId: number): TRole {
  switch (roleId) {
    case 1:
      return "User";
    case 2:
      return "Admin";
    default:
      throw new Error("Unknown role");
  }
}

export const joinQuery = (
  statements: (
    | string
    | false
    | undefined
    | ((getVariable: (variableValue: any) => string) => string)
  )[],
) => {
  let variableIndex = 0;
  const variables: any[] = [];

  const query = statements.reduce<string>((acc, statement) => {
    if (typeof statement === "string") return `${acc} ${statement}`;
    if (typeof statement !== "function") return acc;

    const evaluated = statement((variableValue) => {
      variables.push(variableValue);
      return `$${++variableIndex}`;
    });
    return `${acc} ${evaluated} `;
  }, "");

  return { variables, query };
};
