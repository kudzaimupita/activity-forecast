import express from "express";

export type GraphQLContext<User = unknown> = {
  req: express.Request;
  res: express.Response;
  user?: User | null;
};
