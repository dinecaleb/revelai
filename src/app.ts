import express from 'express';
import journeysRouter from './api/journeys.routes';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.use('/', journeysRouter);

export default app;
