import express from "express";
import cors from "cors";
import passport from "passport";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import morganMiddleware from "./logger/morgan.logger.js";
import helmet from "helmet";
import session from "express-session";
import { errorHandler } from "./middlewares/error.middlewares.js";
import { ApiError } from "./utils/ApiError.js";
import { createServer } from "http";
import cookieParser from "cookie-parser";

const app = express();
const httpServer = createServer(app);
const corsOptions = {
  origin: process.env.ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "dareifyoucanstole",
  })
); // session secret

app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("uploads"));

app.use(requestIp.mw());

// Rate limiter to avoid misuse of the service and avoid cost spikes

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: (req, res) => 20, // replaces deprecated `max`
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.clientIp,
  handler: (req, res, next, options) => {
    throw new ApiError(
      options.statusCode || 429,
      `Too many requests. You are allowed ${
        typeof options.limit === "function"
          ? options.limit(req, res)
          : options.limit
      } requests per ${options.windowMs / 60000} minutes.`
    );
  },
});
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(morganMiddleware);
app.use(errorHandler);

//route import
import pdfRouter from "./routes/pdf.routes.js";
import chatRouter from "./routes/chat.routes.js";
import userRouter from "./routes/user.routes.js";
import companyRouter from "./routes/company.routes.js";
import companyAdminEmail from "./routes/superadmin.routes.js"
//route declaration
app.use("/api/v1/uploads", limiter, pdfRouter);
app.use("/api/v1", chatRouter);

// for user routing
app.use("/api/v1/users", limiter, userRouter);

//for company routes


app.use("/api/v1/company", limiter, companyRouter);
app.use("/api/v1", limiter, companyAdminEmail)

export { httpServer };
