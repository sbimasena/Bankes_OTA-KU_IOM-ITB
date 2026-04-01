export const AuthorizationErrorResponse = {
  description: "Bad request: authorization (not logged in) error",
  content: {
    "text/plain": {
      schema: {
        example: "Unauthorized",
      },
    },
  },
} as const;
