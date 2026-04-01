import { OpenAPIHono } from "@hono/zod-openapi";

import { authProtectedRouter, authRouter } from "./auth.controller.js";
import { connectProtectedRouter, connectRouter } from "./connect.controller.js";
import { detailProtectedRouter, detailRouter } from "./detail.controller.js";
import { listProtectedRouter, listRouter } from "./list.controller.js";
import { otpProtectedRouter, otpRouter } from "./otp.controller.js";
import { passwordProtectedRouter } from "./password.controller.js";
import { profileProtectedRouter, profileRouter } from "./profile.controller.js";
import { pushProtectedRouter } from "./push.controller.js";
import { statusProtectedRouter, statusRouter } from "./status.controller.js";
import { terminateProtectedRouter } from "./terminate.controller.js";
import { transactionProtectedRouter } from "./transaction.controller.js";

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route("/auth", authRouter);
unprotectedApiRouter.route("/profile", profileRouter);
unprotectedApiRouter.route("/list", listRouter);
unprotectedApiRouter.route("/connect", connectRouter);
unprotectedApiRouter.route("/status", statusRouter);
unprotectedApiRouter.route("/detail", detailRouter);
unprotectedApiRouter.route("/otp", otpRouter);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route("/auth", authProtectedRouter);
protectedApiRouter.route("/profile", profileProtectedRouter);
protectedApiRouter.route("/list", listProtectedRouter);
protectedApiRouter.route("/connect", connectProtectedRouter);
protectedApiRouter.route("/status", statusProtectedRouter);
protectedApiRouter.route("/detail", detailProtectedRouter);
protectedApiRouter.route("/otp", otpProtectedRouter);
protectedApiRouter.route("/terminate", terminateProtectedRouter);
protectedApiRouter.route("/password", passwordProtectedRouter);
protectedApiRouter.route("/transaction", transactionProtectedRouter);
protectedApiRouter.route("/push", pushProtectedRouter);
protectedApiRouter.route("/transaction", transactionProtectedRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route("/", unprotectedApiRouter);
apiRouter.route("/", protectedApiRouter);
