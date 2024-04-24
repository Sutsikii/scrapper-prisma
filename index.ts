import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient as PrismaClient1 } from './prisma/generated/client1';
import { PrismaClient as PrismaClient2 } from './prisma/generated/client2';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {

    const res1 = await new PrismaClient1().user1.findMany();
    const res2 = await new PrismaClient2().user2.findMany();

    res.send('Hello World!');
    console.log(res1, res2)
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
