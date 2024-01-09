import express, { Application } from 'express';
import { config } from 'dotenv';
config();
const app: Application = express();

app.use(express.json());

app.listen(process.env.PORT_NUMBER, () => {
  console.log('Server has started successfully!');
});
