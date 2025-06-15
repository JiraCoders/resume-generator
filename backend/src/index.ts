import routes from "@/routes";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import logger from "morgan";

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());

// Routes
app.use("/api", routes);

app.listen(port, () => {
  console.clear();

  console.log(`
    ███████╗██╗    ██╗██╗███████╗████████╗ ██████╗██╗   ██╗
    ██╔════╝██║    ██║██║██╔════╝╚══██╔══╝██╔════╝██║   ██║
    ███████╗██║ █╗ ██║██║█████╗     ██║   ██║     ██║   ██║
    ╚════██║██║███╗██║██║██╔══╝     ██║   ██║     ╚██╗ ██╔╝
    ███████║╚███╔███╔╝██║██║        ██║   ╚██████╗ ╚████╔╝
    ╚══════╝ ╚══╝╚══╝╚══╝╚═╝        ╚═╝    ╚═════╝  ╚═══╝
    `);

  console.log(`
        ___   ___  ___
  _  __|_  | <  / |_  |
  | |/ / __/_ / / / __/
  |___/____(_)_(_)____/
  `);

  console.log("-----------------------------------------------------------------");
  console.info(`Server is running on the port: ${port}. Ready to accept connections.`);
});
