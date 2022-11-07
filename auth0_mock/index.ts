import cors from "cors"
import express from "express";
import {json, urlencoded} from "body-parser";
import {port} from "./modules/helpers";
import {rawReqLogger} from "./modules/middleware";
import {routerApi} from "./routes/api";
import {routerIndex} from "./routes";
import {routerAuth} from "./routes/authentication";


express()
  .set('view engine', 'ejs')
  .use(json())
  .use(urlencoded({extended: true}))
  .use(cors())
  .options('*', cors())
  .use(rawReqLogger)
  .use([routerIndex, routerAuth, routerApi])
  .listen(port, '0.0.0.0', () =>
    console.log('http connected to localhost port ', port)
  );
