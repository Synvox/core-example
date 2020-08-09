export type Membership = {
  id: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  disabledAt: string | null;
  userId: number;
  roleId: string;
};

export type Organization = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
};

export type User = {
  id: number;
  createdAt: string;
  updatedAt: string;
  email: string;
  givenName: string;
  familyName: string;
};

export type Post = {
  id: number;
  organizationId: number;
  authorId: number | null;
  title: string;
  body: string;
};

