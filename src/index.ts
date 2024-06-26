import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getUsersFromDB1, getUsersFromDB2 } from '../libs/prisma';
import cors from 'cors';
import { dbConnectionTest } from './Utils/prismaUtils';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    try {
        const usersFromDB1 = await getUsersFromDB1();  
        const usersFromDB2 = await getUsersFromDB2();  

        
        const responseData = {
            usersFromDB1: usersFromDB1,
            usersFromDB2: usersFromDB2
        };

        

        res.json(responseData); 
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

(async () => {
    // database connection teste
    if (!(await dbConnectionTest())) {
        console.log("CA TESTE OU BIEN? LES DB GENRE")
        server.close(() => {
        console.log('Server closed.');
        process.exit(0);
        })
    }
})()
