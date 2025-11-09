import { ExpressContext } from "apollo-server-express";
import { GraphQLContext } from "../../types";

type Context = GraphQLContext;

// eslint-disable-next-line @typescript-eslint/require-await
export const getGraphQLContext = async ({ req, res }: ExpressContext): Promise<Context> => {
  const context: Context = {
    req,
    res,
  };

  return context;
};
